-- =====================================================================
-- AK Explained — full account schema, one-shot setup script
-- =====================================================================
-- This is a convenience script that combines all three migrations into one
-- paste for the Supabase SQL Editor:
--   1. 20261024120000_create_user_accounts.sql
--   2. 20261025120000_exams_topics_and_profile_update.sql
--   3. 20261025130000_exams_add_kind_and_degrees.sql
--   4. 20261027120000_topics_tree.sql
--
-- It is IDEMPOTENT: safe to run on a fresh database OR on one where some of
-- the migrations were already applied. It will not error with "already exists".
-- Re-running it re-asserts the schema; it does NOT delete your data, and it
-- leaves any `status` you changed by hand (e.g. a degree you set to 'active')
-- untouched.
--
-- The numbered migration files under supabase/migrations/ remain the real
-- history. This file is NOT a migration and is ignored by the Supabase CLI.

-- =====================================================================
-- profiles
-- =====================================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_id    text,
  created_at   timestamptz not null default now()
);

-- If the table pre-existed from migration 1, bring it to the current shape:
alter table public.profiles drop column if exists primary_track;
alter table public.profiles add  column if not exists avatar_id text;

comment on table public.profiles is
  'One row per user. Auto-created by trigger on auth.users insert.';
comment on column public.profiles.avatar_id is
  'Which avatar the user picked; null until they choose one.';

-- =====================================================================
-- attempts  (one row per question answered)
-- =====================================================================
create table if not exists public.attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  question_id text not null,
  topic_id    text,
  is_correct  boolean not null,
  source      text not null check (source in ('daily', 'cbt', 'pyq', 'mock', 'diagnostic')),
  answered_at timestamptz not null default now()
);

create index if not exists attempts_user_topic_idx    on public.attempts (user_id, topic_id);
create index if not exists attempts_user_answered_idx on public.attempts (user_id, answered_at);

comment on table public.attempts is
  'One row per question a user answered, across all quiz surfaces.';

-- =====================================================================
-- reading_progress
-- =====================================================================
create table if not exists public.reading_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  article_slug text not null,
  completed    boolean not null default false,
  last_read_at timestamptz not null default now(),
  primary key (user_id, article_slug)
);

comment on table public.reading_progress is
  'Per-user reading state for one article, keyed by (user_id, article_slug).';

-- =====================================================================
-- Trigger: create a profile row when a new auth user is inserted
-- =====================================================================
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- exams  (reference data: exams, degree tracks, the journey track)
-- =====================================================================
create table if not exists public.exams (
  id          text primary key,
  name        text not null,
  status      text not null check (status in ('active', 'coming_soon')),
  sort_order  int,
  kind        text,          -- made NOT NULL below, after any backfill
  institution text,
  level       text
);

-- If the table pre-existed from migration 2 (before kind/institution/level):
alter table public.exams add column if not exists kind        text;
alter table public.exams add column if not exists institution text;
alter table public.exams add column if not exists level       text;

comment on table public.exams is
  'Exams, degree tracks and the journey track shown in the picker. Read-only from clients.';
