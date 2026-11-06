-- Migration: public.quiz_runs -- one row each time a logged-in student FINISHES a quiz.
--
-- WHY
-- public.attempts keeps one row per question answered. That cannot say "how many quizzes did this
-- student take", because a quiz is many questions. The dashboard tile "Quizzes taken" needs a real
-- count, so each finished quiz now leaves one small row here. (Owner asked for it, 2026-11-06.)
--
-- WHAT COUNTS AS A FINISHED QUIZ
--   * Daily quiz: the reader reaches the result screen with at least one answer (a quiz stopped
--     early still counts, with the questions it did have answered).
--   * MCQ test: the test is submitted, or the clock runs out, with at least one answer.
-- A quiz with no answer at all leaves no row.
--
-- WHAT IS STORED (nothing about the questions themselves; those are in attempts)
--   source           'daily' or 'cbt' (cbt = the MCQ tests)
--   bank_id          which quiz: the Daily period (e.g. 'anglo-saxon') or the MCQ set
--                    (e.g. 'old-english-set-1', or '<age>-custom' for a student's own mix)
--   level            'easy' | 'medium' | 'hard' (null when a test mixes levels)
--   total_questions  how many questions the quiz had
--   answered         how many were answered (so "left unanswered" = total_questions - answered)
--   correct          how many of those were right
--   completed_at     when it finished
--
-- NOT RETROACTIVE: quizzes finished before this table existed have no row, so the count starts
-- from the day the site code and this table are both live. The dashboard says "Quizzes taken" only
-- once at least one row exists; until then it keeps saying "Questions answered".
--
-- SECURITY (same pattern as attempts): row level security on, a student can read and add only their
-- OWN rows (user_id = auth.uid()), nothing for logged-out visitors. No update, no delete: a finished
-- quiz is a fact. Rows go when the account goes (on delete cascade).
--
-- Idempotent: safe to run twice. One transaction: all of it applies, or none of it does.

begin;

create table if not exists public.quiz_runs (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  source          text not null check (source in ('daily', 'cbt')),
  bank_id         text not null,
  level           text,
  total_questions integer not null check (total_questions >= 1),
  answered        integer not null check (answered >= 1 and answered <= total_questions),
  correct         integer not null check (correct >= 0 and correct <= answered),
  completed_at    timestamptz not null default now()
);

comment on table public.quiz_runs is
  'One row per quiz a logged-in student finished (Daily quiz or MCQ test). Counts quizzes; the answers themselves are in attempts.';

-- Read pattern: all of a student's finished quizzes, newest first (the dashboard counts them).
create index if not exists quiz_runs_user_completed_idx on public.quiz_runs (user_id, completed_at desc);

alter table public.quiz_runs enable row level security;

-- Signed-in students only; logged-out visitors get nothing.
revoke all on public.quiz_runs from public, anon;
grant select, insert on public.quiz_runs to authenticated;

drop policy if exists "quiz_runs_select_own" on public.quiz_runs;
create policy "quiz_runs_select_own" on public.quiz_runs
  for select to authenticated using ( (select auth.uid()) = user_id );

drop policy if exists "quiz_runs_insert_own" on public.quiz_runs;
create policy "quiz_runs_insert_own" on public.quiz_runs
  for insert to authenticated with check ( (select auth.uid()) = user_id );

commit;

-- Check (run after, in the SQL Editor):
--   select count(*) from public.quiz_runs;                              -- 0 at first, then it grows
--   select has_table_privilege('anon', 'public.quiz_runs', 'select');   -- false
--   select has_table_privilege('authenticated', 'public.quiz_runs', 'insert');  -- true
--   select polname from pg_policy where polrelid = 'public.quiz_runs'::regclass order by 1;
--     -- quiz_runs_insert_own, quiz_runs_select_own
