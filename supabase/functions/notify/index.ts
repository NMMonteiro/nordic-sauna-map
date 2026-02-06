import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@example.com"
const SITE_URL = Deno.env.get("SITE_URL") || "https://nordicsaunamap.com"

const LOGO_URL = `${SITE_URL}/logo.png`

// Multi-lingual translations
const i18n = {
    newsletter_welcome: {
        en: { subject: "Welcome to the Nordic Sauna Community! 🌿", title: "Welcome!", p1: "Thank you for subscribing to our newsletter. We're thrilled to have you join our community.", p2: "You'll receive updates on new sauna locations, archival stories, and cultural events directly in your inbox.", btn: "Explore the Map", preview: "You're now subscribed to the Nordic Sauna Map." },
        sv: { subject: "Välkommen till Nordic Sauna Community! 🌿", title: "Välkommen!", p1: "Tack för att du prenumererar på vårt nyhetsbrev. Vi är glada över att ha dig i vår community.", p2: "Du kommer att få uppdateringar om nya bastuplatser, arkivberättelser och kulturevenemang direkt i din inkorg.", btn: "Utforska kartan", preview: "Du prenumererar nu på Nordic Sauna Map." },
        fi: { subject: "Tervetuloa Nordic Sauna -yhteisöön! 🌿", title: "Tervetuloa!", p1: "Kiitos uutiskirjeemme tilaamisesta. Olemme innoissamme saadessamme sinut mukaan yhteisöömme.", p2: "Saat päivityksiä uusista saunapaikoista, arkistotarinoista ja kulttuuritapahtumista suoraan sähköpostiisi.", btn: "Tutki karttaa", preview: "Olet nyt Nordic Sauna Mapin tilaaja." }
    },
    submission_received: {
        en: { subject: "We've received your submission! 🌬️", title: "Submission Received!", p1: "We've successfully received your submission: ", p2: "Our heritage team is currently reviewing the details. You'll receive another email as soon as it's approved and live on the map.", footer: "Common review times are 24-48 hours.", preview: "Your submission is being reviewed." },
        sv: { subject: "Vi har tagit emot ditt bidrag! 🌬️", title: "Bidrag mottaget!", p1: "Vi har tagit emot ditt bidrag: ", p2: "Vårt kulturarvsteam granskar nu detaljerna. Du får ett nytt e-postmeddelande så snart det är godkänt och live på kartan.", footer: "Normal granskningstid är 24-48 timmar.", preview: "Ditt bidrag granskas." },
        fi: { subject: "Olemme vastaanottaneet ilmoituksesi! 🌬️", title: "Ilmoitus vastaanotettu!", p1: "Olemme vastaanottaneet ilmoituksesi: ", p2: "Perintötiimimme tarkistaa parhaillaan tietoja. Saat uuden sähköpstiviestin heti, kun se on hyväksytty ja julkaistu kartalla.", footer: "Normaali tarkistusaika on 24-48 tuntia.", preview: "Ilmoitustasi tarkistetaan." }
    },
    approved: {
        en: { subject: "Your submission is now LIVE! 🎉", title: "Great News!", p1: "Your submission ", p2: " has been approved and is now live for the whole community to see!", p3: "Thank you for helping us preserve and map the Nordic sauna heritage.", btn: "View on the Map", preview: "Your submission is now visible on the map." },
        sv: { subject: "Ditt bidrag är nu LIVE! 🎉", title: "Goda nyheter!", p1: "Ditt bidrag ", p2: " har godkänts och är nu live för hela communityn att se!", p3: "Tack för att du hjälper oss att bevara och kartlägga det nordiska bastuarvet.", btn: "Visa på kartan", preview: "Ditt bidrag är nu synligt på kartan." },
        fi: { subject: "Ilmoituksesi on nyt JULKAISTU! 🎉", title: "Hienoja uutisia!", p1: "Ilmoituksesi ", p2: " on hyväksytty ja on nyt koko yhteisön nähtävillä!", p3: "Kiitos, että autat meitä säilyttämään ja kartoittamaan pohjoismaista saunaperintöä.", btn: "Katso kartalta", preview: "Ilmoituksesi on nyt nähtävillä kartalla." }
    }
}

