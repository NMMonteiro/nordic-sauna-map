import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SITE_URL = Deno.env.get("SITE_URL") || "https://nordicsaunamap.com"
const LOGO_URL = `${SITE_URL}/logo.png`

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseServer = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Authenticate the user (must be an admin)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('No authorization header')

        const { data: { user }, error: authError } = await supabaseServer.auth.getUser(authHeader.replace('Bearer ', ''))
        if (authError || !user) throw new Error('Unauthorized')

        const { data: profile } = await supabaseServer
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') throw new Error('Forbidden: Admins only')

        // 2. Parse request body
        const body = await req.json()
        const { audience, templateId, subject, content, imageUrl, lang } = body

        // 3. Fetch recipients based on audience
        let recipients: any[] = []

        if (audience === 'test') {
            const { testEmail } = body
            recipients = [{ id: 'test-id', email: testEmail || 'nuno@tropicalastral.com' }]
        } else {
            // Fetch all unsubscribed emails once to filter them out
            const { data: unsubscribed } = await supabaseServer
                .from('newsletter_subscribers')
                .select('email')
                .eq('status', 'unsubscribed')

            const suppressedEmails = new Set(unsubscribed?.map(u => u.email) || [])

            if (audience === 'subscribers' || audience === 'all') {
                const { data } = await supabaseServer
                    .from('newsletter_subscribers')
                    .select('id, email')
                    .eq('status', 'active')
                if (data) recipients = [...recipients, ...data]
            }

            if (audience === 'members' || audience === 'all') {
                const { data } = await supabaseServer
                    .from('profiles')
                    .select('id, email')
                if (data) recipients = [...recipients, ...data]
            }

            // De-duplicate by email AND Filter out suppressed emails
            recipients = Array.from(new Map(recipients.map(r => [r.email, r])).values())
                .filter(r => !suppressedEmails.has(r.email))
        }

        const uniqueRecipients = recipients

        if (uniqueRecipients.length === 0) {
            return new Response(JSON.stringify({ count: 0, message: "No recipients found" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            })
        }

        // 4. Create Newsletter Record
        const { data: newsletter, error: newsletterError } = await supabaseServer
            .from('broadcasts')
            .insert({
                subject,
                audience,
                template_id: templateId,
                content,
                image_url: imageUrl,
                sent_by: user.id,
                total_recipients: uniqueRecipients.length
            })
            .select()
            .single()

        if (newsletterError) throw newsletterError

        // 5. Send emails and log recipients
        let successCount = 0
        let failureCount = 0
        const errors: any[] = []

        const sendPromises = uniqueRecipients.map(async (recipient) => {
            let status = 'sent'
            let error_message = null

            try {
                if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured in Supabase Secrets.');

                const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}&id=${recipient.id}`
                const html = generateEmailHtml(templateId, subject, content, imageUrl, lang, unsubscribeUrl)

                const res = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${RESEND_API_KEY}`,
                    },
                    body: JSON.stringify({
                        from: "Nordic Sauna Map <newsletter@nordicsaunamap.com>",
                        to: [recipient.email],
                        subject,
                        html,
                    }),
                })

                const resData = await res.json()
                if (res.ok) {
                    successCount++
                } else {
                    status = 'failed'
                    error_message = resData.message || JSON.stringify(resData)
                    failureCount++
                    errors.push({ email: recipient.email, error: error_message })
                }
            } catch (err: any) {
                status = 'failed'
                error_message = err.message
                failureCount++
                errors.push({ email: recipient.email, error: error_message })
            }

            // Log recipient status
            await supabaseServer
                .from('broadcast_recipients')
                .insert({
                    broadcast_id: newsletter.id,
                    email: recipient.email,
                    status,
                    error_message
                })
        })

        await Promise.all(sendPromises)

        // 6. Update Final Counts
        await supabaseServer
            .from('broadcasts')
            .update({
                success_count: successCount,
                failure_count: failureCount
            })
            .eq('id', newsletter.id)

        return new Response(JSON.stringify({
            newsletterId: newsletter.id,
            count: uniqueRecipients.length,
            successCount,
            failureCount,
            errors
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        })

    } catch (err: any) {
        console.error('Broadcast function error:', err)
        return new Response(JSON.stringify({
            error: err.message,
            stack: err.stack,
            details: err
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        })
    }
})

function generateEmailHtml(templateId: string, subject: string, content: string, imageUrl: string | null, lang: string, unsubscribeUrl: string) {
    const isModern = templateId === 'modern'
    const unsubscribeText = { en: "Unsubscribe", sv: "Avregistrera dig", fi: "Peruuta tilaus" }[lang] || "Unsubscribe"

    const fallbackImage = isModern
        ? "https://images.unsplash.com/photo-1590579491624-f98f36d4c763?auto=format&fit=crop&q=80&w=800"
        : "https://images.unsplash.com/photo-1519783166144-83936959822a?auto=format&fit=crop&q=80&w=800"

    const finalImageUrl = imageUrl || fallbackImage

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #020617; margin: 0; padding: 0; background-color: #f8fafc; }
            .wrapper { width: 100%; max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: ${isModern ? '32px' : '0'}; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 60px 48px; text-align: ${isModern ? 'left' : 'center'}; color: white; }
            .content { padding: 48px; }
            .footer { padding: 48px; text-align: center; font-size: 11px; color: #94a3b8; background: #f8fafc; text-transform: uppercase; letter-spacing: 0.1em; }
            .logo-text { font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; font-size: 20px; color: #ffffff; }
            .accent { color: #3b82f6; } /* Using primary blue instead of orange */
            h1 { font-size: ${isModern ? '42px' : '32px'}; font-weight: 900; margin-bottom: 24px; letter-spacing: -0.04em; color: #020617; line-height: 1.1; text-align: ${isModern ? 'left' : 'center'}; }
            p { margin-bottom: 24px; font-size: 16px; color: #0f172a; white-space: pre-wrap; }
            .button { display: inline-block; padding: 20px 40px; background-color: #0f172a; color: white !important; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <div class="logo-text">Nordic<span class="accent">Sauna</span>Map</div>
            </div>
            <div class="content">
                <img src="${finalImageUrl}" style="width: 100%; height: auto; border-radius: ${isModern ? '24px' : '0'}; margin-bottom: 32px;" />
                <h1>${subject}</h1>
                <p>${content}</p>
                <div style="text-align: center; margin-top: 40px;">
                    <a href="${SITE_URL}" class="button">Visit the Platform</a>
                </div>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Nordic Sauna Map Digital Archive<br/>
                Preserving the cultural heritage of the North.<br/><br/>
                <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">${unsubscribeText}</a>
            </div>
        </div>
    </body>
    </html>
    `
}
