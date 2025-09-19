import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsOptions } from '../_shared/utils.ts'

console.log("get-admin-users function started")

interface RequestBody {
    action: string;
    user_id?: string;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return handleCorsOptions(req)
    }

    const cors = getCorsHeaders(req)

    try {
        const { action, user_id }: RequestBody = await req.json()

        // Create a Supabase client with service role (admin access)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        if (action === 'get_user_auth_details' && user_id) {
            // Get user auth details from auth.users table
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id)

            if (authError) {
                console.error('Error fetching auth user:', authError)
                return new Response(
                    JSON.stringify({
                        error: 'Failed to fetch user auth details',
                        details: authError.message
                    }),
                    {
                        status: 400,
                        headers: { ...cors, 'Content-Type': 'application/json' }
                    }
                )
            }

            if (!authUser?.user) {
                return new Response(
                    JSON.stringify({
                        error: 'User not found'
                    }),
                    {
                        status: 404,
                        headers: { ...cors, 'Content-Type': 'application/json' }
                    }
                )
            }

            // Return relevant auth details
            const authDetails = {
                email: authUser.user.email,
                last_sign_in_at: authUser.user.last_sign_in_at,
                created_at: authUser.user.created_at,
                confirmed_at: authUser.user.confirmed_at,
                email_confirmed_at: authUser.user.email_confirmed_at
            }

            return new Response(
                JSON.stringify(authDetails),
                {
                    status: 200,
                    headers: { ...cors, 'Content-Type': 'application/json' }
                }
            )
        }

        // If action is not recognized
        return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            {
                status: 400,
                headers: { ...cors, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error in get-admin-users function:', error)
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                details: (error as Error).message
            }),
            {
                status: 500,
                headers: { ...cors, 'Content-Type': 'application/json' }
            }
        )
    }
}) 