# 🔐 Firebase & Google Cloud Configuration for suomiportaat.com

This guide will help you configure Firebase Authentication and Google Cloud to work with your domain `suomiportaat.com` on Hostinger.

---

## 📋 Prerequisites

- ✅ Firebase project set up (your existing project: `nordic-sauna-map`)
- ✅ Google Cloud Console access
- ✅ Domain `suomiportaat.com` live on Hostinger
- ✅ SSL certificate enabled (HTTPS working)

---

## 🔥 Part 1: Firebase Authentication Configuration

### Step 1: Add Authorized Domains in Firebase

1. **Go to Firebase Console:**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Select your project: **nordic-sauna-map**

2. **Navigate to Authentication:**
   - Click **Build** in the left sidebar
   - Click **Authentication**
   - Click on the **Settings** tab (gear icon at top)

3. **Add Authorized Domains:**
   - Scroll to **Authorized domains** section
   - Click **Add domain**
   - Add: `suomiportaat.com`
   - Click **Add**
   
4. **Add www subdomain (if using):**
   - Click **Add domain** again
   - Add: `www.suomiportaat.com`
   - Click **Add**

5. **Verify your domains list includes:**
   - ✅ `localhost` (for local development)
   - ✅ `suomiportaat.com` (your production domain)
   - ✅ `www.suomiportaat.com` (if using www)
   - You can remove old domains like `nordicsaunamap.com` if they exist

---

## 🔑 Part 2: Google OAuth Configuration

If you're using Google Sign-In (which you are), you need to configure Google Cloud Console.

### Step 1: Access Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit [https://console.cloud.google.com](https://console.cloud.google.com)
   - Make sure you're in the same project as your Firebase (should auto-select)

2. **Navigate to Credentials:**
   - Click the hamburger menu (☰) in the top left
   - Go to **APIs & Services** > **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID

1. **Locate your OAuth Client:**
   - Under **OAuth 2.0 Client IDs**, you should see one or more clients
   - Look for "Web client (auto created by Google Service)" or similar
   - Click the **pencil icon** (Edit) to edit it

### Step 3: Add Authorized JavaScript Origins

1. **In the OAuth client edit screen:**
   - Scroll to **Authorized JavaScript origins**
   - Click **+ ADD URI**

2. **Add your production domain:**
   ```
   https://suomiportaat.com
   ```
   - Click **+ ADD URI** again
   - Add (if using www):
   ```
   https://www.suomiportaat.com
   ```

3. **Keep existing origins for development:**
   - Keep `http://localhost:3000` (or your dev port)
   - Keep `http://localhost:5173` (Vite default)

### Step 4: Add Authorized Redirect URIs

1. **Scroll to Authorized redirect URIs:**
   - Click **+ ADD URI**

2. **Add Firebase Auth redirect:**
   ```
   https://suomiportaat.com/__/auth/handler
   ```

3. **Add www version (if using):**
   - Click **+ ADD URI**
   ```
   https://www.suomiportaat.com/__/auth/handler
   ```

4. **Keep the Firebase callback URL:**
   - You should already have something like:
   ```
   https://nordic-sauna-map.firebaseapp.com/__/auth/handler
   ```
   - Keep this for Firebase hosting compatibility

5. **Your final redirect URIs should include:**
   - ✅ `https://suomiportaat.com/__/auth/handler`
   - ✅ `https://www.suomiportaat.com/__/auth/handler` (if using www)
   - ✅ `https://nordic-sauna-map.firebaseapp.com/__/auth/handler`
   - ✅ `http://localhost:3000/__/auth/handler` (for local dev)

### Step 5: Save Changes

1. **Click SAVE at the bottom**
2. **Wait a few minutes** for changes to propagate (usually instant, but can take up to 5 minutes)

---

## 📧 Part 3: Email/Password Authentication (if using)

If you're using email/password authentication:

### Step 1: Configure Email Templates

1. **In Firebase Console:**
   - Go to **Authentication** > **Templates**

2. **Update Email Action URL:**
   - Click on each template (Email verification, Password reset, etc.)
   - Update the **Action URL** to: `https://suomiportaat.com`
   - Click **Save**

### Step 2: Verify Email Provider Settings

1. **In Firebase Console:**
   - Go to **Authentication** > **Sign-in method**
   - Click on **Email/Password**
   - Ensure it's **Enabled**

---

## 🌐 Part 4: Update Firebase Configuration in Your Code

Your Firebase config is already set in your code, but verify it's correct:

### Check firebaseConfig.ts

Your config should look like this (already in your code):

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBwPVFLEYyJBJEjNMVJZWYvVxOPYpqrKGg",
  authDomain: "nordic-sauna-map.firebaseapp.com",
  projectId: "nordic-sauna-map",
  storageBucket: "nordic-sauna-map.firebasestorage.app",
  messagingSenderId: "1029751773859",
  appId: "1:1029751773859:web:4e5e5c5e5e5e5e5e5e5e5e"
};
```

**Note:** The `authDomain` stays as `nordic-sauna-map.firebaseapp.com` - this is correct! Don't change it to your custom domain.

---

## ✅ Part 5: Testing Authentication

### Test Checklist:

1. **Visit your live site:**
   - Go to `https://suomiportaat.com`

