const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { defineSecret } = require("firebase-functions/params");
const nodemailer = require("nodemailer");

admin.initializeApp();

const senderEmail = defineSecret("SENDER_EMAIL");
const senderPassword = defineSecret("SENDER_PASSWORD");
const SITE_URL = "https://nordicsaunamap.com";

exports.sendbroadcast = onRequest(
  { secrets: [senderEmail, senderPassword], cors: true, timeoutSeconds: 540 },
  async (req, res) => {
    try {
      console.log("Broadcast request received.");
      
      const emailVal = senderEmail.value().trim();
      const passVal = senderPassword.value().trim();
      if (!emailVal || !passVal) throw new Error("SENDER_EMAIL or SENDER_PASSWORD is not configured.");
      
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: emailVal,
          pass: passVal
        }
      });
      
      // 1. Authenticate the user (must be an admin)
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (!authHeader) {
        console.error("Missing Authorization header");
        return res.status(401).json({ error: "No authorization header provided" });
      }

      const idToken = authHeader.startsWith("Bearer ") 
        ? authHeader.split("Bearer ")[1] 
        : authHeader;

      if (!idToken) {
        console.error("Empty ID token in Authorization header");
        return res.status(401).json({ error: "Invalid authorization format" });
      }

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (authErr) {
        console.error("Token verification failed:", authErr.message);
        return res.status(401).json({ error: "Invalid or expired token", details: authErr.message });
      }

      const uid = decodedToken.uid;
      console.log(`Authenticated user UID: ${uid}`);

      // Check if user is admin in Firestore
      const userDoc = await admin.firestore().collection("profiles").doc(uid).get();
      if (!userDoc.exists) {
        console.error(`Profile not found for UID: ${uid}`);
        return res.status(403).json({ error: "Unauthorized: Profile not found" });
      }

      const userData = userDoc.data();
      if (userData.role !== "admin") {
        console.error(`User ${uid} has role ${userData.role}, not admin`);
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      console.log(`Admin authorized: ${userData.email || uid}`);

      // 2. Parse request body
      const { audience, templateId, subject, content, imageUrl, lang, testEmail } = req.body;

      // 3. Fetch recipients based on audience
      let recipients = [];

      if (audience === "test") {
        recipients = [{ id: "test-id", email: testEmail || "nuno@tropicalastral.com" }];
      } else {
        // Fetch all unsubscribed emails once to filter them out
        const unsubscribedSnapshot = await admin.firestore()
          .collection("newsletter_subscribers")
          .where("status", "==", "unsubscribed")
          .get();

        const suppressedEmails = new Set(unsubscribedSnapshot.docs.map(doc => doc.data().email));

        if (audience === "subscribers" || audience === "all") {
          const subscribersSnapshot = await admin.firestore()
            .collection("newsletter_subscribers")
            .where("status", "==", "active")
            .get();
          subscribersSnapshot.forEach(doc => {
            if (doc.data().email) {
              recipients.push({ id: doc.id, email: doc.data().email });
            }
          });
        }

        if (audience === "members" || audience === "all") {
          const profilesSnapshot = await admin.firestore()
            .collection("profiles")
            .get();
          profilesSnapshot.forEach(doc => {
            if (doc.data().email) {
              recipients.push({ id: doc.id, email: doc.data().email });
            }
          });
        }

        if (audience === "new") {
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          
          // New Subscribers
          const newSubSnapshot = await admin.firestore()
            .collection("newsletter_subscribers")
            .where("status", "==", "active")
            .where("created_at", ">=", fourteenDaysAgo)
            .get();
          newSubSnapshot.forEach(doc => {
            if (doc.data().email) {
              recipients.push({ id: doc.id, email: doc.data().email });
            }
          });

          // New Profiles
          const newProfilesSnapshot = await admin.firestore()
            .collection("profiles")
            .where("created_at", ">=", fourteenDaysAgo)
            .get();
          newProfilesSnapshot.forEach(doc => {
            if (doc.data().email) {
              recipients.push({ id: doc.id, email: doc.data().email });
            }
          });
        }

        // De-duplicate by email AND Filter out suppressed emails
        recipients = Array.from(new Map(recipients.map(r => [r.email, r])).values())
          .filter(r => !suppressedEmails.has(r.email));
      }

      const uniqueRecipients = recipients;

      if (uniqueRecipients.length === 0) {
        return res.status(200).json({ count: 0, message: "No recipients found" });
      }

      // 4. Create Newsletter Record
      const broadcastRef = await admin.firestore().collection("broadcasts").add({
        subject,
        audience,
        template_id: templateId,
        content,
        image_url: imageUrl,
        sent_by: decodedToken.uid,
        total_recipients: uniqueRecipients.length,
        success_count: 0,
        failure_count: 0,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      const newsletterId = broadcastRef.id;

      // 5. Send emails and log recipients (THROTTLED LOOP)
      let successCount = 0;
      let failureCount = 0;
      const errors = [];

      console.log(`Starting throttled dispatch to ${uniqueRecipients.length} recipients...`);

      for (const recipient of uniqueRecipients) {
        let status = "sent";
        let error_message = null;

        try {
          const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}&id=${recipient.id}`;
          const html = generateEmailHtml(templateId, subject, content, imageUrl, lang, unsubscribeUrl);

          await transporter.sendMail({
            from: `"Nordic Sauna Map" <${emailVal}>`,
            to: recipient.email,
            replyTo: "info@nordicsaunamap.com",
            subject,
            html,
            headers: {
              "List-Unsubscribe": `<${unsubscribeUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            }
          });
          
          successCount++;
        } catch (err) {
          failureCount++;
          status = "failed";
          error_message = err.message;
          console.error(`[ERROR] Dispatch failed for ${recipient.email}:`, err.message);
          errors.push({ email: recipient.email, error: err.message });
        }

        // Log recipient status
        await admin.firestore().collection("broadcast_recipients").add({
          broadcast_id: newsletterId,
          email: recipient.email,
          status,
          error_message,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Throttle to stay under 5 requests/sec. 400ms delay = 2.5 req/sec (Safe)
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // 6. Update Final Counts
      await broadcastRef.update({
        success_count: successCount,
        failure_count: failureCount
      });

      return res.status(200).json({
        success: true,
        newsletterId: newsletterId,
        count: uniqueRecipients.length,
        successCount,
        failureCount,
        errors: errors.slice(0, 10)
      });

    } catch (err) {
      console.error("Broadcast function error:", err);
      return res.status(400).json({
        success: false,
        error: err.message,
        stack: err.stack,
        details: err
      });
    }
  }
);

