# Resend Email Setup Guide

Follow these steps to connect your custom domain and activate the premium email notifications.

## 1. Resend Configuration (The Domain)
First, you need to prove to the world that you own the domain so emails don't go to spam.

1.  Log in to [Resend.com](https://resend.com).
2.  Go to **Domains** > **Add New Domain**.
3.  Enter `learnmera.com` (or your preferred sending domain) and select your region.
4.  **DNS Verification:** Resend will give you a list of **MX** and **TXT** records.
5.  Go to **Hostinger hPanel** > **Domains** > **DNS/Nameservers**.
6.  Add those records exactly as shown in Resend.
7.  Wait 5-10 minutes and click **Verify** in Resend.

## 2. Get your API Key
1.  In Resend, go to **API Keys**.
2.  Click **Create API Key**.
3.  Give it a name like "Nordic Sauna Live" and set permissions to **Full Access**.
4.  **Copy this key immediately** (you won't see it again).

## 3. Connect to Supabase (The "Secrets")
To give these credentials to your app without putting them in the code, you must set them as "Secrets". 

Run these commands in your terminal (replace the placeholder text):

```bash
# Set your Resend API Key
npx supabase secrets set RESEND_API_KEY=re_your_copied_key_here --project-ref hgpcpontdxjsbqsjiech

# Set your Admin Email (Where you receive notifications)
npx supabase secrets set ADMIN_EMAIL=your-email@example.com --project-ref hgpcpontdxjsbqsjiech

# Ensure the Site URL is correct for links in emails
npx supabase secrets set SITE_URL=https://nordicsaunamap.com --project-ref hgpcpontdxjsbqsjiech
```

## 4. Deploy the "Premium" Code
Finally, send the new design code to Supabase:
```bash
npx supabase functions deploy notify --project-ref hgpcpontdxjsbqsjiech
```

## 5. Enable HTTP Requests in Supabase (CRITICAL)
For the database to "talk" to Resend, it needs the `pg_net` extension enabled.
1.  Go to **Supabase Dashboard** > **SQL Editor**.
2.  Paste and run this:
    ```sql
    CREATE EXTENSION IF NOT EXISTS pg_net;
    ```

---
**Testing:** 
Go to your live site, sign up for the Newsletter, and check your inbox!
