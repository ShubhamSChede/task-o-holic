-- FINAL RLS POLICIES IMPLEMENTATION
-- This is the working version that provides proper security while maintaining functionality
-- Run this in Supabase SQL Editor

-- First, disable RLS temporarily to clean up any existing policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.frequent_tasks DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organizations" ON public.profiles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.profiles;

DROP POLICY IF EXISTS "Users can view organizations they are members of" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization creators can update their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization creators can delete their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.organizations;

DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can add members to their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Organization creators can remove members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can leave organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Authenticated users can view organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Authenticated users can join organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.organization_members;

DROP POLICY IF EXISTS "Users can view their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can view organization todos" ON public.todos;
DROP POLICY IF EXISTS "Users can create their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;
DROP POLICY IF EXISTS "Authenticated users can view todos" ON public.todos;
DROP POLICY IF EXISTS "Authenticated users can create todos" ON public.todos;
DROP POLICY IF EXISTS "Todo creators can update their todos" ON public.todos;
DROP POLICY IF EXISTS "Todo creators can delete their todos" ON public.todos;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.todos;

DROP POLICY IF EXISTS "Users can view organization frequent tasks" ON public.frequent_tasks;
DROP POLICY IF EXISTS "Users can create frequent tasks in their organizations" ON public.frequent_tasks;
DROP POLICY IF EXISTS "Users can update their own frequent tasks" ON public.frequent_tasks;
DROP POLICY IF EXISTS "Users can delete their own frequent tasks" ON public.frequent_tasks;
DROP POLICY IF EXISTS "Authenticated users can view frequent tasks" ON public.frequent_tasks;
DROP POLICY IF EXISTS "Authenticated users can create frequent tasks" ON public.frequent_tasks;
DROP POLICY IF EXISTS "Frequent task creators can update their tasks" ON public.frequent_tasks;
DROP POLICY IF EXISTS "Frequent task creators can delete their tasks" ON public.frequent_tasks;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.frequent_tasks;

-- Now enable RLS with the final working policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frequent_tasks ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can manage their own profile (SELECT, UPDATE, INSERT)
CREATE POLICY "Users can manage their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Organization members can view each other's profiles
CREATE POLICY "Organization members can view profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members om1
            JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
            WHERE om1.user_id = auth.uid()  -- Current user is a member
            AND om2.user_id = profiles.id  -- Profile owner is also a member
        )
    );

-- ORGANIZATIONS POLICIES
-- Allow authenticated users to see all organizations
CREATE POLICY "Authenticated users can view organizations" ON public.organizations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Allow organization creators to update their organizations
CREATE POLICY "Organization creators can update their organizations" ON public.organizations
    FOR UPDATE USING (auth.uid() = created_by);

-- Allow organization creators to delete their organizations
CREATE POLICY "Organization creators can delete their organizations" ON public.organizations
    FOR DELETE USING (auth.uid() = created_by);

-- ORGANIZATION_MEMBERS POLICIES
-- Allow authenticated users to see all organization members
CREATE POLICY "Authenticated users can view organization members" ON public.organization_members
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to join organizations
CREATE POLICY "Authenticated users can join organizations" ON public.organization_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Allow users to leave organizations
CREATE POLICY "Users can leave organizations" ON public.organization_members
    FOR DELETE USING (auth.uid() = user_id);

-- Allow organization creators to remove members
CREATE POLICY "Organization creators can remove members" ON public.organization_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.organizations 
            WHERE organizations.id = organization_members.organization_id 
            AND organizations.created_by = auth.uid()
        )
    );

-- TODOS POLICIES
-- Allow authenticated users to see all todos
CREATE POLICY "Authenticated users can view todos" ON public.todos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create todos
CREATE POLICY "Authenticated users can create todos" ON public.todos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Allow todo creators to update their todos
CREATE POLICY "Todo creators can update their todos" ON public.todos
    FOR UPDATE USING (auth.uid() = created_by);

-- Allow todo creators to delete their todos
CREATE POLICY "Todo creators can delete their todos" ON public.todos
    FOR DELETE USING (auth.uid() = created_by);

-- FREQUENT_TASKS POLICIES
-- Allow authenticated users to see all frequent tasks
CREATE POLICY "Authenticated users can view frequent tasks" ON public.frequent_tasks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create frequent tasks
CREATE POLICY "Authenticated users can create frequent tasks" ON public.frequent_tasks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Allow frequent task creators to update their tasks
CREATE POLICY "Frequent task creators can update their tasks" ON public.frequent_tasks
    FOR UPDATE USING (auth.uid() = created_by);

-- Allow frequent task creators to delete their tasks
CREATE POLICY "Frequent task creators can delete their tasks" ON public.frequent_tasks
    FOR DELETE USING (auth.uid() = created_by);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Verification queries (optional - run these to verify everything is working)
-- SELECT 'RLS Policies Implementation Complete' as status;
-- SELECT COUNT(*) as todos_count FROM public.todos;
-- SELECT COUNT(*) as org_count FROM public.organizations;
-- SELECT COUNT(*) as profiles_count FROM public.profiles;
-- SELECT COUNT(*) as members_count FROM public.organization_members;
-- SELECT COUNT(*) as frequent_tasks_count FROM public.frequent_tasks;
