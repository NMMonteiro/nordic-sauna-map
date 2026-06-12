# 🚀 Complete Deployment Checklist for Suomiportaat.com

Use this master checklist to deploy your website from start to finish.

---

## 📦 Phase 1: Pre-Deployment (Local)

### Build & Verify

- [ ] All code changes committed to Git
- [ ] Tested locally with `npm run dev`
- [ ] No console errors in browser
- [ ] All features working (auth, admin panel, translations)

### Create Production Build

- [ ] Stop dev server (Ctrl+C)
- [ ] Run `npm run build`
- [ ] Verify `dist` folder created
- [ ] Check `dist` contains:
  - [ ] `index.html`
  - [ ] `assets/` folder
  - [ ] `.htaccess` file
  - [ ] `suomiportaat-logo.png`
  - [ ] All media files

### Optional: Test Production Build Locally

- [ ] Run `npm run preview`
- [ ] Visit `http://localhost:4173`
- [ ] Test all features in production mode
- [ ] Check for any build-specific errors

---

## 🌐 Phase 2: Domain Setup

### If Domain is with Hostinger:

- [ ] Domain shows as "Active" in Hostinger Domains
- [ ] Domain assigned to your hosting plan
- [ ] Skip to Phase 3

### If Domain is External (GoDaddy, Namecheap, etc.):

- [ ] Get Hostinger nameservers from hPanel
  - Usually: `ns1.dns-parking.com` and `ns2.dns-parking.com`
- [ ] Update nameservers at your registrar
- [ ] Wait for DNS propagation (24-48 hours)
  - Check status: https://www.whatsmydns.net
- [ ] Add domain in Hostinger hPanel

**📖 Detailed Guide:** See `DOMAIN_SETUP_GUIDE.md`

---

## 📤 Phase 3: Upload Website to Hostinger

### Access File Manager

- [ ] Log in to Hostinger hPanel
- [ ] Go to Websites → `suomiportaat.com` → Manage
- [ ] Click **File Manager**
- [ ] Navigate to `public_html` folder

### Clean & Upload

- [ ] Backup any existing files (if present)
- [ ] Delete all files in `public_html`
- [ ] Open local `dist` folder
- [ ] Select ALL contents (Ctrl+A)
- [ ] Drag & drop into `public_html` in File Manager
- [ ] Verify upload completed successfully

### Verify Files

- [ ] `index.html` is in `public_html` root
- [ ] `assets/` folder is present
- [ ] `.htaccess` file is present
- [ ] All media files uploaded

---

## 🔐 Phase 4: Enable SSL Certificate

### Activate SSL

- [ ] In Hostinger: Websites → `suomiportaat.com` → SSL
- [ ] Click "Install" for Free SSL Certificate
- [ ] Wait 5-15 minutes for activation
- [ ] Enable "Force HTTPS" toggle

### Verify SSL

- [ ] Visit `https://suomiportaat.com`
- [ ] Padlock icon shows in browser
- [ ] Try `http://suomiportaat.com` - should redirect to HTTPS
- [ ] No "Not Secure" warnings

---

## 🔥 Phase 5: Configure Firebase Authentication

### Firebase Console

- [ ] Go to https://console.firebase.google.com
- [ ] Select project: `nordic-sauna-map`
- [ ] Go to Authentication → Settings
- [ ] Add Authorized Domain: `suomiportaat.com`
- [ ] Add Authorized Domain: `www.suomiportaat.com` (if using www)

**📖 Detailed Guide:** See `QUICK_AUTH_SETUP.md`

---

## 🔑 Phase 6: Configure Google Cloud OAuth

### Google Cloud Console

- [ ] Go to https://console.cloud.google.com
- [ ] Navigate to: APIs & Services → Credentials
- [ ] Edit OAuth 2.0 Client ID (Web client)

### Add JavaScript Origins

- [ ] Click "+ ADD URI" under JavaScript origins
- [ ] Add: `https://suomiportaat.com`
- [ ] Add: `https://www.suomiportaat.com` (if using www)

### Add Redirect URIs

- [ ] Click "+ ADD URI" under Redirect URIs
- [ ] Add: `https://suomiportaat.com/__/auth/handler`
- [ ] Add: `https://www.suomiportaat.com/__/auth/handler` (if using www)

### Save Changes

- [ ] Click SAVE at bottom
- [ ] Wait 2-3 minutes for propagation