// Premium Nordic Email Template Wrapper
const emailWrapper = (content: string, previewText: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nordic Sauna Map</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, helvetica, arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .header { background: #0f172a; padding: 48px; text-align: center; color: white; }
        .content { padding: 48px; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #94a3b8; background: #f8fafc; }
        .logo-img { width: 120px; height: auto; margin-bottom: 24px; }
        .logo-text { font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; font-size: 24px; color: #ffffff; margin-bottom: 8px; }
        .accent { color: #f97316; }
        h1 { font-size: 32px; font-weight: 900; margin-bottom: 24px; letter-spacing: -0.04em; color: #0f172a; line-height: 1.1; }
        p { margin-bottom: 24px; font-size: 16px; color: #475569; }
        .button { display: inline-block; padding: 18px 36px; background-color: #0f172a; color: white !important; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.2s; }
        .divider { height: 1px; background: #f1f5f9; margin: 32px 0; }
        .preview { display: none !important; opacity: 0; height: 0; width: 0; }
    </style>
</head>
<body>
    <div class="preview">${previewText}</div>
    <div class="wrapper">
        <div class="header">
            <img src="${LOGO_URL}" alt="Nordic Sauna Map" class="logo-img">
            <div class="logo-text">Nordic<span class="accent">Sauna</span>Map</div>
            <div style="font-size: 12px; opacity: 0.6; letter-spacing: 0.2em; text-transform: uppercase;">Heritage Registry</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Nordic Sauna Map. Built for the community.<br/>
            This is an automated notification from your account settings.
            ${content.includes('unsubscribe-container') ? '' : `
                <div style="margin-top: 16px; border-top: 1px solid #e2e8f0; pt-16;">
                    <p style="font-size: 11px; color: #94a3b8; margin: 16px 0 0 0;">
                        This email was sent to you because you're a member of the Nordic Sauna community.
                    </p>
                </div>
            `}
        </div>
    </div>
</body>
</html>
`

serve(async (req) => {
    const payload = await req.json()
    console.log("[DEBUG] Full payload received:", JSON.stringify(payload))
    const { table, record, old_record, operation } = payload

    const supabaseServer = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Enhanced Language Detection
    let lang = 'en'
    if (record.language) lang = record.language
    else if (record.metadata?.submission_lang) lang = record.metadata.submission_lang
    else if (record.metadata?.lang) lang = record.metadata.lang

    lang = lang.toLowerCase().substring(0, 2)
    console.log(`[DEBUG] Final chosen language: "${lang}" for table: ${table}`)

    const t = (key: string) => {
        const entry = (i18n as any)[key]
        return entry[lang] || entry['en']
    }

    let recipient = ""
    let subject = ""
    let body = ""
    let preview = ""

    const unsubscribeText = {
        en: "Unsubscribe",
        sv: "Avregistrera dig",
        fi: "Peruuta tilaus"
    }[lang as 'en' | 'sv' | 'fi'] || "Unsubscribe";

    // CASE: NEWSLETTER SIGNUP
    if (table === 'newsletter_subscribers' && operation === 'INSERT') {
        const text = t('newsletter_welcome')
        const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(record.email)}&id=${record.id}`
        recipient = record.email
        subject = text.subject
        preview = text.preview
        body = `
            <h1>${text.title}</h1>
            <p>${text.p1}</p>
            <p>${text.p2}</p>
            <a href="${SITE_URL}" class="button">${text.btn}</a>
            <div id="unsubscribe-container" style="margin-top: 48px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p style="font-size: 12px; color: #94a3b8;">
                    Stayed too long in the steam? <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">${unsubscribeText}</a>
                </p>
            </div>
        `
    }

    // CASE: NEW SUBMISSION (Sauna or Blog)
    if (operation === 'INSERT' && (table === 'saunas' || table === 'blog_posts')) {
        const userId = table === 'saunas' ? record.created_by : record.author_id
        const { data: profile } = await supabaseServer
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single()

        const userEmail = profile?.email || 'user@example.com'
        const userName = profile?.full_name || 'Friends'
        const itemTitle = record.title || (record.content?.en ? record.content.en.name : 'Untitled Submission')

        // 1. Notify Admin (You)
        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `Action Required: New ${table === 'saunas' ? 'Sauna' : 'Blog Post'}`,
            html: emailWrapper(`
                <h1>New Submission: ${itemTitle}</h1>
                <p>A new entry has been submitted for review by <strong>${userName}</strong> (${userEmail}).</p>
                <div class="divider"></div>
                <p>Please log in to the admin panel to review and approve this submission.</p>
                <a href="${SITE_URL}/admin" class="button">Review Submission</a>
            `, `New ${table} submission needs your approval.`)
        })

        // 2. Notify User (Receipt)
        const text = t('submission_received')
        recipient = userEmail
        subject = text.subject
        preview = text.preview
        body = `
            <h1>${text.title}</h1>
            <p>Hi ${userName},</p>
            <p>${text.p1} <strong>"${itemTitle}"</strong>.</p>
            <p>${text.p2}</p>
            <div class="divider"></div>
            <p style="font-size: 14px; color: #94a3b8;">${text.footer}</p>
        `
    }

    // CASE: APPROVAL
    if (operation === 'UPDATE' && old_record.status === 'pending_approval' && record.status === 'approved') {
        const userId = table === 'saunas' ? record.created_by : record.author_id
        const { data: profile } = await supabaseServer
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single()

        recipient = profile?.email || 'user@example.com'
        const userName = profile?.full_name || 'Friends'
        const itemTitle = record.title || (record.content?.en ? record.content.en.name : 'Your submission')

        const text = t('approved')
        subject = text.subject
        preview = text.preview
        body = `
            <h1>${text.title}</h1>
            <p>Hi ${userName},</p>
            <p>${text.p1} <strong>"${itemTitle}"</strong> ${text.p2}</p>
            <p>${text.p3}</p>
            <a href="${SITE_URL}" class="button">${text.btn}</a>
        `
    }

    if (subject && body) {
        await sendEmail({ to: recipient, subject, html: emailWrapper(body, preview) })
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
            from: "Nordic Sauna Map <notifications@nordicsaunamap.com>",
            to: [to],
            subject,
            html,
        }),
    })

    return await res.json()
}
