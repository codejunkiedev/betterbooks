export interface ApiResponse<T = unknown> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface RequestConfig {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    data?: unknown;
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    timeout?: number;
}

export interface HttpClient {
    request<T>(config: RequestConfig): Promise<ApiResponse<T>>;
    get<T>(url: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>>;
    post<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
    put<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
    delete<T>(url: string): Promise<ApiResponse<T>>;
    patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
}

export interface ApiService {
    auth: AuthApiService;
    dashboard: DashboardApiService;
    documents: DocumentsApiService;
    invoices: InvoicesApiService;
    accounting: AccountingApiService;
    company: CompanyApiService;
}

export interface AuthApiService {
    signIn(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: unknown; session: unknown }>>;
    signUp(userData: { email: string; password: string; metadata?: Record<string, unknown> }): Promise<ApiResponse<{ user: unknown; session: unknown }>>;
    signOut(): Promise<ApiResponse<void>>;
    resetPassword(email: string): Promise<ApiResponse<void>>;
    updatePassword(password: string): Promise<ApiResponse<void>>;
    getCurrentUser(): Promise<ApiResponse<unknown>>;
}

export interface DashboardApiService {
    getStats(): Promise<ApiResponse<unknown>>;
    getRecentActivity(): Promise<ApiResponse<unknown[]>>;
}

export interface DocumentsApiService {
    upload(file: File, metadata?: Record<string, unknown>): Promise<ApiResponse<unknown>>;
    list(params?: { page?: number; limit?: number; type?: string }): Promise<ApiResponse<unknown[]>>;
    get(id: string): Promise<ApiResponse<unknown>>;
    delete(id: string): Promise<ApiResponse<void>>;
}

export interface InvoicesApiService {
    create(invoice: unknown): Promise<ApiResponse<unknown>>;
    list(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<unknown[]>>;
    get(id: string): Promise<ApiResponse<unknown>>;
    update(id: string, invoice: unknown): Promise<ApiResponse<unknown>>;
    delete(id: string): Promise<ApiResponse<void>>;
    process(id: string): Promise<ApiResponse<unknown>>;
}

export interface AccountingApiService {
    getEntries(params?: { page?: number; limit?: number; account?: string }): Promise<ApiResponse<unknown[]>>;
    getSummary(): Promise<ApiResponse<unknown>>;
    createEntry(entry: unknown): Promise<ApiResponse<unknown>>;
}

export interface CompanyApiService {
    getInfo(): Promise<ApiResponse<unknown>>;
    updateInfo(info: unknown): Promise<ApiResponse<unknown>>;
    setupCompany(setup: unknown): Promise<ApiResponse<unknown>>;
} 