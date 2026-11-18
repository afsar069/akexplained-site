-- Show the pass price before the pass is on sale (owner, 2026-11-18)
-- Razorpay's website review looks for the price on the site, but the pass goes on sale only after the
-- Razorpay keys work. So anyone may now read a plan that HAS a price, on sale or not; the /pass/ page shows
-- the price and "Payments open soon" until the owner ticks On sale. A plan with no price stays hidden.
-- Selling still needs active = true (pass_quote checks it). One policy changes; no data changes.

begin;

drop policy if exists "pass_plans_public_read" on public.pass_plans;
create policy "pass_plans_public_read" on public.pass_plans
  for select to anon, authenticated using ( active or price_paise is not null );

commit;
