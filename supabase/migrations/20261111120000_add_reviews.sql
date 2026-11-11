-- Migration: public.reviews -- student reviews shown on the home page ("What Our Students Say").
--
-- WHY / HOW (owner decided, 2026-11-09; recorded in docs/accounts-status.md)
-- Reviews are login-gated and go live automatically. Only a logged-in student can write one, and it
-- appears on the site at once -- there is NO per-review approval step (the owner does not want to open
-- a CMS for each review). Moderation is by exception: the owner, or Claude through the Supabase
-- connector, can hide or delete a review, and does so only when a review uses inappropriate language.
-- A low-star review is not, by itself, a reason to remove it. One review per student.
--
-- Honest limit: while "Confirm email" is OFF, anyone can make a free account in seconds, so login
-- lowers spam but is not a hard wall. The one-review-per-user rule and easy removal are the real net.
--
-- WHAT A ROW HOLDS
--   user_id   the account that wrote it (one review per account; the row goes when the account goes)
--   name      the name shown on the card (taken from the student's profile/account at submit time)
--   role      optional, e.g. 'NET Aspirant'
--   heading   optional one-line headline
--   stars     1..5
--   body      the review text
--   visible   true shows it on the site; set false to hide it without deleting
--
-- SECURITY
--   Row level security on. Everyone (even logged out) may READ only visible rows -- the home page is
--   public. A logged-in student may also read their own row (even when hidden), and may INSERT one row
--   for themselves. Nobody can UPDATE or DELETE from the browser: hiding and removal are done from the
--   owner's side (service role / the connector), never by a client. Rows go when the account goes.
--
-- Idempotent: safe to run twice. One transaction: all of it applies, or none of it does.

begin;

create table if not exists public.reviews (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  name       text        not null check (length(btrim(name)) between 1 and 80),
  role       text        check (role is null or length(role) <= 80),
  heading    text        check (heading is null or length(heading) <= 120),
  stars      smallint    not null default 5 check (stars between 1 and 5),
  body       text        not null check (length(btrim(body)) between 10 and 1200),
  visible    boolean     not null default true,
  created_at timestamptz not null default now(),
  -- One review per student.
  constraint reviews_one_per_user unique (user_id)
);

comment on table public.reviews is
  'Student reviews shown on the home page. Login-gated, auto-live, one per account. Everyone reads visible rows; a student reads/inserts only their own; hide or delete only from the owner side.';

-- The home page reads visible rows, newest first.
create index if not exists reviews_visible_created_idx on public.reviews (created_at desc) where visible;

alter table public.reviews enable row level security;

-- Public may read visible rows; logged-in students may also read their own. A logged-in student may
-- add exactly one row for themselves. No update or delete is granted to any client role.
revoke all on public.reviews from public, anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select to anon, authenticated using ( visible );

drop policy if exists "reviews_own_read" on public.reviews;
create policy "reviews_own_read" on public.reviews
  for select to authenticated using ( (select auth.uid()) = user_id );

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert to authenticated with check ( (select auth.uid()) = user_id );

commit;

-- Check (run after):
--   select count(*) from public.reviews;                                   -- 0 until the first review
--   select has_table_privilege('anon', 'public.reviews', 'select');        -- true  (visible rows only, by RLS)
--   select has_table_privilege('anon', 'public.reviews', 'insert');        -- false
--   select has_table_privilege('authenticated', 'public.reviews', 'insert');-- true
--   select polname from pg_policy where polrelid = 'public.reviews'::regclass order by 1;
--     -- reviews_insert_own, reviews_own_read, reviews_public_read