function generateEmailHtml(templateId, subject, content, imageUrl, lang, unsubscribeUrl) {
  const unsubscribeText = { en: "Unsubscribe", sv: "Avregistrera dig", fi: "Peruuta tilaus" }[lang] || "Unsubscribe";
  const viewText = { en: "Visit the Platform", sv: "Besök plattformen", fi: "Vieraile alustalla" }[lang] || "Visit the Platform";
  const siteUrl = "https://nordicsaunamap.com";

  const fallbackImage = "https://images.unsplash.com/photo-1519783166144-83936959822a?auto=format&fit=crop&q=80&w=1200";
  const finalImageUrl = imageUrl || fallbackImage;

  let styles = "";
  let structure = "";

  switch (templateId) {
    case "magazine":
      styles = `
        body { font-family: 'Inter', -apple-system, sans-serif; background: #000000; margin: 0; padding: 0; color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; background: #000000; }
        .hero { width: 100%; height: 400px; background-image: url('${finalImageUrl}'); background-position: center; background-size: cover; position: relative; }
        .overlay { background: linear-gradient(to top, #000000, transparent); padding: 40px; position: absolute; bottom: 0; left: 0; right: 0; }
        .content { padding: 40px; background: #000000; }
        h1 { font-size: 48px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; margin: 0 0 20px 0; text-transform: uppercase; color: #ffffff; }
        p { font-size: 18px; line-height: 1.6; color: #a1a1aa; margin-bottom: 30px; }
        .button { display: inline-block; padding: 15px 30px; background: #ffffff; color: #000000 !important; font-weight: 900; text-transform: uppercase; text-decoration: none; letter-spacing: 0.1em; font-size: 12px; }
        .footer { padding: 40px; border-top: 1px solid #27272a; text-align: left; font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 0.2em; }
      `;
      structure = `
        <div class="container">
          <div class="hero">
            <div class="overlay">
              <div style="font-size: 12px; font-weight: 900; letter-spacing: 0.3em; margin-bottom: 10px; color: #3b82f6;">NORDIC SAUNA ARCHIVE</div>
              <h1>${subject}</h1>
            </div>
          </div>
          <div class="content">
            <p>${content}</p>
            <a href="${siteUrl}" class="button">${viewText}</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Nordic Sauna Map<br/><br/>
            Digital Heritage & Cultural Preservation<br/>
            Helsinki, Finland<br/><br/>
            <a href="${unsubscribeUrl}" style="color: #ffffff; text-decoration: none;">${unsubscribeText}</a>
          </div>
        </div>
      `;
      break;

    case "elegant":
      styles = `
        body { font-family: 'Playfair Display', serif; background: #fafaf9; margin: 0; padding: 0; color: #1c1917; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e7e5e4; }
        .header { padding: 60px 40px; text-align: center; border-bottom: 1px solid #f5f5f4; }
        .logo { font-size: 14px; font-weight: 400; letter-spacing: 0.5em; text-transform: uppercase; color: #78716c; margin-bottom: 20px; }
        .content { padding: 60px 80px; text-align: center; }
        .img-wrap { padding: 0 40px; margin-bottom: 40px; }
        .img-wrap img { width: 100%; height: auto; }
        h1 { font-size: 32px; font-weight: 400; font-style: italic; margin-bottom: 30px; color: #1c1917; }
        p { font-size: 16px; line-height: 1.8; color: #44403c; margin-bottom: 40px; }
        .button { display: inline-block; padding: 12px 40px; border: 1px solid #1c1917; color: #1c1917 !important; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; }
        .footer { padding: 40px; text-align: center; font-size: 10px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.2em; }
      `;
      structure = `
        <div class="container">
          <div class="header">
            <div class="logo">Nordic Sauna Map</div>
          </div>
          <div class="content">
            <div class="img-wrap"><img src="${finalImageUrl}" /></div>
            <h1>${subject}</h1>
            <p>${content}</p>
            <a href="${siteUrl}" class="button">${viewText}</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Archive Collection<br/><br/>
            <a href="${unsubscribeUrl}" style="color: #78716c;">${unsubscribeText}</a>
          </div>
        </div>
      `;
      break;

    case "minimal":
      styles = `
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; margin: 0; padding: 0; color: #171717; }
        .container { max-width: 600px; margin: 0 auto; padding: 60px 40px; }
        .logo { font-weight: 800; font-size: 16px; margin-bottom: 80px; letter-spacing: -0.02em; }
        .main-img { width: 100%; border-radius: 12px; margin-bottom: 40px; }
        h1 { font-size: 24px; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.03em; }
        p { font-size: 15px; line-height: 1.6; color: #404040; margin-bottom: 40px; }
        .button { display: inline-block; padding: 16px 32px; background: #171717; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
        .footer { margin-top: 100px; padding-top: 40px; border-top: 1px solid #f5f5f5; font-size: 12px; color: #a3a3a3; }
      `;
      structure = `
        <div class="container">
          <div class="logo">Nordic Sauna Map.</div>
          <img src="${finalImageUrl}" class="main-img" />
          <h1>${subject}</h1>
          <p>${content}</p>
          <a href="${siteUrl}" class="button">${viewText}</a>
          <div class="footer">
            Sent by Nordic Sauna Map Archive<br/>
            <a href="${unsubscribeUrl}" style="color: #171717; text-decoration: none; font-weight: 600;">${unsubscribeText}</a>
          </div>
        </div>
      `;
      break;

    default: // classic
      styles = `
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #020617; margin: 0; padding: 0; background-color: #f8fafc; }
        .wrapper { width: 100%; max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 60px 48px; text-align: left; color: white; }
        .content { padding: 48px; }
        .footer { padding: 48px; text-align: center; font-size: 11px; color: #94a3b8; background: #f8fafc; text-transform: uppercase; letter-spacing: 0.1em; }
        .logo-text { font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; font-size: 20px; color: #ffffff; }
        .accent { color: #3b82f6; }
        h1 { font-size: 42px; font-weight: 900; margin-bottom: 24px; letter-spacing: -0.04em; color: #020617; line-height: 1.1; text-align: left; }
        p { margin-bottom: 24px; font-size: 16px; color: #0f172a; white-space: pre-wrap; }
        .button { display: inline-block; padding: 20px 40px; background-color: #0f172a; color: white !important; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; }
      `;
      structure = `
        <div class="wrapper">
          <div class="header">
            <div class="logo-text">Nordic<span class="accent">Sauna</span>Map</div>
          </div>
          <div class="content">
            <img src="${finalImageUrl}" style="width: 100%; height: auto; border-radius: 24px; margin-bottom: 32px;" />
            <h1>${subject}</h1>
            <p>${content}</p>
            <div style="text-align: center; margin-top: 40px;">
              <a href="${siteUrl}" class="button">${viewText}</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Nordic Sauna Map Archive<br/><br/>
            <a href="${unsubscribeUrl}" style="color: #64748b;">${unsubscribeText}</a>
          </div>
        </div>
      `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <style>${styles}</style>
    </head>
    <body style="margin:0;padding:0;">${structure}</body>
    </html>
  `;
}

exports.setUserPassword = onRequest(
  { cors: true, timeoutSeconds: 30 },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      // Authenticate the caller
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (!authHeader) return res.status(401).json({ error: "No authorization header" });

      const idToken = authHeader.startsWith("Bearer ")
        ? authHeader.split("Bearer ")[1]
        : authHeader;

      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Verify caller is admin in Firestore
      const callerDoc = await admin.firestore().collection("profiles").doc(decodedToken.uid).get();
      if (!callerDoc.exists || callerDoc.data().role !== "admin") {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }

      const { targetUid, newPassword } = req.body;
      if (!targetUid || !newPassword) {
        return res.status(400).json({ error: "targetUid and newPassword are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      if (targetUid === decodedToken.uid) {
        return res.status(400).json({ error: "Use the standard password change flow for your own account" });
      }

      // Set the password via Admin SDK
      await admin.auth().updateUser(targetUid, { password: newPassword });

      console.log(`[setUserPassword] Admin ${decodedToken.uid} reset password for ${targetUid}`);
      return res.status(200).json({ success: true });

    } catch (err) {
      console.error("[setUserPassword] Error:", err);
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

exports.onNewsletterSubscribe = onDocumentCreated(
  { document: "newsletter_subscribers/{docId}", secrets: [senderEmail, senderPassword] },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data associated with the event");
      return;
    }
    
    const data = snap.data();
    const email = data.email;
    const lang = data.language || "en";
    
    console.log(`New newsletter subscription detected: ${email} (${lang})`);
    
    try {
      const emailVal = senderEmail.value().trim();
      const passVal = senderPassword.value().trim();
      if (!emailVal || !passVal) throw new Error("SENDER_EMAIL or SENDER_PASSWORD is not configured.");
      
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: emailVal,
          pass: passVal
        }
      });
      
      const subjects = {
        en: "Welcome to the Nordic Sauna Map!",
        sv: "Välkommen till Bastukartan!",
        fi: "Tervetuloa Saunakarttaan!"
      };
      
      const contents = {
        en: "Thank you for subscribing to our newsletter! We are excited to have you join our community. Stay tuned for the latest sauna traditions, map updates, and heritage stories from across the Nordic region.",
        sv: "Tack för att du prenumererar på vårt nyhetsbrev! Vi är glada att ha dig i vår gemenskap. Håll dig uppdaterad om de senaste bastutraditionerna, kartuppdateringarna och berättelserna från Norden.",
        fi: "Kiitos uutiskirjeemme tilaamisesta! Olemme iloisia saadessamme sinut mukaan yhteisöömme. Pysy kuulolla uusimmista saunaperinteistä, karttapäivityksistä ja tarinoista ympäri Pohjoismaita."
      };
      
      const subject = subjects[lang] || subjects.en;
      const content = contents[lang] || contents.en;
      
      const unsubscribeUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}&id=${snap.id}`;
      const html = generateEmailHtml("classic", subject, content, null, lang, unsubscribeUrl);
      
      await transporter.sendMail({
        from: `"Nordic Sauna Map" <${emailVal}>`,
        to: email,
        replyTo: "info@nordicsaunamap.com",
        subject,
        html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      });
      
      console.log(`Welcome email successfully sent to ${email}`);
    } catch (err) {
      console.error(`Failed to send welcome email to ${email}:`, err);
    }
  }
);

