# Resend Email Service Configuration & Status

**Date**: December 2024  
**Service**: Resend API for email delivery  
**Status**: ✅ Configured, ⚠️ Requires API key setup

---

## 📧 Overview

The application uses **Resend** as the primary email service for sending verification codes during signup and login. Resend is a modern email API service that provides reliable email delivery.

---

## 🔧 Current Configuration

### Package Installation
- **Package**: `resend@^6.2.0`
- **Status**: ✅ Installed in `backend/package.json`

### Implementation Location
- **File**: `backend/src/utils/emailService.js`
- **Function**: `sendWithResend()`
- **Usage**: Called by `sendConfirmationEmail()`

---

## ⚙️ Environment Variables Required

### Required Variables

```env
# Resend API Key (Required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Resend From Email (Recommended)
RESEND_FROM_EMAIL=Degree Plan Assistant <noreply@yourdomain.com>
```

### Optional Variables

```env
# Email Provider Preference
EMAIL_PROVIDER=resend

# Alternative From Email (fallback)
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

---

## 🔍 Current Implementation Details

### 1. Resend Instance Creation

```javascript
const getResendInstance = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Email service configured with Resend");
  }
  return resend;
};
```

**Behavior**:
- Lazy initialization (only creates instance when needed)
- Requires `RESEND_API_KEY` environment variable
- Logs success message when configured

### 2. Email Sending Function

```javascript
const sendWithResend = async ({ to, subject, html }) => {
  // Gets Resend instance
  // Sets from email (with fallbacks)
  // Sends email via Resend API
  // Handles errors
}
```

**From Email Priority**:
1. `RESEND_FROM_EMAIL` (preferred)
2. `EMAIL_FROM_ADDRESS` (fallback)
3. `"Degree Plan Assistant <onboarding@resend.dev>"` (default)

### 3. Error Handling

The implementation handles:
- **403 Validation Error**: Domain not verified
- **Missing API Key**: Graceful fallback
- **Other Errors**: Detailed error messages

### 4. Provider Fallback System

The email service uses a fallback system:
1. **Primary**: Resend (if `RESEND_API_KEY` is set)
2. **Fallback**: SMTP/Nodemailer (if SMTP is configured)
3. **Order**: Configurable via `EMAIL_PROVIDER` env var

---

## 📋 Configuration Checklist

### ✅ What's Working

- [x] Resend package installed
- [x] Email service implementation complete
- [x] Error handling implemented
- [x] Fallback to SMTP configured
- [x] Lazy initialization (performance)
- [x] Logging for debugging

### ⚠️ What Needs Setup

- [ ] **RESEND_API_KEY** - Get from Resend dashboard
- [ ] **RESEND_FROM_EMAIL** - Verify domain in Resend
- [ ] **Domain Verification** - Add DNS records in Resend

---

## 🚀 Setup Instructions

### Step 1: Get Resend API Key

1. **Sign up/Login** to [Resend](https://resend.com)
2. **Navigate** to API Keys section
3. **Create** a new API key
4. **Copy** the API key (starts with `re_`)

### Step 2: Add to Environment Variables

Add to `backend/.env`:

```env
RESEND_API_KEY=re_your_api_key_here
```

### Step 3: Verify Domain (Recommended)

1. **Go to** Resend Dashboard → Domains
2. **Add** your domain (e.g., `yourdomain.com`)
3. **Add DNS records** as instructed:
   - SPF record
   - DKIM records
   - DMARC (optional)
4. **Wait** for verification (usually a few minutes)

### Step 4: Configure From Email

After domain verification:

```env
RESEND_FROM_EMAIL=Degree Plan Assistant <noreply@yourdomain.com>
```

**Or use Resend's test domain** (for development only):
```env
RESEND_FROM_EMAIL=Degree Plan Assistant <onboarding@resend.dev>
```

**Note**: Test domain only works for emails sent to the test address linked to your Resend account.

---

## 🧪 Testing Resend

### Test Email Sending

1. **Set environment variables**:
   ```env
   RESEND_API_KEY=re_your_key
   RESEND_FROM_EMAIL=Degree Plan Assistant <onboarding@resend.dev>
   ```

2. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Try signup**:
   ```bash
   POST http://localhost:4000/api/auth/signup/step1
   {
     "email": "your-test-email@example.com",
     "password": "Test1234"
   }
   ```

4. **Check logs** for:
   - `✅ Email service configured with Resend`
   - `📧 Confirmation email sent via Resend to ...`

### Expected Console Output

**Success**:
```
✅ Email service configured with Resend
📧 Confirmation email sent via Resend to user@example.com (id: abc123...)
```

**Error (No API Key)**:
```
⚠️ Email attempt with resend failed: Resend is not configured (missing RESEND_API_KEY).
📧 Confirmation email sent via Nodemailer to user@example.com
```

**Error (Domain Not Verified)**:
```
❌ Resend error: { statusCode: 403, name: 'validation_error', ... }
Resend validation error: You must verify a sending domain...
```

---

## 🔍 Troubleshooting

### Issue 1: "Resend is not configured"

**Symptoms**:
- Console shows: `Resend is not configured (missing RESEND_API_KEY)`
- Emails fall back to SMTP or fail

**Solution**:
1. Check `backend/.env` file exists
2. Verify `RESEND_API_KEY` is set
3. Restart the server after adding the key

---

### Issue 2: "Resend validation error: You must verify a sending domain"

**Symptoms**:
- Error: `403 validation_error`
- Emails not sent

**Solutions**:

**Option A: Verify Domain** (Recommended for production)
1. Add domain in Resend dashboard
2. Add DNS records
3. Wait for verification
4. Use verified domain in `RESEND_FROM_EMAIL`

**Option B: Use Test Domain** (Development only)
1. Use `onboarding@resend.dev` as from email
2. Send only to the test email address linked to your Resend account
3. Check Resend dashboard for your test email address

---

### Issue 3: Emails Not Received

**Check**:
1. **Spam folder** - Check if email went to spam
2. **Resend dashboard** - Check "Emails" section for delivery status
3. **API key permissions** - Ensure key has email sending permissions
4. **Rate limits** - Check if you've exceeded Resend's free tier limits

---

### Issue 4: "RESEND_FROM_EMAIL is not configured" Warning

**Symptoms**:
- Warning in console logs
- Emails may still work but with default domain

**Solution**:
```env
RESEND_FROM_EMAIL=Degree Plan Assistant <noreply@yourdomain.com>
```

---

## 📊 Resend API Limits

### Free Tier
- **3,000 emails/month**
- **100 emails/day**
- **Test domain available**

### Paid Plans
- Higher limits available
- Custom domain support
- Advanced features

**Check your usage**: [Resend Dashboard](https://resend.com/dashboard)

---

## 🔄 Fallback Behavior

### Provider Priority

The email service tries providers in this order:

1. **If `EMAIL_PROVIDER=resend`**:
   - Try Resend first
   - Fallback to SMTP if Resend fails

2. **If `EMAIL_PROVIDER=smtp` or `nodemailer`**:
   - Try SMTP first
   - Fallback to Resend if SMTP fails

3. **If `EMAIL_PROVIDER` not set**:
   - Try SMTP first (if configured)
   - Fallback to Resend (if configured)

### Error Handling

- If Resend fails, automatically tries SMTP
- If both fail, throws error with all error messages
- Logs warnings for each failed attempt

---

## 📝 Code Examples

### Current Usage

```javascript
// In auth.controller.js
await sendConfirmationEmail(email, confirmationCode);
```

### Manual Resend Usage (if needed)

```javascript
import { sendWithResend } from "../utils/emailService.js";

