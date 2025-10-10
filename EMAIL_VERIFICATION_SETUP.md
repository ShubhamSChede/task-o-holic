# Email Verification Setup Guide

## Overview
This guide will help you set up email verification for your Task-O-Holic application using Supabase Auth.

## Supabase Dashboard Configuration

### 1. Configure Email Templates
1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to Authentication → Email Templates

2. **Update Confirmation Email Template**
   - Click on "Confirm signup" template
   - Update the template to include proper styling
   - Make sure the confirmation link points to your callback URL

3. **Set Site URL**
   - Go to Authentication → URL Configuration
   - Set **Site URL** to: `http://localhost:3000` (for development)
   - Set **Redirect URLs** to: `http://localhost:3000/auth/callback`

### 2. Email Provider Configuration
1. **Go to Authentication → Settings**
2. **Configure SMTP Settings** (if using custom SMTP)
   - Or use Supabase's built-in email service
   - For production, consider using SendGrid, Mailgun, or similar

### 3. Email Verification Settings
1. **Enable Email Confirmations**
   - Go to Authentication → Settings
   - Enable "Enable email confirmations"
   - Set confirmation URL to: `http://localhost:3000/auth/callback`

## Application Flow

### 1. User Registration Flow
```
User fills signup form → 
Email verification sent → 
User clicks email link → 
Redirected to /auth/callback → 
Automatic login → 
Redirected to dashboard
```

### 2. Email Verification Process
1. **User signs up** → Verification email sent
2. **User clicks email link** → Redirected to `/auth/callback`
3. **Callback page processes** → Sets session automatically
4. **User logged in** → Redirected to dashboard

## Files Created/Modified

### 1. **Auth Form** (`src/components/auth/auth-form.tsx`)
- ✅ **Verification Message**: Shows after successful signup
- ✅ **Redirect URL**: Includes callback URL in signup options
- ✅ **User-friendly UI**: Clear instructions for email verification

### 2. **Auth Callback** (`src/app/auth/callback/page.tsx`)
- ✅ **Token Processing**: Handles auth tokens from email link
- ✅ **Session Management**: Automatically logs in user
- ✅ **Error Handling**: Graceful error handling
- ✅ **Success Feedback**: Clear success/error messages

### 3. **Supabase Client** (`src/lib/supabase/client.ts`)
- ✅ **Redirect Configuration**: Sets default redirect URL
- ✅ **Auth Options**: Proper auth configuration

### 4. **Middleware** (`src/middleware.ts`)
- ✅ **Callback Route**: Allows auth callback routes to pass through

### 5. **Email Verification Status** (`src/components/auth/email-verification-status.tsx`)
- ✅ **Status Checking**: Checks if email is verified
- ✅ **Resend Functionality**: Allows resending verification emails
- ✅ **Visual Feedback**: Clear status indicators

## Testing the Flow

### 1. **Test Registration**
1. Go to `/register`
2. Fill out the form
3. Submit registration
4. Check for verification message

### 2. **Test Email Verification**
1. Check your email inbox
2. Click the verification link
3. Should redirect to `/auth/callback`
4. Should automatically log in and redirect to dashboard

### 3. **Test Error Handling**
1. Try with invalid email
2. Try with expired verification link
3. Check error messages are displayed

## Production Considerations

### 1. **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. **URL Configuration**
- Update Site URL to your production domain
- Update Redirect URLs to include production callback URL
- Test email templates in production

### 3. **Email Provider**
- Consider using a dedicated email service
- Set up proper SPF/DKIM records
- Monitor email delivery rates

## Troubleshooting

### Common Issues

1. **Email not received**
   - Check spam folder
   - Verify SMTP configuration
   - Check email template settings

2. **Callback not working**
   - Verify redirect URL configuration
   - Check middleware allows callback routes
   - Verify token processing logic

3. **Automatic login fails**
   - Check session handling in callback
   - Verify token validation
   - Check browser console for errors

### Debug Steps

1. **Check Supabase Logs**
   - Go to Logs → Auth
   - Look for signup/verification events

2. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests

3. **Test with Different Browsers**
   - Verify cross-browser compatibility
   - Check cookie/session handling

## Security Considerations

1. **Token Security**
   - Tokens are handled securely by Supabase
   - No sensitive data in URL parameters

2. **Session Management**
   - Proper session validation
   - Automatic token refresh

3. **Email Security**
   - Verification links expire
   - One-time use tokens

## Next Steps

After implementing email verification:

1. **Test thoroughly** with different email providers
2. **Monitor email delivery** rates
3. **Set up proper email templates** for production
4. **Consider additional security** measures
5. **Document the process** for your team

The email verification system is now fully implemented and ready for use! 🎉
