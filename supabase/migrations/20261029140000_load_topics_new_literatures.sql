-- Migration: load the New Literatures in English (Postcolonial) topic tree.
--
-- Source: supabase/data/taxonomy-new-literatures.csv (77 rows), supplied by
-- the owner and committed next to this file. Values copied as given.
--
-- Runs AFTER 20261027120000_topics_tree.sql. Separate top-level area: no id
-- clashes with the British, Criticism, American or Indian rows, and no parent
-- points outside this file.
--
-- Shape: four 'period' rows (African, Caribbean, Canadian, Australian); every
-- one of the 35 writers sits directly under one; Negritude is a 'movement'
-- sibling. Consistent with the flattened pattern.
--
-- Rows are listed parents-first, exactly in the file's order.
-- Idempotent: `on conflict (id) do nothing`.
-- Wrapped in a transaction: all 77 rows land, or none do.

begin;

insert into public.topics (id, name, parent_id, kind, sort_order) values
  -- New Literatures in English (Postcolonial)
  ('new-literatures-in-english', 'New Literatures in English (Postcolonial)', null, 'area', 5001),
  -- African Literature
  ('african-literature', 'African Literature', 'new-literatures-in-english', 'period', 5002),
  ('chinua-achebe', 'Chinua Achebe', 'african-literature', 'writer', 5003),
  ('things-fall-apart', 'Things Fall Apart', 'chinua-achebe', 'work', 5004),
  ('no-longer-at-ease', 'No Longer at Ease', 'chinua-achebe', 'work', 5005),
  ('arrow-of-god', 'Arrow of God', 'chinua-achebe', 'work', 5006),
  ('wole-soyinka', 'Wole Soyinka', 'african-literature', 'writer', 5007),
  ('death-and-the-kings-horseman', 'Death and the King''s Horseman', 'wole-soyinka', 'work', 5008),
  ('a-dance-of-the-forests', 'A Dance of the Forests', 'wole-soyinka', 'work', 5009),
  ('the-lion-and-the-jewel', 'The Lion and the Jewel', 'wole-soyinka', 'work', 5010),
  ('ngugi-wa-thiongo', 'Ngugi wa Thiong''o', 'african-literature', 'writer', 5011),
  ('weep-not-child', 'Weep Not, Child', 'ngugi-wa-thiongo', 'work', 5012),
  ('a-grain-of-wheat', 'A Grain of Wheat', 'ngugi-wa-thiongo', 'work', 5013),
  ('petals-of-blood', 'Petals of Blood', 'ngugi-wa-thiongo', 'work', 5014),
  ('decolonising-the-mind', 'Decolonising the Mind', 'ngugi-wa-thiongo', 'work', 5015),
  ('nadine-gordimer', 'Nadine Gordimer', 'african-literature', 'writer', 5016),
  ('julys-people', 'July''s People', 'nadine-gordimer', 'work', 5017),
  ('j-m-coetzee', 'J. M. Coetzee', 'african-literature', 'writer', 5018),
  ('disgrace', 'Disgrace', 'j-m-coetzee', 'work', 5019),
  ('waiting-for-the-barbarians', 'Waiting for the Barbarians', 'j-m-coetzee', 'work', 5020),
  ('foe', 'Foe', 'j-m-coetzee', 'work', 5021),
  ('ben-okri', 'Ben Okri', 'african-literature', 'writer', 5022),
  ('the-famished-road', 'The Famished Road', 'ben-okri', 'work', 5023),
  ('buchi-emecheta', 'Buchi Emecheta', 'african-literature', 'writer', 5024),
  ('the-joys-of-motherhood', 'The Joys of Motherhood', 'buchi-emecheta', 'work', 5025),
  ('chimamanda-ngozi-adichie', 'Chimamanda Ngozi Adichie', 'african-literature', 'writer', 5026),
  ('half-of-a-yellow-sun', 'Half of a Yellow Sun', 'chimamanda-ngozi-adichie', 'work', 5027),
  ('purple-hibiscus', 'Purple Hibiscus', 'chimamanda-ngozi-adichie', 'work', 5028),
  ('tsitsi-dangarembga', 'Tsitsi Dangarembga', 'african-literature', 'writer', 5029),
  ('nervous-conditions', 'Nervous Conditions', 'tsitsi-dangarembga', 'work', 5030),
  ('athol-fugard', 'Athol Fugard', 'african-literature', 'writer', 5031),
  ('sizwe-banzi-is-dead', 'Sizwe Banzi Is Dead', 'athol-fugard', 'work', 5032),
  ('bessie-head', 'Bessie Head', 'african-literature', 'writer', 5033),
  ('leopold-senghor', 'Leopold Sedar Senghor', 'african-literature', 'writer', 5034),
  ('negritude', 'Negritude', 'african-literature', 'movement', 5035),
  -- Caribbean Literature
  ('caribbean-literature', 'Caribbean Literature', 'new-literatures-in-english', 'period', 5036),
  ('derek-walcott', 'Derek Walcott', 'caribbean-literature', 'writer', 5037),
  ('omeros', 'Omeros', 'derek-walcott', 'work', 5038),
  ('a-far-cry-from-africa', 'A Far Cry from Africa', 'derek-walcott', 'work', 5039),
  ('v-s-naipaul', 'V. S. Naipaul', 'caribbean-literature', 'writer', 5040),
  ('a-house-for-mr-biswas', 'A House for Mr Biswas', 'v-s-naipaul', 'work', 5041),
  ('a-bend-in-the-river', 'A Bend in the River', 'v-s-naipaul', 'work', 5042),
  ('george-lamming', 'George Lamming', 'caribbean-literature', 'writer', 5043),
  ('in-the-castle-of-my-skin', 'In the Castle of My Skin', 'george-lamming', 'work', 5044),
  ('jean-rhys', 'Jean Rhys', 'caribbean-literature', 'writer', 5045),
  ('wide-sargasso-sea', 'Wide Sargasso Sea', 'jean-rhys', 'work', 5046),
  ('kamau-brathwaite', 'Kamau Brathwaite', 'caribbean-literature', 'writer', 5047),
  ('jamaica-kincaid', 'Jamaica Kincaid', 'caribbean-literature', 'writer', 5048),
  ('caryl-phillips', 'Caryl Phillips', 'caribbean-literature', 'writer', 5049),
  ('earl-lovelace', 'Earl Lovelace', 'caribbean-literature', 'writer', 5050),
  -- Canadian Literature
  ('canadian-literature', 'Canadian Literature', 'new-literatures-in-english', 'period', 5051),
  ('margaret-atwood', 'Margaret Atwood', 'canadian-literature', 'writer', 5052),
  ('the-handmaids-tale', 'The Handmaid''s Tale', 'margaret-atwood', 'work', 5053),
  ('surfacing', 'Surfacing', 'margaret-atwood', 'work', 5054),
  ('the-blind-assassin', 'The Blind Assassin', 'margaret-atwood', 'work', 5055),
  ('margaret-laurence', 'Margaret Laurence', 'canadian-literature', 'writer', 5056),
  ('the-stone-angel', 'The Stone Angel', 'margaret-laurence', 'work', 5057),
  ('alice-munro', 'Alice Munro', 'canadian-literature', 'writer', 5058),
  ('dance-of-the-happy-shades', 'Dance of the Happy Shades', 'alice-munro', 'work', 5059),
  ('michael-ondaatje', 'Michael Ondaatje', 'canadian-literature', 'writer', 5060),
  ('the-english-patient', 'The English Patient', 'michael-ondaatje', 'work', 5061),
  ('robertson-davies', 'Robertson Davies', 'canadian-literature', 'writer', 5062),
  ('mordecai-richler', 'Mordecai Richler', 'canadian-literature', 'writer', 5063),
  ('carol-shields', 'Carol Shields', 'canadian-literature', 'writer', 5064),
  -- Australian Literature
  ('australian-literature', 'Australian Literature', 'new-literatures-in-english', 'period', 5065),
  ('patrick-white', 'Patrick White', 'australian-literature', 'writer', 5066),
  ('voss', 'Voss', 'patrick-white', 'work', 5067),
  ('the-tree-of-man', 'The Tree of Man', 'patrick-white', 'work', 5068),
  ('a-d-hope', 'A. D. Hope', 'australian-literature', 'writer', 5069),
  ('judith-wright', 'Judith Wright', 'australian-literature', 'writer', 5070),
  ('les-murray', 'Les Murray', 'australian-literature', 'writer', 5071),
  ('david-malouf', 'David Malouf', 'australian-literature', 'writer', 5072),
  ('peter-carey', 'Peter Carey', 'australian-literature', 'writer', 5073),
  ('oscar-and-lucinda', 'Oscar and Lucinda', 'peter-carey', 'work', 5074),
  ('thomas-keneally', 'Thomas Keneally', 'australian-literature', 'writer', 5075),
  ('schindlers-ark', 'Schindler''s Ark', 'thomas-keneally', 'work', 5076),
  ('henry-lawson', 'Henry Lawson', 'australian-literature', 'writer', 5077)
on conflict (id) do nothing;

commit;
