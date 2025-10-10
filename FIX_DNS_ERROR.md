# Fix ERR_NAME_NOT_RESOLVED Error

## The Problem
The error `ERR_NAME_NOT_RESOLVED` for `ibfwhaakzwmasvihttyl.supabase.co` means:
- The Supabase project URL is incorrect
- The Supabase project has been paused/deleted
- The project reference ID is wrong

## Quick Diagnosis

### 1. Check Your Supabase Project Status
1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Check if your project exists**
3. **Look for any "Paused" or "Deleted" status**

### 2. Verify Project URL Format
Your Supabase URL should look like:
```
https://[PROJECT_REF].supabase.co
```

**Example:**
```
https://abcdefghijklmnop.supabase.co
```

## Solutions

### Solution 1: Create a New Supabase Project
If your project was paused/deleted:

1. **Create New Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose organization
   - Enter project name: "task-o-holic"
   - Set database password
   - Choose region closest to you
   - Click "Create new project"

2. **Get New Credentials**
   - Wait for project to be ready (2-3 minutes)
   - Go to Settings → API
   - Copy the new Project URL and API keys

3. **Update .env.local**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-new-service-key
   ```

### Solution 2: Fix Existing Project URL
If you have the correct project:

1. **Check Project Reference**
   - Go to Supabase Dashboard
   - Select your project
   - Look at the URL in browser: `https://supabase.com/dashboard/project/[PROJECT_REF]`
   - The PROJECT_REF is what goes in your URL

2. **Update .env.local**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[CORRECT_PROJECT_REF].supabase.co
   ```

### Solution 3: Restore from Backup
If you have a backup project:

1. **Use the backup project**
   - Go to the backup project in Supabase
   - Get its credentials
   - Update .env.local with backup project details

## Step-by-Step Fix

### Step 1: Check Supabase Dashboard
```bash
# Open browser and go to:
https://supabase.com/dashboard
```

### Step 2: Verify Project
- Look for your project in the dashboard
- Check if it shows "Active" status
- If paused, click "Resume" or create new project

### Step 3: Get Correct Credentials
1. **Click on your project**
2. **Go to Settings → API**
3. **Copy these values:**
   - Project URL (should end with `.supabase.co`)
   - anon public key
   - service_role key

### Step 4: Update .env.local
Create/update `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-correct-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Testing the Fix

### 1. Check Network Tab
1. Open browser dev tools
2. Go to Network tab
3. Try to create account
4. Look for successful requests to Supabase

### 2. Verify URL Format
The request should go to:
```
https://[PROJECT_REF].supabase.co/auth/v1/signup
```

**NOT:**
```
https://ibfwhaakzwmasvihttyl.supabase.co/auth/v1/signup  ❌
```

## Common Issues

### Issue 1: Project Paused
**Solution:** Resume project or create new one

### Issue 2: Wrong Project Reference
**Solution:** Double-check the project reference ID

### Issue 3: Typo in URL
**Solution:** Verify URL format and spelling

### Issue 4: Missing .env.local
**Solution:** Create the file with correct credentials

## If Still Having Issues

### 1. Create Fresh Project
- Create a completely new Supabase project
- Use the new credentials
- This ensures everything is working

### 2. Check Internet Connection
- Verify you can access supabase.com
- Check if there are any network restrictions

### 3. Contact Support
- If project exists but URL doesn't work
- Contact Supabase support

## Quick Test

After fixing, test with this simple check:
1. Go to `/register`
2. Fill out the form
3. Submit
4. Should see verification message (not "Failed to fetch")

The `ERR_NAME_NOT_RESOLVED` error will be fixed once you have the correct Supabase project URL! 🎉
