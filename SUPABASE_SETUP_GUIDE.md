# Supabase Project Setup Guide - Task-o-holic

## Overview
This guide will help you set up a new Supabase project and restore your database schema after your old project was removed due to 90+ days of inactivity.

## Prerequisites
- [ ] A Supabase account (free tier is fine)
- [ ] The backup file: `db_cluster-02-07-2025@07-26-58.backup (2)`
- [ ] Your Next.js project ready

---

## Step 1: Create a New Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Fill in the details:
     - **Project Name**: `task-o-holic` (or your preferred name)
     - **Database Password**: Choose a strong password (save this!)
     - **Region**: Choose the closest region to you
     - **Pricing Plan**: Free (or Pro if needed)
   - Click "Create new project"
   - Wait 2-3 minutes for project setup

3. **Note Your Project Credentials**
   You'll need these values later:
   - **Project URL**: Found in Settings > API
   - **Project API Key (anon, public)**: Found in Settings > API
   - **Service Role Key** (optional): Found in Settings > API
   - **Database Password**: The one you set during creation

---

## Step 2: Restore Database Schema

### Option A: Using SQL Editor (Recommended for simplicity)

1. **Open SQL Editor**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New Query"

2. **Run the Restoration Script**
   - Open the file `supabase-restore-schema.sql` from your project root
   - Copy the entire content
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`
   - Wait for all statements to execute successfully

3. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - ✅ profiles
     - ✅ organizations
     - ✅ organization_members
     - ✅ todos
     - ✅ frequent_tasks

### Option B: Using Full Backup Restore (Advanced)

If you want to restore the complete backup including data:

1. **Install PostgreSQL Client**
   ```bash
   # Windows (via chocolatey)
   choco install postgresql

   # Or download from: https://www.postgresql.org/download/windows/
   ```

2. **Get Database Connection String**
   - Go to Settings > Database
   - Copy the "Connection string" (choose "Connection pooling" mode)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres`

3. **Restore from Backup**
   ```bash
   # Navigate to your project directory
   cd "C:\Users\shubh\OneDrive\Desktop\Projects\task-o-holic"

   # Restore the backup (this may take a while)
   pg_restore --verbose --clean --no-acl --no-owner \
     -d "postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres" \
     "db_cluster-02-07-2025@07-26-58.backup (2)"
   ```

   **Note**: This will restore ALL data including old users and organizations. Only use this if you want to keep old data.

---

## Step 3: Configure Authentication

1. **Enable Email Provider**
   - Go to Authentication > Providers
   - Make sure "Email" is enabled
   - Configure email templates if needed

2. **Set Auth Redirect URLs**
   - Go to Authentication > URL Configuration
   - Add these URLs:
     - **Site URL**: `http://localhost:3000` (for development)
     - **Redirect URLs**: 
       - `http://localhost:3000/**`
       - `https://your-production-domain.com/**` (when deploying)

3. **Configure Email Templates** (Optional)
   - Go to Authentication > Email Templates
   - Customize the confirmation and reset password emails

---

## Step 4: Update Your Next.js Project

1. **Update Environment Variables**
   
   Create or update `.env.local` in your project root:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
   ```

   Replace:
   - `[YOUR-PROJECT-REF]`: Your project reference (e.g., `abcdefghijklmnop`)
   - `[YOUR-ANON-KEY]`: The anon public key
   - `[YOUR-SERVICE-ROLE-KEY]`: The service role key (from Settings > API)

2. **Verify Configuration Files**

   Check if these files exist and are correct:
   
   - `src/lib/supabase/client.ts` - Client-side Supabase client
   - `src/lib/supabase/server.ts` - Server-side Supabase client
   - `src/lib/supabase/types.ts` - TypeScript types

3. **Install/Update Dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

---

## Step 5: Test Your Setup

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Authentication**
   - Go to `http://localhost:3000/register`
   - Create a new test account
   - Verify email confirmation works
   - Check if profile is auto-created

3. **Test Database Operations**
   - Create a personal todo
   - Create an organization
   - Add a todo to the organization
   - Create a frequent task

4. **Verify in Supabase Dashboard**
   - Go to Table Editor
   - Check if data is being inserted correctly
   - Verify RLS policies are working

---

## Step 6: Enable Realtime (Optional)

If you're using real-time features:

1. **Enable Realtime for Tables**
   - Go to Database > Replication
   - Click on `supabase_realtime` publication
   - Enable replication for:
     - ✅ todos
     - ✅ organization_members
     - ✅ frequent_tasks

---

## Step 7: Security Checklist

- [ ] Database password is strong and stored securely
- [ ] API keys are in `.env.local` and NOT in version control
- [ ] `.env.local` is in `.gitignore`
- [ ] RLS policies are enabled on all tables
- [ ] Service role key is only used server-side
- [ ] Email rate limiting is configured
- [ ] Auth redirect URLs are whitelisted

---

## Troubleshooting

### Issue: "relation already exists" errors
**Solution**: The table already exists. Either:
- Skip that CREATE TABLE statement, or
- Run `DROP TABLE IF EXISTS table_name CASCADE;` before creating

### Issue: Authentication not working
**Solution**: 
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
- Check browser console for errors
- Verify redirect URLs are configured

### Issue: RLS policy errors
**Solution**:
- Check if policies are created: Go to Authentication > Policies
- Verify user is authenticated: Check `auth.users` table
- Test policies in SQL Editor with: `SELECT auth.uid();`

### Issue: Functions not found
**Solution**:
- Re-run the functions section from `supabase-restore-schema.sql`
- Verify functions exist: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`

### Issue: Can't connect to database
**Solution**:
- Check if project is paused (free tier pauses after inactivity)
- Verify connection string is correct
- Make sure you're using the connection pooling mode (port 6543)

---

## Database Schema Overview

### Tables
1. **profiles** - User profiles (extends auth.users)
2. **organizations** - Organizations/teams
3. **organization_members** - Members in organizations with roles
4. **todos** - Todo items (personal or organizational)
5. **frequent_tasks** - Template tasks for organizations

### Key Functions
- `handle_new_user()` - Auto-creates profile on signup
- `update_updated_at_column()` - Auto-updates timestamps
- `get_todo_stats()` - Returns todo statistics

### RLS Policies
All tables have Row Level Security enabled with appropriate policies for:
- User can only see/edit their own data
- Organization members can see shared data
- Organization creators have admin privileges

---

## Next Steps After Setup

1. **Update TypeScript Types** (if schema changed)
   ```bash
   npx supabase gen types typescript --project-id [YOUR-PROJECT-REF] > src/types/supabase.ts
   ```

2. **Deploy to Production**
   - Update environment variables in your deployment platform
   - Add production URL to Supabase redirect URLs
   - Test thoroughly before going live

3. **Set Up Backups**
   - Configure automatic backups in Supabase settings
   - Export schema regularly for version control

4. **Monitor Usage**
   - Set up alerts for approaching free tier limits
   - Monitor database size and API requests

---

## Support Resources

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)
- 📧 [Supabase Support](https://supabase.com/support)

---

## Summary

You should now have:
✅ A new Supabase project
✅ Database schema restored
✅ Authentication configured
✅ Next.js app connected
✅ RLS policies enabled
✅ All features working

If you encounter any issues, refer to the Troubleshooting section or reach out to Supabase support.

Happy coding! 🚀

