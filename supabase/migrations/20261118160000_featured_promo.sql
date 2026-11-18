-- Show one promo code on the pass page (owner, 2026-11-18: "FIRSTIME50 ye promo code isi table pe bhi daal do")
-- ----------------------------------------------------------------------------------------------------------
-- promo_codes stays admin-only (a student never lists codes). Instead the plan names the ONE code to show to
-- everyone, with a short label the admin page writes from the code itself (for example "Rs 50 off").
-- pass_plans is already public for a plan that has a price, so the pass page can read these two columns.
-- The code is still checked by the server when it is used (dates, limits, once per student).
-- One transaction. Safe to run twice.

begin;

alter table public.pass_plans add column if not exists featured_promo text
  references public.promo_codes (code) on delete set null;
alter table public.pass_plans add column if not exists featured_label text not null default '';

comment on column public.pass_plans.featured_promo is
  'The one promo code shown to everyone on /pass/ (null = none). Set on /admin/payments/.';
comment on column public.pass_plans.featured_label is
  'What the shown code gives, written by the admin page from the code, e.g. "Rs 50 off".';

commit;
