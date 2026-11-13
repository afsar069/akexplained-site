-- Migration: let the site owner upload a login paper from the browser, safely.
--
-- WHY
-- Until now a login paper (an exam mock test, or a login MCQ set) was loaded by pasting a big block
-- of SQL through the database connector. Mock Test 3 was about 90 KB of SQL, read and pasted twice,
-- and one typo in a WHERE clause cost a redo. This migration adds the database half of an
-- owner-only upload page (/admin/upload-paper/): the browser inserts the paper with the ordinary
-- publishable key and the owner's own login, and the DATABASE decides who may write and whether the
-- paper is sound. No service key, no Edge Function, and no question text in the repo (rule 15).
--
-- WHAT IT ADDS
--   1. public.paper_admins      who is allowed to upload. One row per allowed login user.
--   2. mcq_papers.status        'draft' (nobody but an admin sees it) or 'live' (students see it).
--   3. new policies on mcq_papers: students read live login rows; an admin reads all, and may
--      insert and update login rows. Nobody may delete, ever.
--   4. a validation trigger on mcq_papers: the database itself refuses a broken paper.
--   5. public.paper_catalog     the paper's public METADATA (title, exam, kind, number, count,
--      status) kept up to date by a trigger, so the static site can be rebuilt from it.
--      It holds NO question text.
--
-- WHY THE CHECKS LIVE HERE AND NOT IN THE PAGE
-- Browser JavaScript can be bypassed, and it cannot cheaply see the other papers to check that a
-- question id or a question is not already used. So the page's checks are only quick feedback; the
-- trigger is the real gate. (Owner's decision, 2026-11-12.)
--
-- SECURITY NOTES
--   * Both trigger functions are SECURITY INVOKER (the normal kind) with a fixed, empty search_path.
--     They are NOT security definer, so they add no advisor finding; EXECUTE is revoked anyway,
--     which does not stop a trigger from firing (proved in 20261103120000).
--   * The admin test is  exists (select 1 from public.paper_admins where user_id = auth.uid()).
--     paper_admins lets a user read their OWN row, so this works inside a policy with no
--     security definer helper (rule 14).
--   * access = 'paid' can never be written by a client: every insert / update policy and the
--     trigger demand access = 'login'. The paid layer is still not built (rule 15).
--   * No DELETE grant and no DELETE policy on either new table.
--
-- The owner's user id is NOT in this file. It is added by one INSERT after the owner says which
-- login account is theirs (rule 2: nothing invented; and no personal data in the public repo).
--
-- Idempotent: safe to run twice. One transaction: all of it applies, or none of it does.

begin;

-- ---------------------------------------------------------------------------
-- 1. Who may upload
-- ---------------------------------------------------------------------------

create table if not exists public.paper_admins (
  user_id  uuid        primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

comment on table public.paper_admins is
  'Login accounts allowed to upload a login paper from /admin/upload-paper/. One row per account; the row is added by SQL only. A user may read only their own row, which is how the page knows whether to show the form.';

alter table public.paper_admins enable row level security;

revoke all on public.paper_admins from public, anon, authenticated;
grant select on public.paper_admins to authenticated;

-- A signed-in user may read only their own row: "am I an admin?" and nothing more.
-- No insert, update or delete policy: rows are added by the owner's side, by SQL.
drop policy if exists "paper_admins_read_own" on public.paper_admins;
create policy "paper_admins_read_own" on public.paper_admins
  for select to authenticated using ( user_id = auth.uid() );

-- ---------------------------------------------------------------------------
-- 2. Draft or live
-- ---------------------------------------------------------------------------

-- Added with default 'live' so every paper that is already loaded STAYS live and visible to
-- students; the default then becomes 'draft', so anything uploaded from now on is hidden until
-- the owner makes it live.
alter table public.mcq_papers add column if not exists status text not null default 'live';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.mcq_papers'::regclass and conname = 'mcq_papers_status_check'
  ) then
    alter table public.mcq_papers
      add constraint mcq_papers_status_check check (status in ('draft', 'live'));
  end if;
end $$;

alter table public.mcq_papers alter column status set default 'draft';

comment on column public.mcq_papers.status is
  '''live'' = signed-in students can read it; ''draft'' = only an admin can read it. New rows default to draft.';

-- ---------------------------------------------------------------------------
-- 3. The public metadata of a paper (no questions)
-- ---------------------------------------------------------------------------

create table if not exists public.paper_catalog (
  set_id         text        primary key,
  title          text        not null,
  exam_id        text        references public.exams (id),
  kind           text        not null check (kind in ('mock-test', 'mcq-set')),
  number         integer,
  question_count integer     not null default 0,
  status         text        not null check (status in ('draft', 'live')),
  updated_at     timestamptz not null default now()
);

comment on table public.paper_catalog is
  'Public metadata of each paper in mcq_papers: title, exam, kind, number, how many questions, draft or live. NO question text. Kept up to date by a trigger on mcq_papers; tools/sync_catalog.py turns the live rows into the site''s _data JSON.';
comment on column public.paper_catalog.exam_id is
  'The exam hub the paper belongs to, or null for the English Literature MCQ practice sets, which belong to no exam.';
comment on column public.paper_catalog.question_count is
  'All questions of the set, every level added together.';
comment on column public.paper_catalog.status is
  '''live'' only when every level of the set is live.';

alter table public.paper_catalog enable row level security;

revoke all on public.paper_catalog from public, anon, authenticated;
grant select on public.paper_catalog to anon, authenticated;
grant insert, update on public.paper_catalog to authenticated;  -- admins only, by the policies below

-- Everyone may read a live paper's metadata: the hub pages already show these titles.
drop policy if exists "paper_catalog_public_read" on public.paper_catalog;
create policy "paper_catalog_public_read" on public.paper_catalog
  for select to anon, authenticated using ( status = 'live' );

drop policy if exists "paper_catalog_admin_read" on public.paper_catalog;
create policy "paper_catalog_admin_read" on public.paper_catalog
  for select to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = auth.uid()) );

