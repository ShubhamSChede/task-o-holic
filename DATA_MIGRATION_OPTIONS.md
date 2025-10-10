# Data Migration Options - Task-o-holic

## Overview

You have a full database backup from your old Supabase project. This document outlines your options for migrating data to your new project.

---

## ⚠️ Important Considerations

### What's in Your Backup

Your backup file contains:
1. **Schema** (tables, functions, triggers) ✅ Already restored via `supabase-restore-schema.sql`
2. **User Data** (from `auth.users` table)
3. **Application Data** (profiles, todos, organizations, etc.)
4. **System Data** (Supabase internal tables)

### Key Users in Your Backup

According to the backup, you have these registered users:
- `shubhamchede1602@gmail.com` (you)
- `darkwarrior7709@gmail.com` (Akshay)
- `sshrey844@gmail.com` (Shrey)
- `dream117709@gmail.com` (Ss)
- `amith10mnr@gmail.com` (Amith)
- `roshanichede@gmail.com` (Roshani)
- `harshsinghvi98@gmail.com` (Harsh Singhvi)
- `sohalsawardekar7@gmail.com` (Sohal)
- And a few more...

---

## 🎯 Migration Options

### Option 1: Fresh Start (Recommended) ✨

**Best for**: Starting clean without old data

**Pros**:
- ✅ Cleanest approach
- ✅ No conflicts with old data
- ✅ Fresh user accounts with new passwords
- ✅ No orphaned data
- ✅ Fastest setup

**Cons**:
- ❌ Lose all old todos, organizations, etc.
- ❌ Users need to re-register

**Steps**:
1. ✅ Already done! You've restored the schema
2. Start using the app and create new data
3. Users re-register with their emails

**Use this if**: Your old data is not critical OR you want a clean slate

---

### Option 2: Selective Data Import (Moderate Complexity) 📦

**Best for**: Keeping important data while starting fresh with users

**Pros**:
- ✅ Preserve important todos/organizations
- ✅ Fresh user accounts
- ✅ Control over what gets migrated
- ✅ No authentication conflicts

**Cons**:
- ❌ Requires manual work
- ❌ Need to reassign ownership to new user IDs
- ❌ Time-consuming for large datasets

**Steps**:

1. **Export specific data from backup**:
   ```sql
   -- In your NEW Supabase project SQL Editor
   -- After users have re-registered
   
   -- Example: Copy organizations (update user IDs first)
   INSERT INTO organizations (name, description, password, created_by)
   VALUES 
     ('Old Organization Name', 'Migrated from old system', 'new-password', 'new-user-uuid');
   
   -- Example: Copy todos (update user IDs)
   INSERT INTO todos (title, description, priority, created_by)
   VALUES 
     ('Important Todo', 'Migrated from old system', 'high', 'new-user-uuid');
   ```

2. **Create a migration script** (see `manual-data-migration.sql` template below)

**Use this if**: You have specific valuable data (like important todos or organizations) but not too much data

---

### Option 3: Full Restore with User Re-authentication (Complex) 🔧

**Best for**: Preserving all data but requiring users to reset passwords

**Pros**:
- ✅ All data preserved
- ✅ All relationships intact
- ✅ Complete history maintained

