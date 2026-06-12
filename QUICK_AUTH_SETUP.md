# 🚀 Quick Start: Configure suomiportaat.com for Authentication

Follow these steps in order to get authentication working on your live domain.

---

## ⚡ Step-by-Step Configuration

### 1️⃣ Firebase Console (5 minutes)

**URL:** https://console.firebase.google.com

1. **Select Project:** `nordic-sauna-map`

2. **Go to Authentication:**
   - Left sidebar → **Build** → **Authentication**
   - Click **Settings** tab (gear icon)

3. **Add Authorized Domains:**
   - Scroll to "Authorized domains"
   - Click **Add domain**
   - Type: `suomiportaat.com`
   - Click **Add**
   
   ✅ **Done!** Firebase will now allow authentication from your domain.

---

### 2️⃣ Google Cloud Console (10 minutes)

**URL:** https://console.cloud.google.com

#### Part A: Navigate to OAuth Settings

1. **Open menu** (☰ top left)
2. **Go to:** APIs & Services → **Credentials**
3. **Find:** "OAuth 2.0 Client IDs" section
4. **Click:** The pencil icon (✏️) to edit your Web client

#### Part B: Add JavaScript Origins

1. **Scroll to:** "Authorized JavaScript origins"
2. **Click:** + ADD URI
3. **Add this URL:**
   ```
   https://suomiportaat.com
   ```
4. **Click:** + ADD URI again (if using www)
5. **Add:**
   ```
   https://www.suomiportaat.com
   ```

#### Part C: Add Redirect URIs

1. **Scroll to:** "Authorized redirect URIs"
2. **Click:** + ADD URI
3. **Add this URL:**
   ```
   https://suomiportaat.com/__/auth/handler
   ```
4. **Click:** + ADD URI again (if using www)
5. **Add:**
   ```
   https://www.suomiportaat.com/__/auth/handler
   ```

#### Part D: Save

1. **Scroll to bottom**
2. **Click:** SAVE
3. **Wait:** 2-3 minutes for changes to take effect

---

## ✅ Verification

### Test Authentication:

1. **Visit:** https://suomiportaat.com
2. **Click:** "Get Started" or "Sign In"
3. **Click:** "Continue with Google"
4. **Select:** Your Google account
5. **Result:** Should successfully log you in ✅

### If you get errors:

| Error | Solution |
|-------|----------|
| `auth/unauthorized-domain` | Add domain in Firebase (Step 1) |
| `redirect_uri_mismatch` | Add redirect URI in Google Cloud (Step 2C) |
| `origin_mismatch` | Add JavaScript origin in Google Cloud (Step 2B) |

---

## 📋 Configuration Summary

After completing the steps above, you should have:

### In Firebase Console:
✅ Authorized domains:
- `suomiportaat.com`
- `www.suomiportaat.com` (optional)

### In Google Cloud Console:
✅ JavaScript origins:
- `https://suomiportaat.com`
- `https://www.suomiportaat.com` (optional)

✅ Redirect URIs:
- `https://suomiportaat.com/__/auth/handler`
- `https://www.suomiportaat.com/__/auth/handler` (optional)

---

## 🎯 What Each Setting Does

**Authorized Domains (Firebase):**
- Tells Firebase which domains are allowed to use authentication
- Without this, you'll get `auth/unauthorized-domain` error

**JavaScript Origins (Google Cloud):**
- Tells Google which domains can initiate OAuth requests
- Without this, you'll get `origin_mismatch` error

**Redirect URIs (Google Cloud):**
- Tells Google where to send users after they authenticate
- Without this, you'll get `redirect_uri_mismatch` error

---

## 💡 Pro Tips

1. **Always use HTTPS** - Authentication won't work on HTTP
2. **Wait 2-3 minutes** after saving changes in Google Cloud
3. **Clear browser cache** if you're still seeing errors after configuration
4. **Test in incognito mode** to rule out browser extensions
5. **Keep localhost entries** for local development

---

## 🔗 Direct Links

- **Firebase Console:** https://console.firebase.google.com/project/nordic-sauna-map/authentication/settings
- **Google Cloud Credentials:** https://console.cloud.google.com/apis/credentials

---

**Need detailed instructions?** See `FIREBASE_DOMAIN_SETUP.md` for comprehensive guide with troubleshooting.

**Ready to deploy?** See `DEPLOY_TO_HOSTINGER.md` for deployment instructions.