await sendWithResend({
  to: "user@example.com",
  subject: "Test Email",
  html: "<h1>Hello</h1>"
});
```

---

## 🔐 Security Considerations

### API Key Security
- ✅ Never commit API keys to git
- ✅ Use `.env` file (in `.gitignore`)
- ✅ Rotate keys periodically
- ✅ Use environment-specific keys

### Email Security
- ✅ Domain verification prevents spoofing
- ✅ SPF/DKIM records configured
- ✅ HTML emails sanitized
- ✅ No sensitive data in emails (only codes)

---

## 📈 Monitoring & Logging

### Success Logs
```
✅ Email service configured with Resend
📧 Confirmation email sent via Resend to user@example.com (id: abc123)
```

### Warning Logs
```
⚠️ RESEND_FROM_EMAIL is not configured...
⚠️ Email attempt with resend failed: ...
```

### Error Logs
```
❌ Resend error: { ... }
❌ Error sending confirmation email: ...
```

---

## 🎯 Best Practices

1. **Always verify domain** for production
2. **Use environment variables** for API keys
3. **Monitor email delivery** in Resend dashboard
4. **Set up fallback** (SMTP) for reliability
5. **Test with real emails** before production
6. **Check spam folders** during testing
7. **Monitor rate limits** and upgrade if needed

---

## 🔗 Resources

- **Resend Dashboard**: https://resend.com/dashboard
- **Resend Documentation**: https://resend.com/docs
- **Resend API Reference**: https://resend.com/docs/api-reference
- **Domain Verification Guide**: https://resend.com/docs/dashboard/domains/introduction

---

## ✅ Verification Checklist

- [ ] Resend account created
- [ ] API key generated and added to `.env`
- [ ] Domain verified (for production)
- [ ] `RESEND_FROM_EMAIL` configured
- [ ] Test email sent successfully
- [ ] Error handling tested
- [ ] Fallback to SMTP tested (if configured)
- [ ] Logs checked for success messages

---

## 🐛 Known Issues

### Issue: Emails Blocked by Resend

**Cause**: Unverified domain or sending to non-test addresses with test domain

**Workaround**: 
- In development, use test email address from Resend dashboard
- Or verify your domain
- Or configure SMTP as primary provider

**Status**: Documented in `docs/test-and-bugs/README.md`

---

**Last Updated**: December 2024  
**Status**: ✅ Configured, ⚠️ Requires API key and domain setup

