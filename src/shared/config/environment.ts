interface EnvironmentConfig {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_APP_NAME: string;
    VITE_APP_VERSION: string;
    VITE_API_TIMEOUT: number;
    VITE_MAX_FILE_SIZE: number;
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

export const config: EnvironmentConfig = {
    NODE_ENV: (import.meta.env.MODE as EnvironmentConfig['NODE_ENV']) || 'development',
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL!,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY!,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'BetterBooks',
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    VITE_API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    VITE_MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB
};

// Validate environment on import
validateEnvironment();

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test'; 