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

        // Create a promise that rejects after timeout
        const timeoutPromise = config.timeout
            ? new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), config.timeout);
            })
            : null;

        // Make the request with timeout
        const fetchPromise = fetch(url, requestOptions);
        const response = timeoutPromise
            ? await Promise.race([fetchPromise, timeoutPromise])
            : await fetchPromise;

        // Handle HTTP errors
        if (!response.ok) {
            let errorMessage = response.status === 405
                ? 'Method not allowed - CORS issue detected'
                : `HTTP ${response.status}: ${response.statusText}`;

            // Try to get more detailed error information from response
            try {
                const errorData = await response.json();
                if (errorData && typeof errorData === 'object') {
                    console.error('HTTP Error Response:', {
                        status: response.status,
                        statusText: response.statusText,
                        data: errorData
                    });

                    // If there's a specific error message in the response, use it
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.hs_code) {
                        errorMessage = `Validation error: ${JSON.stringify(errorData)}`;
                    }
                }
            } catch (parseError) {
                // If we can't parse the error response, use the default message
                console.error('Failed to parse error response:', parseError);
            }

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