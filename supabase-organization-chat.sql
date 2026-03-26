-- Task-o-holic — organization group chat (Supabase Realtime)
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.organization_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 4000),
  created_at timestamptz not null default now()
);

create index if not exists organization_messages_org_created_idx
  on public.organization_messages (organization_id, created_at desc);

alter table public.organization_messages enable row level security;

-- Members can read messages
drop policy if exists "org_messages_select_members" on public.organization_messages;
create policy "org_messages_select_members"
on public.organization_messages
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_messages.organization_id
      and om.user_id = auth.uid()
  )
);

-- Members can insert messages as themselves
drop policy if exists "org_messages_insert_members" on public.organization_messages;
create policy "org_messages_insert_members"
on public.organization_messages
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_id
      and om.user_id = auth.uid()
  )
);