-- Written only by the trigger below, which runs as the admin who uploads.
drop policy if exists "paper_catalog_admin_insert" on public.paper_catalog;
create policy "paper_catalog_admin_insert" on public.paper_catalog
  for insert to authenticated
  with check ( exists (select 1 from public.paper_admins a where a.user_id = auth.uid()) );

drop policy if exists "paper_catalog_admin_update" on public.paper_catalog;
create policy "paper_catalog_admin_update" on public.paper_catalog
  for update to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = auth.uid()) )
  with check ( exists (select 1 from public.paper_admins a where a.user_id = auth.uid()) );

-- ---------------------------------------------------------------------------
-- 4. Who may read and write a paper
-- ---------------------------------------------------------------------------

revoke all on public.mcq_papers from public, anon, authenticated;
grant select, insert, update on public.mcq_papers to authenticated;  -- write is admin-only, by policy
-- No delete grant and no delete policy: a paper is never removed from the browser.

-- Students: a login paper, and only once it is live. (Replaces the old policy of the same name,
-- which had no status test.)
drop policy if exists "mcq_papers_login_read" on public.mcq_papers;
create policy "mcq_papers_login_read" on public.mcq_papers
  for select to authenticated using ( access = 'login' and status = 'live' );

-- An admin sees everything, including their own drafts. The upload page needs this to tell the
-- owner "this set already exists, rev 1", and the catalog trigger needs it to count the levels.
drop policy if exists "mcq_papers_admin_read" on public.mcq_papers;
create policy "mcq_papers_admin_read" on public.mcq_papers
  for select to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = auth.uid()) );

drop policy if exists "mcq_papers_admin_insert" on public.mcq_papers;
create policy "mcq_papers_admin_insert" on public.mcq_papers
  for insert to authenticated
  with check (
    exists (select 1 from public.paper_admins a where a.user_id = auth.uid())
    and access = 'login'
  );

