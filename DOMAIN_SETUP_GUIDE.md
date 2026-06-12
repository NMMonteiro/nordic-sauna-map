# 🌐 Domain Setup Guide for Suomiportaat.com on Hostinger

This guide will help you configure your domain `suomiportaat.com` on Hostinger to point to your website.

---

## 📋 Prerequisites

- ✅ Hostinger hosting account
- ✅ Domain `suomiportaat.com` purchased (either through Hostinger or another registrar)
- ✅ Access to your domain registrar's control panel (if domain is not with Hostinger)

---

## 🎯 Scenario 1: Domain Purchased Through Hostinger

If you bought `suomiportaat.com` directly from Hostinger, it's already connected! You just need to verify:

### Step 1: Verify Domain Connection

1. **Log in to Hostinger hPanel:**
   - Go to [https://hpanel.hostinger.com](https://hpanel.hostinger.com)

2. **Check Domains:**
   - Click on **Domains** in the left sidebar
   - You should see `suomiportaat.com` listed
   - Status should show as "Active"

3. **Verify Website Assignment:**
   - Click on **Websites** in the sidebar
   - You should see your hosting plan
   - The domain `suomiportaat.com` should be listed as the primary domain

### Step 2: Upload Your Website

Once verified, proceed to [Upload Your Website](#-upload-your-website) section below.

---

## 🎯 Scenario 2: Domain Purchased Elsewhere (External Registrar)

If you bought `suomiportaat.com` from another registrar (like GoDaddy, Namecheap, Google Domains, etc.), you need to point it to Hostinger.

### Option A: Change Nameservers (Recommended)

This is the easiest method and gives Hostinger full control over your domain's DNS.

#### Step 1: Get Hostinger Nameservers

1. **Log in to Hostinger hPanel:**
   - Go to [https://hpanel.hostinger.com](https://hpanel.hostinger.com)

2. **Find Your Nameservers:**
   - Click on **Domains** in the sidebar
   - Click **Add Domain** or **Connect Domain**
   - Hostinger will show you the nameservers (usually):
     - `ns1.dns-parking.com`
     - `ns2.dns-parking.com`
   
   **Note:** Your specific nameservers might be different. Use the ones shown in your Hostinger panel.

#### Step 2: Update Nameservers at Your Registrar

The exact steps vary by registrar, but the general process is:

**For GoDaddy:**
1. Log in to your GoDaddy account
2. Go to **My Products** > **Domains**
3. Click on `suomiportaat.com`
4. Scroll to **Additional Settings** > **Manage DNS**
5. Click **Change** next to Nameservers
6. Select **Custom** nameservers
7. Enter Hostinger's nameservers:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
8. Click **Save**

**For Namecheap:**
1. Log in to Namecheap
2. Go to **Domain List**
3. Click **Manage** next to `suomiportaat.com`
4. Find **Nameservers** section
5. Select **Custom DNS**
6. Enter Hostinger's nameservers:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
7. Click the green checkmark to save

**For Google Domains:**
1. Log in to Google Domains
2. Select `suomiportaat.com`
3. Click **DNS** in the left menu
4. Scroll to **Name servers**
5. Select **Use custom name servers**
6. Enter Hostinger's nameservers:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
7. Click **Save**

#### Step 3: Wait for DNS Propagation

- **Propagation time:** 24-48 hours (usually faster, often 2-6 hours)
- **Check status:** Use [https://www.whatsmydns.net](https://www.whatsmydns.net) to monitor propagation

#### Step 4: Add Domain in Hostinger

1. **In Hostinger hPanel:**
   - Go to **Websites**
   - Click on your hosting plan
   - Click **Add Domain** or **Manage Domains**
   - Enter `suomiportaat.com`
   - Click **Add Domain**

2. **Set as Primary (if needed):**
   - If you want `suomiportaat.com` to be your main domain
   - Click the three dots next to the domain
   - Select **Set as Primary**

### Option B: Point A Records (Advanced)

If you want to keep your nameservers with your current registrar but point the domain to Hostinger:

#### Step 1: Get Hostinger IP Address

1. **In Hostinger hPanel:**
   - Go to **Websites** > Your hosting plan
   - Look for **Server IP** or **IP Address**
   - Copy this IP address (e.g., `123.45.67.89`)

#### Step 2: Update DNS Records at Your Registrar

1. **Log in to your domain registrar**
2. **Find DNS Management** (might be called DNS Settings, DNS Records, or Zone File)
3. **Add/Edit A Records:**
   - **Type:** A
   - **Host/Name:** @ (or leave blank for root domain)
   - **Value/Points to:** [Your Hostinger IP address]
   - **TTL:** 3600 (or default)

4. **Add www subdomain:**
   - **Type:** A
   - **Host/Name:** www
   - **Value/Points to:** [Your Hostinger IP address]
   - **TTL:** 3600

5. **Save changes**

#### Step 3: Wait for DNS Propagation

- Same as Option A: 24-48 hours

---

## 📤 Upload Your Website

Once your domain is connected (either method), upload your website files:

### Step 1: Access File Manager

1. **In Hostinger hPanel:**
   - Go to **Websites** > `suomiportaat.com` > **Manage**
   - Click **File Manager**

### Step 2: Navigate to public_html

1. **Open the `public_html` folder**
   - This is where your website files go
   - If there are any default files (like `index.html` or `default.php`), delete them

### Step 3: Upload Your Build

1. **On your local computer:**
   - Open the `dist` folder in your project
   - Select ALL files and folders inside (Ctrl+A)

2. **Upload to Hostinger:**
   - Drag and drop all files into the `public_html` folder in File Manager
   - **OR** use the Upload button in File Manager

3. **Verify Upload:**
   - You should see files like:
     - `index.html`
     - `assets/` folder
     - `.htaccess`
     - `suomiportaat-logo.png`
     - Other media files

---

## 🔐 Enable SSL Certificate (HTTPS)

**IMPORTANT:** Always enable SSL for security and SEO.

### Step 1: Activate SSL

1. **In Hostinger hPanel:**
   - Go to **Websites** > `suomiportaat.com` > **Manage**
   - Click **SSL** in the sidebar

2. **Install Free SSL:**
   - Click **Install** next to "Free SSL Certificate"
   - Wait 5-15 minutes for activation

3. **Force HTTPS:**
   - Toggle on **Force HTTPS**
   - This redirects all HTTP traffic to HTTPS

### Step 2: Verify SSL

1. **Visit your website:**
   - Go to `https://suomiportaat.com`
   - You should see a padlock icon in the browser address bar

2. **Test redirect:**
   - Try `http://suomiportaat.com` (without the 's')
   - It should automatically redirect to `https://suomiportaat.com`

---

## ✅ Verify Your Website is Live

### Checklist:

- [ ] Visit `https://suomiportaat.com` - homepage loads
- [ ] Visit `https://www.suomiportaat.com` - redirects to main domain
- [ ] Check SSL certificate - padlock icon shows
- [ ] Test navigation - all menu items work
- [ ] Test direct URLs - e.g., `https://suomiportaat.com/education`
- [ ] Test on mobile device
- [ ] Check browser console for errors (F12)

---

## 🔧 Troubleshooting

### Issue: "This site can't be reached"

**Possible causes:**
- DNS hasn't propagated yet (wait 24-48 hours)
- Nameservers not updated correctly
- Domain not added in Hostinger

**Solution:**
1. Check nameservers using [https://www.whatsmydns.net](https://www.whatsmydns.net)
2. Verify domain is added in Hostinger hPanel
3. Wait for DNS propagation

### Issue: "404 Not Found" or blank page

**Solution:**
1. Verify files are in `public_html` (not in a subfolder)
2. Check that `index.html` exists in `public_html`
3. Verify `.htaccess` file is present
4. Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Not Secure" warning

**Solution:**
1. Enable SSL certificate in Hostinger
2. Force HTTPS in Hostinger settings
3. Wait 5-15 minutes for SSL to activate

### Issue: "Mixed Content" warnings

**Solution:**
- All external resources (images, scripts) must use HTTPS
- Check browser console for specific HTTP resources
- Update any hardcoded HTTP URLs to HTTPS

### Issue: Pages work but refresh gives 404

**Solution:**
- Verify `.htaccess` file is in `public_html`
- Check `.htaccess` content matches the one in your project
- Contact Hostinger support if mod_rewrite is not enabled

---

## 📞 Support Contacts

- **Hostinger Support:** [https://www.hostinger.com/contact](https://www.hostinger.com/contact)
  - Live chat available 24/7
  - Email support
  - Knowledge base

- **Domain Registrar Support:**
  - Contact your registrar if you have issues updating nameservers

---

## 🎉 Next Steps After Domain is Live

1. **Update Firebase:**
   - Add `suomiportaat.com` to Firebase Authorized Domains
   - See `DEPLOY_TO_HOSTINGER.md` for details

2. **Update Supabase:**
   - Set Site URL to `https://suomiportaat.com`
   - See `DEPLOY_TO_HOSTINGER.md` for details

3. **Test Everything:**
   - User authentication
   - Admin panel
   - All features and translations

4. **Monitor:**
   - Check for any errors in browser console
   - Test on different devices and browsers

---

## 📝 Quick Reference

**Hostinger Nameservers:**
- `ns1.dns-parking.com`
- `ns2.dns-parking.com`

**Your Domain:**
- `suomiportaat.com`

**SSL:**
- Free Let's Encrypt SSL available
- Force HTTPS recommended

**File Location:**
- Upload to: `public_html/`
- Must include: `index.html`, `.htaccess`, `assets/`

---

**Need help?** Contact Hostinger support 24/7 via live chat in your hPanel!
