-- Allow a few similar questions across papers; refuse only a copy (owner, 2026-11-18)
-- --------------------------------------------------------------------------------
-- BEFORE: one question that was already in another paper made the upload fail ("Some of these questions are
-- already in another paper"). Two exam papers sometimes repeat a question, and the owner wants those papers to go
-- live. NOW: up to 10 questions (counted by exact text, once each) may be the same as a question in another paper.
-- MORE THAN 10 is refused, because that is a copy of another paper or a file saved under the wrong name.
--
-- Also adds paper_similar_questions(set_id): an admin-only report of which questions of a paper are the same as a
-- question in another paper. The upload page calls it after saving and tells the owner (it is information, not an
-- error). It returns ids only, no question text, and does nothing for anyone who is not a paper admin.
--
-- Everything else in the check is unchanged: ids stay unique across papers, four different options, a real tag, etc.
-- No table, policy or grant changes. SECURITY INVOKER on purpose (the caller's own RLS applies).

create or replace function public.mcq_papers_check_body()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  qs    jsonb;
  q     jsonb;
  ids   text[];
  stems text[];
  bad   text;
  nbad  int;
  nsim  int;
  i     int;
begin
  -- A change to nothing but the status (draft <-> live) does not re-read the questions: an old
  -- paper is not re-judged by rules written after it was loaded.
  if tg_op = 'UPDATE'
     and new.body = old.body and new.access = old.access and new.rev = old.rev
     and new.set_id = old.set_id and new.level = old.level then
    new.updated_at := now();
    return new;
  end if;

  if tg_op = 'UPDATE' and new.rev < old.rev then
    raise exception 'This paper is already at rev %. A new upload must keep or raise the rev, never lower it.', old.rev;
  end if;

  if new.access <> 'login' then
    raise exception 'Only a login paper can be saved here. This one says access = %.', new.access;
  end if;

  qs := new.body -> 'questions';
  if jsonb_typeof(qs) <> 'array' or jsonb_array_length(qs) < 1 then
    raise exception 'The file has no list of questions.';
  end if;

  -- The file must say the same set, level and rev as the row it is saved under, so a file cannot
  -- land under the wrong name. (The old CHECK says this too; this says it in plain words first.)
  if coalesce(new.body ->> 'setId', '') <> new.set_id then
    raise exception 'The file is for set % but it is being saved as %.', coalesce(new.body ->> 'setId', '(none)'), new.set_id;
  end if;
  if coalesce(new.body ->> 'level', '') <> new.level then
    raise exception 'The file is the % level but it is being saved as %.', coalesce(new.body ->> 'level', '(none)'), new.level;
  end if;
  if coalesce(new.body ->> 'rev', '') <> new.rev::text then
    raise exception 'The file says rev % but it is being saved as rev %.', coalesce(new.body ->> 'rev', '(none)'), new.rev;
  end if;

  if coalesce(btrim(coalesce(new.body ->> 'title', new.body ->> 'setName')), '') = '' then
    raise exception 'The file has no title (setName).';
  end if;

  if (new.body ->> 'examId') is not null
     and not exists (select 1 from public.exams e where e.id = new.body ->> 'examId') then
    raise exception 'Unknown exam: %. Pick a category the site has a page for.', new.body ->> 'examId';
  end if;

  if (new.body ->> 'kind') is not null
     and (new.body ->> 'kind') not in ('mock-test', 'mcq-set') then
    raise exception 'Unknown kind: %. It must be mock-test or mcq-set.', new.body ->> 'kind';
  end if;

  -- Every question: an id, a question, exactly four different options that are not empty,
  -- the right option marked 0 to 3, and an explanation.
  for i in 0 .. jsonb_array_length(qs) - 1 loop
    q := qs -> i;
    if jsonb_typeof(q) <> 'object' then
      raise exception 'Question % is not a question.', i + 1;
    end if;
    if coalesce(btrim(q ->> 'id'), '') = '' then
      raise exception 'Question % has no id.', i + 1;
    end if;
    if coalesce(btrim(q ->> 'question'), '') = '' then
      raise exception 'Question % (%) has no question text.', i + 1, q ->> 'id';
    end if;
    if jsonb_typeof(q -> 'options') <> 'array' or jsonb_array_length(q -> 'options') <> 4 then
      raise exception 'Question % (%) must have exactly 4 options.', i + 1, q ->> 'id';
    end if;
    if exists (
      select 1 from jsonb_array_elements(q -> 'options') o
      where jsonb_typeof(o.value) <> 'string' or btrim(o.value #>> '{}') = ''
    ) then
      raise exception 'Question % (%) has an empty option.', i + 1, q ->> 'id';
    end if;
    if (select count(distinct btrim(o.value #>> '{}')) from jsonb_array_elements(q -> 'options') o) <> 4 then
      raise exception 'Question % (%) has the same option twice.', i + 1, q ->> 'id';
    end if;
    if jsonb_typeof(q -> 'correct_option_id') <> 'number'
       or coalesce(q ->> 'correct_option_id', '') !~ '^[0-3]$' then
      raise exception 'Question % (%) must mark the right option as 0, 1, 2 or 3.', i + 1, q ->> 'id';
    end if;
    if coalesce(btrim(q ->> 'explanation'), '') = '' then
      raise exception 'Question % (%) has no explanation.', i + 1, q ->> 'id';
    end if;
  end loop;

  -- Tags must be real nodes of the topic tree (rule 12).
  select count(*), string_agg(distinct coalesce(s.t, '(none)'), ', ')
    into nbad, bad
  from (select e.value ->> 'topicId' as t from jsonb_array_elements(qs) e) s
  where s.t is null or btrim(s.t) = ''
     or not exists (select 1 from public.topics tp where tp.id = s.t);
  if nbad > 0 then
    raise exception '% question(s) have a topic tag that is missing or not in the topic list: %', nbad, bad;
  end if;

  select count(*), string_agg(distinct s.t, ', ')
    into nbad, bad
  from (
    select e.value ->> 'periodId' as t from jsonb_array_elements(qs) e
    where e.value ->> 'periodId' is not null and btrim(e.value ->> 'periodId') <> ''
  ) s
  where not exists (select 1 from public.topics tp where tp.id = s.t and tp.kind = 'period');
  if nbad > 0 then
    raise exception '% question(s) have a period tag that is not a period: %', nbad, bad;
  end if;

  select array_agg(e.value ->> 'id'), array_agg(btrim(e.value ->> 'question'))
    into ids, stems
  from jsonb_array_elements(qs) e;

  -- The same id twice in this file.
  select string_agg(t.x, ', ') into bad
  from (select u as x from unnest(ids) u group by u having count(*) > 1 limit 5) t;
  if bad is not null then
    raise exception 'Two questions in this file have the same id: %', bad;
  end if;

  -- The same question twice in this file.
  select string_agg(t.x, ' | ') into bad
  from (select u as x from unnest(stems) u group by u having count(*) > 1 limit 3) t;
  if bad is not null then
    raise exception 'The same question is in this file twice: %', bad;
  end if;

  -- An id that already belongs to another paper (readers' records hang on ids: rule 12).
  select string_agg(t.x, ', ') into bad
  from (
    select distinct o.value ->> 'id' as x
    from public.mcq_papers p, jsonb_array_elements(p.body -> 'questions') o
    where (p.set_id, p.level) <> (new.set_id, new.level)
      and (o.value ->> 'id') = any (ids)
    limit 5
  ) t;
  if bad is not null then
    raise exception 'These question ids already belong to another paper: %', bad;
  end if;

  -- The same question already in another paper (owner, 2026-11-18). A few shared questions are normal
  -- (two exam papers do repeat a question now and then), so up to MAX_SIMILAR of them are allowed and the
  -- upload page lists them afterwards (paper_similar_questions). MORE than that means the file is a copy of
  -- another paper (or one saved under the wrong name), and that is still refused.
  select count(*), string_agg(t.x, ' | ')
    into nsim, bad
  from (
    select (min(p.set_id) || ' ' || min(o.value ->> 'id')) as x
    from public.mcq_papers p, jsonb_array_elements(p.body -> 'questions') o
    where p.set_id <> new.set_id
      and btrim(o.value ->> 'question') = any (stems)
    group by btrim(o.value ->> 'question')
  ) t;
  if nsim > 10 then
    raise exception '% questions in this file are already in another paper (up to 10 is allowed). This looks like a copy of another paper, for example: %',
      nsim, (select string_agg(x, ' | ') from (select x from regexp_split_to_table(bad, ' \| ') x limit 3) s);
  end if;

  new.updated_at := now();
  return new;
end
$$;


-- ---------------------------------------------------------------------------
-- Report: which questions of this paper are the same as a question in another paper?
-- ---------------------------------------------------------------------------
create or replace function public.paper_similar_questions(p_set_id text)
returns table (question_id text, other_set_id text, other_question_id text)
language sql
stable
set search_path = ''
as $$
  select distinct on (a.value ->> 'id')
         a.value ->> 'id',
         p2.set_id,
         b.value ->> 'id'
  from public.mcq_papers p1
  cross join lateral jsonb_array_elements(p1.body -> 'questions') a
  join public.mcq_papers p2 on p2.set_id <> p1.set_id
  cross join lateral jsonb_array_elements(p2.body -> 'questions') b
  where p1.set_id = p_set_id
    and btrim(a.value ->> 'question') = btrim(b.value ->> 'question')
    and exists (select 1 from public.paper_admins x where x.user_id = (select auth.uid()))
  order by a.value ->> 'id', p2.set_id, b.value ->> 'id'
$$;

comment on function public.paper_similar_questions(text) is
  'Admin-only report for the upload page: which questions of a paper are the same as a question in another paper (ids only). SECURITY INVOKER.';

revoke execute on function public.paper_similar_questions(text) from public, anon;
grant execute on function public.paper_similar_questions(text) to authenticated;
