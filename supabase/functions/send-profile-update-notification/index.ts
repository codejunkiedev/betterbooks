import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsOptions, getAppBaseUrl } from '../_shared/utils.ts'

interface UpdateBody {
    accountant_user_id: string;
    changes: Record<string, unknown>;
}

const resendApiKey = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return handleCorsOptions(req)
    }

    const cors = getCorsHeaders(req)

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        }

        if (!resendApiKey) {
            throw new Error('Missing RESEND_API_KEY environment variable');
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { accountant_user_id, changes }: UpdateBody = await req.json();

        const { data: userData, error: adminErr } = await supabaseAdmin.auth.admin.getUserById(accountant_user_id);
        if (adminErr) throw adminErr;
        const toEmail = userData.user?.email;
        if (!toEmail) {
            return new Response(JSON.stringify({ error: 'Accountant email not found' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
        }

        const changedKeys = Object.keys(changes || {});
        const htmlChanges = changedKeys.length
            ? `<ul>${changedKeys.map(k => `<li><strong>${k}</strong>: ${String((changes as Record<string, unknown>)[k])}</li>`).join('')}</ul>`
            : '<p>No visible field changes were included.</p>';

        const appBaseUrl = getAppBaseUrl()
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'BetterBooks <noreply@usebetterbooks.com>',
                to: [toEmail],
                subject: 'Your BetterBooks profile was updated',
                html: `
          <h2>Your profile has been updated</h2>
          <p>An admin updated your accountant profile. Summary of changes:</p>
          ${htmlChanges}
          <div style="margin-top: 20px;">
            <a href="${appBaseUrl}/accountant/login" style="background-color:#0F766E;color:white;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block;">Go to BetterBooks</a>
          </div>
        `,
            })
        });

        if (!emailResponse.ok) {
            const text = await emailResponse.text();
            throw new Error(`Failed to send email: ${text}`);
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Error in send-profile-update-notification:', message);
        return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
}); 