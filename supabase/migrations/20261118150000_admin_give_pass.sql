-- An admin can give a student a free pass from /admin/payments/ (owner, 2026-11-18)
-- ---------------------------------------------------------------------------------
-- The owner asked: "can I give free access to an account myself, from my admin page?" Yes: an admin may insert a
-- pass with source = 'admin' (no order, no payment) for any student, and stop it early (the existing admin update
-- policy). Nothing else changes: students still only read their own passes; orders are untouched.
-- passes gets two small columns so the admin page can show why and by whom: note, created_by.
-- One transaction. Safe to run twice.

begin;

alter table public.passes add column if not exists note text not null default '';
alter table public.passes add column if not exists created_by uuid default auth.uid()
  references auth.users (id) on delete set null;

grant insert on public.passes to authenticated;   -- admins only, by the policy below

drop policy if exists "passes_admin_insert" on public.passes;
create policy "passes_admin_insert" on public.passes
  for insert to authenticated
  with check (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
    and source = 'admin'
    and order_id is null
    and ends_at > starts_at
    and ends_at <= starts_at + interval '3660 days'
  );

commit;

-- Check: select policyname from pg_policies where tablename = 'passes' order by 1;   -- includes passes_admin_insert
-- Undo: drop policy "passes_admin_insert" on public.passes; revoke insert on public.passes from authenticated;
