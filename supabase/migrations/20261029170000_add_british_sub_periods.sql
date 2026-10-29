-- Migration: add the 18 British sub-period nodes.
--
-- The 10 British age nodes (old-english, middle-english, ...) stay as they are
-- and become PARENTS. The site's own literary periods (the cards on /quizzes/daily/)
-- are added as child nodes, kind = 'period'. Each question is then tagged with a
-- periodId (one of these 18 nodes) next to its topicId.
--
-- Source: supabase/data/taxonomy-master-reference.csv (the 18 new rows). Ids and
-- parents are the owner's table. Names and years are the Daily page's own wording.
-- Three ids carry an "-era" suffix because the plain slug is already an age node:
-- jacobean-era, restoration-era, modern-era.
-- The Renaissance (1500-1660) and Neoclassical (1660-1785) banks get NO node:
-- each spans two ages, so their questions are tagged one by one.
--
-- Runs AFTER the British topic load (20261027130000_load_topics_british.sql):
-- every parent below already exists, so the self-referencing FK holds.
-- Existing writers and works keep their current parents; nothing is moved.
--
-- sort_order: each node sits after the last existing row of its parent's block,
-- in date order. No existing sort_order is touched.
--
-- Idempotent: `on conflict (id) do nothing`. A second run inserts nothing.
-- It does NOT update a row that already exists.
--
-- Wrapped in a transaction: all 18 rows land, or none do.

begin;

insert into public.topics (id, name, parent_id, kind, sort_order) values
  -- under old-english
  ('anglo-saxon', 'Anglo-Saxon Period (450-1066)', 'old-english', 'period', 135),
  -- under middle-english
  ('anglo-norman', 'Anglo-Norman Period (1066-1340)', 'middle-english', 'period', 231),
  ('age-of-chaucer', 'Age of Chaucer (1340-1400)', 'middle-english', 'period', 232),
  ('fifteenth-century', 'Fifteenth Century (1400-1500)', 'middle-english', 'period', 233),
  -- under renaissance
  ('early-tudor', 'Early Tudor Period (1500-1558)', 'renaissance', 'period', 363),
  ('elizabethan', 'Elizabethan Age (1558-1603)', 'renaissance', 'period', 364),
  -- under jacobean
  ('jacobean-era', 'Jacobean Age (1603-1625)', 'jacobean', 'period', 457),
  ('caroline', 'Caroline Age (1625-1649)', 'jacobean', 'period', 458),
  ('commonwealth', 'Commonwealth Period (1649-1660)', 'jacobean', 'period', 459),
  -- under restoration
  ('restoration-era', 'Restoration Age (1660-1700)', 'restoration', 'period', 532),
  -- under augustan-age
  ('augustan', 'Augustan Age (1700-1745)', 'augustan-age', 'period', 674),
  ('age-of-sensibility', 'Age of Sensibility (1745-1785)', 'augustan-age', 'period', 675),
  -- under romantic-age
  ('romantic', 'Romantic Period (1785-1832)', 'romantic-age', 'period', 760),
  -- under victorian-age
  ('victorian', 'Victorian Period (1832-1901)', 'victorian-age', 'period', 887),
  -- under modern
  ('edwardian', 'Edwardian Period (1901-1914)', 'modern', 'period', 981),
  ('georgian', 'Georgian Period (1910-1936)', 'modern', 'period', 982),
  ('modern-era', 'Modern Period (1914-1945)', 'modern', 'period', 983),
  -- under contemporary
  ('postmodern', 'Postmodern Period (1945-)', 'contemporary', 'period', 1057)
on conflict (id) do nothing;

commit;
