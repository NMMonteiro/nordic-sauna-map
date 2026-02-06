# Resend & Email Integration Guide

This document outlines the steps to fully implement and test email triggers using Resend and Supabase Edge Functions.

## 1. Domain Setup (Prerequisite)
To send emails from your own domain (e.g., `notifications@learnmera.com`), you must:
1.  **Deploy the Website**: The site must be live on its final domain or a subdomain (e.g., Vercel deployment).
2.  **Verify Domain in Resend**:
    - Go to [resend.com/domains](https://resend.com/domains).
    - Add `learnmera.com`.
    - Configure the DNS records (MX, TXT, CNAME) provided by Resend in your domain registrar.
    - Status must show **Verified** before you can send from non-test emails.

## 2. Supabase Configuration
Once you have your Resend API Key, run these commands using the Supabase CLI, or set them in the Supabase Dashboard under **Functions > notify > Settings > Secrets**:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key
supabase secrets set ADMIN_EMAIL=your-admin-email@example.com
supabase secrets set SITE_URL=https://your-deployed-domain.com
```

## 3. Implemented Triggers
The system is configured to send emails automatically for the following events:

| Event | Trigger | Recipient |
| :--- | :--- | :--- |
| **New Newsletter Signup** | Insertion into `newsletter_subscribers` | Subscriber |
| **New Sauna Submission** | Insertion into `saunas` | Admin & Submitter |
| **New Blog Post** | Insertion into `blog_posts` | Admin & Author |
| **Submission Approved** | Status change to `approved` | Submitter/Author |

## 4. Newsletter Integration
The frontend is now connected to the `newsletter_subscribers` table. 
- **Waitlist Pattern**: When a user enters their email, it is stored in the database.
- **Auto-Email**: This triggers the Edge Function to send a "Welcome to the Community" email.

## 5. Google Login (Next Steps)
To enable Google Login, we need to:
1.  Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2.  Configure the **OAuth consent screen**.
3.  Create **OAuth 2.0 Client IDs** (Web application).
4.  Add the Client ID and Secret to Supabase Dashboard under **Authentication > Providers > Google**.
5.  Add `http://localhost:5173` and your production URL to the **Authorized redirect URIs** in Google Console.

---
**Current Status:** Backend infrastructure is ready. Triggers are active.
**Action Required:** Domain verification and Secret configuration.
