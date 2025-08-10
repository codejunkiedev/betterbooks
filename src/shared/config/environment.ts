import { EnvironmentType } from '../types/environment';
import type { EnvironmentTypeValue, EnvironmentConfig } from '../types/environment';


const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_APP_BASE_URL'] as const;

function validateEnvironment(): void {
    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
}

const getCurrentMode = (): EnvironmentTypeValue => {
    const appEnv = import.meta.env.VITE_APP_ENV;
    if (appEnv === EnvironmentType.STAGING) return EnvironmentType.STAGING;
    if (import.meta.env.DEV) return EnvironmentType.DEVELOPMENT;
    if (import.meta.env.PROD) return EnvironmentType.PRODUCTION;
    return (import.meta.env.MODE as EnvironmentTypeValue) || EnvironmentType.DEVELOPMENT;
};

const mode = getCurrentMode();

export const config: EnvironmentConfig = {
    NODE_ENV: mode,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL!,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY!,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'BetterBooks',
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV || mode,
    VITE_APP_BASE_URL: import.meta.env.VITE_APP_BASE_URL!,
};

validateEnvironment();

export const isDevelopment = config.NODE_ENV === EnvironmentType.DEVELOPMENT;
export const isStaging = config.NODE_ENV === EnvironmentType.STAGING;
export const isProduction = config.NODE_ENV === EnvironmentType.PRODUCTION;

export const getEnvironmentInfo = () => ({
    mode: config.NODE_ENV,
    appEnv: config.VITE_APP_ENV,
    isDev: isDevelopment,
    isStaging: isStaging,
    isProd: isProduction,
    appName: config.VITE_APP_NAME,
    version: config.VITE_APP_VERSION,
});

console.log('🌍 Environment:', config.VITE_APP_ENV, 'Base URL:', config.VITE_APP_BASE_URL);

