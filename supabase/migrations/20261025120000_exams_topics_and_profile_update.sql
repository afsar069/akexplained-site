-- Migration: exams, topics, exam-topic mapping, user selections, notify list
-- plus a profiles change (drop primary_track, add avatar_id).
--
-- Design note:
--   A question is tagged with a SUBJECT topic (e.g. 'beowulf', 'kenning'),
--   never with an exam. Exams map to topics separately via exam_topics, so
--   adding a new exam later is INSERTs into exams/exam_topics, not re-tagging
--   questions.
--
-- Access model:
--   * exams, topics, exam_topics are PUBLIC REFERENCE DATA: SELECT is granted
--     to anon and authenticated, RLS is on with a read-only policy, and no
--     write access is granted to any client role.
--   * user_exams and notify_requests are per-user: a signed-in user can touch
--     only their own rows; anon gets nothing. DELETE is allowed on user_exams
--     only (a user may remove an exam); notify_requests has no DELETE.

-- =====================================================================
-- profiles: drop primary_track (replaced by user_exams), add avatar_id
-- =====================================================================
-- Dropping the column also drops its CHECK constraint. There is no live
-- profile data to preserve yet.

alter table public.profiles drop column primary_track;
alter table public.profiles add  column avatar_id text;

comment on column public.profiles.avatar_id is
  'Which avatar the user picked; null until they choose one.';

-- =====================================================================
-- 1. exams  (reference data)
-- =====================================================================
-- id is a slug. 'literature-journey' is a non-exam track that lives here too.

create table public.exams (
  id         text primary key,
  name       text not null,
  status     text not null check (status in ('active', 'coming_soon')),
  sort_order int
);

comment on table public.exams is
  'Exams and tracks shown in the picker. Reference data, read-only from clients.';
comment on column public.exams.status is
  '''active'' = open now; ''coming_soon'' = greyed out in the picker.';

-- Seed rows. Display names are the standard uppercase form of each slug;
-- owner to confirm/adjust wording. All ''coming_soon'' except ugc-net and
-- literature-journey, which are ''active''.
insert into public.exams (id, name, status, sort_order) values
  ('ugc-net',            'UGC NET',             'active',       1),
  ('gate',               'GATE',                'coming_soon',  2),
  ('cuet-pg',            'CUET-PG',             'coming_soon',  3),
  ('upsc-cse',           'UPSC CSE',            'coming_soon',  4),
  ('pgt',                'PGT',                 'coming_soon',  5),
  ('tgt',                'TGT',                 'coming_soon',  6),
  ('state-psc',          'State PSC',           'coming_soon',  7),
  ('literature-journey', 'Literature Journey',  'active',     100)
on conflict (id) do nothing;

-- =====================================================================
-- 2. topics  (reference data)
-- =====================================================================
-- Subject topics a question can be tagged with. Left empty here; the owner
-- supplies the topic list separately.

create table public.topics (
  id         text primary key,
  name       text not null,
  age_slug   text,              -- which age article it belongs to; nullable
  sort_order int
);

comment on table public.topics is
  'Subject topics used to tag questions. Reference data, read-only from clients.';
comment on column public.topics.age_slug is
  'The age/article this topic belongs to; nullable.';

-- =====================================================================
-- 3. exam_topics  (which topics belong to which exam, grouped into units)
-- =====================================================================

create table public.exam_topics (
  exam_id    text not null references public.exams (id),
  topic_id   text not null references public.topics (id),
  unit_label text,              -- e.g. 'Unit 3', 'Section B'
  unit_order int,
  primary key (exam_id, topic_id)
);

comment on table public.exam_topics is
  'Maps topics to exams, grouped into units. Reference data, read-only.';

-- =====================================================================
-- 4. user_exams  (a user can select several exams)
-- =====================================================================

create table public.user_exams (
  user_id     uuid not null references auth.users (id) on delete cascade,
  exam_id     text not null references public.exams (id),
  is_primary  boolean not null default false,
  selected_at timestamptz not null default now(),
  primary key (user_id, exam_id)
);

comment on table public.user_exams is
  'Exams a user selected. At most one row per user may have is_primary = true.';

-- Enforce "only one primary exam per user": a partial unique index over
-- user_id for the rows where is_primary is true.
create unique index user_exams_one_primary_per_user
  on public.user_exams (user_id)
  where is_primary;

-- =====================================================================
-- 5. notify_requests  (clicks on a greyed-out exam)
-- =====================================================================

create table public.notify_requests (
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
-- Reference tables: read-only for everyone (anon + authenticated).
grant select on public.exams       to anon, authenticated;
grant select on public.topics      to anon, authenticated;
grant select on public.exam_topics to anon, authenticated;

-- Per-user tables: authenticated only. user_exams also gets DELETE; anon none.
grant select, insert, update, delete on public.user_exams      to authenticated;
grant select, insert, update         on public.notify_requests to authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.exams           enable row level security;
alter table public.topics          enable row level security;
alter table public.exam_topics     enable row level security;
alter table public.user_exams      enable row level security;
alter table public.notify_requests enable row level security;

-- ---- reference data: anyone may read, nobody may write ----
create policy "exams_read_all" on public.exams
  for select to anon, authenticated
  using ( true );

create policy "topics_read_all" on public.topics
  for select to anon, authenticated
  using ( true );

create policy "exam_topics_read_all" on public.exam_topics
  for select to anon, authenticated
  using ( true );

-- ---- user_exams: own rows only (select / insert / update / delete) ----
create policy "user_exams_select_own" on public.user_exams
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "user_exams_insert_own" on public.user_exams
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "user_exams_update_own" on public.user_exams
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "user_exams_delete_own" on public.user_exams
  for delete to authenticated
  using ( (select auth.uid()) = user_id );

-- ---- notify_requests: own rows only (select / insert / update, no delete) ----
create policy "notify_requests_select_own" on public.notify_requests
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "notify_requests_insert_own" on public.notify_requests
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "notify_requests_update_own" on public.notify_requests
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );
