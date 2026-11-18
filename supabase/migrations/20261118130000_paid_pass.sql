-- The paid layer: the All Access pass, promo codes, Razorpay orders (owner, 2026-11-18)
-- ------------------------------------------------------------------------------------
-- WHAT THE OWNER DECIDED
--   * One pass for now, "All Access": one payment opens every paid mock test. Later, other plans per course.
--   * A pass runs 30 days per unit; a student buys 1 to 6 units at a time (the owner can change both).
--   * The price is NOT fixed in code: it lives in pass_plans and the owner edits it on /admin/payments/.
--     Until a price is set and the plan is switched on, nothing can be bought.
--   * Promo codes: percent off (100% = free, Razorpay is skipped) or a flat amount off; optional limit
--     on uses, dates, one plan, once per student.
--   * Refunds follow the owner's policy (/refund-policy/): no refund after a paid test is opened; a full
--     refund on request within 24 hours if no paid test was opened; failed and double payments are returned.
--     paper_opens records when a student first opened a paid test, so that decision is fair.
--
-- HOW IT IS SAFE
--   * Prices are worked out in the database (pass_quote), never taken from the browser.
--   * Orders and passes are written only by the server (the Edge Functions, with the service role).
--     A student can READ their own orders and passes, and nothing else. No client insert/update/delete.
--   * pass_quote / pass_create_order / pass_grant are callable by the service role only.
--   * A paid paper (mcq_papers.access = 'paid') is readable only while the student holds a pass that is
--     running now. Logged-out visitors get nothing, as before.
--   * Every table with a user_id references auth.users on delete cascade (rule 10: Delete my account).
--
-- Nothing becomes paid by this migration: no mcq_papers row changes. Papers are moved to paid later, in
-- one UPDATE, only when Razorpay live mode works (owner's word first).
--
-- One transaction. Safe to run twice.

begin;

-- ---------------------------------------------------------------------------
-- 1. The plans (today: one, "all-access")
-- ---------------------------------------------------------------------------
create table if not exists public.pass_plans (
  id            text        primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  title         text        not null check (btrim(title) <> ''),
  description   text        not null default '',
  price_paise   integer     check (price_paise is null or price_paise >= 100),
  days_per_unit integer     not null default 30 check (days_per_unit between 1 and 366),
  max_units     integer     not null default 6  check (max_units between 1 and 24),
  active        boolean     not null default false,
  updated_at    timestamptz not null default now(),
  constraint pass_plans_active_needs_price check (not active or price_paise is not null)
);

comment on table public.pass_plans is
  'What can be bought. price_paise is per unit (one unit = days_per_unit days). A plan can be bought only while active, and it can be active only with a price. Edited by an admin on /admin/payments/.';

insert into public.pass_plans (id, title, description, price_paise, days_per_unit, max_units, active)
values ('all-access', 'All Access pass', 'Every test on the site that is not free (MCQ practice sets, mock tests and previous-year papers), for as long as the pass runs.', null, 30, 6, false)
on conflict (id) do nothing;

alter table public.pass_plans enable row level security;
revoke all on public.pass_plans from public, anon, authenticated;
grant select on public.pass_plans to anon, authenticated;
grant update on public.pass_plans to authenticated;   -- admins only, by policy

drop policy if exists "pass_plans_public_read" on public.pass_plans;
create policy "pass_plans_public_read" on public.pass_plans
  for select to anon, authenticated using ( active );

drop policy if exists "pass_plans_admin_read" on public.pass_plans;
create policy "pass_plans_admin_read" on public.pass_plans
  for select to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

drop policy if exists "pass_plans_admin_update" on public.pass_plans;
create policy "pass_plans_admin_update" on public.pass_plans
  for update to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) )
  with check ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

-- ---------------------------------------------------------------------------
-- 2. Promo codes (admin only; a student never lists them, the server checks one)
-- ---------------------------------------------------------------------------
create table if not exists public.promo_codes (
  code             text        primary key check (code ~ '^[A-Z0-9_-]{3,30}$'),
  percent_off      integer     check (percent_off between 1 and 100),
  amount_off_paise integer     check (amount_off_paise >= 1),
  plan_id          text        references public.pass_plans (id),
  max_uses         integer     check (max_uses >= 1),
  once_per_student boolean     not null default true,
  valid_from       timestamptz,
  valid_until      timestamptz,
  active           boolean     not null default true,
  note             text        not null default '',
  created_by       uuid        default auth.uid() references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  constraint promo_codes_one_kind check ((percent_off is null) <> (amount_off_paise is null)),
  constraint promo_codes_dates check (valid_from is null or valid_until is null or valid_until > valid_from)
);

