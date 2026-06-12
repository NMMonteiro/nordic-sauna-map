# 🚀 Deployment Guide: Suomiportaat.com to Hostinger

This guide will walk you through deploying your **Suomiportaat** website to Hostinger using your domain `suomiportaat.com`.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:
- ✅ Hostinger account with access to `suomiportaat.com`
- ✅ Firebase project credentials configured
- ✅ Supabase project set up
- ✅ All environment variables ready (see `.env.local`)

---

## 🔨 Step 1: Build the Production Version

1. **Stop your development server** if it's running (Ctrl+C in the terminal)

2. **Build the production bundle:**
   ```bash
   npm run build
   ```

3. **Verify the build:**
   - A `dist` folder should be created in your project directory
   - Check that it contains: `index.html`, `assets/` folder, and other static files

4. **Test the build locally (optional but recommended):**
   ```bash
   npm run preview
   ```
   - This will serve the production build at `http://localhost:4173`
   - Test key features: login, navigation, translations, etc.

---

## 📤 Step 2: Upload to Hostinger

### Option A: Using Hostinger File Manager (Recommended for First-Time)

1. **Log in to Hostinger hPanel:**
   - Go to [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
   - Enter your credentials

2. **Navigate to your website:**
   - Click on **Websites** in the sidebar
   - Find `suomiportaat.com` and click **Manage**

3. **Open File Manager:**
   - Click on **File Manager** in the website management panel
   - Navigate to the `public_html` folder

4. **Clear existing files (if any):**
   - **IMPORTANT:** If there are existing files in `public_html`, back them up first
   - Delete all old files to avoid conflicts

5. **Upload your build:**
   - Open your local `dist` folder
   - **Select ALL files and folders INSIDE the `dist` folder**
   - Drag and drop them into the Hostinger `public_html` folder
   - **Do NOT upload the `dist` folder itself, only its contents**

6. **Verify the upload:**
   - You should see files like:
     - `index.html`
     - `assets/` folder
     - `.htaccess` (this is crucial for React Router)

7. **Upload the `.htaccess` file:**
   - The `.htaccess` file in your project root needs to be in `public_html`
   - If it wasn't included in the `dist` folder, upload it manually

### Option B: Using FTP/SFTP (Advanced)

1. **Get FTP credentials from Hostinger:**
   - In hPanel, go to **Files** > **FTP Accounts**
   - Note your FTP hostname, username, and password

2. **Use an FTP client (like FileZilla):**
   - Host: Your FTP hostname
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (FTP) or 22 (SFTP)

3. **Upload files:**
   - Navigate to `public_html` on the remote server
   - Upload all contents from your local `dist` folder

### Option C: Using Git Auto-Deploy (Advanced)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Set up Git in Hostinger:**
   - In hPanel, go to **Git** under your website
   - Click **Create new repository**
   - Connect to your GitHub repository
   - Set branch to `main`
   - Set deployment path to `public_html`
   - **Important:** Add a build command: `npm install && npm run build && cp -r dist/* .`

---

## 🔧 Step 3: Verify `.htaccess` Configuration

The `.htaccess` file is **critical** for React Router to work properly. It ensures all routes redirect to `index.html`.

**Verify the file exists in `public_html` with this content:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**If the file is missing:**
- Create a new file named `.htaccess` in `public_html`
- Copy the content above into it
- Save the file

---

## 🔐 Step 4: Configure Firebase for Production

### A. Update Firebase Configuration

1. **Go to Firebase Console:**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Select your project

2. **Add your domain to Authorized Domains:**
   - Go to **Authentication** > **Settings** > **Authorized domains**
   - Click **Add domain**
   - Add: `suomiportaat.com`
   - Also add: `www.suomiportaat.com` (if using www)

3. **Update Google OAuth (if using):**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to **APIs & Services** > **Credentials**
   - Edit your OAuth 2.0 Client ID
   - Add to **Authorized JavaScript origins:**
     - `https://suomiportaat.com`
     - `https://www.suomiportaat.com`
   - Add to **Authorized redirect URIs:**
     - `https://suomiportaat.com/__/auth/handler`
     - `https://www.suomiportaat.com/__/auth/handler`

---

## 🗄️ Step 5: Configure Supabase for Production

### A. Update Supabase URL Configuration

1. **Go to Supabase Dashboard:**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Update Site URL:**
   - Go to **Authentication** > **URL Configuration**
   - Set **Site URL** to: `https://suomiportaat.com`

3. **Add Redirect URLs:**
   - In **Redirect URLs**, add:
     - `https://suomiportaat.com/**`
     - `https://www.suomiportaat.com/**`

### B. Update Edge Functions (if using)

If you're using Supabase Edge Functions for newsletters or notifications:

```bash
supabase secrets set SITE_URL=https://suomiportaat.com
```

---

## 🌐 Step 6: Configure Domain & SSL

### A. Verify Domain is Pointing to Hostinger

1. **Check DNS settings:**
   - In Hostinger hPanel, go to **Domains**
   - Click on `suomiportaat.com`
   - Verify the nameservers are pointing to Hostinger

2. **If domain was purchased elsewhere:**
   - Update nameservers to Hostinger's:
     - `ns1.dns-parking.com`
     - `ns2.dns-parking.com`
   - DNS propagation can take 24-48 hours

### B. Enable SSL Certificate

1. **In Hostinger hPanel:**
   - Go to **Websites** > `suomiportaat.com` > **Manage**
   - Click on **SSL** in the sidebar
   - Enable **Free SSL Certificate** (Let's Encrypt)
   - Wait for SSL to activate (usually 5-15 minutes)

2. **Force HTTPS (Recommended):**
   - In hPanel, enable **Force HTTPS** option
   - Or add to your `.htaccess`:
     ```apache
     RewriteCond %{HTTPS} off
     RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
     ```

---

## ✅ Step 7: Test Your Deployment

1. **Visit your website:**
   - Go to `https://suomiportaat.com`
   - Check that the homepage loads correctly

2. **Test key features:**
   - ✅ Navigation works (all menu items)
   - ✅ Language switcher functions properly
   - ✅ User authentication (login/register)
   - ✅ Admin panel (if you have admin access)
   - ✅ User panel/profile
   - ✅ All translations display correctly
   - ✅ Direct URL access works (e.g., `/education`, `/blog`)

3. **Test on different devices:**
   - Desktop browser
   - Mobile browser
   - Tablet (if available)

4. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for any errors in the Console tab
   - Check Network tab for failed requests

---

## 🐛 Troubleshooting

### Issue: "404 Not Found" on page refresh

**Solution:** Verify `.htaccess` file is in `public_html` with correct content.

### Issue: "Firebase configuration error"

**Solution:** Check that `suomiportaat.com` is added to Firebase Authorized Domains.

### Issue: "Authentication not working"

**Solution:** 
- Verify Firebase and Supabase URL configurations
- Check that OAuth redirect URIs are correctly set
- Clear browser cache and cookies

### Issue: "Blank page or white screen"

**Solution:**
- Check browser console for errors
- Verify all files uploaded correctly
- Ensure `index.html` is in the root of `public_html`

### Issue: "Mixed content warnings (HTTP/HTTPS)"

**Solution:**
- Ensure SSL is enabled
- Force HTTPS in Hostinger settings
- Check that all external resources use HTTPS

### Issue: "Environment variables not working"

**Solution:**
- Environment variables from `.env.local` are compiled into the build
- If you change them, you must rebuild: `npm run build`
- Re-upload the new `dist` folder contents

---

## 🔄 Updating Your Website

When you make changes to your website:

1. **Make your code changes locally**
2. **Test with `npm run dev`**
3. **Build the new version:**
   ```bash
   npm run build
   ```
4. **Upload the new `dist` folder contents to `public_html`**
   - You can overwrite existing files
5. **Clear browser cache** to see changes immediately

---

## 📞 Support Resources

- **Hostinger Support:** [https://www.hostinger.com/contact](https://www.hostinger.com/contact)
- **Firebase Documentation:** [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **Supabase Documentation:** [https://supabase.com/docs](https://supabase.com/docs)

---

## ✨ Post-Deployment Optimization (Optional)

### Enable Caching

Add to `.htaccess` for better performance:

```apache
# Enable browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
</IfModule>
```

### Enable Compression

Add to `.htaccess`:

```apache
# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

**🎉 Congratulations! Your website should now be live at https://suomiportaat.com**
