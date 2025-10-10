# Troubleshooting Guide - Common Errors

## Error: "Error fetching todos: {}"

This error occurs when the Supabase client can't fetch data. Here are the most common causes and solutions:

### 1. Check Environment Variables

**Verify your `.env.local` file exists and has correct values:**

```bash
# .env.local should contain:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to fix:**
1. Go to your Supabase Dashboard → Settings → API
2. Copy the "Project URL" and "anon public" key
3. Update `.env.local` with correct values
4. **Restart your dev server** (`npm run dev`)

### 2. Check Row Level Security (RLS) Policies

The most common cause is missing or incorrect RLS policies.

**Verify RLS is set up:**
1. Go to Supabase Dashboard → Table Editor
2. Click on "todos" table
3. Ensure RLS is enabled (toggle should be ON)
4. Click "View Policies" 

**Expected policies for todos table:**
- `Users can view their own todos`
- `Users can view organization todos`
- `Users can create their own todos`
- `Users can update their own todos`
- `Users can delete their own todos`

**Quick fix - Re-run policies:**
```sql
-- In Supabase SQL Editor, run this:

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can view organization todos" ON public.todos;
DROP POLICY IF EXISTS "Users can create their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;

-- Recreate policies
CREATE POLICY "Users can view their own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view organization todos"
  ON public.todos FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = public.todos.organization_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = created_by);
```

### 3. Check Authentication

**Verify user is logged in:**
1. Open browser DevTools → Application tab → Cookies
2. Look for cookies starting with `sb-` (Supabase session cookies)
3. If missing, you're not logged in

**Test authentication:**
```sql
-- In Supabase SQL Editor:
SELECT auth.uid();
-- Should return your user UUID, not NULL
```

### 4. Check Database Connection

**Verify Supabase project is active:**
1. Go to Supabase Dashboard
2. Check if project shows "Paused" - free tier pauses after inactivity
3. If paused, click "Restore" or wait for auto-restore

### 5. Check for Foreign Key Issues

The query joins `organizations` table. If the foreign key is broken:

```sql
-- Check if foreign keys exist:
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'todos' AND tc.constraint_type = 'FOREIGN KEY';
```

**If missing, add foreign key:**
```sql
ALTER TABLE public.todos
ADD CONSTRAINT todos_organization_id_fkey 
FOREIGN KEY (organization_id) 
REFERENCES public.organizations(id) 
ON DELETE CASCADE;
```

---

## Error: searchParams sync access

This is a Next.js 15+ requirement. SearchParams must be unwrapped using `React.use()`.

**✅ Already Fixed** - The todos page has been updated to use `React.use()`

If you see this error elsewhere, update like this:

**Before:**
```tsx
export default function Page({ searchParams }: { searchParams: { key: string } }) {
  const value = searchParams.key; // ❌ Direct access
}
```

**After:**
```tsx
import { use } from 'react';

export default function Page({ 
  searchParams 
}: { 
  searchParams: Promise<{ key: string }> 
}) {
  const params = use(searchParams); // ✅ Unwrap first
  const value = params.key;
}
```

---

## Quick Diagnostic Checklist

Run through this checklist to identify the issue:

- [ ] `.env.local` file exists in project root
- [ ] Environment variables are correct (check Supabase dashboard)
- [ ] Dev server was restarted after changing `.env.local`
- [ ] User is logged in (check browser cookies)
- [ ] RLS is enabled on todos table
- [ ] RLS policies exist for todos (5 policies expected)
- [ ] Supabase project is active (not paused)
- [ ] Database schema was properly restored
- [ ] Foreign keys exist on todos table

---

## Testing the Fix

1. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Clear console
   - Refresh page
   - Look for specific error messages

3. **Test in Supabase SQL Editor:**
   ```sql
   -- This should work if everything is set up correctly
   SELECT 
     t.*,
     o.name as org_name
   FROM todos t
   LEFT JOIN organizations o ON t.organization_id = o.id
   WHERE t.created_by = auth.uid();
   ```

4. **Check Network tab:**
   - Open DevTools → Network tab
   - Filter by "Fetch/XHR"
   - Refresh page
   - Look for requests to Supabase
   - Check response status (should be 200)

---

## Common Error Messages & Solutions

### "Invalid API key"
→ Anon key is wrong. Copy from Supabase Dashboard → Settings → API

### "JWT expired" or "Invalid JWT"
→ Log out and log back in. Session expired.

### "relation \"todos\" does not exist"
→ Table not created. Re-run `supabase-restore-schema.sql`

### "column todos.created_by does not exist"
→ Schema mismatch. Re-run schema restoration.

### "permission denied for table todos"
→ RLS blocking access. Check policies exist and are correct.

### "null value in column \"created_by\" violates not-null constraint"
→ User not authenticated. Check auth.uid() returns value.

---

## Advanced Debugging

### Enable Supabase Debug Mode

```typescript
// In src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        debug: true, // Add this
      },
    }
  )
```

### Check Detailed Error

Update the error handling to see more details:

```typescript
// In src/lib/supabase/client-fetcher.ts
const result = await query;
console.log('Query result:', result); // Add this
if (result.error) {
  console.error('Detailed error:', {
    message: result.error.message,
    details: result.error.details,
    hint: result.error.hint,
    code: result.error.code
  });
}
return result;
```

### Verify Supabase Connection

Create a test file:

```typescript
// test-supabase.ts
import { createClient } from '@/lib/supabase/client';

async function testConnection() {
  const supabase = createClient();
  
  // Test 1: Check auth
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session:', session ? 'Active' : 'None');
  
  // Test 2: Check query
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .limit(1);
  
  console.log('Query result:', { data, error });
}

testConnection();
```

---

## Still Having Issues?

If none of the above fixes work:

1. **Check Supabase Status:**
   - Visit: https://status.supabase.com
   - Verify no ongoing incidents

2. **Review Logs:**
   - Supabase Dashboard → Logs
   - Look for error messages

3. **Fresh Database Test:**
   ```sql
   -- Create a simple test
   INSERT INTO todos (title, created_by)
   VALUES ('Test Todo', auth.uid());
   
   -- Try to read it
   SELECT * FROM todos WHERE created_by = auth.uid();
   ```

4. **Nuclear Option (Fresh Start):**
   ```bash
   # 1. Delete .next folder
   rm -rf .next
   
   # 2. Reinstall dependencies
   rm -rf node_modules
   npm install
   
   # 3. Verify .env.local
   cat .env.local
   
   # 4. Restart dev server
   npm run dev
   ```

5. **Get Help:**
   - Post in Supabase Discord: https://discord.supabase.com
   - Include: Error message, browser console output, RLS policy list
   - Share (sanitized) SQL query that's failing

---

## Prevention Tips

- Always restart dev server after changing `.env.local`
- Test RLS policies in SQL Editor before using in app
- Keep schema backup updated
- Use TypeScript types to catch issues early
- Monitor Supabase project activity to prevent auto-pause