exports.onSaunaCreated = onDocumentCreated(
  { document: "saunas/{saunaId}", secrets: [senderEmail, senderPassword] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    const createdBy = data.created_by;
    const country = data.country || "Finland";
    
    console.log(`New sauna submission: ${snap.id} from user ${createdBy}`);
    
    try {
      const emailVal = senderEmail.value().trim();
      const passVal = senderPassword.value().trim();
      if (!emailVal || !passVal) throw new Error("SENDER_EMAIL or SENDER_PASSWORD is not configured.");
      
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: emailVal,
          pass: passVal
        }
      });
      
      let userEmail = "";
      let userName = "Contributor";
      if (createdBy) {
        const profileSnap = await admin.firestore().collection("profiles").doc(createdBy).get();
        if (profileSnap.exists) {
          userEmail = profileSnap.data().email || "";
          userName = profileSnap.data().full_name || userName;
        }
      }
      
      // Confirm to submitter
      if (userEmail) {
        const subject = "We received your sauna submission! - Nordic Sauna Map";
        const content = `Hi ${userName},\n\nThank you for contributing to the Nordic Sauna Map! We have received your submission for a sauna in ${country}.\n\nOur team is currently reviewing the details to verify the location and heritage details. We will notify you as soon as it goes live!`;
        const html = generateEmailHtml("classic", subject, content, null, "en", `${SITE_URL}/dashboard`);
        
        await transporter.sendMail({
          from: `"Nordic Sauna Map" <${emailVal}>`,
          to: userEmail,
          replyTo: "info@nordicsaunamap.com",
          subject,
          html
        });
      }
      
      // Confirm to admin
      await transporter.sendMail({
        from: `"Nordic Sauna Map" <${emailVal}>`,
        to: "info@nordicsaunamap.com",
        replyTo: "info@nordicsaunamap.com",
        subject: `NEW SAUNA SUBMISSION: ${country}`,
        html: generateEmailHtml("classic", `New Sauna Submission in ${country}`, `A new sauna has been submitted and is awaiting approval.\n\nSauna ID: ${snap.id}\nSubmitted By: ${userName} (${userEmail || "Unknown Email"})\n\nManage it in the Admin Console.`, null, "en", `${SITE_URL}/admin`)
      });
      
      console.log(`Sauna submission notification sent successfully.`);
    } catch (err) {
      console.error("Failed to send sauna submission notification:", err);
    }
  }
);