**Cons**:
- ❌ Most complex approach
- ❌ Users must reset passwords (can't restore encrypted passwords)
- ❌ Potential for data conflicts
- ❌ Requires careful execution

**Steps**:

1. **Install PostgreSQL client** (if not already installed)

2. **Prepare the backup**:
   - The backup file you have is a full database dump
   - It includes Supabase system tables that shouldn't be overwritten

3. **Selective restore approach**:
   ```bash
   # Create a temporary local database
   createdb temp_restore
   
   # Restore backup to temp database
   pg_restore --verbose -d temp_restore "db_cluster-02-07-2025@07-26-58.backup (2)"
   
   # Extract only application data
   pg_dump temp_restore \
     --table=public.profiles \
     --table=public.organizations \
     --table=public.organization_members \
     --table=public.todos \
     --table=public.frequent_tasks \
     --data-only \
     > application_data.sql
   ```

4. **Handle authentication**:
   ```sql
   -- In NEW Supabase, after importing data
   -- Users will need to use "Forgot Password" to reset
   
   -- Or send them password reset emails:
   -- Go to Authentication → Users → (select user) → Send Password Reset
   ```

5. **Import to new Supabase**:
   ```bash
   psql "postgresql://postgres:[NEW-PASSWORD]@[NEW-HOST]:6543/postgres" < application_data.sql
   ```

**Use this if**: You have significant valuable data AND users are willing to reset passwords

---

### Option 4: Manual CSV Export/Import (Safest for Critical Data) 📊

**Best for**: Small to medium datasets where you want full control

**Pros**:
- ✅ Full visibility of data
- ✅ Can clean/validate data during migration
- ✅ Easy to troubleshoot
- ✅ No risk of breaking new database

**Cons**:
- ❌ Time-consuming
- ❌ Requires creating new user accounts first
- ❌ Manual UUID mapping needed

**Steps**:

1. **Set up local PostgreSQL** and restore backup locally
   ```bash
   createdb old_taskoholic
   pg_restore -d old_taskoholic "db_cluster-02-07-2025@07-26-58.backup (2)"
   ```

2. **Export to CSV**:
   ```bash
   # Export organizations
   psql old_taskoholic -c "\COPY (SELECT * FROM organizations) TO 'organizations.csv' CSV HEADER"
   
   # Export todos
   psql old_taskoholic -c "\COPY (SELECT * FROM todos) TO 'todos.csv' CSV HEADER"
   
   # etc...
   ```

3. **Users re-register** in new system

4. **Create mapping file** (old UUID → new UUID)

5. **Update CSVs** with new UUIDs

6. **Import to new Supabase** via SQL Editor or Table Editor

**Use this if**: You want maximum control and have moderate amount of data

---

## 📝 Recommended Approach Based on Your Situation

### If you have < 50 important items:
→ **Option 1 (Fresh Start)** or **Option 2 (Selective Import)**

### If you have 50-500 important items:
→ **Option 2 (Selective Import)** or **Option 4 (CSV Export/Import)**

### If you have > 500 important items OR complex relationships:
→ **Option 3 (Full Restore)** or **Option 4 (CSV Export/Import)**

### If all your users are inactive or test users:
→ **Option 1 (Fresh Start)** - cleanest approach

---

## 🛠️ Tools You'll Need

Depending on your chosen option:

- [ ] **PostgreSQL Client** (for Options 3 & 4)
  ```bash
  # Windows
  choco install postgresql
  # Or download: https://www.postgresql.org/download/
  ```

- [ ] **pgAdmin** (optional, for GUI management)
  - Download: https://www.pgadmin.org/download/

- [ ] **CSV Editor** (for Option 4)
  - Excel, Google Sheets, or VS Code

- [ ] **UUID Generator** (for manual migrations)
  - Online: https://www.uuidgenerator.net/

---

## ⏱️ Time Estimates

| Option | Setup Time | Migration Time | Total Time |
|--------|-----------|----------------|------------|
| Option 1 | 30 min | 0 | **30 min** |
| Option 2 | 30 min | 1-4 hours | **1.5-4.5 hours** |
| Option 3 | 45 min | 2-8 hours | **3-9 hours** |
| Option 4 | 1 hour | 4-16 hours | **5-17 hours** |

---

## 🚨 Important Warnings

1. **Never commit sensitive data** to git (passwords, API keys, user emails)
2. **Backup your backup** - keep the original file safe
3. **Test in development first** - don't experiment on production
4. **User passwords cannot be migrated** - they're encrypted with old keys
5. **Validate data after migration** - check for missing relationships
6. **Inform users** if they need to reset passwords or re-register

---

## 📋 Migration Checklist Template

Whichever option you choose, follow this checklist:

- [ ] Backup the backup file (copy to safe location)
- [ ] Document your migration plan
- [ ] Set up new Supabase project
- [ ] Restore schema (via `supabase-restore-schema.sql`)
- [ ] Test schema is working (create test data)
- [ ] Execute data migration (based on chosen option)
- [ ] Validate migrated data
- [ ] Test all application features
- [ ] Inform users of any required actions
- [ ] Monitor for issues
- [ ] Delete temporary databases/files

---

## 💡 My Recommendation for You

Based on the backup analysis, I recommend:

**Start with Option 1 (Fresh Start)** because:
1. Your old project was inactive for 90+ days
2. Most users in the backup appear to be test users
3. You can get up and running in 30 minutes
4. The schema is already fully restored
5. You avoid migration complexity

**Then, if needed**:
- Manually create 2-3 important organizations
- Manually add critical todos (if any)
- This gives you a clean, working system immediately

**Later, if you discover critical data**:
- Use Option 2 or 4 to selectively import specific items
- This can be done at any time without breaking your working system

---

## 🆘 Need Help?

- Struggling with migration? Create an issue or ask in Discord
- Need to extract specific data? I can help write custom SQL queries
- Want to automate part of the migration? Let me know what you need

Remember: **A working system is better than perfect data migration**. Start simple, then enhance if needed.

