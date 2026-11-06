-- Migration: public.leaderboard() -- show each student's real account name on the Top students list.
--
-- THE PROBLEM (found 2026-11-06 when the owner saw two names, both "Student")
-- The board read the name only from public.profiles.display_name. For all three live accounts that column is
-- empty: their names live on the account itself (Google sign-in: `name`; email sign-up: `display_name`), which is
-- what the site shows in the header and on My Account. So everyone showed as "Student".
--
-- THE FIX
-- The name on the board is now, in this order:
--   1. the name saved on the profile (public.profiles.display_name), if there is one;
--   2. else the name on the account (display_name, then name, then full_name);
--   3. else the word "Student".
-- It is the same name the student already sees for themselves. An email address (or any part of it) is NEVER
-- used. A student can still choose what others see by changing the name on My Account (that saves to the profile,
-- which comes first), and a blank name cannot be saved there.
--
-- NOTHING ELSE CHANGES: the points rule, the floor of 1, top ten only, the keys returned (rank, name, score,
-- accuracy, is_you), SECURITY DEFINER with an empty search_path, EXECUTE for signed-in students only.
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
                 -- The name the student sees in their own header and on My Account: the name saved on their
                 -- profile, else the name on the account itself (email signup: display_name; Google: name).
                 -- Never an email address, and 'Student' only when there is no name at all.
                 'name',      coalesce(
                                nullif(btrim(pr.display_name), ''),
                                nullif(btrim(au.raw_user_meta_data ->> 'display_name'), ''),
                                nullif(btrim(au.raw_user_meta_data ->> 'name'), ''),
                                nullif(btrim(au.raw_user_meta_data ->> 'full_name'), ''),
                                'Student'),
                 'score',     r.score,
                 'accuracy',  r.accuracy,
                 'is_you',    r.user_id = auth.uid()
               )
               order by r.pos
             )
      from ranked r
      left join public.profiles pr on pr.id = r.user_id
      left join auth.users au on au.id = r.user_id
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
--   select b ->> 'rank' as rank, b ->> 'name' as name, b ->> 'score' as points, b ->> 'accuracy' as accuracy
--   from jsonb_array_elements(public.leaderboard() -> 'board') b;
-- The names should now be the real account names, not "Student".
--   select has_function_privilege('anon', 'public.leaderboard()', 'execute');          -- false
--   select has_function_privilege('authenticated', 'public.leaderboard()', 'execute'); -- true
