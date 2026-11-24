-- Migration: let an admin REPLACE a paper slot, even when a stale copy sits at the wrong level.
--
-- WHY (owner, 2026-11-24)
-- The owner tried to replace UP PGT MCQ Day 25 with a corrected file and the upload failed with
-- "These question ids already belong to another paper". The cause: the old Day 25 had been loaded at
-- level 'easy', but the Day pages read level 'medium', so the old copy never showed AND its question
-- ids (frozen) blocked the correct 'medium' file (same slot, other level = "another paper" to the
-- check trigger). Same-level replace already works (20261124, upload-paper.js auto-raises the rev);
-- what was missing is the ability to clear a stale copy at a WRONG level in the same slot.
--
-- Until now there was no DELETE on mcq_papers from the browser at all (owner's earlier rule). This
-- adds an admin-only DELETE so the upload page can remove a stale same-slot copy before saving the
-- correct file — "a correct new file replaces the old one" (owner's words). It also keeps
-- paper_catalog in step when a row is deleted.
--
-- WHAT IT ADDS
--   1. DELETE on public.mcq_papers for an admin only (one row in paper_admins), by grant + policy.
--   2. DELETE on public.paper_catalog for an admin only, so the sync trigger below can run as the
--      admin who deletes (SECURITY INVOKER).
--   3. A trigger that, after a paper row is deleted, recomputes that set's catalog row
--      (question_count, status) or drops it when the set has no rows left.
--
-- SECURITY
--   * Both admin policies use  exists (select 1 from public.paper_admins where user_id = auth.uid()),
--     the same test as every other admin policy. A guest or ordinary student can delete nothing.
--   * The service role (the connector) bypasses RLS as before; this changes only the browser path.
--   * The trigger function is SECURITY INVOKER with an empty search_path and EXECUTE revoked, so it
--     adds no advisor finding (as the insert/update sync function does).
--
-- Idempotent: safe to run twice. One transaction: all of it applies, or none of it does.

begin;

-- ---------------------------------------------------------------------------
-- 1. An admin may delete a paper row
-- ---------------------------------------------------------------------------

grant delete on public.mcq_papers to authenticated;  -- gated by the policy below

drop policy if exists "mcq_papers_admin_delete" on public.mcq_papers;
create policy "mcq_papers_admin_delete" on public.mcq_papers
  for delete to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = auth.uid()) );

-- ---------------------------------------------------------------------------
-- 2. An admin may delete a catalog row (the trigger below runs as the admin)
-- ---------------------------------------------------------------------------

grant delete on public.paper_catalog to authenticated;  -- gated by the policy below

drop policy if exists "paper_catalog_admin_delete" on public.paper_catalog;
create policy "paper_catalog_admin_delete" on public.paper_catalog
  for delete to authenticated
  using ( exists (select 1 from public.paper_admins a where a.user_id = auth.uid()) );

-- ---------------------------------------------------------------------------
-- 3. The catalog row follows a DELETE
-- ---------------------------------------------------------------------------

create or replace function public.mcq_papers_sync_catalog_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_count  int;
  v_status text;
begin
  select sum(jsonb_array_length(p.body -> 'questions'))::int,
         case when count(*) filter (where p.status <> 'live') = 0 then 'live' else 'draft' end
    into v_count, v_status
  from public.mcq_papers p
  where p.set_id = old.set_id;

  if v_count is null then
    -- No rows left for this set: drop its catalog row (so a fully-removed paper leaves no stale card).
    delete from public.paper_catalog where set_id = old.set_id;
  else
    -- Some levels remain (for example after removing one mis-levelled copy): keep count and status right.
    update public.paper_catalog
       set question_count = v_count, status = v_status, updated_at = now()
     where set_id = old.set_id;
  end if;
  return null;
end
$$;

comment on function public.mcq_papers_sync_catalog_delete() is
  'Trigger on mcq_papers DELETE: keeps paper_catalog in step — recompute the set''s count/status from the rows that remain, or drop the catalog row when the set has none left. SECURITY INVOKER on purpose.';

revoke execute on function public.mcq_papers_sync_catalog_delete() from public, anon, authenticated;

drop trigger if exists mcq_papers_sync_catalog_delete on public.mcq_papers;
create trigger mcq_papers_sync_catalog_delete
  after delete on public.mcq_papers
  for each row execute function public.mcq_papers_sync_catalog_delete();

commit;

-- Checks (read back after applying):
--   select polname, polcmd from pg_policy where polrelid = 'public.mcq_papers'::regclass and polcmd = 'd';
--   select polname, polcmd from pg_policy where polrelid = 'public.paper_catalog'::regclass and polcmd = 'd';
--   select tgname from pg_trigger where tgrelid = 'public.mcq_papers'::regclass and tgname = 'mcq_papers_sync_catalog_delete';
--
-- Rollback:
--   begin;
--   drop trigger if exists mcq_papers_sync_catalog_delete on public.mcq_papers;
--   drop function if exists public.mcq_papers_sync_catalog_delete();
--   drop policy if exists "mcq_papers_admin_delete" on public.mcq_papers;
--   drop policy if exists "paper_catalog_admin_delete" on public.paper_catalog;
--   revoke delete on public.mcq_papers from authenticated;
--   revoke delete on public.paper_catalog from authenticated;
--   commit;
