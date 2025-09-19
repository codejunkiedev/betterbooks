export const EnvironmentType = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production'
} as const;

export type EnvironmentTypeValue = typeof EnvironmentType[keyof typeof EnvironmentType];

export interface EnvironmentConfig {
    NODE_ENV: EnvironmentTypeValue;
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_APP_NAME: string;
    VITE_APP_VERSION: string;
    VITE_APP_ENV: string;
    VITE_APP_BASE_URL: string;
} 