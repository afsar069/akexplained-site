-- Migration: public.leaderboard() -- rank EVERY student who has answered, by POINTS (top ten shown).
--
-- WHAT CHANGES (owner, 2026-11-06)
-- 1. Everyone who has answered at least one question is on the board. The first version needed 100
--    different questions, so with two accounts only one name showed. The floor is now 1 (`min_questions`).
-- 2. The rank no longer goes by accuracy alone. The owner said it must depend on BOTH how many questions
--    a student has done AND how accurate they are, "not that one right answer puts a student first".
--
-- THE RULE
--   points = right answers x accuracy      (each question counted ONCE, by its latest answer)
--          = right x right / answered      (rounded to a whole number)
-- Both more questions and more accuracy raise the points, and a lucky 1-out-of-1 is worth 1 point:
--
--     answered  right  accuracy   points
--          1      1     100%         1      <- last, not first
--         100     58      58%        34
--         100     90      90%        81      <- more accurate beats more questions...
--         200    100      50%        50      <- ...than twice the questions at half the accuracy
--         400    100      25%        25      <- guessing at volume does not pay
--
-- No made-up cut-off anywhere: the formula itself is what stops a tiny lucky run from topping the board.
-- Ties on points: higher accuracy first, then more questions, then who started earlier.
-- To change the rule, change the `score` line in the `per_user` CTE below (and nothing else).
--
-- WHAT DOES NOT CHANGE
--   * Each question is counted ONCE by its latest answer (repeat-proof; fixing a wrong answer raises the score).
--   * About another student the function returns ONLY: rank, the name they chose, their points and their
--     accuracy, and only for the ten at the top. No user ids, no emails, no per-question rows.
--     (Points and accuracy together hint at how many questions a student has answered; /privacy/ says so.)
--     The caller's own standing comes back in "you".
--   * SECURITY DEFINER, search_path empty, EXECUTE for signed-in students only.
--
-- A student who has logged in but answered nothing has no points, so they are not ranked yet.
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
           count(*) filter (where l.is_correct)::int as correct,
           round(100.0 * count(*) filter (where l.is_correct) / count(*))::int as accuracy,
           -- THE RULE: points = right answers x accuracy = right * right / answered, rounded.
           round( ((count(*) filter (where l.is_correct))::numeric
                   * (count(*) filter (where l.is_correct))::numeric) / count(*) )::int as score,
           (select min(a2.answered_at) from public.attempts a2 where a2.user_id = l.user_id) as started_at
    from latest l
    group by l.user_id
  ),
  ranked as (
    select p.user_id, p.questions, p.accuracy, p.score,
           rank() over (order by p.score desc, p.accuracy desc, p.questions desc, p.started_at asc) as pos
    from per_user p, settings s
    where p.questions >= s.min_questions
  ),
  me as (
    select coalesce((select questions from per_user where user_id = auth.uid()), 0) as questions,
           (select accuracy from per_user where user_id = auth.uid())               as accuracy,
           (select score    from per_user where user_id = auth.uid())               as score,
           (select pos      from ranked   where user_id = auth.uid())               as pos
  )
  select jsonb_build_object(
    'min_questions', (select min_questions from settings),
    'total_ranked',  (select count(*) from ranked),
    -- The top ten only. A student outside them is never named to anyone.
    -- About another student: rank, the name they chose, points, accuracy. The question count is
    -- deliberately NOT here, so it is not in the network response for someone else.
    'board', coalesce((
      select jsonb_agg(
               jsonb_build_object(
                 'rank',      r.pos,
                 'name',      coalesce(nullif(btrim(pr.display_name), ''), 'Student'),
                 'score',     r.score,
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
        'score',     m.score,
        'rank',      m.pos,
        'eligible',  m.questions >= (select min_questions from settings),
        'needed',    greatest(0, (select min_questions from settings) - m.questions)
      )
      from me m
    )
  );
$$;

revoke execute on function public.leaderboard() from public, anon;
grant  execute on function public.leaderboard() to authenticated;

commit;

-- Check (run after, in the SQL Editor):
--   select public.leaderboard() -> 'min_questions';                 -- 1
--   select jsonb_array_length(public.leaderboard() -> 'board');     -- one per student who answered, at most 10
--   select jsonb_pretty(public.leaderboard() -> 'board');           -- rank, name, score, accuracy, is_you
--   select has_function_privilege('anon', 'public.leaderboard()', 'execute');          -- false
--   select has_function_privilege('authenticated', 'public.leaderboard()', 'execute'); -- true
-- Run in the SQL Editor, auth.uid() is null, so the "you" part reads questions 0 -- that is correct
-- there; it fills in for a signed-in student in the browser.
