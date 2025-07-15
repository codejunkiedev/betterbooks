import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
    document_id: string;
    comment_content: string;
    author_name: string;
    document_name: string;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { document_id, comment_content, author_name, document_name }: NotificationRequest = await req.json()

        // Get document and company information
        const { data: documentData, error: documentError } = await supabaseClient
            .from('documents')
            .select(`
        id,
        original_filename,
        company_id,
        companies!inner (
          id,
          name,
          user_id,
          assigned_accountant_id
        )
      `)
            .eq('id', document_id)
            .single()

        if (documentError) {
            throw new Error(`Failed to fetch document: ${documentError.message}`)
        }

        const company = documentData.companies
        const recipients: string[] = []

        // Get company owner email
        const { data: ownerData } = await supabaseClient.auth.admin.getUserById(company.user_id)
        if (ownerData.user && ownerData.user.email) {
            recipients.push(ownerData.user.email)
        }

        // Get assigned accountant email if exists
        if (company.assigned_accountant_id) {
            const { data: accountantData } = await supabaseClient
                .from('accountants')
                .select('user_id')
                .eq('id', company.assigned_accountant_id)
                .single()

            if (accountantData) {
                const { data: accountantUserData } = await supabaseClient.auth.admin.getUserById(accountantData.user_id)
                if (accountantUserData.user && accountantUserData.user.email) {
                    recipients.push(accountantUserData.user.email)
                }
            }
        }

        // Remove duplicates
        const uniqueRecipients = [...new Set(recipients)]

        // Send email notifications to each recipient
        for (const email of uniqueRecipients) {
            const emailData = {
                to: [email],
                subject: `New Comment on Bank Statement: ${document_name}`,
                html: `
          <h2>New Comment Added</h2>
          <p>A new comment has been added to a bank statement for <strong>${company.name}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Document Details:</h3>
            <p><strong>File:</strong> ${document_name}</p>
            <p><strong>Company:</strong> ${company.name}</p>
          </div>

          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Comment by ${author_name}:</h3>
            <p style="font-style: italic;">"${comment_content}"</p>
          </div>

          <p>Please log in to your account to view the full comment thread and respond if needed.</p>
          
          <div style="margin-top: 20px;">
            <a href="${Deno.env.get('FRONTEND_URL') || 'https://your-app.com'}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View in BetterBooks
            </a>
          </div>
        `,
            }

            // Here you would integrate with your email service (SendGrid, Resend, etc.)
            // For now, we'll log the email that would be sent
            console.log(`Email notification would be sent to: ${email}`)
            console.log('Email content:', emailData)

            // If you're using Supabase's built-in email service or want to integrate with a service like Resend:
            /*
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'notifications@betterbooks.com',
                to: [email],
                subject: emailData.subject,
                html: emailData.html,
              }),
            })
      
            if (!emailResponse.ok) {
              console.error(`Failed to send email to ${email}:`, await emailResponse.text())
            }
            */
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Notifications would be sent to ${uniqueRecipients.length} recipients`,
                recipients: uniqueRecipients
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