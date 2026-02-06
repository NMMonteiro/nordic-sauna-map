#  sauna-map Development Status - Feb 5, 2026

## 🚀 Objective: Newsletter & Broadcast Tool
The primary goal was to implement a professional newsletter dispatch tool for administrators to communicate with subscribers and members.

---

## ✅ Completed Tasks
1.  **Newsletter Manager Component**:
    *   Created `components/NewsletterManager.tsx`.
    *   Implemented multi-step workflow: Audience Selection -> Template Selection -> Content Composition -> Preview -> Send.
    *   Added **Live Mobile Preview** with real-time content updates.
2.  **Visual Composer Upgrade**:
    *   Implemented **Image Upload CRUD**: Admins can upload, replace, or delete feature images.
    *   Assets are hosted on Supabase Storage (`blog-media` bucket).
    *   Template logic handles both 'Classic Heritage' and 'Nordic Minimal' layouts.
3.  **GDPR & Unsubscribe Logic**:
    *   Updated `pages/UnsubscribePage.tsx` to handle cross-table unsubscription (dedicated list + registered profiles).
    *   Mandatory unsubscribe links included in all broadcasts.
4.  **Backend Logic & Deployment**:
    *   **Successfully Deployed** `send-broadcast` and `notify` Edge Functions.
    *   **Version Pinning**: Fixed bundling issues by pinning `@supabase/supabase-js@2.47.10`.
    *   Configured Supabase Secrets (`RESEND_API_KEY`, `ADMIN_EMAIL`, `SITE_URL`) on the remote project.
5.  **Admin Panel Integration**:
    *   New "Newsletter" tab added to `AdminPanel.tsx` with translations for EN, SV, FI.

6.  **Detailed Reporting & Test Mode**:
    *   Implemented detailed success/failure tracking for each recipient.
    *   Added **"Test Dispatch"** button to allow sending to a specific email before a global blast.
    *   Errors from Resend (e.g., unverified domains) are now captured and displayed in the Admin UI.

---

## 🛠️ Current Status & Issues
*   **Resolved "Not Received" Issue**: Diagnostic checks showed that `nuno@tropicalastral.com` was neither in the `profiles` table nor the `newsletter_subscribers` list, which is why the broadcast didn't reach it.
*   **Domain Verification**: Ensure `nordicsaunamap.com` is verified in your Resend dashboard; otherwise, global blasts to non-admin emails may be restricted.

---

## 📋 Immediate Next Steps

1.  **Run a Test Dispatch**:
    Go to Admin > Broadcast, click the new **"Test"** button, and send a message to your active email. Check the report for any Resend API errors.
2.  **Verify Subscriber List**:
    Ensure your desired testing emails are either registered in the app or added via the newsletter signup form on the landing page.
3.  **Check Domain Status**:
    Confirm domain verification in [Resend](https://resend.com/domains) to enable sending from `broadcast@nordicsaunamap.com`.

---

## 🔐 Configuration Summary
*   **Supabase Project**: `hgpcpontdxjsbqsjiech`
*   **Resend Integration**: Connected via Service Secrets.
*   **Storage**: `blog-media` bucket used for newsletter assets.

