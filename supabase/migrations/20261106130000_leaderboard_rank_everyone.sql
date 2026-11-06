-- Migration: public.leaderboard() -- rank EVERY student who has answered a question (top ten shown).
--
-- WHAT CHANGES (owner, 2026-11-06)
-- The first version only ranked a student after 100 different questions, so with two accounts
-- logged in the dashboard showed one name. The owner wants the Top students list to show every
-- student who has logged in and answered, best accuracy first (1st, 2nd, 3rd ... up to 10th).
-- So the floor drops from 100 to 1: one number, `min_questions` in the `settings` CTE below.
--
-- WHAT DOES NOT CHANGE
--   * Ranking is by accuracy, each question counted ONCE by its latest answer (repeat-proof).
--   * Ties: more questions answered first, then who started earlier.
--   * About another student the function returns ONLY the name they chose and their accuracy,
--     only for the ten at the top. The caller's own standing comes back in "you".
--   * SECURITY DEFINER, search_path empty, EXECUTE for signed-in students only.
--
-- ONE SIDE EFFECT TO KNOW ABOUT
-- With a floor of 1, a student with a single right answer is at 100% and sits above a student with
-- hundreds of answers at 80%. That is what "rank everyone by accuracy" means; if it ever feels
-- unfair, raise `min_questions` here (a number such as 10 or 20) and run this file again.
--
-- A student who has logged in but answered nothing has no accuracy, so they are not ranked yet.
--
-- Idempotent: create or replace, and the grants are stated outright. One transaction.

begin;

create or replace function public.leaderboard()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with settings as (
    -- The owner's number. Change it here and nowhere else.
    -- 1 = everyone who has answered at least one question is ranked (owner, 2026-11-06).
    select 1 as min_questions
  ),
  latest as (
    -- One row per student per question: their most recent answer to it.
    select distinct on (a.user_id, a.question_id)
           a.user_id, a.question_id, a.is_correct
    from public.attempts a
    order by a.user_id, a.question_id, a.answered_at desc, a.id desc
  ),
  per_user as (
    select l.user_id,
           count(*)::int as questions,
           round(100.0 * count(*) filter (where l.is_correct) / count(*))::int as accuracy,
           (select min(a2.answered_at) from public.attempts a2 where a2.user_id = l.user_id) as started_at
    from latest l
    group by l.user_id
  ),
  ranked as (
    select p.user_id, p.questions, p.accuracy,
           rank() over (order by p.accuracy desc, p.questions desc, p.started_at asc) as pos
    from per_user p, settings s
    where p.questions >= s.min_questions
  ),
  me as (
    select coalesce((select questions from per_user where user_id = auth.uid()), 0) as questions,
           (select accuracy from per_user where user_id = auth.uid())               as accuracy,
           (select pos      from ranked   where user_id = auth.uid())               as pos
  )
  select jsonb_build_object(
    'min_questions', (select min_questions from settings),
    'total_ranked',  (select count(*) from ranked),
    -- The top ten only. A student outside them is never named to anyone.
    'board', coalesce((
      -- Owner's rule (2026-11-04): about another student, show ONLY the name
      -- they chose and their score. The question count is deliberately NOT
      -- here, so it is not even in the network response for someone else.
      -- (The caller's own question count stays, in the "you" object below.)
      select jsonb_agg(
               jsonb_build_object(
                 'rank',      r.pos,
                 'name',      coalesce(nullif(btrim(pr.display_name), ''), 'Student'),
                 'accuracy',  r.accuracy,
                 'is_you',    r.user_id = auth.uid()
               )
               order by r.pos
             )
      from ranked r
      left join public.profiles pr on pr.id = r.user_id
      where r.pos <= 10
    ), '[]'::jsonb),
    -- The caller's own standing. Always about the caller, never about anyone else.
    'you', (
      select jsonb_build_object(
        'questions', m.questions,
        'accuracy',  m.accuracy,
        'rank',      m.pos,
        'eligible',  m.questions >= (select min_questions from settings),
        'needed',    greatest(0, (select min_questions from settings) - m.questions)
      )
      from me m
    )
  );
$$;

-- EXECUTE on a function is granted to PUBLIC by default, which would put this on the REST API for
-- logged-out visitors too (advisors 0028/0029). Take that away and hand it back to signed-in
-- students only: a guest has no standing to show and no name to compare.
revoke execute on function public.leaderboard() from public, anon;
grant  execute on function public.leaderboard() to authenticated;

commit;

-- Check (run after):
--   select public.leaderboard() -> 'min_questions';     -- 1
--   select jsonb_array_length(public.leaderboard() -> 'board');   -- one per student who answered, at most 10
--   select has_function_privilege('anon', 'public.leaderboard()', 'execute');          -- false
--   select has_function_privilege('authenticated', 'public.leaderboard()', 'execute'); -- true
-- Run in the SQL Editor, auth.uid() is null, so the "you" part reads questions 0 -- that is correct
-- there; it fills in for a signed-in student in the browser.