**📖 Detailed Guide:** See `FIREBASE_DOMAIN_SETUP.md`

---

## ✅ Phase 7: Testing & Verification

### Basic Functionality

- [ ] Visit `https://suomiportaat.com`
- [ ] Homepage loads correctly
- [ ] No console errors (F12)
- [ ] SSL certificate active (padlock icon)

### Navigation

- [ ] All menu items work
- [ ] Direct URLs work (e.g., `/education`, `/blog`)
- [ ] No 404 errors on page refresh
- [ ] Footer links work

### Translations

- [ ] Language switcher works
- [ ] Test all 5 languages:
  - [ ] English (EN)
  - [ ] Swedish (SV)
  - [ ] Finnish (FI)
  - [ ] Arabic (AR)
  - [ ] Ukrainian (UK)

### Authentication

- [ ] Click "Get Started" or "Sign In"
- [ ] Google Sign-In works
  - [ ] Click "Continue with Google"
  - [ ] Select Google account
  - [ ] Successfully logs in
  - [ ] Redirects back to site
- [ ] Email/Password works (if enabled)
- [ ] Sign out works

### User Features

- [ ] User can access Profile/User Panel
- [ ] User can update profile
- [ ] User can view their content
- [ ] User can sign out

### Admin Features (if admin user)

- [ ] Admin can access Admin Panel
- [ ] Admin can manage content
- [ ] Admin can view analytics
- [ ] Design Studio works (if enabled)

### Mobile Testing

- [ ] Test on mobile device
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] No horizontal scrolling

### Cross-Browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## 🐛 Phase 8: Troubleshooting (if needed)

### Common Issues & Solutions

| Issue | Solution | Guide |
|-------|----------|-------|
| 404 on page refresh | Check `.htaccess` in `public_html` | `DEPLOY_TO_HOSTINGER.md` |
| "Not Secure" warning | Enable SSL in Hostinger | `DEPLOY_TO_HOSTINGER.md` |
| `auth/unauthorized-domain` | Add domain to Firebase | `QUICK_AUTH_SETUP.md` |
| `redirect_uri_mismatch` | Add redirect URI in Google Cloud | `FIREBASE_DOMAIN_SETUP.md` |
| `origin_mismatch` | Add JavaScript origin in Google Cloud | `FIREBASE_DOMAIN_SETUP.md` |
| Blank page | Check console errors, verify files uploaded | `DEPLOY_TO_HOSTINGER.md` |

---

## 📊 Phase 9: Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor for any user-reported issues
- [ ] Check browser console for errors
- [ ] Verify analytics tracking (if enabled)
- [ ] Test all critical user flows

### First Week

- [ ] Monitor authentication success rate
- [ ] Check for any 404 errors
- [ ] Verify email notifications working (if enabled)
- [ ] Gather user feedback

---

## 📝 Phase 10: Documentation & Backup

### Update Documentation

- [ ] Document any custom configurations
- [ ] Note any issues encountered and solutions
- [ ] Update team on deployment status

### Backup

- [ ] Backup database (if applicable)
- [ ] Save deployment configuration
- [ ] Document environment variables

---

## 🎉 Deployment Complete!

Once all checkboxes are checked, your website is fully deployed and operational!

### Your Live URLs:

- **Website:** https://suomiportaat.com
- **Admin Panel:** https://suomiportaat.com (login → Admin Panel)
- **Firebase Console:** https://console.firebase.google.com/project/nordic-sauna-map
- **Google Cloud Console:** https://console.cloud.google.com

### Support Resources:

- **Hostinger Support:** https://www.hostinger.com/contact (24/7 live chat)
- **Firebase Docs:** https://firebase.google.com/docs
- **Your Guides:**
  - `DOMAIN_SETUP_GUIDE.md` - Domain configuration
  - `DEPLOY_TO_HOSTINGER.md` - Deployment details
  - `QUICK_AUTH_SETUP.md` - Quick auth setup
  - `FIREBASE_DOMAIN_SETUP.md` - Detailed auth configuration

---

## 🔄 Future Updates

When you make changes to your website:

1. [ ] Make changes locally
2. [ ] Test with `npm run dev`
3. [ ] Run `npm run build`
4. [ ] Upload new `dist` contents to `public_html`
5. [ ] Clear browser cache
6. [ ] Test on live site

---

**🚀 Happy Deploying!**