comment on column public.exams.status is
  '''active'' = open now; ''coming_soon'' = greyed out in the picker.';
comment on column public.exams.kind is
  'Which family the row belongs to: exam, degree, or journey.';
comment on column public.exams.institution is
  'University name for a degree track; null for competitive exams.';
comment on column public.exams.level is
  'Degree level: ''ba'' or ''ma''; null for non-degree rows.';

-- Seed rows. on conflict do nothing: existing rows (and any status you changed
-- by hand) are left as they are.
insert into public.exams (id, name, status, sort_order, kind, institution, level) values
  ('ugc-net',            'UGC NET',                                'active',       1, 'exam',    null,                        null),
  ('gate',               'GATE',                                   'coming_soon',  2, 'exam',    null,                        null),
  ('cuet-pg',            'CUET-PG',                                'coming_soon',  3, 'exam',    null,                        null),
  ('upsc-cse',           'UPSC CSE',                               'coming_soon',  4, 'exam',    null,                        null),
  ('pgt',                'PGT',                                    'coming_soon',  5, 'exam',    null,                        null),
  ('tgt',                'TGT',                                    'coming_soon',  6, 'exam',    null,                        null),
  ('state-psc',          'State PSC',                              'coming_soon',  7, 'exam',    null,                        null),
  ('ccsu-ba',            'CCS University Meerut - BA English',     'coming_soon', 10, 'degree',  'CCS University Meerut',     'ba'),
  ('ccsu-ma',            'CCS University Meerut - MA English',     'coming_soon', 11, 'degree',  'CCS University Meerut',     'ma'),
  ('du-ba',              'Delhi University - BA English',          'coming_soon', 12, 'degree',  'Delhi University',          'ba'),
  ('du-ma',              'Delhi University - MA English',          'coming_soon', 13, 'degree',  'Delhi University',          'ma'),
  ('amu-ba',             'Aligarh Muslim University - BA English', 'coming_soon', 14, 'degree',  'Aligarh Muslim University', 'ba'),
  ('amu-ma',             'Aligarh Muslim University - MA English', 'coming_soon', 15, 'degree',  'Aligarh Muslim University', 'ma'),
  ('ignou-ba',           'IGNOU - BA English',                     'coming_soon', 16, 'degree',  'IGNOU',                     'ba'),
  ('ignou-ma',           'IGNOU - MA English',                     'coming_soon', 17, 'degree',  'IGNOU',                     'ma'),
  ('literature-journey', 'Literature Journey',                     'active',     100, 'journey', null,                        null)
on conflict (id) do nothing;

-- Make sure kind is set on rows that pre-existed before the kind column
-- (does nothing on a fresh run). Does not touch status / institution / level.
update public.exams set kind = 'exam'
  where id in ('ugc-net', 'gate', 'cuet-pg', 'upsc-cse', 'pgt', 'tgt', 'state-psc')
    and kind is distinct from 'exam';
update public.exams set kind = 'journey'
  where id = 'literature-journey'
    and kind is distinct from 'journey';

-- Enforce kind NOT NULL and the allowed-value checks (idempotent).
alter table public.exams alter column kind set not null;
alter table public.exams drop constraint if exists exams_kind_check;
alter table public.exams add  constraint exams_kind_check  check (kind  in ('exam', 'degree', 'journey'));
alter table public.exams drop constraint if exists exams_level_check;
alter table public.exams add  constraint exams_level_check check (level in ('ba', 'ma'));

-- =====================================================================
-- topics  (reference data; filled in later)
-- =====================================================================
-- A self-referencing tree: area > period > movement / writer > work, etc.
create table if not exists public.topics (
  id         text primary key,
  name       text not null,
  parent_id  text references public.topics (id),  -- null for a top-level area
  kind       text,                                -- made NOT NULL below
  sort_order int
);

-- If the table pre-existed from migration 2 (flat, with age_slug):
alter table public.topics drop column if exists age_slug;
alter table public.topics add  column if not exists parent_id text references public.topics (id);
alter table public.topics add  column if not exists kind text;
alter table public.topics alter column kind set not null;
alter table public.topics drop constraint if exists topics_kind_check;
alter table public.topics add  constraint topics_kind_check
  check (kind in ('area', 'period', 'movement', 'writer', 'work', 'concept'));
create index if not exists topics_parent_id_idx on public.topics (parent_id);

comment on table public.topics is
  'Subject topics used to tag questions, as a tree. Reference data, read-only from clients.';
comment on column public.topics.parent_id is
  'Parent topic; null for a top-level area. Self-referencing tree.';
comment on column public.topics.kind is
  'Node kind: area, period, movement, writer, work, or concept.';

-- =====================================================================
-- exam_topics  (which topics belong to which exam, grouped into units)
-- =====================================================================
create table if not exists public.exam_topics (
  exam_id    text not null references public.exams (id),
  topic_id   text not null references public.topics (id),
  unit_label text,
  unit_order int,
  primary key (exam_id, topic_id)
);

comment on table public.exam_topics is
  'Maps topics to exams, grouped into units. Reference data, read-only.';

-- =====================================================================
-- user_exams  (a user can select several exams)
-- =====================================================================
create table if not exists public.user_exams (
  user_id     uuid not null references auth.users (id) on delete cascade,
  exam_id     text not null references public.exams (id),
  is_primary  boolean not null default false,
  selected_at timestamptz not null default now(),
  primary key (user_id, exam_id)
);

-- At most one primary exam per user.
create unique index if not exists user_exams_one_primary_per_user
  on public.user_exams (user_id)
  where is_primary;

comment on table public.user_exams is
  'Exams a user selected. At most one row per user may have is_primary = true.';

-- =====================================================================
-- notify_requests  (clicks on a greyed-out exam)
-- =====================================================================
create table if not exists public.notify_requests (
  user_id      uuid not null references auth.users (id) on delete cascade,
  exam_id      text not null references public.exams (id),
  requested_at timestamptz not null default now(),
  primary key (user_id, exam_id)
);

comment on table public.notify_requests is
  'A user asked to be notified when a coming-soon exam opens.';

-- =====================================================================
-- Data API exposure (GRANTs)
-- =====================================================================
-- Per-user tables: authenticated only. user_exams also gets DELETE. anon none.
grant select, insert, update         on public.profiles         to authenticated;
grant select, insert, update         on public.attempts         to authenticated;
grant select, insert, update         on public.reading_progress to authenticated;
grant select, insert, update, delete on public.user_exams       to authenticated;
grant select, insert, update         on public.notify_requests  to authenticated;

-- Reference tables: read-only for everyone (anon + authenticated).
grant select on public.exams       to anon, authenticated;
grant select on public.topics      to anon, authenticated;
grant select on public.exam_topics to anon, authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles         enable row level security;
alter table public.attempts         enable row level security;
alter table public.reading_progress enable row level security;
alter table public.exams            enable row level security;
alter table public.topics           enable row level security;
alter table public.exam_topics      enable row level security;
alter table public.user_exams       enable row level security;
alter table public.notify_requests  enable row level security;

-- Policies are dropped-if-exists then created, so this block is re-runnable.

-- ---- profiles (own row = id) ----
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ( (select auth.uid()) = id );
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ( (select auth.uid()) = id );
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using ( (select auth.uid()) = id ) with check ( (select auth.uid()) = id );

-- ---- attempts (own rows = user_id) ----
drop policy if exists "attempts_select_own" on public.attempts;
create policy "attempts_select_own" on public.attempts
  for select to authenticated using ( (select auth.uid()) = user_id );
drop policy if exists "attempts_insert_own" on public.attempts;
create policy "attempts_insert_own" on public.attempts
  for insert to authenticated with check ( (select auth.uid()) = user_id );
drop policy if exists "attempts_update_own" on public.attempts;
create policy "attempts_update_own" on public.attempts
  for update to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );

-- ---- reading_progress (own rows = user_id) ----
drop policy if exists "reading_progress_select_own" on public.reading_progress;
create policy "reading_progress_select_own" on public.reading_progress
  for select to authenticated using ( (select auth.uid()) = user_id );
drop policy if exists "reading_progress_insert_own" on public.reading_progress;
create policy "reading_progress_insert_own" on public.reading_progress
  for insert to authenticated with check ( (select auth.uid()) = user_id );
drop policy if exists "reading_progress_update_own" on public.reading_progress;
create policy "reading_progress_update_own" on public.reading_progress
  for update to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );

-- ---- reference data: anyone may read, nobody may write ----
drop policy if exists "exams_read_all" on public.exams;
create policy "exams_read_all" on public.exams
  for select to anon, authenticated using ( true );
drop policy if exists "topics_read_all" on public.topics;
create policy "topics_read_all" on public.topics
  for select to anon, authenticated using ( true );
drop policy if exists "exam_topics_read_all" on public.exam_topics;
create policy "exam_topics_read_all" on public.exam_topics
  for select to anon, authenticated using ( true );

-- ---- user_exams (own rows; select / insert / update / delete) ----
drop policy if exists "user_exams_select_own" on public.user_exams;
create policy "user_exams_select_own" on public.user_exams
  for select to authenticated using ( (select auth.uid()) = user_id );
drop policy if exists "user_exams_insert_own" on public.user_exams;
create policy "user_exams_insert_own" on public.user_exams
  for insert to authenticated with check ( (select auth.uid()) = user_id );
drop policy if exists "user_exams_update_own" on public.user_exams;
create policy "user_exams_update_own" on public.user_exams
  for update to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
drop policy if exists "user_exams_delete_own" on public.user_exams;
create policy "user_exams_delete_own" on public.user_exams
  for delete to authenticated using ( (select auth.uid()) = user_id );

-- ---- notify_requests (own rows; select / insert / update, no delete) ----
drop policy if exists "notify_requests_select_own" on public.notify_requests;
create policy "notify_requests_select_own" on public.notify_requests
  for select to authenticated using ( (select auth.uid()) = user_id );
drop policy if exists "notify_requests_insert_own" on public.notify_requests;
create policy "notify_requests_insert_own" on public.notify_requests
  for insert to authenticated with check ( (select auth.uid()) = user_id );
drop policy if exists "notify_requests_update_own" on public.notify_requests;
create policy "notify_requests_update_own" on public.notify_requests
  for update to authenticated using ( (select auth.uid()) = user_id ) with check ( (select auth.uid()) = user_id );
