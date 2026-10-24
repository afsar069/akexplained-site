-- Migration: user accounts foundation
-- Tables: profiles, attempts, reading_progress
--
-- Project settings this migration accounts for:
--   * "Automatically expose new tables" is DISABLED, so every table is exposed
--     to the Data API with explicit GRANTs to the `authenticated` role below.
--     Nothing is granted to `anon`.
--   * "Enable automatic RLS" is ENABLED, but each table still gets an explicit
--     `enable row level security` so this file is self-contained.
--
-- Access model (enforced by RLS):
--   * A signed-in user can SELECT / INSERT / UPDATE only their own rows.
--     - profiles: rows where id = auth.uid()
--     - attempts, reading_progress: rows where user_id = auth.uid()
--   * No DELETE is allowed for anyone (no DELETE policy exists).
--   * The anon role gets zero access to all three tables.

-- =====================================================================
-- 1. profiles
-- =====================================================================
-- One row per user. The row is created automatically by a trigger on
-- auth.users (see below), so the app never has to insert it by hand.

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  primary_track text check (
    primary_track in ('ugc-net', 'up-pgt', 'state-psc', 'literature-journey')
  ),
  created_at    timestamptz not null default now()
);

comment on table public.profiles is
  'One row per user. Auto-created by trigger on auth.users insert.';
comment on column public.profiles.primary_track is
  'The track the user is studying for; null until they pick one.';

-- =====================================================================
-- 2. attempts  (one row per question answered)
-- =====================================================================

create table public.attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  topic_id    text,                 -- nullable for now; questions are not tagged yet
  is_correct  boolean not null,
  source      text not null check (
    source in ('daily', 'cbt', 'pyq', 'mock', 'diagnostic')
  ),
  answered_at timestamptz not null default now()
);

comment on table public.attempts is
  'One row per question a user answered, across all quiz surfaces.';
comment on column public.attempts.topic_id is
  'Nullable for now; questions are not tagged with a topic yet.';

-- Read patterns: per-user by topic, and per-user over time.
create index attempts_user_topic_idx    on public.attempts (user_id, topic_id);
create index attempts_user_answered_idx on public.attempts (user_id, answered_at);

-- =====================================================================
-- 3. reading_progress
-- =====================================================================
-- One row per (user, article). Tracks whether a user finished an article
-- and when they last opened it.

create table public.reading_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  article_slug text not null,                 -- e.g. 'old-english'
  completed    boolean not null default false,
  last_read_at timestamptz not null default now(),
  primary key (user_id, article_slug)
);

comment on table public.reading_progress is
  'Per-user reading state for one article, keyed by (user_id, article_slug).';

-- =====================================================================
-- Trigger: create a profile row when a new auth user is inserted
-- =====================================================================
-- SECURITY DEFINER so the trigger can write to public.profiles regardless of
-- the inserting role. An empty search_path forces fully-qualified names, which
-- blocks search_path hijacking (the Supabase-recommended pattern).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Data API exposure (GRANTs)
-- =====================================================================
-- "Automatically expose new tables" is OFF, so grant explicitly.
-- authenticated: SELECT / INSERT / UPDATE only (no DELETE).
-- anon: nothing.
-- For `attempts`, the GENERATED ALWAYS AS IDENTITY column needs no separate
-- sequence grant; table INSERT is enough and the id cannot be overridden.

grant select, insert, update on public.profiles         to authenticated;
grant select, insert, update on public.attempts         to authenticated;
grant select, insert, update on public.reading_progress to authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles         enable row level security;
alter table public.attempts         enable row level security;
alter table public.reading_progress enable row level security;

-- Each policy is scoped `to authenticated`, so the anon role matches no policy
-- and (having no GRANT either) gets zero access. `(select auth.uid())` is
-- wrapped in a subselect so Postgres caches it once per statement.

-- ---- profiles (own row = id) ----
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ( (select auth.uid()) = id );

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ( (select auth.uid()) = id );

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- ---- attempts (own rows = user_id) ----
create policy "attempts_select_own" on public.attempts
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "attempts_insert_own" on public.attempts
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "attempts_update_own" on public.attempts
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

-- ---- reading_progress (own rows = user_id) ----
create policy "reading_progress_select_own" on public.reading_progress
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "reading_progress_insert_own" on public.reading_progress
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "reading_progress_update_own" on public.reading_progress
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );
