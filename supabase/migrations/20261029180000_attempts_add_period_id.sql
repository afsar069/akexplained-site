-- Migration: add attempts.period_id.
--
-- Each answered question is already stored with the topic it was tagged with
-- (topic_id). This adds the literary PERIOD it was tagged with (period_id: one
-- of the child 'period' nodes in public.topics, e.g. 'elizabethan').
--
-- Why a column on the attempt itself:
--   * The questions live in JSON files, not in a table, so the database cannot
--     look a question's period up later.
--   * The attempt keeps the period it was answered under. If a question is
--     re-tagged years from now, old attempts do not silently change.
--
-- Nullable: existing rows are unaffected and stay null. Same style as topic_id:
-- plain text, no foreign key (the browser writes it; the reference list is
-- checked when the site is built, by tools/check-topics.js).
--
-- Idempotent: safe to run twice.
-- Wrapped in a transaction: all of it applies, or none of it does.

begin;

alter table public.attempts add column if not exists period_id text;

comment on column public.attempts.period_id is
  'The period node (topics.id, kind = period) the question was tagged with when it was answered; null if untagged.';

-- Read pattern: a user's attempts for one period.
create index if not exists attempts_user_period_idx on public.attempts (user_id, period_id);

commit;
