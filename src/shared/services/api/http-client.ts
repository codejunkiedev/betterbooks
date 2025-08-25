import {
    HttpClient,
    RequestConfig,
    ApiResponse
} from './types';

export class HttpClientApi implements HttpClient {
    private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
        // Build URL with query parameters
        let url = config.url;
        if (config.params) {
            const searchParams = new URLSearchParams();
            Object.entries(config.params).forEach(([key, value]) => {
                searchParams.append(key, String(value));
            });
            url += `?${searchParams.toString()}`;
        }

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...config.headers,
        };

        // Prepare request options
        const requestOptions: RequestInit = {
            method: config.method,
            headers,
            mode: 'cors', // Explicitly set CORS mode
        };

        // Add body for methods that support it
        if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            requestOptions.body = JSON.stringify(config.data);
        }

        // Make the request
        const response = await fetch(url, requestOptions);

        // Handle HTTP errors
        if (!response.ok) {
            const errorMessage = response.status === 405
                ? 'Method not allowed - CORS issue detected'
                : `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        // Parse response
        const responseData = await response.json().catch(() => null);

        return {
            data: responseData as T,
            success: true,
        };
    }

    public async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(config);
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
} 