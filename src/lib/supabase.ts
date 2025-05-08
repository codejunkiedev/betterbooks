import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing! Please check your environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
supabase.auth.getSession().then(({ error }) => {
    if (error) {
        console.error('❌ Supabase connection failed:', error.message)
    } else {
        console.log('✅ Supabase connected successfully!')
    }
}) 