# Deployment Guide for Hostinger

Follow these steps to deploy **Nordic Sauna Map** to your Hostinger account at `nordicsaunamap.com`.

## 1. Prepare for Deployment
First, you need to generate the production build.
1.  Stop your current `npm run dev` in the terminal.
2.  Run the command:
    ```bash
    npm run build
    ```
3.  This will create a new folder called **`dist`** in your project directory.

## 2. Upload to Hostinger
You have two main ways to upload the site:

### Option A: Using Hostinger File Manager (Easiest)
1.  Log in to your **Hostinger hPanel**.
2.  Go to **Websites** > **Manage** for `nordicsaunamap.com`.
3.  Open the **File Manager**.
4.  Navigate to the `public_html` folder.
5.  **Important:** Upload the **contents** of your local `dist` folder directly into `public_html`. 
    *   *Do not upload the `dist` folder itself, just the files inside it.*
6.  Ensure the `.htaccess` file (which I just created for you) is also uploaded to `public_html`.

### Option B: Using Git (Advanced)
If you have a GitHub repository, you can go to **Git** in the hPanel and set up an automatic deployment from your `main` branch.

## 3. Post-Deployment Configuration (CRITICAL)
Once the site is live at `nordicsaunamap.com`, you must update your external service settings:

### A. Supabase URL Configuration
1.  Go to **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2.  Set **Site URL** to `https://nordicsaunamap.com`.
3.  In **Redirect URIs**, add `https://nordicsaunamap.com/**`.

### B. Google OAuth
1.  Go to **Google Cloud Console** > **APIs & Services** > **Credentials**.
2.  Edit your Client ID.
3.  Add `https://nordicsaunamap.com` to **Authorized JavaScript origins**.
4.  Add `https://hgpcpontdxjsbqsjiech.supabase.co/auth/v1/callback` to **Authorized redirect URIs** (ensure this one matches exactly the URL in your Supabase Dashboard).

### C. Resend Integration
Update your Supabase secrets via dashboard or CLI:
```bash
supabase secrets set SITE_URL=https://nordicsaunamap.com
```

---
**Note:** If you see a "404" when refreshing pages like `/about` or `/blog`, make sure the `.htaccess` file is present in your Hostinger `public_html` folder.