exports.onSaunaUpdated = onDocumentUpdated(
  { document: "saunas/{saunaId}", secrets: [senderEmail, senderPassword] },
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    
    if (beforeData.status !== "approved" && afterData.status === "approved") {
      const createdBy = afterData.created_by;
      const country = afterData.country || "Finland";
      const saunaId = event.data.after.id;
      
      console.log(`Sauna ${saunaId} status changed to approved. Sending email to creator ${createdBy}`);
      
      try {
        const emailVal = senderEmail.value().trim();
        const passVal = senderPassword.value().trim();
        if (!emailVal || !passVal) throw new Error("SENDER_EMAIL or SENDER_PASSWORD is not configured.");
        
        const transporter = nodemailer.createTransport({
          host: "smtp.hostinger.com",
          port: 465,
          secure: true,
          auth: {
            user: emailVal,
            pass: passVal
          }
        });
        
        let userEmail = "";
        let userName = "Contributor";
        if (createdBy) {
          const profileSnap = await admin.firestore().collection("profiles").doc(createdBy).get();
          if (profileSnap.exists) {
            userEmail = profileSnap.data().email || "";
            userName = profileSnap.data().full_name || userName;
          }
        }
        
        if (userEmail) {
          const subject = "Your sauna submission is LIVE! - Nordic Sauna Map";
          const content = `Hi ${userName},\n\nGreat news! Your sauna submission in ${country} has been approved and is now live on the Nordic Sauna Map!\n\nThank you for helping us preserve and promote Nordic sauna heritage. You can check it out on the map now!`;
          const html = generateEmailHtml("classic", subject, content, null, "en", `${SITE_URL}/`);
          
          await transporter.sendMail({
            from: `"Nordic Sauna Map" <${emailVal}>`,
            to: userEmail,
            replyTo: "info@nordicsaunamap.com",
            subject,
            html
          });
          console.log(`Approval notification sent to ${userEmail}`);
        }
      } catch (err) {
        console.error("Failed to send approval notification:", err);
      }
    }
  }
);

