-- Migration: public.mcq_papers -- the MCQ question sets that are NOT public files.
--
-- WHY
-- Every MCQ set so far is a plain file in assets/questions/. A file on the site (and in the public
-- GitHub repo) can be read by anyone who knows its address, so a "login" or "paid" set cannot live
-- there. A gated set lives in this table instead, and the database decides who may read it.
-- (Owner decided, 2026-11-07: free sets stay as files; login sets, and later paid sets, go here.)
--
-- THREE LAYERS
--   free   a file in assets/questions/ (nothing in this table)
--   login  a row here with access = 'login'  -> any logged-in student can read it
--   paid   a row here with access = 'paid'   -> NOT BUILT YET. No policy lets anyone read a 'paid'
--          row, so today such a row is invisible to every student (it fails closed). When paid is
--          built, ONE more policy is added (it checks the student's paid pass); no row has to move.
-- Moving a set from login to paid later is one UPDATE of the access column.
--
-- WHAT A ROW HOLDS
--   one row = one level of one set (the same thing as one old file, e.g. old-english-set-4-medium.json)
--   set_id   the set, e.g. 'old-english-set-4'
--   level    'easy' | 'medium' | 'hard'
--   access   'login' | 'paid'
--   rev      the file's rev (raise it when a question's meaning changes; old attempts then reset)
--   body     the whole question file as JSON, exactly the shape the test page already reads
--            ({ setId, level, rev, questions: [...] , ... })
--
-- SECURITY (same pattern as the other tables): row level security on. Logged-out visitors get
-- nothing at all. A logged-in student can only READ, and only 'login' rows. Nobody can add, change or
-- delete a row from the browser; rows are loaded by the project owner's side (SQL), never by a client.
--
-- The table has no link to auth.users, so deleting an account never touches it.
--
-- Idempotent: safe to run twice. One transaction: all of it applies, or none of it does.

begin;

create table if not exists public.mcq_papers (
  set_id     text        not null,
  level      text        not null check (level in ('easy', 'medium', 'hard')),
  access     text        not null check (access in ('login', 'paid')),
  rev        integer     not null check (rev >= 1),
  body       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (set_id, level),
  -- The JSON must be a question file, and must say the same set, level and rev as the row,
  -- so a wrong paste cannot sit under the wrong name.
  constraint mcq_papers_body_shape check (
    jsonb_typeof(body) = 'object'
    and jsonb_typeof(body -> 'questions') = 'array'
    and jsonb_array_length(body -> 'questions') >= 1
    and body ->> 'setId' = set_id
    and body ->> 'level' = level
    and body ->> 'rev' = rev::text
  )
);

comment on table public.mcq_papers is
  'MCQ question sets that are not public files (access = login | paid). One row per set and level; body is the whole question file. Read-only from clients; paid rows stay unreadable until a paid policy exists.';

alter table public.mcq_papers enable row level security;

-- Signed-in students may read; logged-out visitors and the public role get nothing.
revoke all on public.mcq_papers from public, anon, authenticated;
grant select on public.mcq_papers to authenticated;

-- Login layer: any logged-in student reads the 'login' rows.
-- (No policy for 'paid' on purpose; see the header.)
drop policy if exists "mcq_papers_login_read" on public.mcq_papers;
create policy "mcq_papers_login_read" on public.mcq_papers
  for select to authenticated using ( access = 'login' );

commit;

-- Check (run after, in the SQL Editor):
--   select count(*) from public.mcq_papers;                 -- 0 until the first login set is loaded
--   select policyname, cmd, roles from pg_policies where tablename = 'mcq_papers';
--                                                            -- one row: mcq_papers_login_read, SELECT, {authenticated}
