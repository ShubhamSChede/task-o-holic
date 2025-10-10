# Fix "Failed to fetch" Error

## The Problem
The "Failed to fetch" error occurs because the `.env.local` file is missing, which contains your Supabase configuration.

## Quick Fix

### 1. Create `.env.local` file
Create a new file called `.env.local` in your project root with the following content:

```env
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Your Supabase anon/public key (safe to use in browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Your Supabase service role key (NEVER expose to browser, server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Get Your Supabase Credentials
1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Get API Keys**
   - Go to Settings → API
   - Copy the "Project URL" → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the "anon public" key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the "service_role" key → paste as `SUPABASE_SERVICE_ROLE_KEY`

### 3. Restart Development Server
After creating the `.env.local` file:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Example `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjQzNzI4MCwiZXhwIjoxOTYyMDEzMjgwfQ.example-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ2NDM3MjgwLCJleHAiOjE5NjIwMTMyODB9.example-service-key-here
```

## Additional Fixes Applied

### 1. **Fixed Supabase Client Configuration**
- Added proper window check for redirect URL
- Prevents server-side rendering issues

### 2. **Enhanced Error Handling**
- More specific error messages
- Better user feedback
- Console logging for debugging

### 3. **Improved Auth Form**
- Safer redirect URL handling
- Better error categorization

## Testing After Fix

1. **Create Account**
   - Go to `/register`
   - Fill out the form
   - Should show verification message instead of "Failed to fetch"

2. **Check Console**
   - Open browser dev tools
   - Look for any remaining errors
   - Should see successful API calls

## If Still Having Issues

1. **Check Network Tab**
   - Open dev tools → Network tab
   - Try creating account
   - Look for failed requests

2. **Verify Supabase Project**
   - Make sure project is active
   - Check if API keys are correct
   - Verify project URL format

3. **Check Environment Variables**
   - Make sure `.env.local` is in project root
   - Verify no extra spaces or quotes
   - Restart dev server after changes

The "Failed to fetch" error should be resolved once you create the `.env.local` file with your Supabase credentials! 🎉