drop policy if exists "mcq_papers_admin_update" on public.mcq_papers;
create policy "mcq_papers_admin_update" on public.mcq_papers
  for update to authenticated
  using (
    exists (select 1 from public.paper_admins a where a.user_id = auth.uid())
    and access = 'login'
  )
  with check (
    exists (select 1 from public.paper_admins a where a.user_id = auth.uid())
    and access = 'login'
  );

-- ---------------------------------------------------------------------------
-- 5. The database refuses a broken paper
-- ---------------------------------------------------------------------------

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

  -- The same question already in another paper.
  select string_agg(t.x, ' | ') into bad
  from (
    select distinct p.set_id || ' ' || (o.value ->> 'id') as x
    from public.mcq_papers p, jsonb_array_elements(p.body -> 'questions') o
    where p.set_id <> new.set_id
      and btrim(o.value ->> 'question') = any (stems)
    limit 3
  ) t;
  if bad is not null then
    raise exception 'Some of these questions are already in another paper: %', bad;
  end if;

  new.updated_at := now();
  return new;
end
$$;

comment on function public.mcq_papers_check_body() is
  'Trigger on mcq_papers: the database''s own check of an uploaded paper (ids, options, right answer, explanation, real tags, nothing already used by another paper). SECURITY INVOKER on purpose.';

revoke execute on function public.mcq_papers_check_body() from public, anon, authenticated;

drop trigger if exists mcq_papers_check_body on public.mcq_papers;
create trigger mcq_papers_check_body
  before insert or update on public.mcq_papers
  for each row execute function public.mcq_papers_check_body();

-- ---------------------------------------------------------------------------
-- 6. The catalog row follows the paper
-- ---------------------------------------------------------------------------

create or replace function public.mcq_papers_sync_catalog()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_title  text;
  v_exam   text;
  v_kind   text;
  v_num    int;
  v_count  int;
  v_status text;
begin
  v_title := btrim(coalesce(nullif(btrim(coalesce(new.body ->> 'title', '')), ''), new.body ->> 'setName'));
  v_exam  := nullif(btrim(coalesce(new.body ->> 'examId', '')), '');
  if v_exam is null then
    -- The papers loaded before this tool existed carry no examId in the file; keep what the
    -- catalog already says for them.
    select c.exam_id into v_exam from public.paper_catalog c where c.set_id = new.set_id;
  end if;
  v_kind := coalesce(
    nullif(btrim(coalesce(new.body ->> 'kind', '')), ''),
    case when new.set_id like '%mock-test%' then 'mock-test' else 'mcq-set' end
  );
  v_num := case when coalesce(new.body ->> 'setNumber', '') ~ '^[0-9]+$'
                then (new.body ->> 'setNumber')::int end;

  select sum(jsonb_array_length(p.body -> 'questions'))::int,
         case when count(*) filter (where p.status <> 'live') = 0 then 'live' else 'draft' end
    into v_count, v_status
  from public.mcq_papers p
  where p.set_id = new.set_id;

  insert into public.paper_catalog
    (set_id, title, exam_id, kind, number, question_count, status, updated_at)
  values
    (new.set_id, v_title, v_exam, v_kind, v_num, coalesce(v_count, 0), coalesce(v_status, 'draft'), now())
  on conflict (set_id) do update
    set title          = excluded.title,
        exam_id        = excluded.exam_id,
        kind           = excluded.kind,
        number         = excluded.number,
        question_count = excluded.question_count,
        status         = excluded.status,
        updated_at     = now();
  return null;
end
$$;

comment on function public.mcq_papers_sync_catalog() is
  'Trigger on mcq_papers: keeps the paper''s public metadata row in paper_catalog in step with it. SECURITY INVOKER, so it writes as the admin who uploaded.';

revoke execute on function public.mcq_papers_sync_catalog() from public, anon, authenticated;

