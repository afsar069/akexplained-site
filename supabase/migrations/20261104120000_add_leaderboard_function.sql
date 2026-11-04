-- Migration: public.leaderboard() -- the top students, and where the caller stands.
--
-- WHY A FUNCTION AND NOT A QUERY FROM THE BROWSER
-- RLS on public.attempts is own-rows-only, so a signed-in student can only ever read their own
-- answers. A leaderboard has to look across every student, so it must run as the table owner.
-- This is therefore SECURITY DEFINER -- and that makes the function itself the privacy boundary:
-- it is written so the ONLY thing it can ever hand back about another student is a display name,
-- a question count and an accuracy, and only for the ten at the top. No user ids, no emails, no
-- per-question rows, no way to ask about a named person.
--
-- THE OWNER'S RULES (2026-11-04), encoded below
--   * A student enters the ranking only after answering MIN_QUESTIONS (100) different questions.
--     Without that floor a student who answered two questions correctly would sit at 100% and top
--     the board.
--   * The ranking is by accuracy.
--   * Names are shown. The owner chose this over an anonymous board; /privacy/ says so in the same
--     commit, because a student's name and result are now visible to other students.
--   * There is no minimum number of students. The board is live from the first eligible student and
--     reorders itself as people pass each other, which is what the owner asked for.
--
-- ONE DECISION CLAUDE MADE, FLAGGED TO THE OWNER
-- "Accuracy" counts each question ONCE, by its most recent answer -- not every attempt. Counting
-- every attempt would let a student answer one easy question correctly five hundred times and reach
-- 100%. Counting the latest answer per question is repeat-proof, and it means going back and fixing
-- a wrong answer actually improves the score. If the owner wants a different rule, the `latest` CTE
-- is the only part that changes.
--
-- TIES are broken by more questions answered, then by who started earlier.
--
-- COST: one pass over public.attempts per call. Fine at today's size (110 rows). If the table grows
-- into the millions this wants a materialised view refreshed on a schedule; the function's shape
-- (what it returns) would not change.
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
    select 100 as min_questions
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
--   select public.leaderboard();
-- Expect a jsonb object with min_questions 100, total_ranked, a board array (at most 10 entries)
-- and a "you" object. Run as the service role in the SQL editor, auth.uid() is null, so "you" will
-- read questions 0 / eligible false -- that is correct there; it fills in for a real signed-in
-- student in the browser.
--
-- And confirm a logged-out visitor cannot call it:
--   select has_function_privilege('anon', 'public.leaderboard()', 'execute');          -- false
--   select has_function_privilege('authenticated', 'public.leaderboard()', 'execute'); -- true
