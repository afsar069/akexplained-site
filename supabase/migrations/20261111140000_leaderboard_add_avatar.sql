-- Migration: public.leaderboard() -- each of the top ten now carries the avatar the student chose.
--
-- WHAT CHANGES (owner, 2026-11-11)
-- The Top students card on /dashboard/ shows the student's picture beside their name. The function adds one
-- key to each board row: "avatar" = the id of the ready-made picture ('a1'..'a10'), or null when the student
-- kept the default graduation cap (or chose nothing). Nothing else changes: same ranking rule, same top ten,
-- same name rule, still SECURITY DEFINER with an empty search_path, EXECUTE for signed-in students only.
--
-- ABOUT ANOTHER STUDENT the function now returns ONLY: rank, name, avatar id, points and accuracy.
-- (/privacy/ says so in the same commit.)
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
    -- The owner's number. 0 = everyone who has logged in is ranked. 1 = only after the first answer.
    select 0 as min_questions
  ),
  people as (
    -- Everyone who has signed in at least once (see the header for why not every sign-up).
    select u.id as user_id, u.created_at
    from auth.users u
    where u.last_sign_in_at is not null
      and u.deleted_at is null
  ),
  latest as (
    -- One row per student per question: their most recent answer to it.
    select distinct on (a.user_id, a.question_id)
           a.user_id, a.question_id, a.is_correct
    from public.attempts a
    order by a.user_id, a.question_id, a.answered_at desc, a.id desc
  ),
  per_user as (
    select pe.user_id,
           count(l.question_id)::int as questions,
           count(*) filter (where l.is_correct)::int as correct,
           -- No answers: no accuracy (null) and 0 points.
           case when count(l.question_id) = 0 then null
                else round(100.0 * count(*) filter (where l.is_correct) / count(l.question_id))::int end as accuracy,
           -- THE RULE: points = right answers x accuracy = right * right / answered, rounded.
           case when count(l.question_id) = 0 then 0
                else round( ((count(*) filter (where l.is_correct))::numeric
                             * (count(*) filter (where l.is_correct))::numeric) / count(l.question_id) )::int end as score,
           coalesce((select min(a2.answered_at) from public.attempts a2 where a2.user_id = pe.user_id), pe.created_at) as started_at
    from people pe
    left join latest l on l.user_id = pe.user_id
    group by pe.user_id, pe.created_at
  ),
  ranked as (
    select p.user_id, p.questions, p.accuracy, p.score,
           rank() over (order by p.score desc, p.accuracy desc nulls last, p.questions desc, p.started_at asc, p.user_id asc) as pos
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
    'board', coalesce((
      select jsonb_agg(
               jsonb_build_object(
                 'rank',      r.pos,
                 -- The name the student sees in their own header and on My Account: the name saved on their
                 -- profile, else the name on the account (display_name, name, full_name), else "Student".
                 -- Never an email address.
                 'name',      coalesce(
                                nullif(btrim(pr.display_name), ''),
                                nullif(btrim(au.raw_user_meta_data ->> 'display_name'), ''),
                                nullif(btrim(au.raw_user_meta_data ->> 'name'), ''),
                                nullif(btrim(au.raw_user_meta_data ->> 'full_name'), ''),
                                'Student'),
                 -- The picture the student chose (a1..a10). A bare id, never a file or a link. Anything that is
                 -- not one of the ten ready-made ids comes back null, and the page then shows the default cap.
                 'avatar',    case when pr.avatar_id in ('a1','a2','a3','a4','a5','a6','a7','a8','a9','a10')
                                   then pr.avatar_id end,
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
        'eligible',  m.pos is not null,
        'needed',    greatest(0, (select min_questions from settings) - m.questions)
      )
      from me m
    )
  );
$$;

revoke execute on function public.leaderboard() from public, anon;
grant  execute on function public.leaderboard() to authenticated;

commit;

-- Check (after): select b ->> 'rank', b ->> 'name', b ->> 'avatar' from jsonb_array_elements(public.leaderboard() -> 'board') b;
--   select has_function_privilege('anon', 'public.leaderboard()', 'execute');          -- false
--   select has_function_privilege('authenticated', 'public.leaderboard()', 'execute'); -- true
