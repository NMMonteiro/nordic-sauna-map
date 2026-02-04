import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@example.com"

serve(async (req) => {
    const payload = await req.json()
    const { table, record, old_record, operation } = payload

    const supabaseServer = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch author/user details
    const userId = table === 'saunas' ? record.created_by : record.author_id
    const { data: profile } = await supabaseServer
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()

    const userEmail = profile?.email || 'user@example.com'
    const userName = profile?.full_name || 'Sauna Enthusiast'

    let subject = ""
    let html = ""
    let recipient = userEmail

    // CASE: NEW SUBMISSION
    if (operation === 'INSERT') {
        // Notify Admin
        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Submission: ${table}`,
            html: `<h1>New ${table} submitted</h1>
             <p>A new ${table === 'saunas' ? 'sauna location' : 'blog post'} has been submitted by ${userName}.</p>
             <p>Login to the Admin Console to review it.</p>`
        })

        // Notify User
        subject = "We've received your submission!"
        html = `<h1>Tack för ditt bidrag!</h1>
            <p>Hi ${userName}, we've received your ${table === 'saunas' ? 'sauna record' : 'blog post'}: "${record.title || record.content?.en?.name || 'Untitled'}".</p>
            <p>Our team will review it shortly. You'll receive another email once it's approved and live on the Nordic Sauna Map.</p>`
    }

    // CASE: APPROVAL
    if (operation === 'UPDATE' && old_record.status === 'pending_approval' && record.status === 'approved') {
        subject = "Your submission has been approved!"
        html = `<h1>Bra nyheter!</h1>
            <p>Hi ${userName}, your ${table === 'saunas' ? 'sauna record' : 'blog post'} has been approved and is now live!</p>
            <p>Check it out on the <a href="${Deno.env.get('SITE_URL') || 'https://nordicsauna.map'}">Nordic Sauna Map</a>.</p>`
    }

    if (subject && html) {
        await sendEmail({ to: recipient, subject, html })
    }

    return new Response(JSON.stringify({ message: "Notification processed" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    })
})

async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    if (!RESEND_API_KEY) {
        console.error("RESEND_API_KEY not set")
        return
    }

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: "Nordic Sauna Map <notifications@learnmera.com>",
            to: [to],
            subject,
            html,
        }),
    })

    return await res.json()
}
