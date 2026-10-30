-- Migration: add 9 missing nodes (the owner-approved second batch).
--
-- Why: questions already on the site are about these, and without a node they could only be tagged
-- to their period (or to a nearby device such as blank verse). Each one is named in an existing question.
--
--   vorticism ......................... concept, under modern
--   war-of-the-theatres ............... concept, under renaissance (the Poetomachia, 1599-1601)
--   gorboduc .......................... work, under renaissance (two authors, so it sits under the age,
--                                       as The Revenger's Tragedy sits under jacobean)
--   thomas-norton, thomas-sackville ... writers, under renaissance
--   three-estates ..................... concept, under middle-english
--   samuel-butler-hudibras ............ writer, under restoration. The Victorian samuel-butler is NOT touched.
--   ohthere-and-wulfstan .............. concept, under old-english (the voyages in the Old English Orosius)
--   theatrical-licensing-act-1737 ..... concept, under augustan-age (not the 1662 or 1695 press licensing acts)
--
-- Source: supabase/data/taxonomy-master-reference.csv and taxonomy-british-v2.csv (the 9 new rows).
-- sort_order continues after the last British row (1309); only siblings are ordered by it.
--
-- Runs AFTER 20261030120000_add_writers_schools_and_world_literature.sql. Every parent already exists.
-- Idempotent: `on conflict (id) do nothing`. One transaction: all 9 rows land, or none do.
-- Before: 1702 rows. After: 1711.

begin;

insert into public.topics (id, name, parent_id, kind, sort_order) values
  ('ohthere-and-wulfstan', 'Ohthere and Wulfstan', 'old-english', 'concept', 1310),
  ('three-estates', 'The Three Estates', 'middle-english', 'concept', 1311),
  ('war-of-the-theatres', 'The War of the Theatres', 'renaissance', 'concept', 1312),
  ('gorboduc', 'Gorboduc', 'renaissance', 'work', 1313),
  ('thomas-norton', 'Thomas Norton', 'renaissance', 'writer', 1314),
  ('thomas-sackville', 'Thomas Sackville', 'renaissance', 'writer', 1315),
  ('samuel-butler-hudibras', 'Samuel Butler (Hudibras)', 'restoration', 'writer', 1316),
  ('theatrical-licensing-act-1737', 'The Theatrical Licensing Act (1737)', 'augustan-age', 'concept', 1317),
  ('vorticism', 'Vorticism', 'modern', 'concept', 1318)
on conflict (id) do nothing;

commit;

-- Check (run after): this should return 1711.
--   select count(*) from public.topics;