comment on table public.promo_codes is
  'Discount codes. Exactly one of percent_off (100 = free) or amount_off_paise. plan_id null = any plan. max_uses counts paid orders. Never deleted from the browser: switch one off with active = false.';

alter table public.promo_codes enable row level security;
revoke all on public.promo_codes from public, anon, authenticated;
grant select, insert, update on public.promo_codes to authenticated;  -- admins only, by policy

drop policy if exists "promo_codes_admin_read" on public.promo_codes;
create policy "promo_codes_admin_read" on public.promo_codes
  for select to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

drop policy if exists "promo_codes_admin_insert" on public.promo_codes;
create policy "promo_codes_admin_insert" on public.promo_codes
  for insert to authenticated
  with check ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

drop policy if exists "promo_codes_admin_update" on public.promo_codes;
create policy "promo_codes_admin_update" on public.promo_codes
  for update to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) )
  with check ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

-- ---------------------------------------------------------------------------
-- 3. Orders (one per Buy press) and passes (one per paid order)
-- ---------------------------------------------------------------------------
create table if not exists public.pass_orders (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users (id) on delete cascade,
  plan_id        text        not null references public.pass_plans (id),
  units          integer     not null check (units >= 1),
  days           integer     not null check (days >= 1),
  base_paise     integer     not null check (base_paise >= 0),
  discount_paise integer     not null default 0 check (discount_paise >= 0),
  amount_paise   integer     not null check (amount_paise >= 0),
  promo_code     text        references public.promo_codes (code),
  status         text        not null default 'created' check (status in ('created', 'paid', 'failed', 'refunded')),
  rzp_order_id   text        unique,
  rzp_payment_id text        unique,
  note           text        not null default '',
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,
  refunded_at    timestamptz,
  constraint pass_orders_sum check (amount_paise = base_paise - discount_paise)
);
create index if not exists pass_orders_user_idx on public.pass_orders (user_id, created_at desc);
create index if not exists pass_orders_promo_idx on public.pass_orders (promo_code) where promo_code is not null;

comment on table public.pass_orders is
  'One row per Buy press. Written only by the server (Edge Functions). created -> paid (pass granted) | failed; paid -> refunded (the pass ends at once). Razorpay keeps its own record of every payment too.';

create table if not exists public.passes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  plan_id    text        not null references public.pass_plans (id),
  order_id   uuid        unique references public.pass_orders (id) on delete cascade,
  source     text        not null check (source in ('payment', 'promo', 'admin')),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  created_at timestamptz not null default now(),
  constraint passes_order check (ends_at >= starts_at)
);
create index if not exists passes_user_idx on public.passes (user_id, ends_at desc);

comment on table public.passes is
  'A student''s pass: open from starts_at to ends_at. A new purchase while a pass runs starts when the last one ends, so no day is lost. A refund sets ends_at so the pass stops.';

alter table public.pass_orders enable row level security;
alter table public.passes      enable row level security;
revoke all on public.pass_orders from public, anon, authenticated;
revoke all on public.passes      from public, anon, authenticated;
grant select, update on public.pass_orders to authenticated;   -- own read; admin read + update, by policy
grant select, update on public.passes      to authenticated;   -- own read; admin read + update, by policy

drop policy if exists "pass_orders_own_read" on public.pass_orders;
create policy "pass_orders_own_read" on public.pass_orders
  for select to authenticated using ( user_id = (select auth.uid()) );

drop policy if exists "pass_orders_admin_read" on public.pass_orders;
create policy "pass_orders_admin_read" on public.pass_orders
  for select to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

-- An admin may mark a paid order refunded (after refunding it in Razorpay) and add a note.
drop policy if exists "pass_orders_admin_update" on public.pass_orders;
create policy "pass_orders_admin_update" on public.pass_orders
  for update to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) )
  with check ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

drop policy if exists "passes_own_read" on public.passes;
create policy "passes_own_read" on public.passes
  for select to authenticated using ( user_id = (select auth.uid()) );