exports.onProfileCreated = onDocumentCreated(
  { document: "profiles/{userId}", secrets: [senderEmail, senderPassword] },
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
      const emailVal = senderEmail.value().trim();
      const passVal = senderPassword.value().trim();
      if (!emailVal || !passVal) throw new Error("SENDER_EMAIL or SENDER_PASSWORD is not configured.");
      
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: emailVal,
          pass: passVal
        }
      });

      const subjects = {
        en: "Welcome to the Nordic Sauna Heritage Registry!",
        sv: "Välkommen till Nordiska Basturegistret!",
        fi: "Tervetuloa Pohjoismaiseen Saunarekisteriin!"
      };

      const onboardingDocs = {
        en: `Welcome to the Nordic Sauna Map & Heritage Registry! We are thrilled to have you join our community dedicated to documenting and preserving historical sauna culture.

To get started, please explore our onboarding materials:
- **Member Handbook**: A guide to sauna architecture, cultural context, and history.
- **Sauna Submission Guidelines**: How to document and submit saunas with accurate heritage data.
- **Code of Conduct**: Keeping our community welcoming, respectful, and safe.

You can access these resources and begin contributing at ${SITE_URL}/dashboard.

Warm regards,
The Nordic Sauna Map Team`,
        sv: `Välkommen till Nordiska Basturegistret! Vi är fantastiskt glada att du har gått med i vår gemenskap för att dokumentera och bevara den historiska bastukulturen.

För att komma igång, vänligen läs igenom vårt introduktionsmaterial:
- **Medlemshandbok**: En guide till bastuarkitektur, kulturella sammanhang och historia.
- **Riktlinjer för inlämning**: Hur man dokumenterar och skickar in bastur med korrekt kulturarvsdata.
- **Uppförandekod**: Att hålla vår gemenskap välkomnande, respektfull och säker.

Du kan komma åt dessa resurser och börja bidra på ${SITE_URL}/dashboard.

Varma hälsningar,
Nordiska Bastukartans Team`,
        fi: `Tervetuloa Pohjoismaiseen Saunarekisteriin! Olemme innoissamme saadessamme sinut mukaan yhteisöömme, joka on omistautunut historiallisen saunakulttuurin dokumentointiin ja säilyttämiseen.

Aloittaaksesi tutustu perehdytysmateriaaleihimme:
- **Jäsenkäsikirja**: Opas saunan arkkitehtuuriin, kulttuurisiin taustoihin ja historiaan.
- **Saunan lisäysohjeet**: Miten dokumentoida ja lähettää saunoja tarkalla perintötiedolla.
- **Yhteisön säännöt**: Yhteisömme pitämiseksi ystävällisenä, kunnioittavana ja turvallisena.

Pääset käsiksi näihin materiaaleihin ja voit aloittaa saunojen lisäämisen osoitteessa ${SITE_URL}/dashboard.

Ystävällisin tereisn,
Pohjoismaisen Saunakartan Tiimi`
      };

      const subject = subjects[lang] || subjects.en;
      const content = onboardingDocs[lang] || onboardingDocs.en;
      
      const html = generateEmailHtml("classic", subject, content, null, lang, `${SITE_URL}/unsubscribe`);

      await transporter.sendMail({
        from: `"Nordic Sauna Map" <${emailVal}>`,
        to: email,
        replyTo: "info@nordicsaunamap.com",
        subject,
        html
      });
      
      console.log(`Onboarding welcome email successfully sent to ${email}`);
    } catch (err) {
      console.error(`Failed to send onboarding welcome email to ${email}:`, err);
    }
  }
);

