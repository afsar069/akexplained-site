-- Migration: add 21 thinkers named in the live Literary Theory chapter articles (kind = 'writer').
--
-- Why: the Literary Theory MCQ plan (docs/literary-theory-mcq-plan.md, 2026-11-27) found that 21 thinkers named in
-- the ten live chapter articles had no node in the master taxonomy, so a question about them could only be tagged
-- to the area node. The owner approved the 21 nodes on 2026-11-27 ("i approve 21 nodes"). Nothing else is added:
-- no school, concept or period node (the owner did not approve any), and no existing node is moved or renamed.
--
-- Names are exactly as the articles' own "Critics and works" tables print them.
-- Parent (CLAUDE.md rule 11): a writer sits under its school where the owner's tree already has the school AND the
-- writer's peers sit there. Where no real school node exists, the writer sits directly under the area, as A. C. Bradley
-- and the two Leavises do (re-parent later with one UPDATE if the owner adds a school). So:
--   yuri-tynianov ........................ russian-formalism       (peers: Shklovsky, Jakobson, Propp, Eichenbaum)
--   louise-rosenblatt, norman-n-holland .. reader-response-criticism (peers: Iser, Jauss, Fish)
--   the other 18 ......................... literary-criticism-and-theory (the area)
-- Same-name rule (rule 12): E. D. Hirsch is added in full; a later "Hirsch" (Trauma chapter) is a different question.
--
--   Phenomenology and Hermeneutics: Husserl, Heidegger, Gadamer, Ricoeur, Schleiermacher, Dilthey, Ingarden, E. D. Hirsch
--   Reader-Response: Rosenblatt, Holland          Bakhtin: Bakhtin, Voloshinov, Medvedev
--   Semiotics: Peirce, Eco                         Formalism: Tynianov, Mukarovsky
--   Narratology: Bal, Prince, Chatman              Introduction: Hoggart
--
-- Source: supabase/data/taxonomy-criticism.csv and taxonomy-master-reference.csv (the 21 new rows).
-- sort_order continues after the last Criticism row (2210); only siblings are ordered by it.
--
-- Runs AFTER the criticism load. The three parents already exist. Idempotent: `on conflict (id) do nothing`.
-- One transaction: all 21 rows land, or none do. Before: 1717 rows. After: 1738.

begin;

insert into public.topics (id, name, parent_id, kind, sort_order) values
  ('edmund-husserl',            'Edmund Husserl',            'literary-criticism-and-theory', 'writer', 2211),
  ('martin-heidegger',          'Martin Heidegger',          'literary-criticism-and-theory', 'writer', 2212),
  ('hans-georg-gadamer',        'Hans-Georg Gadamer',        'literary-criticism-and-theory', 'writer', 2213),
  ('paul-ricoeur',              'Paul Ricoeur',              'literary-criticism-and-theory', 'writer', 2214),
  ('friedrich-schleiermacher',  'Friedrich Schleiermacher',  'literary-criticism-and-theory', 'writer', 2215),
  ('wilhelm-dilthey',           'Wilhelm Dilthey',           'literary-criticism-and-theory', 'writer', 2216),
  ('roman-ingarden',            'Roman Ingarden',            'literary-criticism-and-theory', 'writer', 2217),
  ('e-d-hirsch',                'E. D. Hirsch',              'literary-criticism-and-theory', 'writer', 2218),
  ('louise-rosenblatt',         'Louise Rosenblatt',         'reader-response-criticism',     'writer', 2219),
  ('norman-n-holland',          'Norman N. Holland',         'reader-response-criticism',     'writer', 2220),
  ('mikhail-bakhtin',           'Mikhail Bakhtin',           'literary-criticism-and-theory', 'writer', 2221),
  ('valentin-voloshinov',       'Valentin Voloshinov',       'literary-criticism-and-theory', 'writer', 2222),
  ('pavel-medvedev',            'Pavel Medvedev',            'literary-criticism-and-theory', 'writer', 2223),
  ('charles-sanders-peirce',    'Charles Sanders Peirce',    'literary-criticism-and-theory', 'writer', 2224),
  ('umberto-eco',               'Umberto Eco',               'literary-criticism-and-theory', 'writer', 2225),
  ('yuri-tynianov',             'Yuri Tynianov',             'russian-formalism',             'writer', 2226),
  ('jan-mukarovsky',            'Jan Mukařovský',            'literary-criticism-and-theory', 'writer', 2227),
  ('mieke-bal',                 'Mieke Bal',                 'literary-criticism-and-theory', 'writer', 2228),
  ('gerald-prince',             'Gerald Prince',             'literary-criticism-and-theory', 'writer', 2229),
  ('seymour-chatman',           'Seymour Chatman',           'literary-criticism-and-theory', 'writer', 2230),
  ('richard-hoggart',           'Richard Hoggart',           'literary-criticism-and-theory', 'writer', 2231)
on conflict (id) do nothing;

commit;

-- Check (run after): this should return 1738, and the second query 21 rows.
--   select count(*) from public.topics;
--   select id, name, kind, parent_id from public.topics where sort_order between 2211 and 2231 order by sort_order;
