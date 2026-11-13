-- Migration: the admin dashboard — notifications to students, and admin read of the data.
--
-- WHY
-- The owner-only page (/admin/...) is growing from "upload a paper" into a small admin area. The
-- owner asked (2026-11-13) to also: send a notification to the dashboard bell (one student or
-- everyone), see who has signed up and how active they are, and hide or remove a bad review from
-- the page instead of asking Claude to run SQL. This migration is the database half.
--
-- Same rules as the rest of the site: no service key, no Edge Function. The browser writes with the
-- publishable key and the admin's own login; the DATABASE (RLS) decides who may do what. "Admin" is
-- a row in public.paper_admins (added by SQL only) — the one allow list for every admin power.
--
-- WHAT IT ADDS
--   1. public.notifications       the messages an admin sends. One student (audience 'user') or
--                                 everyone (audience 'all'). No question/student secrets.
--   2. public.notification_reads  one row per (student, notification) they have opened, so the bell
--                                 count clears and stays cleared on every device.
--   3. admin READ on profiles, attempts, quiz_runs — so the Students page can show names, when they
--      joined, when they were last active, and how much they have done. (Added policies only; a
--      non-admin still sees only their OWN rows, exactly as before.) No access to auth.users and no
--      SECURITY DEFINER function, so no new security-advisor finding.
--   4. reviews: an admin may read every review (even hidden ones), hide/show one (visible), and
--      delete one. Students are unchanged (they still read visible rows + their own, insert one).
--
-- Idempotent. One transaction.

begin;

-- ---------------------------------------------------------------------------
-- 1. The messages
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id         uuid        primary key default gen_random_uuid(),
  audience   text        not null check (audience in ('all', 'user')),
  user_id    uuid        references auth.users (id) on delete cascade,  -- null for a broadcast
  title      text        not null check (length(btrim(title)) between 1 and 120),
  body       text        check (body is null or length(body) <= 1000),
  -- A link, if given, must be a path on THIS site (starts with one "/", not "//"): no off-site links.
  link       text        check (link is null or (link ~ '^/[^/]' and length(link) <= 300)),
  created_by uuid        default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  -- 'all' => no single user; 'user' => exactly one.
  constraint notifications_audience_user check (
    (audience = 'all' and user_id is null) or (audience = 'user' and user_id is not null)
  )
);

comment on table public.notifications is
  'Messages an admin sends to the student dashboard bell. audience ''all'' is a broadcast (user_id null); ''user'' is for one student. No question or private student data. Written only by an admin (paper_admins); read by the student it is for, or everyone for a broadcast.';

create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_created_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

revoke all on public.notifications from public, anon, authenticated;
grant select on public.notifications to authenticated;
grant insert, delete on public.notifications to authenticated;   -- admin only, by the policies below

-- A student reads a broadcast or a message addressed to them; an admin reads all.
drop policy if exists "notifications_read" on public.notifications;
create policy "notifications_read" on public.notifications
  for select to authenticated using (
    audience = 'all'
    or user_id = (select auth.uid())
    or exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
  );

-- Only an admin may send one, and it is stamped as sent by them.
drop policy if exists "notifications_admin_insert" on public.notifications;
create policy "notifications_admin_insert" on public.notifications
  for insert to authenticated with check (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
    and (created_by is null or created_by = (select auth.uid()))
  );

-- Only an admin may remove one (to pull back a message sent by mistake).
drop policy if exists "notifications_admin_delete" on public.notifications;
create policy "notifications_admin_delete" on public.notifications
  for delete to authenticated using (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- 2. Who has opened what (so the bell count clears everywhere)
-- ---------------------------------------------------------------------------

create table if not exists public.notification_reads (
  user_id         uuid        not null references auth.users (id) on delete cascade,
  notification_id uuid        not null references public.notifications (id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (user_id, notification_id)
);

comment on table public.notification_reads is
  'One row per (student, notification) the student has opened. Lets the dashboard bell show an honest unread count that clears on every device. A student reads and inserts only their own rows.';

alter table public.notification_reads enable row level security;

revoke all on public.notification_reads from public, anon, authenticated;
grant select, insert on public.notification_reads to authenticated;

drop policy if exists "notification_reads_own_read" on public.notification_reads;
create policy "notification_reads_own_read" on public.notification_reads
  for select to authenticated using ( user_id = (select auth.uid()) );

drop policy if exists "notification_reads_own_insert" on public.notification_reads;
create policy "notification_reads_own_insert" on public.notification_reads
  for insert to authenticated with check ( user_id = (select auth.uid()) );

-- ---------------------------------------------------------------------------
-- 3. Admin may READ the student data the Students page shows
--    (name, joined, activity). These are EXTRA policies: a non-admin still
--    sees only their own rows, because the admin test is false for them.
--    No auth.users, so no email and no new SECURITY DEFINER function.
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select to authenticated using (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
  );

drop policy if exists "attempts_admin_read" on public.attempts;
create policy "attempts_admin_read" on public.attempts
  for select to authenticated using (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
  );

drop policy if exists "quiz_runs_admin_read" on public.quiz_runs;
create policy "quiz_runs_admin_read" on public.quiz_runs
  for select to authenticated using (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- 4. Reviews: an admin may read all, hide/show, and delete
-- ---------------------------------------------------------------------------

-- The admin page needs to see hidden reviews too (to show or delete them).
drop policy if exists "reviews_admin_read" on public.reviews;
create policy "reviews_admin_read" on public.reviews
  for select to authenticated using (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
  );

-- Hide or show a review (flip `visible`). An admin is trusted with the row.
drop policy if exists "reviews_admin_update" on public.reviews;
create policy "reviews_admin_update" on public.reviews
  for update to authenticated
  using (exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())));

-- Remove a review for good (owner's rule: only for inappropriate language).
drop policy if exists "reviews_admin_delete" on public.reviews;
create policy "reviews_admin_delete" on public.reviews
  for delete to authenticated using (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
  );

-- Students keep only their old powers; grant the two new verbs (admin-only by the policies above).
grant update, delete on public.reviews to authenticated;

commit;

-- Checks (read back after applying):
--   select count(*) from public.notifications;                 -- 0 until the first message
--   select polname, polcmd from pg_policy where polrelid = 'public.notifications'::regclass order by 1;
--   select polname, polcmd from pg_policy where polrelid = 'public.reviews'::regclass order by 1;
--   as a signed-in STUDENT: reads only broadcasts + own messages, own reads; cannot insert a
--     notification; sees only own profile/attempts; cannot update or delete a review.
--   as an ADMIN: reads all; inserts/deletes a notification; reads every profile/attempt; hides and
--     deletes a review.
--   security advisors: unchanged (no SECURITY DEFINER function added).
--
-- Rollback (removes the admin dashboard's data layer, leaves every existing table as it was):
--   begin;
--   drop table if exists public.notification_reads;
--   drop table if exists public.notifications;
--   drop policy if exists "profiles_admin_read" on public.profiles;
--   drop policy if exists "attempts_admin_read" on public.attempts;
--   drop policy if exists "quiz_runs_admin_read" on public.quiz_runs;
--   drop policy if exists "reviews_admin_read" on public.reviews;
--   drop policy if exists "reviews_admin_update" on public.reviews;
--   drop policy if exists "reviews_admin_delete" on public.reviews;
--   revoke update, delete on public.reviews from authenticated;
--   commit;
