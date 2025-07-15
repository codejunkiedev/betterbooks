// import { config } from '@/shared/config/environment';
import { logger } from '@/shared/utils/logger';
import {
    ApplicationError,
    NetworkError,
    AuthenticationError,
    AuthorizationError,
    ErrorCode
} from '@/shared/types/errors';
import {
    HttpClient,
    RequestConfig,
    ApiResponse
} from './types';

interface RetryConfig {
    maxRetries: number;
    retryDelay: number;
    retryCondition: (error: Error) => boolean;
}

class HttpError extends ApplicationError {
    constructor(
        message: string,
        public status: number,
        public response?: unknown
    ) {
        super(ErrorCode.NETWORK_ERROR, message);
        this.name = 'HttpError';
    }
}

export class SupabaseHttpClient implements HttpClient {
    private retryConfig: RetryConfig = {
        maxRetries: 3,
        retryDelay: 1000,
        retryCondition: (error: Error) => {
            if (error instanceof HttpError) {
                return error.status >= 500 || error.status === 429;
            }
            return false;
        },
    };

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async retryRequest<T>(
        requestFn: () => Promise<ApiResponse<T>>,
        retryCount = 0
    ): Promise<ApiResponse<T>> {
        try {
            return await requestFn();
        } catch (error) {
            if (
                retryCount < this.retryConfig.maxRetries &&
                this.retryConfig.retryCondition(error as Error)
            ) {
                logger.warn(`Retrying request (${retryCount + 1}/${this.retryConfig.maxRetries})`, {
                    error: (error as Error).message,
                });

                await this.delay(this.retryConfig.retryDelay * Math.pow(2, retryCount));
                return this.retryRequest(requestFn, retryCount + 1);
            }
            throw error;
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof HttpError) {
            switch (error.status) {
                case 401:
                    throw new AuthenticationError('Authentication required');
                case 403:
                    throw new AuthorizationError('Insufficient permissions');
                case 404:
                    throw new ApplicationError(ErrorCode.NOT_FOUND, 'Resource not found');
                case 422:
                    throw new ApplicationError(ErrorCode.VALIDATION_ERROR, 'Validation failed');
                case 500:
                    throw new ApplicationError(ErrorCode.SERVER_ERROR, 'Internal server error');
                default:
                    throw new HttpError(
                        `HTTP ${error.status}: ${error.message}`,
                        error.status,
                        error.response
                    );
            }
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApplicationError(ErrorCode.TIMEOUT_ERROR, 'Request timeout');
            }
            throw new NetworkError(error.message);
        }

        throw new ApplicationError(ErrorCode.UNKNOWN_ERROR, 'An unknown error occurred');
    }

    private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
        const { supabase } = await import('@/shared/services/supabase/client');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || config.VITE_API_TIMEOUT);

        try {
            logger.debug('Making HTTP request', {
                method: config.method,
                url: config.url,
                hasData: !!config.data,
                hasParams: !!config.params,
            });

            let response: unknown;

            switch (config.method) {
                case 'GET':
                    response = await supabase
                        .from(config.url)
                        .select('*')
                        .abortSignal(controller.signal);
                    break;
                case 'POST':
                    response = await supabase
                        .from(config.url)
                        .insert(config.data)
                        .select()
                        .abortSignal(controller.signal);
                    break;
                case 'PUT':
                    response = await supabase
                        .from(config.url)
                        .update(config.data)
                        .select()
                        .abortSignal(controller.signal);
                    break;
                case 'DELETE':
                    response = await supabase
                        .from(config.url)
                        .delete()
                        .abortSignal(controller.signal);
                    break;
                case 'PATCH':
                    response = await supabase
                        .from(config.url)
                        .update(config.data)
                        .select()
                        .abortSignal(controller.signal);
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${config.method}`);
            }

            clearTimeout(timeoutId);

            const responseData = response as { data?: unknown; error?: { message?: string; code?: number } };
            if (responseData.error) {
                throw new HttpError(
                    responseData.error.message || 'Supabase error',
                    responseData.error.code || 500,
                    responseData.error
                );
            }

            logger.debug('HTTP request successful', {
                method: config.method,
                url: config.url,
                status: 'success',
            });

            return {
                data: responseData.data as T,
                success: true,
            };
        } catch (error) {
            clearTimeout(timeoutId);
            this.handleError(error);
        }
    }

    public async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
        return this.retryRequest(() => this.makeRequest<T>(config));
    }

    public async get<T>(url: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
        const requestConfig: RequestConfig = {
            method: 'GET',
            url,
        };
        if (params) {
            requestConfig.params = params;
        }
        return this.request<T>(requestConfig);
    }

    public async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'POST',
            url,
            data,
        });
    }

    public async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'PUT',
            url,
            data,
        });
    }

    public async delete<T>(url: string): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'DELETE',
            url,
        });
    }

    public async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'PATCH',
            url,
            data,
        });
    }

    public setRetryConfig(config: Partial<RetryConfig>): void {
        this.retryConfig = { ...this.retryConfig, ...config };
    }
} 