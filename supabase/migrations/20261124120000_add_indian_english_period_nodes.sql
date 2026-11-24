-- Migration: add the six Indian English period nodes (one per notes article).
--
-- Why: the Indian English MCQ plan (CLAUDE.md rule 3, 2026-11-24) has six hubs, one per notes article. A question in
-- one of their sets needs a `periodId`, and the database accepts only a `kind = 'period'` node
-- (mcq_papers_check_body). The Indian area had only five genre nodes (iwe-beginnings, iwe-poetry, iwe-fiction,
-- iwe-drama, iwe-prose), none for the six articles. The owner said (2026-11-24): "if there is none, build it".
--
-- Same pattern as the American ages: the id is the notes article's `age:` front-matter value, and the node sits
-- directly under the area. The name is the hub's own name on /quizzes/mcq/ (_data/mcqSpec.json).
--
--   indian-english-introduction ...... Indian English: Introduction
--   indian-english-beginnings ........ Indian English: Beginnings to 1857
--   indian-english-early-growth ...... Indian English: 1857 to 1920
--   indian-english-freedom-years ..... Indian English: 1920 to 1947
--   indian-english-independence-era .. Indian English: 1947 to 1980
--   indian-english-late-twentieth .... Indian English: 1980 to 2000
--
-- Nothing is moved or renamed: the five genre nodes and every writer and work under them stay exactly where
-- they are. These six are new, empty period nodes; a writer is not re-parented.
-- When the seventh article (2000 to the present) is written, its node is added the same way.
--
-- Source: supabase/data/taxonomy-indian.csv and taxonomy-master-reference.csv (the 6 new rows).
-- sort_order continues after the last Indian row (4118); only siblings are ordered by it.
--
-- Runs AFTER 20261029130000_load_topics_indian.sql. The parent (indian-writing-in-english) already exists.
-- Idempotent: `on conflict (id) do nothing`. One transaction: all 6 rows land, or none do.
-- Before: 1711 rows. After: 1717.

begin;

insert into public.topics (id, name, parent_id, kind, sort_order) values
  ('indian-english-introduction', 'Indian English: Introduction', 'indian-writing-in-english', 'period', 4119),
  ('indian-english-beginnings', 'Indian English: Beginnings to 1857', 'indian-writing-in-english', 'period', 4120),
  ('indian-english-early-growth', 'Indian English: 1857 to 1920', 'indian-writing-in-english', 'period', 4121),
  ('indian-english-freedom-years', 'Indian English: 1920 to 1947', 'indian-writing-in-english', 'period', 4122),
  ('indian-english-independence-era', 'Indian English: 1947 to 1980', 'indian-writing-in-english', 'period', 4123),
  ('indian-english-late-twentieth', 'Indian English: 1980 to 2000', 'indian-writing-in-english', 'period', 4124)
on conflict (id) do nothing;

commit;

-- Check (run after): this should return 1717, and the second query 6 rows.
--   select count(*) from public.topics;
--   select id, name, kind, parent_id from public.topics where id like 'indian-english-%' order by sort_order;
