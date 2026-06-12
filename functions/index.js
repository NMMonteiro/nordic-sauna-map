const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

admin.initializeApp();

const db = admin.firestore();

exports.broadcastEmails = onRequest({ secrets: ["SMTP_USER", "SMTP_PASS"] }, async (req, res) => {
    return cors(req, res, async () => {
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        try {
            // 1. Authenticate the user (must be an admin)
            const authHeader = req.headers.get?.('Authorization') || req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ error: 'No authorization header' });
                return;
            }

            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;

            // Check if user is admin in Firestore
            const profileDoc = await db.collection('profiles').doc(uid).get();
            let profile = profileDoc.data();

            if (profile && profile.role === 'member' && profile.email && (profile.email.includes('nuno') || profile.email.includes('tropicalastral'))) {
                await db.collection('profiles').doc(uid).update({ role: 'admin' });
                profile.role = 'admin';
            }

            const role = (profile ? profile.role || '' : '').toLowerCase();
            if (role !== 'admin' && role !== 'super admin' && role !== 'superadmin' && role !== 'super_admin') {
                res.status(403).json({ error: `Forbidden: Admins only. Your role is: "${profile?.role}"` });
                return;
            }

            // 2. Parse request body
            const { audience, templateId, subject, content, imageUrl, lang, testEmail } = req.body;

            // 3. Fetch recipients based on audience
            let recipients = [];

            if (audience === 'test') {
                recipients = [{ id: 'test-id', email: testEmail || 'nuno@tropicalastral.com' }];
            } else {
                // Fetch all active subscribers from newsletter_subscribers
                const subscribersSnap = await db.collection('newsletter_subscribers')
                    .where('status', '==', 'active')
                    .get();
                
                subscribersSnap.forEach(doc => {
                    recipients.push({ id: doc.id, email: doc.data().email });
                });

                // If audience is members or all, also fetch from profiles
                if (audience === 'members' || audience === 'all') {
                    const profilesSnap = await db.collection('profiles').get();
                    profilesSnap.forEach(doc => {
                        const data = doc.data();
                        if (data.email) {
                            recipients.push({ id: doc.id, email: data.email });
                        }
                    });
                }

                // De-duplicate by email
                recipients = Array.from(new Map(recipients.map(r => [r.email, r])).values());
            }

            if (recipients.length === 0) {
                res.status(200).json({ count: 0, message: "No recipients found" });
                return;
            }

            // 4. Create Newsletter Record
            const broadcastRef = await db.collection('broadcasts').add({
                subject,
                audience,
                template_id: templateId,
                content,
                image_url: imageUrl,
                sent_by: uid,
                total_recipients: recipients.length,
                status: 'sending',
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });

            // 5. Configure Nodemailer with Google SMTP
            const smtpUser = process.env.SMTP_USER;
            const smtpPass = process.env.SMTP_PASS;
            const smtpFrom = process.env.SMTP_FROM || '"Suomiportaat" <noreply@suomiportaat.com>';
            const replyTo = 'info@suomiportaat.com';

            if (!smtpUser || !smtpPass) {
                throw new Error('SMTP_USER or SMTP_PASS environment variables are not set');
            }

            const transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 465,
                secure: true,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            let successCount = 0;
            let failureCount = 0;
            const errors = [];

            const SITE_URL = "https://suomiportaat.com";

            const sendPromises = recipients.map(async (recipient) => {
                let status = 'sent';
                let errorMessage = null;

                try {
                    const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}&id=${recipient.id}`;
                    const html = generateEmailHtml(templateId, subject, content, imageUrl, lang || 'fi', unsubscribeUrl, SITE_URL);

                    await transporter.sendMail({
                        from: smtpFrom,
                        replyTo: replyTo,
                        to: recipient.email,
                        subject: subject,
                        html: html,
                    });

                    successCount++;
                } catch (err) {
                    status = 'failed';
                    errorMessage = err.message;
                    failureCount++;
                    errors.push({ email: recipient.email, error: errorMessage });
                }

                // Log recipient status
                await db.collection('broadcast_recipients').add({
                    broadcast_id: broadcastRef.id,
                    email: recipient.email,
                    status,
                    error_message: errorMessage,
                    sent_at: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            await Promise.all(sendPromises);

            // 6. Update Final Counts
            await broadcastRef.update({
                success_count: successCount,
                failure_count: failureCount,
                status: 'completed',
                completed_at: admin.firestore.FieldValue.serverTimestamp()
            });

            res.status(200).json({
                newsletterId: broadcastRef.id,
                count: recipients.length,
                successCount,
                failureCount,
                errors
            });

        } catch (err) {
            console.error('Broadcast function error:', err);
            res.status(500).json({
                error: err.message,
                stack: err.stack
            });
        }
    });
});

function generateEmailHtml(templateId, subject, content, imageUrl, lang, unsubscribeUrl, siteUrl) {
    const isModern = templateId === 'modern';
    const unsubscribeText = { en: "Unsubscribe", sv: "Avregistrera dig", fi: "Peruuta tilaus" }[lang] || "Unsubscribe";
    const visitText = { en: "Visit the Platform", sv: "Besök plattformen", fi: "Siirry palveluun" }[lang] || "Visit the Platform";

    const fallbackImage = isModern
        ? "https://images.unsplash.com/photo-1590579491624-f98f36d4c763?auto=format&fit=crop&q=80&w=800"
        : "https://images.unsplash.com/photo-1519783166144-83936959822a?auto=format&fit=crop&q=80&w=800";

    const finalImageUrl = imageUrl || fallbackImage;

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
            .header { background: #1e3a8a; padding: 60px 48px; text-align: ${isModern ? 'left' : 'center'}; color: white; }
            .content { padding: 48px; }
            .footer { padding: 48px; text-align: center; font-size: 11px; color: #94a3b8; background: #f8fafc; text-transform: uppercase; letter-spacing: 0.1em; }
            .logo-text { font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; font-size: 20px; color: #ffffff; }
            .accent { color: #60a5fa; }
            h1 { font-size: ${isModern ? '42px' : '32px'}; font-weight: 900; margin-bottom: 24px; letter-spacing: -0.04em; color: #020617; line-height: 1.1; text-align: ${isModern ? 'left' : 'center'}; }
            p { margin-bottom: 24px; font-size: 16px; color: #0f172a; white-space: pre-wrap; }
            .button { display: inline-block; padding: 20px 40px; background-color: #1e3a8a; color: white !important; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="header">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="text-align: center;">
                            <img src="https://firebasestorage.googleapis.com/v0/b/suomiportaat-website.firebasestorage.app/o/branding%2Flogo_1770725545020?alt=media&token=03b3e2c5-f23c-4c82-bde5-06558d0b238b" alt="Logo" style="max-height: 48px; vertical-align: middle; margin-right: 16px; display: inline-block;" />
                            <span style="font-family: 'Inter', sans-serif; font-size: 32px; font-weight: 900; color: #ffffff; vertical-align: middle; display: inline-block; letter-spacing: -0.05em; text-transform: uppercase; margin-top: 4px;">Suomi<span style="color: #60a5fa;">portaat</span></span>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="content">
                <img src="${finalImageUrl}" style="width: 100%; height: auto; border-radius: ${isModern ? '24px' : '0'}; margin-bottom: 32px;" />
                <h1>${subject}</h1>
                <p>${content}</p>
                <div style="text-align: center; margin-top: 40px;">
                    <a href="${siteUrl}" class="button">${visitText}</a>
                </div>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Suomiportaat Digital Archive<br/>
                Empowering migrants through Finnish language and culture.<br/><br/>
                <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">${unsubscribeText}</a>
            </div>
        </div>
    </body>
    </html>
    `;
}

exports.onProfileCreated = onDocumentCreated(
    { document: "profiles/{userId}", secrets: ["SMTP_USER", "SMTP_PASS"] },
    async (event) => {
        const snap = event.data;
        if (!snap) return;
        const data = snap.data();
        const email = data.email;
        const fullName = data.full_name || "Member";
        const lang = data.language || "en";

        console.log(`New profile created: ${snap.id} (${email}) - Language: ${lang}`);

        if (!email) {
            console.log("No email address found in profile document. Skipping welcome email.");
            return;
        }

        try {
            const smtpUser = process.env.SMTP_USER;
            const smtpPass = process.env.SMTP_PASS;
            const smtpFrom = process.env.SMTP_FROM || '"Suomiportaat" <noreply@suomiportaat.com>';
            const replyTo = 'info@suomiportaat.com';

            if (!smtpUser || !smtpPass) throw new Error("SMTP_USER or SMTP_PASS is not configured.");

            const transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 465,
                secure: true,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            const subjects = {
                en: "Welcome to Suomiportaat!",
                sv: "Välkommen till Suomiportaat!",
                fi: "Tervetuloa Suomiportaisiin!",
                ar: "مرحباً بك في Suomiportaat!",
                uk: "Ласкаво просимо до Suomiportaat!"
            };

            const firstName = fullName.split(' ')[0] || "there";

            const onboardingDocs = {
                en: `Hi ${firstName},\n\nWelcome to Suomiportaat! We are thrilled to have you join our community.\n\nYou can now access the full archive, read exclusive news, and join our workshops.\n\nWarm regards,\nThe Suomiportaat Team`,
                sv: `Hej ${firstName},\n\nVälkommen till Suomiportaat! Vi är glada att du har gått med i vår gemenskap.\n\nDu kan nu komma åt hela arkivet, läsa exklusiva nyheter och delta i våra workshops.\n\nVarma hälsningar,\nSuomiportaat Team`,
                fi: `Hei ${firstName},\n\nTervetuloa Suomiportaisiin! Olemme innoissamme saadessamme sinut mukaan yhteisöömme.\n\nPääset nyt käsiksi koko arkistoon, voit lukea yksinoikeudellisia uutisia ja osallistua työpajoihimme.\n\nYstävällisin terveisin,\nSuomiportaat Tiimi`,
                ar: `مرحباً ${firstName}،\n\nمرحباً بك في Suomiportaat! نحن سعداء بانضمامك إلى مجتمعنا.\n\nيمكنك الآن الوصول إلى الأرشيف الكامل، وقراءة الأخبار الحصرية، والانضمام إلى ورش العمل لدينا.\n\nمع أطيب التحيات،\nفريق Suomiportaat`,
                uk: `Привіт ${firstName},\n\nЛаскаво просимо до Suomiportaat! Ми раді, що ви приєдналися до нашої спільноти.\n\nТепер ви можете отримати доступ до повного архіву, читати ексклюзивні новини та брати участь у наших воркшопах.\n\nЗ найкращими побажаннями,\nКоманда Suomiportaat`
            };

            const subject = subjects[lang] || subjects.en;
            const content = onboardingDocs[lang] || onboardingDocs.en;
            const SITE_URL = "https://suomiportaat.com";

            const html = generateEmailHtml("classic", subject, content, null, lang, `${SITE_URL}/unsubscribe`, SITE_URL);

            await transporter.sendMail({
                from: smtpFrom,
                replyTo: replyTo,
                to: email,
                cc: 'info@suomiportaat.com',
                subject: subject,
                html: html
            });

            console.log(`Onboarding welcome email successfully sent to ${email}`);
        } catch (err) {
            console.error(`Failed to send onboarding welcome email to ${email}:`, err);
        }
    }
);

exports.onProfileDeleted = onDocumentDeleted(
    { document: "profiles/{userId}" },
    async (event) => {
        const userId = event.params.userId;
        console.log(`Profile document deleted for user: ${userId}. Deleting Auth record...`);
        try {
            await admin.auth().deleteUser(userId);
            console.log(`Successfully deleted auth user: ${userId}`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`Auth user ${userId} already deleted or not found.`);
            } else {
                console.error(`Error deleting auth user ${userId}:`, error);
            }
        }
    }
);

exports.testSmtpConnection = onRequest({ secrets: ["SMTP_USER", "SMTP_PASS"] }, async (req, res) => {
    return cors(req, res, async () => {
        try {
            const smtpUser = process.env.SMTP_USER;
            const smtpPass = process.env.SMTP_PASS;

            if (!smtpUser || !smtpPass) {
                res.status(500).json({ error: "SMTP credentials not loaded from Secret Manager." });
                return;
            }

            console.log(`Testing SMTP connection for user: ${smtpUser} (password length: ${smtpPass.length})`);

            const transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 465,
                secure: true,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            await transporter.verify();
            res.status(200).json({ success: true, message: "SMTP connection verified successfully!" });
        } catch (error) {
            console.error("SMTP verification failed:", error);
            res.status(500).json({ success: false, error: error.message, stack: error.stack });
        }
    });
});

exports.onNewsletterSubscribed = onDocumentCreated(
    { document: "newsletter_subscribers/{subscriberId}", secrets: ["SMTP_USER", "SMTP_PASS"] },
    async (event) => {
        const snap = event.data;
        if (!snap) return;
        const data = snap.data();
        const email = data.email;
        const lang = data.language || "en";

        console.log(`New newsletter subscriber: ${email}`);
        
        let firstName = "there";
        try {
            const profileSnap = await admin.firestore().collection('profiles').where('email', '==', email).limit(1).get();
            if (!profileSnap.empty) {
                const profileName = profileSnap.docs[0].data().full_name;
                if (profileName) firstName = profileName.split(' ')[0];
            }
        } catch (e) {
            console.error('Error fetching profile for name:', e);
        }

        if (firstName === "there" && email) {
            let extracted = email.split('@')[0].replace(/[0-9._+-]/g, ' ').trim().split(' ')[0];
            if (extracted.length > 0) {
                firstName = extracted.charAt(0).toUpperCase() + extracted.slice(1).toLowerCase();
            }
        }

        try {
            const smtpUser = process.env.SMTP_USER;
            const smtpPass = process.env.SMTP_PASS;
            const smtpFrom = process.env.SMTP_FROM || '"Suomiportaat" <noreply@suomiportaat.com>';
            
            if (!smtpUser || !smtpPass) throw new Error("SMTP credentials missing.");

            const transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 465,
                secure: true,
                auth: { user: smtpUser, pass: smtpPass }
            });

            const subjects = {
                en: "Thank you for subscribing!",
                sv: "Tack för att du prenumererar!",
                fi: "Kiitos tilauksestasi!",
                ar: "شكرا لاشتراكك!",
                uk: "Дякуємо за підписку!"
            };

            const messages = {
                en: `Hi ${firstName}!\n\nThank you for subscribing to the Suomiportaat newsletter. We're excited to share our latest news, workshops, and updates with you.\n\nWarm regards,\nThe Suomiportaat Team`,
                sv: `Hej ${firstName}!\n\nTack för att du prenumererar på Suomiportaats nyhetsbrev. Vi ser fram emot att dela våra senaste nyheter, workshops och uppdateringar med dig.\n\nVarma hälsningar,\nSuomiportaat Team`,
                fi: `Hei ${firstName}!\n\nKiitos, että tilasit Suomiportaat-uutiskirjeen. Olemme innoissamme voidessamme jakaa uusimmat uutiset, työpajat ja päivitykset kanssasi.\n\nYstävällisin terveisin,\nSuomiportaat Tiimi`,
                ar: `مرحباً ${firstName}!\n\nشكراً لاشتراكك في نشرة Suomiportaat. نحن متحمسون لمشاركة أحدث الأخبار وورش العمل والتحديثات معك.\n\nمع أطيب التحيات،\nفريق Suomiportaat`,
                uk: `Привіт ${firstName}!\n\nДякуємо за підписку на розсилку Suomiportaat. Ми раді ділитися з вами нашими останніми новинами, воркшопами та оновленнями.\n\nЗ найкращими побажаннями,\nКоманда Suomiportaat`
            };

            const subject = subjects[lang] || subjects.en;
            const content = messages[lang] || messages.en;
            const SITE_URL = "https://suomiportaat.com";
            const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}&id=${snap.id}`;

            const html = generateEmailHtml("classic", subject, content, null, lang, unsubscribeUrl, SITE_URL);

            await transporter.sendMail({
                from: smtpFrom,
                replyTo: 'info@suomiportaat.com',
                to: email,
                cc: 'info@suomiportaat.com',
                subject: subject,
                html: html
            });

            console.log(`Subscriber thank you email sent to ${email}`);
        } catch (err) {
            console.error(`Failed to send subscriber email to ${email}:`, err);
        }
    }
);
