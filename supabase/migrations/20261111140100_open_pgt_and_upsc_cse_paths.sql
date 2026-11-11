-- Migration: open the PGT and UPSC CSE paths in "Choose your path".
--
-- Owner, 2026-11-11: "open the PGT and UPSC CSE paths on /login/?path=1". Until now both rows were
-- 'coming_soon' (greyed out, with a "Notify me" button). 'active' makes them pickable like UGC NET.
-- Only the status changes; names, order and kind stay. Anyone who already pressed "Notify me" keeps
-- that request row (nothing is deleted).
-- Note: the site has a PGT hub (/exams/pgt/) but no UPSC CSE page yet; the dashboard shows UPSC CSE as a
-- label without a link until one exists.
--
-- Idempotent. One transaction.

begin;

update public.exams
   set status = 'active'
 where id in ('pgt', 'upsc-cse')
   and status is distinct from 'active';

commit;

-- Check: select id, status from public.exams where id in ('pgt', 'upsc-cse');  -- both 'active'
