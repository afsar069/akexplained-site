-- Migration: add kind / institution / level to exams, and add 8 degree tracks.
--
-- Runs AFTER the exams table exists (migration 20261025120000_*).
--
-- Why:
--   The signup screen groups options into three families — Competitive exams /
--   University degree / Literature journey — and the UI shows the university and
--   the level (BA/MA) as separate fields instead of parsing the name string.
--   So exams gets a `kind` (the family), plus `institution` and `level` for the
--   degree tracks. BA and MA are ALWAYS separate tracks with separate syllabi.

-- =====================================================================
-- New columns
-- =====================================================================
-- `kind` is added nullable first so the existing rows can be backfilled, then
-- made NOT NULL with a CHECK. `institution` and `level` are null for anything
-- that is not a university degree.

alter table public.exams add column kind        text;
alter table public.exams add column institution text;
alter table public.exams add column level       text;

comment on column public.exams.kind is
  'Which family the row belongs to: exam, degree, or journey.';
comment on column public.exams.institution is
  'University name for a degree track; null for competitive exams.';
comment on column public.exams.level is
  'Degree level: ''ba'' or ''ma''; null for non-degree rows.';

-- =====================================================================
-- Backfill kind for the rows that already exist
-- =====================================================================

update public.exams
  set kind = 'exam'
  where id in ('ugc-net', 'gate', 'cuet-pg', 'upsc-cse', 'pgt', 'tgt', 'state-psc');

update public.exams
  set kind = 'journey'
  where id = 'literature-journey';

-- =====================================================================
-- Enforce kind (NOT NULL + allowed values) and validate level
-- =====================================================================
-- These run after the backfill so no existing row violates NOT NULL.
-- `level in (...)` allows NULL automatically, so non-degree rows are fine.

alter table public.exams alter column kind set not null;
alter table public.exams add constraint exams_kind_check
  check (kind in ('exam', 'degree', 'journey'));
alter table public.exams add constraint exams_level_check
  check (level in ('ba', 'ma'));

-- =====================================================================
-- Add the 8 university degree tracks (all coming_soon for now)
-- =====================================================================
-- BA and MA are separate rows / separate tracks. The owner switches each to
-- 'active' once its syllabus is mapped to topics. Names are exactly as supplied;
-- institution and level are split out so the UI need not parse the name.

insert into public.exams (id, name, status, sort_order, kind, institution, level) values
  ('ccsu-ba',  'CCS University Meerut - BA English',    'coming_soon', 10, 'degree', 'CCS University Meerut',       'ba'),
  ('ccsu-ma',  'CCS University Meerut - MA English',    'coming_soon', 11, 'degree', 'CCS University Meerut',       'ma'),
  ('du-ba',    'Delhi University - BA English',         'coming_soon', 12, 'degree', 'Delhi University',            'ba'),
  ('du-ma',    'Delhi University - MA English',         'coming_soon', 13, 'degree', 'Delhi University',            'ma'),
  ('amu-ba',   'Aligarh Muslim University - BA English','coming_soon', 14, 'degree', 'Aligarh Muslim University',   'ba'),
  ('amu-ma',   'Aligarh Muslim University - MA English','coming_soon', 15, 'degree', 'Aligarh Muslim University',   'ma'),
  ('ignou-ba', 'IGNOU - BA English',                    'coming_soon', 16, 'degree', 'IGNOU',                       'ba'),
  ('ignou-ma', 'IGNOU - MA English',                    'coming_soon', 17, 'degree', 'IGNOU',                       'ma')
on conflict (id) do nothing;
