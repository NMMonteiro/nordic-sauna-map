# Fix: Email Confirmation Error in Supabase

## Problem
Users are getting "Error sending confirmation email" when trying to register.

## Root Cause
Supabase has email confirmation enabled by default, but the email service (SMTP) is not configured in your project.

## Solution Options

### Option 1: Disable Email Confirmation (Recommended for Development/Testing)

1. **Go to Supabase Dashboard:**
   - Navigate to https://supabase.com/dashboard
   - Select your "Nordic Sauna Map" project

2. **Navigate to Authentication Settings:**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab
   - Find "Email" provider

3. **Disable Email Confirmation:**
   - Scroll down to "Email Settings"
   - Find "Confirm email" toggle
   - **Turn OFF** the "Confirm email" option
   - Click "Save"

4. **Test Registration:**
   - Try registering a new user
   - User should be able to sign up and log in immediately without email confirmation

---

### Option 2: Configure Email Service (Recommended for Production)

If you want to keep email confirmation enabled, you need to configure SMTP:

1. **Go to Supabase Dashboard:**
   - Navigate to https://supabase.com/dashboard
   - Select your "Nordic Sauna Map" project

2. **Navigate to Project Settings:**
   - Click on "Project Settings" (gear icon) in the left sidebar
   - Click on "Auth" tab

3. **Configure SMTP Settings:**
   - Scroll down to "SMTP Settings"
   - Enable "Enable Custom SMTP"
   - Fill in your SMTP details:
     - **SMTP Host:** (e.g., smtp.gmail.com for Gmail)
     - **SMTP Port:** (e.g., 587 for TLS)
     - **SMTP User:** Your email address
     - **SMTP Password:** Your email password or app-specific password
     - **Sender Email:** The email address that will send confirmation emails
     - **Sender Name:** "Nordic Sauna Map" or your preferred name

4. **For Gmail (Example):**
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: `your-email@gmail.com`
   - Password: Create an "App Password" in your Google Account settings
   - Sender: `your-email@gmail.com`
   - Name: `Nordic Sauna Map`

5. **Test the Configuration:**
   - Click "Save"
   - Try registering a new user
   - Check if the confirmation email is received

---

## Code Changes Made

I've updated the `AuthModal.tsx` component to:

1. **Better Error Handling:**
   - Catches email confirmation errors specifically
   - Shows a user-friendly message if email service is not configured

2. **Auto-Login Support:**
   - If email confirmation is disabled, users are automatically logged in after registration
   - If email confirmation is enabled, users see a message to check their email

3. **Email Redirect:**
   - Added `emailRedirectTo` option to redirect users back to the homepage after email confirmation

---

## Testing After Fix

### If you disabled email confirmation:
1. Try registering with a new email
2. You should be logged in immediately
3. No email confirmation required

### If you configured SMTP:
1. Try registering with a new email
2. Check your email inbox for confirmation email
3. Click the confirmation link
4. You should be redirected to the homepage and logged in

---

## Recommended Approach

**For Development/Testing:** Disable email confirmation (Option 1)
**For Production:** Configure SMTP with a professional email service (Option 2)

---

## Additional Notes

- The code changes are already deployed and will work with either option
- If you choose Option 1 (disable confirmation), existing unconfirmed users can now log in directly
- If you choose Option 2 (SMTP), make sure to use a reliable email service for production
- Consider using services like SendGrid, Mailgun, or AWS SES for production email delivery

---

## Current Status

✅ Code updated with better error handling
⏳ Waiting for Supabase configuration (choose Option 1 or 2 above)
