import { createClient } from '@supabase/supabase-js'
import { logger } from '@/shared/utils/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug environment variables
logger.info('Supabase Client Configuration', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing',
    mode: import.meta.env.MODE
});

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('Missing Supabase environment variables', undefined, {
        url: supabaseUrl ? 'Set' : 'Missing',
        key: supabaseAnonKey ? 'Set' : 'Missing'
    });
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    },
    global: {
        headers: {
            'X-Client-Info': 'betterbooks-web'
        }
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

// Test connection on client creation
supabase.auth.getSession().then(({ error }) => {
    if (error) {
        logger.error('Initial Supabase connection test failed', error);
    } else {
        logger.info('Supabase connection test successful');
    }
}).catch(error => {
    logger.error('Supabase client initialization error', error);
}); 