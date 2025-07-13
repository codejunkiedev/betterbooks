// Application Configuration
export const APP_CONFIG = {
    NAME: 'BetterBooks',
    VERSION: '1.0.0',
    DESCRIPTION: 'Modern accounting application for businesses',
    AUTHOR: 'BetterBooks Team',
    SUPPORT_EMAIL: 'support@betterbooks.com',
    WEBSITE: 'https://betterbooks.com'
} as const;

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.VITE_API_BASE_URL || 'https://api.betterbooks.com',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
} as const;

// Supabase Configuration
export const SUPABASE_CONFIG = {
    STORAGE_BUCKET: 'documents',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'],
    UPLOAD_TIMEOUT: 60000, // 60 seconds
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
    DEFAULT_CURRENT_PAGE: 1,
} as const;

// Table Configuration
export const TABLE_CONFIG = {
    DEFAULT_SORT_FIELD: 'created_at',
    DEFAULT_SORT_ORDER: 'desc' as const,
    ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50],
    DEFAULT_ROWS_PER_PAGE: 10,
} as const;

// Form Configuration
export const FORM_CONFIG = {
    DEBOUNCE_DELAY: 300, // 300ms
    VALIDATION_DELAY: 500, // 500ms
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// UI Configuration
export const UI_CONFIG = {
    SIDEBAR_WIDTH: {
        EXPANDED: 256, // 16rem
        COLLAPSED: 80, // 5rem
    },
    HEADER_HEIGHT: 80, // 5rem
    TOAST_DURATION: 5000, // 5 seconds
    LOADING_DELAY: 100, // 100ms
    ANIMATION_DURATION: 200, // 200ms
    BREAKPOINTS: {
        SM: 640,
        MD: 768,
        LG: 1024,
        XL: 1280,
        '2XL': 1536,
    },
} as const;

// Validation Configuration
export const VALIDATION_CONFIG = {
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL_CHARS: true,
    },
    EMAIL: {
        MAX_LENGTH: 254,
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
    },
    COMPANY_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 200,
    },
    PHONE: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 15,
    },
} as const;

// Currency Configuration
export const CURRENCY_CONFIG = {
    DEFAULT: 'PKR',
    SYMBOL: '₨',
    DECIMAL_PLACES: 2,
    THOUSAND_SEPARATOR: ',',
    DECIMAL_SEPARATOR: '.',
} as const;

// Date Configuration
export const DATE_CONFIG = {
    DEFAULT_FORMAT: 'yyyy-MM-dd',
    DISPLAY_FORMAT: 'MMM dd, yyyy',
    TIME_FORMAT: 'HH:mm:ss',
    DATETIME_FORMAT: 'MMM dd, yyyy HH:mm',
    TIMEZONE: 'Asia/Karachi',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied. You do not have permission to view this resource.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
    INVALID_FILE_TYPE: 'File type is not supported.',
    UPLOAD_FAILED: 'File upload failed. Please try again.',
    SAVE_FAILED: 'Failed to save changes. Please try again.',
    DELETE_FAILED: 'Failed to delete item. Please try again.',
    LOAD_FAILED: 'Failed to load data. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    SAVE_SUCCESS: 'Changes saved successfully.',
    DELETE_SUCCESS: 'Item deleted successfully.',
    UPLOAD_SUCCESS: 'File uploaded successfully.',
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'You have been logged out successfully.',
    REGISTER_SUCCESS: 'Account created successfully.',
    PASSWORD_RESET_SUCCESS: 'Password reset email sent successfully.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    COMPANY_CREATED: 'Company created successfully.',
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
    SAVING: 'Saving...',
    DELETING: 'Deleting...',
    UPLOADING: 'Uploading...',
    LOADING: 'Loading...',
    PROCESSING: 'Processing...',
    SUBMITTING: 'Submitting...',
} as const;

// Placeholder Messages
export const PLACEHOLDER_MESSAGES = {
    NO_DATA: 'No data available.',
    NO_RESULTS: 'No results found.',
    NO_DOCUMENTS: 'No documents uploaded yet.',
    NO_INVOICES: 'No invoices found.',
    NO_ACTIVITY: 'No recent activity.',
    NO_COMPANIES: 'No companies found.',
    NO_USERS: 'No users found.',
    NO_ACCOUNTANTS: 'No accountants found.',
} as const; 