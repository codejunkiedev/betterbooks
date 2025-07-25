import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? 're_Jsj8dd3F_BTEpTZ9PfdzmpbtWrAjjZWwG';

interface NotificationRequest {
    company_id: string,
    sender_id: string,
    recipient_id: string,
    related_document_id: string,
    content: string,
    is_read: boolean;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { sender_id, recipient_id, related_document_id, content }: NotificationRequest = await req.json()

        // Get all data in parallel using Promise.all
        const [
            { data: senderData },
            { data: receiverData },
            { data: documentData }
        ] = await Promise.all([
            supabaseClient.auth.admin.getUserById(sender_id),
            supabaseClient.auth.admin.getUserById(recipient_id!),
            supabaseClient.from('documents').select('original_filename, companies!inner(name)').eq('id', related_document_id).single()
        ]);

        console.log({
            senderData,
            receiverData,
            documentData
        });

        if (!senderData.user?.email) {
            throw new Error('Sender email not found')
        }

        if (!receiverData.user?.email) {
            throw new Error('Receiver email not found')
        }

        // Send email
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'noreply@usebetterbooks.com',
                to: [receiverData.user.email],
                subject: `New Comment on Document: ${documentData.original_filename}`,
                html: `
                    <h2>New Comment Added</h2>
                    <p>A new comment has been added to <strong>${documentData.original_filename}</strong> for <strong>${documentData.companies.name}</strong>.</p>
                    <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3>Comment:</h3>
                        <p style="font-style: italic;">"${content}"</p>
                    </div>
                    <p>Please log in to your account to view the full comment thread.</p>
                    <div style="margin-top: 20px;">
                        <a href="https://betterbooks-two.vercel.app/" 
                           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            View in BetterBooks
                        </a>
                    </div>
                `,
            }),
        })

        if (!emailResponse.ok) {
            throw new Error(`Failed to send email: ${await emailResponse.text()}`)
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Email sent from ${senderData.user.email} to ${receiverData.user.email}`,
                from: senderData.user.email,
                to: receiverData.user.email
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error) {
        console.error('Error in send-comment-notification function:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                success: false
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})  