drop policy if exists "passes_admin_read" on public.passes;
create policy "passes_admin_read" on public.passes
  for select to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

drop policy if exists "passes_admin_update" on public.passes;
create policy "passes_admin_update" on public.passes
  for update to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) )
  with check ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

-- An admin may only move an order to 'refunded' or change its note; amounts and ids never change.
create or replace function public.pass_orders_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.id <> old.id or new.user_id <> old.user_id or new.plan_id <> old.plan_id
       or new.units <> old.units or new.days <> old.days or new.base_paise <> old.base_paise
       or new.discount_paise <> old.discount_paise or new.amount_paise <> old.amount_paise
       or new.promo_code is distinct from old.promo_code
       or new.rzp_order_id is distinct from old.rzp_order_id
       or new.rzp_payment_id is distinct from old.rzp_payment_id
       or new.created_at <> old.created_at or new.paid_at is distinct from old.paid_at then
      raise exception 'Only the status (to refunded) and the note of an order can be changed here.';
    end if;
    if new.status <> old.status and not (old.status = 'paid' and new.status = 'refunded') then
      raise exception 'An order can only be marked refunded after it was paid.';
    end if;
  end if;
  if new.status = 'refunded' and old.status <> 'refunded' then
    new.refunded_at := coalesce(new.refunded_at, now());
  end if;
  return new;
end
$$;
revoke execute on function public.pass_orders_guard() from public, anon, authenticated;

drop trigger if exists pass_orders_guard on public.pass_orders;
create trigger pass_orders_guard
  before update on public.pass_orders
  for each row execute function public.pass_orders_guard();

-- A refunded order ends its pass at once (and a pass that had not started yet never starts).
create or replace function public.pass_orders_end_pass()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'refunded' and old.status <> 'refunded' then
    update public.passes p
       set ends_at = greatest(p.starts_at, least(p.ends_at, now()))
     where p.order_id = new.id;
  end if;
  return null;
end
$$;
revoke execute on function public.pass_orders_end_pass() from public, anon, authenticated;

drop trigger if exists pass_orders_end_pass on public.pass_orders;
create trigger pass_orders_end_pass
  after update on public.pass_orders
  for each row execute function public.pass_orders_end_pass();

-- ---------------------------------------------------------------------------
-- 4. When did a student first open a paid paper? (for the refund rule)
-- ---------------------------------------------------------------------------
create table if not exists public.paper_opens (
  user_id         uuid        not null references auth.users (id) on delete cascade,
  set_id          text        not null,
  first_opened_at timestamptz not null default now(),
  primary key (user_id, set_id)
);

comment on table public.paper_opens is
  'The first time a student opened (loaded the questions of) each paid paper. The test page writes it; the refund rule reads it.';

alter table public.paper_opens enable row level security;
revoke all on public.paper_opens from public, anon, authenticated;
grant select, insert on public.paper_opens to authenticated;

drop policy if exists "paper_opens_own_read" on public.paper_opens;
create policy "paper_opens_own_read" on public.paper_opens
  for select to authenticated using ( user_id = (select auth.uid()) );

drop policy if exists "paper_opens_admin_read" on public.paper_opens;
create policy "paper_opens_admin_read" on public.paper_opens
  for select to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid())) );

drop policy if exists "paper_opens_own_insert" on public.paper_opens;
create policy "paper_opens_own_insert" on public.paper_opens
  for insert to authenticated
  with check ( user_id = (select auth.uid()) and first_opened_at <= now() + interval '1 minute' );

-- ---------------------------------------------------------------------------
-- 5. Paid papers: readable while the student's pass runs
-- ---------------------------------------------------------------------------
drop policy if exists "mcq_papers_paid_read" on public.mcq_papers;
create policy "mcq_papers_paid_read" on public.mcq_papers
  for select to authenticated
  using (
    access = 'paid' and status = 'live'
    and exists (
      select 1 from public.passes p
      where p.user_id = (select auth.uid()) and p.starts_at <= now() and p.ends_at > now()
    )
  );

-- An admin may upload or change a login OR a paid paper (the trigger below checks the rest).
drop policy if exists "mcq_papers_admin_insert" on public.mcq_papers;
create policy "mcq_papers_admin_insert" on public.mcq_papers
  for insert to authenticated
  with check (
    exists (select 1 from public.paper_admins a where a.user_id = auth.uid())
    and access in ('login', 'paid')
  );

