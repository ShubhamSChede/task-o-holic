-- Task-o-holic Database Schema Restoration
-- This script contains the essential schema for your application
-- Run this in your new Supabase project's SQL Editor

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    password text NOT NULL,
    created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Organization members table
CREATE TABLE IF NOT EXISTS public.organization_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT organization_members_organization_id_user_id_key UNIQUE (organization_id, user_id)
);

-- Todos table
CREATE TABLE IF NOT EXISTS public.todos (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    is_complete boolean DEFAULT false,
    due_date timestamp with time zone,
    priority text,
    tags text[] DEFAULT '{}'::text[],
    created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Frequent tasks table
CREATE TABLE IF NOT EXISTS public.frequent_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text,
    priority text,
    tags text[] DEFAULT '{}'::text[],
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 2. CREATE FUNCTIONS
-- =====================================================

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;

-- Function to get todo statistics for a user
CREATE OR REPLACE FUNCTION public.get_todo_stats(user_id uuid) 
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
  pending_count INTEGER;
BEGIN
  SELECT 
    COUNT(*), 
    COUNT(*) FILTER (WHERE is_complete = true),
    COUNT(*) FILTER (WHERE is_complete = false)
  INTO 
    total_count, 
    completed_count,
    pending_count
  FROM todos 
  WHERE created_by = user_id;
  
  RETURN json_build_object(
    'total', total_count,
    'completed', completed_count,
    'pending', pending_count
  );
END;
$$;

-- =====================================================
-- 3. CREATE TRIGGERS
-- =====================================================

-- Trigger to create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on todos
DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on frequent_tasks
DROP TRIGGER IF EXISTS update_frequent_tasks_updated_at ON public.frequent_tasks;
CREATE TRIGGER update_frequent_tasks_updated_at
  BEFORE UPDATE ON public.frequent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frequent_tasks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view profiles in their organizations" ON public.profiles;
CREATE POLICY "Users can view profiles in their organizations"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om1
      WHERE om1.user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.organization_members om2
          WHERE om2.user_id = public.profiles.id
            AND om2.organization_id = om1.organization_id
        )
    )
  );

-- Organizations policies
DROP POLICY IF EXISTS "Users can view organizations they are members of" ON public.organizations;
CREATE POLICY "Users can view organizations they are members of"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Organization creators can update their organizations" ON public.organizations;
CREATE POLICY "Organization creators can update their organizations"
  ON public.organizations FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Organization creators can delete their organizations" ON public.organizations;
CREATE POLICY "Organization creators can delete their organizations"
  ON public.organizations FOR DELETE
  USING (auth.uid() = created_by);

-- Organization members policies
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
CREATE POLICY "Users can view members of their organizations"
  ON public.organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = public.organization_members.organization_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can add members to their organizations" ON public.organization_members;
CREATE POLICY "Users can add members to their organizations"
  ON public.organization_members FOR INSERT
  WITH CHECK (true);  -- This allows joining with password

DROP POLICY IF EXISTS "Organization creators can remove members" ON public.organization_members;
CREATE POLICY "Organization creators can remove members"
  ON public.organization_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE id = organization_id AND created_by = auth.uid()
    )
  );

-- Todos policies
DROP POLICY IF EXISTS "Users can view their own todos" ON public.todos;
CREATE POLICY "Users can view their own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can view organization todos" ON public.todos;
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

DROP POLICY IF EXISTS "Users can create their own todos" ON public.todos;
CREATE POLICY "Users can create their own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
CREATE POLICY "Users can update their own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;
CREATE POLICY "Users can delete their own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = created_by);

-- Frequent tasks policies
DROP POLICY IF EXISTS "Users can view organization frequent tasks" ON public.frequent_tasks;
CREATE POLICY "Users can view organization frequent tasks"
  ON public.frequent_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = public.frequent_tasks.organization_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create frequent tasks in their organizations" ON public.frequent_tasks;
CREATE POLICY "Users can create frequent tasks in their organizations"
  ON public.frequent_tasks FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = public.frequent_tasks.organization_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own frequent tasks" ON public.frequent_tasks;
CREATE POLICY "Users can update their own frequent tasks"
  ON public.frequent_tasks FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own frequent tasks" ON public.frequent_tasks;
CREATE POLICY "Users can delete their own frequent tasks"
  ON public.frequent_tasks FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.organizations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.organization_members TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.todos TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.frequent_tasks TO anon, authenticated, service_role;

GRANT ALL ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon, authenticated, service_role;
GRANT ALL ON FUNCTION public.get_todo_stats(uuid) TO anon, authenticated, service_role;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your database schema has been restored successfully!
-- Next steps:
-- 1. Update your .env.local file with new Supabase credentials
-- 2. Test the authentication flow
-- 3. Verify all features are working correctly

