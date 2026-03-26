-- Task-o-holic — tldraw latest-only persistence (save/load, not multiplayer sync)
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

-- 1) One canvas document per organization (latest snapshot only)
create table if not exists public.tldraw_room_state (
  org_id uuid primary key references public.organizations(id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.tldraw_room_state_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Some earlier iterations created an incorrect FK for `tldraw_room_state.org_id`
-- (pointing at `tldraw_rooms` instead of `organizations`). If that FK exists,
-- autosave will fail with 500s until it's removed.
alter table if exists public.tldraw_room_state
  drop constraint if exists tldraw_room_state_org_id_fkey;

-- Same issue can exist for `tldraw_assets.org_id` depending on what was created earlier.
-- If the FK points to `tldraw_rooms`, uploads will succeed to Storage but the DB insert will fail,
-- leaving assets unable to resolve on refresh.
alter table if exists public.tldraw_assets
  drop constraint if exists tldraw_assets_org_id_fkey;

drop trigger if exists trg_tldraw_room_state_updated_at on public.tldraw_room_state;
create trigger trg_tldraw_room_state_updated_at
before update on public.tldraw_room_state
for each row execute function public.tldraw_room_state_set_updated_at();

-- 2) Media assets referenced by tldraw (images/videos)
-- Your Supabase Storage bucket: `tldraw-assets`
create table if not exists public.tldraw_assets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  asset_key text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (org_id, asset_key)
);

-- If `tldraw_assets` already exists (with different column names), ensure the FK is correct.
do $$
begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'tldraw_assets'
      and c.conname = 'tldraw_assets_org_id_fkey'
  ) then
    -- already exists; do nothing
  else
    alter table public.tldraw_assets
      add constraint tldraw_assets_org_id_fkey
      foreign key (org_id) references public.organizations(id) on delete cascade;
  end if;
end$$;

-- Optional but recommended: enable RLS and restrict access to org members
alter table public.tldraw_room_state enable row level security;
alter table public.tldraw_assets enable row level security;

-- Room state: members can read
drop policy if exists "tldraw_room_state_select_members" on public.tldraw_room_state;
create policy "tldraw_room_state_select_members"
on public.tldraw_room_state
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = tldraw_room_state.org_id
      and om.user_id = auth.uid()
  )
);

-- Room state: members can write (insert/update)
drop policy if exists "tldraw_room_state_upsert_members" on public.tldraw_room_state;
create policy "tldraw_room_state_upsert_members"
on public.tldraw_room_state
for insert
with check (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
  )
);

drop policy if exists "tldraw_room_state_update_members" on public.tldraw_room_state;
create policy "tldraw_room_state_update_members"
on public.tldraw_room_state
for update
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = tldraw_room_state.org_id
      and om.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
  )
);

-- Assets: members can read
drop policy if exists "tldraw_assets_select_members" on public.tldraw_assets;
create policy "tldraw_assets_select_members"
on public.tldraw_assets
for select
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = tldraw_assets.org_id
      and om.user_id = auth.uid()
  )
);