drop policy if exists "mcq_papers_admin_update" on public.mcq_papers;
create policy "mcq_papers_admin_update" on public.mcq_papers
  for update to authenticated
  using (
    exists (select 1 from public.paper_admins a where a.user_id = auth.uid())
    and access in ('login', 'paid')
  )
  with check (
    exists (select 1 from public.paper_admins a where a.user_id = auth.uid())
    and access in ('login', 'paid')
  );

-- The body check: now allows a paid paper, and keeps a paid paper paid on a new upload.
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
  -- A change to nothing but the status (draft <-> live) or the access (login <-> paid) does not
  -- re-read the questions: an old paper is not re-judged by rules written after it was loaded.
  if tg_op = 'UPDATE'
     and new.body = old.body and new.rev = old.rev
     and new.set_id = old.set_id and new.level = old.level then
    if new.access not in ('login', 'paid') then
      raise exception 'A paper is either login or paid. This one says access = %.', new.access;
    end if;
    new.updated_at := now();
    return new;
  end if;

  if tg_op = 'UPDATE' and new.rev < old.rev then
    raise exception 'This paper is already at rev %. A new upload must keep or raise the rev, never lower it.', old.rev;
  end if;

  if new.access not in ('login', 'paid') then
    raise exception 'A paper is either login or paid. This one says access = %.', new.access;
  end if;

  -- A new upload of a paid paper must stay paid, so a corrected file can never open a paid paper
  -- to every logged-in student by mistake. (Moving a paper from paid to login is a separate,
  -- deliberate change of the access alone, above.)
  if tg_op = 'UPDATE' and old.access = 'paid' and new.access <> 'paid' then
    raise exception 'This paper is a paid paper. A new upload of it must also be paid.';
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
revoke execute on function public.mcq_papers_check_body() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. The catalog says whether a paper is paid (public metadata, no questions)
-- ---------------------------------------------------------------------------
alter table public.paper_catalog add column if not exists access text not null default 'login';
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.paper_catalog'::regclass and conname = 'paper_catalog_access_check'
  ) then
    alter table public.paper_catalog
      add constraint paper_catalog_access_check check (access in ('login', 'paid'));
  end if;
