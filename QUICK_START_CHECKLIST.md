# Quick Start Checklist - Supabase Restoration

## 🚀 Complete These Steps in Order

### Phase 1: Create New Supabase Project (10 minutes)

- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Set project name: `task-o-holic`
- [ ] Choose closest region
- [ ] Set a strong database password (SAVE IT!)
- [ ] Wait for project to be created (~2-3 minutes)

### Phase 2: Restore Database Schema (5 minutes)

- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Click "New Query"
- [ ] Copy content from `supabase-restore-schema.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run" (Ctrl+Enter)
- [ ] Verify success - check for green checkmarks
- [ ] Go to "Table Editor" and verify 5 tables exist:
  - [ ] profiles
  - [ ] organizations
  - [ ] organization_members
  - [ ] todos
  - [ ] frequent_tasks

### Phase 3: Configure Authentication (3 minutes)

- [ ] Go to Authentication → Providers
- [ ] Verify "Email" is enabled
- [ ] Go to Authentication → URL Configuration
- [ ] Add Site URL: `http://localhost:3000`
- [ ] Add Redirect URL: `http://localhost:3000/**`

### Phase 4: Update Your Project (5 minutes)

- [ ] Copy `env.example` to `.env.local`
- [ ] Go to Supabase Dashboard → Settings → API
- [ ] Copy "Project URL" to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy "anon public" key to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy "service_role" key to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verify `.env.local` is in `.gitignore`

### Phase 5: Test Everything (10 minutes)

- [ ] Run `npm install` (ensure dependencies are up to date)
- [ ] Run `npm run dev`
- [ ] Open browser to `http://localhost:3000`
- [ ] Test user registration:
  - [ ] Go to `/register`
  - [ ] Create test account
  - [ ] Check email for confirmation
  - [ ] Confirm email
  - [ ] Verify profile auto-created (check Supabase Table Editor → profiles)
- [ ] Test login:
  - [ ] Log in with test account
  - [ ] Verify redirect to dashboard
- [ ] Test basic features:
  - [ ] Create a personal todo
  - [ ] Create an organization
  - [ ] Join organization
  - [ ] Create organization todo
  - [ ] Create frequent task
- [ ] Check Supabase Table Editor to verify data is being saved

### Phase 6: Security Check (2 minutes)

- [ ] Verify `.env.local` is NOT committed to git
- [ ] Check that RLS is enabled on all tables (Table Editor → each table → RLS toggle should be ON)
- [ ] Verify your database password is strong and saved securely

---

## ⚠️ Common Issues & Quick Fixes

### "relation already exists" error
→ Table already exists. Skip that step or drop table first.

### Can't login after registration
→ Check email for confirmation link OR disable email confirmation temporarily in Auth settings

### "Row level security" errors
→ Make sure you ran the ENTIRE `supabase-restore-schema.sql` script, including the RLS policies section

### Environment variables not working
→ Restart your dev server after changing `.env.local`

### Triggers not working (profile not auto-created)
→ Verify trigger was created: SQL Editor → `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`

---

## 📋 Your Credentials Checklist

Keep these safe and never commit to git:

```
Project Name: ____________________
Project URL: ____________________
Database Password: ____________________
Anon Key: ____________________
Service Role Key: ____________________
```

---

## ✅ Success Criteria

You've successfully restored your Supabase project when:

1. ✅ All 5 tables visible in Table Editor
2. ✅ Can register new user
3. ✅ Profile auto-created on signup
4. ✅ Can create and view todos
5. ✅ Can create and join organizations
6. ✅ No RLS errors in browser console

---

## 📚 Next Steps After Setup

- [ ] Read full setup guide: `SUPABASE_SETUP_GUIDE.md`
- [ ] Review database schema: `supabase-restore-schema.sql`
- [ ] Set up production deployment
- [ ] Configure custom domain
- [ ] Set up automated backups

---

## 🆘 Need Help?

- Full guide: See `SUPABASE_SETUP_GUIDE.md`
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

**Estimated Total Time: 30-45 minutes** ⏱️

