import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsOptions, getAppBaseUrl, sendEmailWithRetry } from '../_shared/utils.ts'

interface Payload {
    user_id: string;
    module: 'ACCOUNTING' | 'TAX_FILING' | 'PRAL_INVOICING';
    enabled: boolean;
    settings?: Record<string, unknown>;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return handleCorsOptions(req);
    const cors = getCorsHeaders(req);

    try {
        const body: Payload = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!supabaseUrl || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

        const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

        // Get user's email
        const { data: auth } = await supabaseAdmin.auth.admin.getUserById(body.user_id);
        const toEmail = auth?.user?.email ?? null;

        // Compose email
        if (toEmail) {
            const appBaseUrl = getAppBaseUrl();
            const subject = body.enabled ? `Access enabled: ${body.module}` : `Access disabled: ${body.module}`;
            const html = body.enabled
                ? `<h2>Your access has been enabled</h2><p>We have enabled ${body.module.replace('_', ' ')} for your account.</p><p><a href="${appBaseUrl}/user/login">Open BetterBooks</a></p>`
                : `<h2>Your access has been disabled</h2><p>${body.module.replace('_', ' ')} access has been disabled. Your data is preserved but new entries are restricted.</p>`;

            await sendEmailWithRetry(toEmail, subject, html);
        }

        // Log activity
        await supabaseAdmin.from('activity_logs').insert({
            company_id: null,
            actor_id: null,
            activity: body.enabled ? 'REPORT_GENERATED' : 'REPORT_GENERATED',
            details: { type: 'MODULE_CHANGE', module: body.module, enabled: body.enabled, settings: body.settings ?? null }
        });

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Internal error';
        return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }
}); 