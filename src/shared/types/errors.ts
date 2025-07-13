export enum ErrorCode {
    // Authentication errors
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',

    // Validation errors
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

    // API errors
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    NOT_FOUND = 'NOT_FOUND',

    // Business logic errors
    INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',

    // File upload errors
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
    UPLOAD_FAILED = 'UPLOAD_FAILED',

    // Database errors
    DATABASE_ERROR = 'DATABASE_ERROR',
    CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',

    // Unknown error
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
    code: ErrorCode;
    message: string;
    details: Record<string, unknown> | undefined;
    timestamp: Date;
    stack?: string;
}

export class ApplicationError extends Error implements AppError {
    public readonly code: ErrorCode;
    public readonly details: Record<string, unknown> | undefined;
    public readonly timestamp: Date;

    constructor(
        code: ErrorCode,
        message: string,
        details: Record<string, unknown> | undefined = undefined
    ) {
        super(message);
        this.name = 'ApplicationError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date();
    }
}

export class ValidationError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(ErrorCode.VALIDATION_ERROR, message, details);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(ErrorCode.UNAUTHORIZED, message, details);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(ErrorCode.FORBIDDEN, message, details);
        this.name = 'AuthorizationError';
    }
}

export class NetworkError extends ApplicationError {
    constructor(message: string, details?: Record<string, unknown>) {
        super(ErrorCode.NETWORK_ERROR, message, details);
        this.name = 'NetworkError';
    }
}

export function isApplicationError(error: unknown): error is ApplicationError {
    return error instanceof ApplicationError;
}

export function createError(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
): ApplicationError {
    return new ApplicationError(code, message, details);
} 