end
$$;
comment on column public.paper_catalog.access is
  '''paid'' when any level of the set is paid (the test page then asks for the pass, not just a login).';

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
  v_access text;
begin
  v_title := btrim(coalesce(nullif(btrim(coalesce(new.body ->> 'title', '')), ''), new.body ->> 'setName'));
  v_exam  := nullif(btrim(coalesce(new.body ->> 'examId', '')), '');
  if v_exam is null then
    select c.exam_id into v_exam from public.paper_catalog c where c.set_id = new.set_id;
  end if;
  v_kind := coalesce(
    nullif(btrim(coalesce(new.body ->> 'kind', '')), ''),
    case when new.set_id like '%mock-test%' then 'mock-test' else 'mcq-set' end
  );
  v_num := case when coalesce(new.body ->> 'setNumber', '') ~ '^[0-9]+$'
                then (new.body ->> 'setNumber')::int end;

  select sum(jsonb_array_length(p.body -> 'questions'))::int,
         case when count(*) filter (where p.status <> 'live') = 0 then 'live' else 'draft' end,
         case when count(*) filter (where p.access = 'paid') > 0 then 'paid' else 'login' end
    into v_count, v_status, v_access
  from public.mcq_papers p
  where p.set_id = new.set_id;

  insert into public.paper_catalog
    (set_id, title, exam_id, kind, number, question_count, status, access, updated_at)
  values
    (new.set_id, v_title, v_exam, v_kind, v_num, coalesce(v_count, 0), coalesce(v_status, 'draft'),
     coalesce(v_access, 'login'), now())
  on conflict (set_id) do update
    set title          = excluded.title,
        exam_id        = excluded.exam_id,
        kind           = excluded.kind,
        number         = excluded.number,
        question_count = excluded.question_count,
        status         = excluded.status,
        access         = excluded.access,
        updated_at     = now();
  return null;
end
$$;
revoke execute on function public.mcq_papers_sync_catalog() from public, anon, authenticated;

update public.paper_catalog c
   set access = 'paid'
 where c.access <> 'paid'
   and exists (select 1 from public.mcq_papers p where p.set_id = c.set_id and p.access = 'paid');

-- ---------------------------------------------------------------------------
-- 7. Server-only functions (the Edge Functions call these with the service role)
-- ---------------------------------------------------------------------------

-- The price of a purchase, worked out here and nowhere else. Returns
-- {ok, error?, plan_id, title, units, days, base_paise, discount_paise, amount_paise, promo_code}.
create or replace function public.pass_quote(p_user uuid, p_plan text, p_units int, p_code text)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  pl    public.pass_plans%rowtype;
  pc    public.promo_codes%rowtype;
  v_code text := upper(btrim(coalesce(p_code, '')));
  base  int;
  disc  int := 0;
  used  int;
begin
  select * into pl from public.pass_plans where id = p_plan;
  if not found or not pl.active or pl.price_paise is null then
    return jsonb_build_object('ok', false, 'error', 'This pass is not on sale yet.');
  end if;
  if p_units is null or p_units < 1 or p_units > pl.max_units then
    return jsonb_build_object('ok', false, 'error',
      format('Choose from 1 to %s months.', pl.max_units));
  end if;
  base := pl.price_paise * p_units;

  if v_code <> '' then
    select * into pc from public.promo_codes c where c.code = v_code;
    if not found or not pc.active then
      return jsonb_build_object('ok', false, 'error', 'This promo code is not valid.');
    end if;
    if pc.valid_from is not null and now() < pc.valid_from then
      return jsonb_build_object('ok', false, 'error', 'This promo code cannot be used yet.');
    end if;
    if pc.valid_until is not null and now() >= pc.valid_until then
      return jsonb_build_object('ok', false, 'error', 'This promo code has expired.');
    end if;
    if pc.plan_id is not null and pc.plan_id <> pl.id then
      return jsonb_build_object('ok', false, 'error', 'This promo code is for a different pass.');
    end if;
    if pc.max_uses is not null then
      select count(*) into used from public.pass_orders o
       where o.promo_code = pc.code and o.status in ('paid', 'refunded');
      if used >= pc.max_uses then
        return jsonb_build_object('ok', false, 'error', 'This promo code has been used up.');
      end if;
    end if;
    if pc.once_per_student and exists (
      select 1 from public.pass_orders o
       where o.promo_code = pc.code and o.user_id = p_user and o.status in ('paid', 'refunded')
    ) then
      return jsonb_build_object('ok', false, 'error', 'You have already used this promo code.');
    end if;
    if pc.percent_off is not null then
      disc := round(base * pc.percent_off / 100.0)::int;
    else
      disc := pc.amount_off_paise;
    end if;
    disc := least(disc, base);
  end if;

  return jsonb_build_object(
    'ok', true, 'plan_id', pl.id, 'title', pl.title, 'units', p_units,
    'days', pl.days_per_unit * p_units, 'base_paise', base, 'discount_paise', disc,
    'amount_paise', base - disc, 'promo_code', nullif(v_code, ''));
end
$$;

-- Make an order from a fresh quote. Returns the quote plus order_id (or {ok:false, error}).
create or replace function public.pass_create_order(p_user uuid, p_plan text, p_units int, p_code text)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  qt  jsonb;
  oid uuid;
begin
  if p_user is null then
    return jsonb_build_object('ok', false, 'error', 'Please log in first.');
  end if;
  qt := public.pass_quote(p_user, p_plan, p_units, p_code);
  if not (qt ->> 'ok')::boolean then return qt; end if;
  insert into public.pass_orders
    (user_id, plan_id, units, days, base_paise, discount_paise, amount_paise, promo_code)
  values
    (p_user, qt ->> 'plan_id', (qt ->> 'units')::int, (qt ->> 'days')::int,
     (qt ->> 'base_paise')::int, (qt ->> 'discount_paise')::int, (qt ->> 'amount_paise')::int,
     qt ->> 'promo_code')
  returning id into oid;
  return qt || jsonb_build_object('order_id', oid);
end
$$;

-- Mark an order paid and give the pass. Safe to call twice (the browser and the webhook both may):
-- the row lock makes the second call wait, then it sees 'paid' and returns the same pass.
-- p_amount_paise, when given, must equal the order's amount (what Razorpay says was paid).
create or replace function public.pass_grant(p_order uuid, p_payment_id text, p_amount_paise int)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  o     public.pass_orders%rowtype;
  v_beg timestamptz;
  v_end timestamptz;
begin
  select * into o from public.pass_orders where id = p_order for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Order not found.');
  end if;
  if o.status = 'paid' then
    select starts_at, ends_at into v_beg, v_end from public.passes where order_id = o.id;
    -- A second, different payment on an order that is already paid is a double payment: say so,
    -- so it can be returned (owner's refund rule).
    if coalesce(btrim(p_payment_id), '') <> '' and p_payment_id is distinct from o.rzp_payment_id then
      update public.pass_orders
         set note = btrim(note || ' Double payment ' || p_payment_id || ': return it.')
       where id = o.id and position(p_payment_id in note) = 0;
      return jsonb_build_object('ok', true, 'already', true, 'double_payment', p_payment_id,
                                'starts_at', v_beg, 'ends_at', v_end);
    end if;
    return jsonb_build_object('ok', true, 'already', true, 'starts_at', v_beg, 'ends_at', v_end);
  end if;
  if o.status = 'refunded' then
    return jsonb_build_object('ok', false, 'error', 'This order was refunded.');
  end if;
  if p_amount_paise is not null and p_amount_paise <> o.amount_paise then
    return jsonb_build_object('ok', false, 'error', 'The amount paid does not match the order.');
  end if;
  if o.amount_paise > 0 and coalesce(btrim(p_payment_id), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'No payment for this order.');
  end if;

  -- A new pass starts when the student's last pass of this plan ends (or now), so no day is lost.
  select greatest(now(), coalesce(max(p.ends_at), now())) into v_beg
    from public.passes p where p.user_id = o.user_id and p.plan_id = o.plan_id;
  v_end := v_beg + make_interval(days => o.days);

  update public.pass_orders
     set status = 'paid', paid_at = now(),
         rzp_payment_id = coalesce(nullif(btrim(p_payment_id), ''), rzp_payment_id)
   where id = o.id;

  insert into public.passes (user_id, plan_id, order_id, source, starts_at, ends_at)
  values (o.user_id, o.plan_id, o.id, case when o.amount_paise = 0 then 'promo' else 'payment' end, v_beg, v_end);

  return jsonb_build_object('ok', true, 'already', false, 'starts_at', v_beg, 'ends_at', v_end);
end
$$;

revoke execute on function public.pass_quote(uuid, text, int, text)        from public, anon, authenticated;
revoke execute on function public.pass_create_order(uuid, text, int, text) from public, anon, authenticated;
revoke execute on function public.pass_grant(uuid, text, int)              from public, anon, authenticated;
grant  execute on function public.pass_quote(uuid, text, int, text)        to service_role;
grant  execute on function public.pass_create_order(uuid, text, int, text) to service_role;
grant  execute on function public.pass_grant(uuid, text, int)              to service_role;

-- The server (service role) writes orders and passes directly too (Razorpay ids, failed, refunded).
grant select, insert, update on public.pass_orders, public.passes, public.pass_plans, public.promo_codes
  to service_role;
grant select on public.paper_opens to service_role;

commit;

-- Checks (read back after applying):
--   select id, price_paise, days_per_unit, max_units, active from public.pass_plans;   -- all-access, null, 30, 6, false
--   select count(*) from public.mcq_papers where access = 'paid';                      -- 0 (nothing moved)
--   select policyname from pg_policies where tablename = 'mcq_papers' order by 1;      -- includes mcq_papers_paid_read
--   select set_id, access from public.paper_catalog where access = 'paid';             -- none yet
--
-- Undo (only with the owner's word; drops payment records):
--   drop table public.passes, public.pass_orders, public.paper_opens, public.promo_codes, public.pass_plans;
--   drop function public.pass_quote, public.pass_create_order, public.pass_grant,
--                 public.pass_orders_guard, public.pass_orders_end_pass;
--   drop policy "mcq_papers_paid_read" on public.mcq_papers;
--   alter table public.paper_catalog drop column access;
--   (and re-run 20261118120000 for the old body check, 20261112130000 section 4 for the old admin policies)
