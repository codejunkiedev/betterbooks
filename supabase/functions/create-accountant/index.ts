import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, AuthError } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateAccountantRequest {
    full_name: string
    email: string
    phone_number: string
    professional_qualifications: 'CA' | 'ACCA' | 'CMA' | 'Other'
    specialization: string[]
    employment_type: 'Full-time' | 'Part-time' | 'Consultant'
    max_client_capacity?: number
    start_date?: string
    actor_id?: string
}

function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
    const length = 12
    let pwd = ''
    for (let i = 0; i < length; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pwd
}

function generateAccountantCode(): string {
    return `ACC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body: CreateAccountantRequest = await req.json()

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

        const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Create auth user with temporary password
        const tempPassword = generateTempPassword()
        const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email: body.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { role: 'ACCOUNTANT', full_name: body.full_name }
        })

        if (createUserError) {
            const message = (createUserError as AuthError).message || 'Failed to create user'
            const lower = message.toLowerCase()
            const isDup = lower.includes('exists') || lower.includes('already') || lower.includes('duplicate')
            return new Response(
                JSON.stringify({ error: isDup ? 'Email already exists in the system' : message, code: isDup ? 'EMAIL_EXISTS' : 'CREATE_USER_FAILED' }),
                { status: isDup ? 409 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const userId = createdUser?.user?.id
        if (!userId) {
            return new Response(JSON.stringify({ error: 'User creation failed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // Upsert profile (full_name, phone)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({ id: userId, full_name: body.full_name, phone_number: body.phone_number, is_active: true }, { onConflict: 'id' })
        if (profileError) throw profileError

        // Insert accountant record
        const accountant_code = generateAccountantCode()
        const { data: accountant, error: accError } = await supabaseAdmin
            .from('accountants')
            .insert({
                user_id: userId,
                full_name: body.full_name,
                is_active: true,
                phone_number: body.phone_number,
                professional_qualifications: body.professional_qualifications,
                specialization: body.specialization,
                employment_type: body.employment_type,
                max_client_capacity: body.max_client_capacity ?? null,
                start_date: body.start_date ?? null,
                accountant_code,
            })
            .select()
            .single()
        if (accError) throw accError

        // Log activity (ACCOUNTANT_CREATED)
        try {
            await supabaseAdmin
                .from('activity_logs')
                .insert({
                    company_id: null,
                    actor_id: body.actor_id ?? null,
                    activity: 'ACCOUNTANT_CREATED',
                    details: {
                        email: body.email,
                        accountant_code,
                        full_name: body.full_name,
                    },
                })
        } catch (logErr) {
            console.warn('Activity log failed:', (logErr as Error).message)
        }

        // Send welcome email with credentials
        try {
            const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'BetterBooks <noreply@usebetterbooks.com>',
                    to: [body.email],
                    subject: 'Welcome to BetterBooks – Your Accountant Account',
                    html: `
            <h2>Welcome, ${body.full_name}!</h2>
            <p>Your accountant account has been created. Use the credentials below to sign in.</p>
            <div style="background:#f3f4f6;padding:12px;border-radius:8px;margin:12px 0">
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p>Please sign in and change your password immediately.</p>
            <div style="margin-top:16px">
              <a href="https://betterbooks-two.vercel.app/accountant/login" style="background:#111827;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Sign in</a>
            </div>
          `,
                }),
            })
            if (!emailResponse.ok) {
                console.warn('Failed to send welcome email:', await emailResponse.text())
            }
        } catch (emailErr) {
            console.warn('Email send error:', (emailErr as Error).message)
        }

        return new Response(
            JSON.stringify({ success: true, data: { accountant, user_id: userId } }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('create-accountant error:', error)
        return new Response(
            JSON.stringify({ error: (error as Error).message ?? 'Unknown error' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
}) 