2. **Test Google Sign-In:**
   - Click "Get Started" or "Sign In"
   - Click "Continue with Google"
   - Select a Google account
   - Should successfully authenticate and redirect back

3. **Test Email/Password (if enabled):**
   - Try registering with email
   - Check for confirmation email
   - Try logging in

4. **Check for errors:**
   - Open browser console (F12)
   - Look for any authentication errors
   - Common error: `auth/unauthorized-domain` means domain not added to Firebase

### Common Test Scenarios:

**✅ Success:** User logs in and sees their profile/dashboard
**❌ Error: "auth/unauthorized-domain"** → Add domain to Firebase Authorized Domains
**❌ Error: "redirect_uri_mismatch"** → Add redirect URI to Google Cloud Console
**❌ Error: "origin_mismatch"** → Add JavaScript origin to Google Cloud Console

---

## 🐛 Troubleshooting

### Issue: "auth/unauthorized-domain" error

**Solution:**
1. Go to Firebase Console > Authentication > Settings
2. Add `suomiportaat.com` to Authorized domains
3. Wait 2-3 minutes and try again

### Issue: "redirect_uri_mismatch" error

**Solution:**
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add `https://suomiportaat.com/__/auth/handler` to Authorized redirect URIs
4. Save and wait 2-3 minutes

### Issue: "origin_mismatch" error

**Solution:**
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add `https://suomiportaat.com` to Authorized JavaScript origins
4. Save and wait 2-3 minutes

### Issue: Google Sign-In popup closes immediately

**Possible causes:**
- Redirect URI not configured
- JavaScript origin not configured
- Browser blocking popups

**Solution:**
1. Verify all URIs are added correctly
2. Allow popups for your domain
3. Try in incognito mode to rule out extensions

### Issue: Authentication works locally but not on live site

**Solution:**
1. Verify SSL is enabled (must use HTTPS)
2. Check browser console for specific errors
3. Verify domain is added to Firebase Authorized domains
4. Clear browser cache and cookies

---

## 📝 Quick Reference Checklist

Use this checklist to ensure everything is configured:

### Firebase Console:
- [ ] `suomiportaat.com` added to Authorized domains
- [ ] `www.suomiportaat.com` added (if using www)
- [ ] Email templates updated with correct action URL
- [ ] Sign-in methods enabled (Google, Email/Password, etc.)

### Google Cloud Console:
- [ ] OAuth 2.0 Client ID edited
- [ ] `https://suomiportaat.com` added to JavaScript origins
- [ ] `https://www.suomiportaat.com` added to JavaScript origins (if using www)
- [ ] `https://suomiportaat.com/__/auth/handler` added to Redirect URIs
- [ ] `https://www.suomiportaat.com/__/auth/handler` added to Redirect URIs (if using www)
- [ ] Changes saved

### Testing:
- [ ] Google Sign-In works on live site
- [ ] Email/Password authentication works (if enabled)
- [ ] No console errors
- [ ] Users can access protected pages (Admin Panel, User Profile)

---

## 🔄 After Configuration

### 1. Test All Authentication Methods

- **Google Sign-In:** Primary method
- **Email/Password:** If enabled
- **Sign Out:** Verify users can sign out
- **Protected Routes:** Admin panel, user profile

### 2. Test User Roles

- **Regular User:**
  - Can view content
  - Can access user panel
  - Cannot access admin panel

- **Admin User:**
  - Can access admin panel
  - Can manage content
  - Can view analytics

### 3. Monitor for Issues

- Check Firebase Console > Authentication > Users
- Monitor for failed sign-in attempts
- Check browser console on live site

---

## 📞 Support Resources

- **Firebase Documentation:** [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
- **Google Cloud Console:** [https://console.cloud.google.com](https://console.cloud.google.com)
- **Firebase Support:** [https://firebase.google.com/support](https://firebase.google.com/support)

---

## 🎯 Summary

**What you configured:**
1. ✅ Firebase Authorized Domains → `suomiportaat.com`
2. ✅ Google OAuth JavaScript Origins → `https://suomiportaat.com`
3. ✅ Google OAuth Redirect URIs → `https://suomiportaat.com/__/auth/handler`

**What stays the same:**
- Firebase `authDomain` in code (remains `nordic-sauna-map.firebaseapp.com`)
- Firebase project ID
- API keys

**Result:**
- Users can authenticate on `suomiportaat.com`
- Google Sign-In works seamlessly
- All auth features functional

---

**🎉 Once configured, your authentication will work perfectly on suomiportaat.com!**
