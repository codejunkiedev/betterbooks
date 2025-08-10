import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, handleCorsOptions, getAppBaseUrl } from '../_shared/utils.ts'

interface AssignBody {
    companyId: string;
    userId: string; // company owner auth user id
    newAccountantUserId: string | null; // new accountant auth user id
    previousAccountantUserId?: string | null; // previous accountant auth user id
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

        const { userId, newAccountantUserId, previousAccountantUserId }: AssignBody = await req.json();

        // Fetch emails
        const userEmail = userId
            ? (await supabaseAdmin.auth.admin.getUserById(userId)).data.user?.email
            : undefined;
        const newAccEmail = newAccountantUserId
            ? (await supabaseAdmin.auth.admin.getUserById(newAccountantUserId)).data.user?.email
            : undefined;
        const prevAccEmail = previousAccountantUserId
            ? (await supabaseAdmin.auth.admin.getUserById(previousAccountantUserId)).data.user?.email
            : undefined;

        const appBaseUrl = getAppBaseUrl();

        const sendEmail = async (to: string, subject: string, html: string) => {
            const resp = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'BetterBooks <noreply@usebetterbooks.com>',
                    to: [to],
                    subject,
                    html,
                }),
            });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Failed to send email: ${text}`);
            }
        };

        // Compose emails
        const userHtml = `
      <h2>Your accountant has changed</h2>
      <p>We've assigned a new accountant to your account to better support your needs.</p>
      <p>You can message your accountant from the Messages section.</p>
      <div style="margin-top: 20px;">
        <a href="${appBaseUrl}/user/login" style="background-color:#0F766E;color:white;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block;">Go to BetterBooks</a>
      </div>
    `;

        const accHtml = `
      <h2>New client assigned</h2>
      <p>A client has been assigned to you. Please introduce yourself and start assisting them.</p>
      <div style="margin-top: 20px;">
        <a href="${appBaseUrl}/accountant/login" style="background-color:#0F766E;color:white;padding:10px 16px;text-decoration:none;border-radius:6px;display:inline-block;">Go to BetterBooks</a>
      </div>
    `;

        // Send emails where emails exist
        const tasks: Promise<void>[] = [];
        if (userEmail) tasks.push(sendEmail(userEmail, 'Your accountant has been assigned', userHtml));
        if (newAccEmail) tasks.push(sendEmail(newAccEmail, 'A new client has been assigned to you', accHtml));
        if (prevAccEmail) {
            const prevHtml = `
        <h2>Client reassigned</h2>
        <p>This is to inform you that a client has been reassigned to another accountant.</p>
      `;
            tasks.push(sendEmail(prevAccEmail, 'Client reassigned', prevHtml));
        }

        await Promise.all(tasks);

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        console.error('Error in send-accountant-assignment-notification:', message);
        return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
}); 