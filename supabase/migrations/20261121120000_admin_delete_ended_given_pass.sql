-- An admin can delete an ENDED free pass from /admin/payments/ (owner, 2026-11-21)
-- ---------------------------------------------------------------------------------
-- The owner asked: "when I stop someone's free pass, let me also delete it from the list."
-- Until now `passes` had no DELETE grant and no DELETE policy, so a free pass could only be stopped.
-- Now an admin may delete a pass only when ALL of these are true:
--   - source = 'admin'   (a free pass the owner gave; a paid or promo pass is never deleted from a browser)
--   - order_id is null   (it is not tied to a payment)
--   - it has ended       (ends_at <= now()), or it was stopped before it began (ends_at <= starts_at)
-- A running pass cannot be deleted (stop it first). A student can never delete anything: there is no policy for them.
-- Deleting an ended free pass changes nobody's access (it is already over). Orders and paper_opens are untouched.
-- One transaction. Safe to run twice.

begin;

grant delete on public.passes to authenticated;   -- admins only, by the policy below

drop policy if exists "passes_admin_delete_given" on public.passes;
create policy "passes_admin_delete_given" on public.passes
  for delete to authenticated
  using (
    exists (select 1 from public.paper_admins a where a.user_id = (select auth.uid()))
    and source = 'admin'
    and order_id is null
    and (ends_at <= now() or ends_at <= starts_at)
  );

commit;

-- Check: select policyname, cmd from pg_policies where tablename = 'passes' order by 1;   -- includes passes_admin_delete_given (DELETE)
-- Tested 2026-11-21 in a rolled-back transaction on the live database: a student deletes 0 rows (own ended free pass or
-- own paid pass); an admin deletes an ended free pass (1) and a free pass stopped before it began (1), and 0 rows of a
-- running free pass or of any paid-source pass.
-- Undo: drop policy "passes_admin_delete_given" on public.passes; revoke delete on public.passes from authenticated;
