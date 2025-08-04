interface EnvironmentConfig {
    NODE_ENV: 'development' | 'production';
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_APP_NAME: string;
    VITE_APP_VERSION: string;
    VITE_API_TIMEOUT: number;
    VITE_MAX_FILE_SIZE: number;
    VITE_APP_ENV: string;
    VITE_API_URL?: string;
    MISTRAL_API_KEY?: string;
}

const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
] as const;

function validateEnvironment(): void {
    const missingVars = requiredEnvVars.filter(
        (varName) => !import.meta.env[varName]
    );

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }
}

// Get the current environment mode
const getCurrentMode = (): 'development' | 'production' => {
    // Check if we're in development mode
    if (import.meta.env.DEV) return 'development';
    if (import.meta.env.PROD) return 'production';

    // Fallback to MODE or default to development
    return (import.meta.env.MODE as 'development' | 'production') || 'development';
};

// Get environment-specific defaults
const getEnvironmentDefaults = () => {
    const mode = getCurrentMode();

    if (mode === 'production') {
        return {
            appName: 'BetterBooks',
            apiTimeout: 30000,
            maxFileSize: 10485760, // 10MB
        };
    }

    // Development defaults
    return {
        appName: 'BetterBooks Dev',
        apiTimeout: 30000,
        maxFileSize: 10485760, // 10MB
    };
};

const defaults = getEnvironmentDefaults();

export const config: EnvironmentConfig = {
    NODE_ENV: getCurrentMode(),
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL!,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY!,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME || defaults.appName,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    VITE_API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || defaults.apiTimeout.toString()),
    VITE_MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || defaults.maxFileSize.toString()),
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV || getCurrentMode(),
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MISTRAL_API_KEY: import.meta.env.MISTRAL_API_KEY,
};

// Validate environment on import
validateEnvironment();

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';

// Helper function to get environment info
export const getEnvironmentInfo = () => ({
    mode: config.NODE_ENV,
    appEnv: config.VITE_APP_ENV,
    isDev: isDevelopment,
    isProd: isProduction,
    appName: config.VITE_APP_NAME,
    version: config.VITE_APP_VERSION,
});

// Log current environment when config is imported
console.log('🌍 Environment:', config.VITE_APP_ENV);

