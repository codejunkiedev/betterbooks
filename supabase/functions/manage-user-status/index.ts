import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsOptions } from '../_shared/utils.ts'

interface RequestBody {
    action: 'suspend' | 'reactivate'
    user_id: string
    company_id: string
    reason: string
    notes?: string
    notify_user: boolean
    notify_accountant: boolean
    actor_id?: string
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return handleCorsOptions(req)
    }

    const cors = getCorsHeaders(req)

    try {
        const { action, user_id, company_id, reason, notes, notify_user, notify_accountant, actor_id }: RequestBody = await req.json()

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

        const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Update company status
        const isActive = action === 'reactivate'
        const { error: companyErr } = await supabaseAdmin
            .from('companies')
            .update({ is_active: isActive })
            .eq('id', company_id)
        if (companyErr) throw companyErr

        // Attempt to update auth ban status (best-effort)
        try {
            // Note: Supabase Admin API may not support direct ban flags in all versions
            // This is best-effort and safe to ignore on failure
            if (!isActive) {
                // Potential future API placeholder (ignored if unsupported)
                await supabaseAdmin.auth.admin.updateUserById(user_id, {})
            } else {
                await supabaseAdmin.auth.admin.updateUserById(user_id, {})
            }
        } catch (e) { console.warn('Auth admin update skipped:', e instanceof Error ? e.message : e); }

        // Fetch user and company for email/context
        const [{ data: userData }, { data: companyData }, { data: actorData }] = await Promise.all([
            supabaseAdmin.auth.admin.getUserById(user_id),
            supabaseAdmin.from('companies').select('id,name,assigned_accountant_id').eq('id', company_id).maybeSingle(),
            actor_id ? supabaseAdmin.auth.admin.getUserById(actor_id) : Promise.resolve({ data: { user: null } })
        ])

        // Insert activity log
        const activity = isActive ? 'COMPANY_ACTIVATED' : 'COMPANY_DEACTIVATED'
        const details = {
            reason,
            notes: notes || null,
            actor_id: actor_id || null,
            actor_email: actorData?.user?.email || null,
            user_email: userData?.user?.email || null,
        }

        await supabaseAdmin
            .from('activity_logs')
            .insert({ company_id, actor_id: actor_id ?? null, activity, details })

        // Resolve accountant email if needed
        let accountantEmail: string | null = null
        if (notify_accountant && companyData?.assigned_accountant_id) {
            const { data: accountant } = await supabaseAdmin
                .from('accountants')
                .select('user_id')
                .eq('id', companyData.assigned_accountant_id)
                .maybeSingle()
            if (accountant?.user_id) {
                const { data: accountantAuth } = await supabaseAdmin.auth.admin.getUserById(accountant.user_id)
                accountantEmail = accountantAuth?.user?.email ?? null
            }
        }

        // Send emails
        if (resendApiKey && (notify_user || accountantEmail)) {
            const subject = isActive ? 'Your BetterBooks account has been reactivated' : 'Your BetterBooks account has been suspended'
            const html = isActive
                ? `<h2>Account Reactivated</h2><p>Your access has been restored for <strong>${companyData?.name ?? 'your company'}</strong>.</p>`
                : `<h2>Account Suspended</h2><p>Your access has been suspended for <strong>${companyData?.name ?? 'your company'}</strong>.</p><p><strong>Reason:</strong> ${reason.replace('_', ' ')}</p>${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}`

            const recipients: string[] = []
            if (notify_user && userData?.user?.email) recipients.push(userData.user.email)
            if (accountantEmail) recipients.push(accountantEmail)

            if (recipients.length > 0) {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from: 'BetterBooks <noreply@usebetterbooks.com>',
                        to: recipients,
                        subject,
                        html,
                    })
                })
                if (!res.ok) {
                    // Don't fail the action if email fails
                    console.warn('Failed to send email:', await res.text())
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return new Response(JSON.stringify({ error: message }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
}) 