drop trigger if exists mcq_papers_sync_catalog on public.mcq_papers;
create trigger mcq_papers_sync_catalog
  after insert or update on public.mcq_papers
  for each row execute function public.mcq_papers_sync_catalog();

-- ---------------------------------------------------------------------------
-- 7. The papers that are already loaded
-- ---------------------------------------------------------------------------
-- Title, number and question count are read from the papers themselves (body -> setName /
-- setNumber), so nothing here is invented (rule 2): these are the titles the live pages show.
-- Only the exam each one belongs to is named by hand, from the page it sits on:
--   up-ap-p2-mock-test-N  /exams/state-psc/up-assistant-professor/paper-2-mock-tests/  -> state-psc
--   up-pgt-mock-test-N    /exams/pgt/up-pgt/mock-tests/                                -> pgt
--   old-english-set-N, anglo-norman-set-N  /quizzes/mcq/<age>/  -> no exam (null)

with known (set_id, exam_id) as (
  values
    ('up-ap-p2-mock-test-1', 'state-psc'),
    ('up-ap-p2-mock-test-2', 'state-psc'),
    ('up-ap-p2-mock-test-3', 'state-psc'),
    ('up-pgt-mock-test-6',   'pgt'),
    ('up-pgt-mock-test-7',   'pgt'),
    ('up-pgt-mock-test-8',   'pgt'),
    ('up-pgt-mock-test-9',   'pgt'),
    ('up-pgt-mock-test-10',  'pgt'),
    ('old-english-set-4',    null),
    ('old-english-set-5',    null),
    ('old-english-set-6',    null),
    ('anglo-norman-set-2',   null)
)
insert into public.paper_catalog
  (set_id, title, exam_id, kind, number, question_count, status)
select p.set_id,
       min(nullif(btrim(p.body ->> 'setName'), '')),
       k.exam_id::text,
       case when p.set_id like '%mock-test%' then 'mock-test' else 'mcq-set' end,
       case when min(coalesce(p.body ->> 'setNumber', '')) ~ '^[0-9]+$'
            then min(coalesce(p.body ->> 'setNumber', ''))::int end,
       sum(jsonb_array_length(p.body -> 'questions'))::int,
       case when count(*) filter (where p.status <> 'live') = 0 then 'live' else 'draft' end
from public.mcq_papers p
join known k on k.set_id = p.set_id
group by p.set_id, k.exam_id
on conflict (set_id) do nothing;

commit;

-- Checks (read back after applying):
--   select count(*) from public.mcq_papers where status = 'live';   -- every paper loaded before: live
--   select * from public.paper_catalog order by set_id;             -- one row per set, real titles
--   select polname, polcmd from pg_policy where polrelid = 'public.mcq_papers'::regclass order by 1;
--   select grantee, privilege_type from information_schema.role_table_grants
--    where table_schema = 'public' and table_name in ('mcq_papers','paper_catalog','paper_admins');
--
-- Rollback (if the upload tool has to be withdrawn; it leaves the papers exactly as they were):
--   begin;
--   drop trigger if exists mcq_papers_check_body on public.mcq_papers;
--   drop trigger if exists mcq_papers_sync_catalog on public.mcq_papers;
--   drop function if exists public.mcq_papers_check_body();
--   drop function if exists public.mcq_papers_sync_catalog();
--   drop policy if exists "mcq_papers_admin_read" on public.mcq_papers;
--   drop policy if exists "mcq_papers_admin_insert" on public.mcq_papers;
--   drop policy if exists "mcq_papers_admin_update" on public.mcq_papers;
--   drop policy if exists "mcq_papers_login_read" on public.mcq_papers;
--   create policy "mcq_papers_login_read" on public.mcq_papers
--     for select to authenticated using ( access = 'login' );
--   revoke insert, update on public.mcq_papers from authenticated;
--   drop table if exists public.paper_catalog;
--   drop table if exists public.paper_admins;
--   alter table public.mcq_papers drop column if exists status;
--   commit;
