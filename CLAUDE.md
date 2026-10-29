# AK Explained — working rules

## 1. Site text is in simple English. Always.
Anything a visitor can read — headings, labels, buttons, form hints, error
messages, empty states, alt text — is written in **simple, plain English**.
**No Hinglish on the site.** This holds even when the conversation is in Hinglish.

Code comments may stay in Hinglish; they are for the maintainers, not visitors.

## 2. Nothing is invented
Dates, authorship, syllabus details, subscriber counts, student reviews, video
titles — none of it is made up. If a fact is not supplied or verifiable, leave a
placeholder and ask. The site's own About page states this rule to readers, so
breaking it breaks a promise already made.

## 3. Structure
- `index.html` — landing page (plain HTML + `assets/home.css` + `assets/home.js`)
- `_includes/base.njk` — layout for markdown article pages (Pages CMS publishes these)
- Other `*/index.html` — hub and utility pages, standalone HTML
- `quizzes/mcq/<age>/…` (hub, `build/`, `custom/`, `set-<n>/`) is **generated**, not hand-written:
  templates in `quizzes/mcq/_templates/` and `_includes/mcq-page.njk`, data in `_data/mcqSpec.json`
  (see rule 7). Change the template or the registry, never a generated page.
  `quizzes/mcq/index.html` (all ages) is still hand-written.
- `quizzes/daily/<period>/index.html` — instant-quiz hub for one period (hand-written, standalone).
  Engine `assets/instant.js`, questions in `assets/instant/` (see rule 8). Open so far: `anglo-saxon/`, `anglo-norman/`, `age-of-chaucer/`, `fifteenth-century/`, `renaissance/`, `early-tudor/`, `elizabethan/`, `jacobean/`, `caroline/`, `commonwealth/`, `neoclassical/`, `restoration/`, `augustan/`, `age-of-sensibility/`, `romantic/`, `victorian/`, `edwardian/`, `georgian/`, `modern/`, `postmodern/` (all 20 periods are open).
- `assets/site.css` — everything shared; `eleventy.config.js` syncs the header,
  footer, page-head motif and `nav.js` into every built page

The list of literary periods (20, from Old English to Postmodern) is the same on three pages and
must stay in step: `_data/mcqSpec.json` (+ the cards in `quizzes/mcq/index.html` and the slugs in
`assets/mcq.js`), the cards in `quizzes/daily/index.html` (and its period filter, one option per age), and `ages` in `assets/home.js`.
The timeline page `english-literature/index.html` shows the same 20 ages (one small tile each, 6 to a line on a wide screen, same names, years, writers, pictures and notes link as `ages` in `assets/home.js`), so it must stay in step too.
Names, years and pictures come from the Daily page. Invent none of them.

The menu lives in three places and must stay in step: `_includes/base.njk` and the
sidebar markup copied into `index.html` and `404.html` (every other page gets it from base.njk at build).

## 4. Before pushing
`npx eleventy` must build clean, and no internal link may 404.

## 5. Deploys
Work goes on the feature branch. Merging to `main` publishes to akexplained.com,
so do that only when asked.

## 6. Off for now
- `write-a-review/` — built form, excluded from the build in `eleventy.config.js`.
  Turns on with student accounts; remove the one ignore line.
- Reviews on the home page show "Coming soon" until then. Published reviews live
  in `assets/reviews.json` (Pages CMS → Student Reviews).

## 7. MCQ question sets
Question files are made with `tools/mcq-skill/SKILL.md` (by Claude Work or another AI) and
arrive in the final format: `<age>-set-<n>-easy.json`, `-medium.json` and a `-report.md`.
Every question carries `src` (the page that proves it); the site does not show it yet.
To publish a set:
1. `python3 tools/mcq-skill/validate_mcq.py <easy> <medium> --notes notes/<article>/index.md --others <other sets' files of the age>` — no errors.
2. Spot-check about ten questions against their `src`, and every one a warning or the report flags.
   Fix or replace a wrong one; never keep a guess.
3. Files go to `assets/questions/`.
4. `_data/mcqSpec.json` is the registry. An age with no `sets` gets a "questions coming soon" hub
   (noindex, not linked from `/quizzes/mcq/`). To plan an age, add its `sets` (number, title, one-line
   meta, topics, levels) and the hub `topics` list; the owner supplies these, never invent them.
   To open a set, set `"live": true` and give it `lede`, `titleCase` (and `focus` if it has one).
   `rev` is read from the files. The hub row, build page, custom test and the set and review pages
   are then generated; the build stops with a message if a live set's file is missing.
5. `assets/mcq.js`: every age card on `/quizzes/mcq/` links to its hub. `SOON_HUBS` = hub open, no
   questions yet (card keeps saying "Questions coming soon"). When an age's first set goes live, move
   its slug to `LIVE_AGES` (card shows progress).
6. `npx eleventy`, link check, browser test, push the branch. `main` only when asked (rule 5).
`tools/` is ignored by the build and is not published.

## 8. Instant quiz (Daily page)
The goal is to get the reader into a quiz in as few taps as possible. Start must work with no choices.

**How it works now** (do not re-explain it to the owner, and do not change it unless asked):
- The reader picks Easy or Hard and 10 to 50 questions (default Easy, 10), taps an answer and sees
  right or wrong and the reason at once. The result lists the questions missed.
  Page `/quizzes/daily/<period>/`; the period's card on `/quizzes/daily/` links to it ("Start Quiz →").
- Question file `assets/instant/<period>-<level>.json`:
  `{bankId, period, level, rev, questions:[{id, question, options, correct_option_id, explanation?}]}`.
  `explanation` is optional (the Age of Chaucer files have none): without it the reader sees right or
  wrong and the right answer, and no reason. Never write a reason for the owner. On such a page the text
  must not say "with the reason" (meta, About list). If reasons arrive later, add them and raise `rev`.
  The question text is the owner's and stays exactly as supplied; only `id` and `rev` are added.
  Ids never change or get renumbered: readers' records and the future dashboard hang on them. Prefix per
  period, then `e` or `h`, then the number: `as-e-01` Anglo-Saxon, `an-h-01` Anglo-Norman, `ac-e-01` Age of Chaucer, `fc-e-01` Fifteenth Century, `rn-e-01` Renaissance Period, `et-e-01` Early Tudor Period, `el-e-01` Elizabethan Age, `jb-e-01` Jacobean Age, `cr-e-01` Caroline Age, `cw-e-01` Commonwealth Period, `nc-e-01` Neoclassical Period, `rs-e-01` Restoration Age, `au-e-01` Augustan Age, `sn-e-01` Age of Sensibility (not `as-`, that is Anglo-Saxon), `rm-e-01` Romantic Period, `vc-e-01` Victorian Period, `ed-e-01` Edwardian Period, `gr-e-01` Georgian Period, `md-e-01` Modern Period, `pm-e-01` Postmodern Period (Literature bank
  of a period: `asl-`, `anl-`, `acl-`, `fcl-`, `rnl-`, `etl-`, `ell-`, `jbl-`, `crl-`, `cwl-`, `ncl-`, `rsl-`, `aul-`, `snl-`, `rml-`, `vcl-`, `edl-`, `grl-`, `mdl-`, `pml-`). If a question's meaning changes, raise `rev`.
- The engine shuffles options, except an option that points at the others ("All of the above",
  "Both A and B") and True / False (2 options, kept in that order). Order of questions: never seen, then missed, then right.
- Progress stays in this browser only (`akd:<bank>:v1`, per question id) so it can move to an account later.
- **Answering must never scroll the page** (focus is set with `preventScroll`). The owner asked for
  this. Keep it in every new quiz screen. A screen change may scroll only if its top is out of view.
- Site text never promises "a new set every day".
- Planned after login: the dashboard shows these results, and the level moves up by how many questions
  were done and how much was read. The owner gives the rule for moving up. Never invent thresholds.

**When the owner sends question files for it**
1. The owner marks them verified: do not re-check the facts. If something stood out while reading,
   say so once and leave it as it is. Do run the structure check (counts, 4 options, or 2 for a
   True / False question, `correct_option_id` in range, no duplicate questions).
2. **Duplicate check against every live file of the same period** (compare the question text).
   If the files are the same questions, even with the options in another order, STOP. Add nothing, tell
   the owner what matched, and ask for the right files. (This happened once: a "Literature" upload was
   the Age questions again, with the options shuffled.)
3. Genuinely new questions for another period: copy the Anglo-Saxon hub page and change only the period's
   words (title, meta, banner line and colour from `_data/mcqSpec.json`, notes link, the two level lines,
   the "It covers" line from the real questions, `data-bank`, `data-src`), add the pair of files, open the
   card on the Daily page ("Start Quiz →"), add the page to `sitemap.xml`. Anglo-Norman was done this way.
   Keep the supplied text as it is. If words look damaged (for example a lost apostrophe, "Wit s"),
   list them for the owner, and fix only if they say so.
   When the owner then says to fix or check a flagged question: verify it with a reliable source (web
   search; say which, and say what could not be opened), change as little as possible, keep the id, and
   keep the right option unless the fact itself was wrong. Do not add questions or reasons of your own.
   Two questions that repeat each other are left as they are: replacing one needs a new question from the owner.
4. `npx eleventy`, link check, browser test (default start, 10 to 50 limits, instant answer, no scroll
   on answer, resume), push the branch. `main` only when asked (rule 5).

**Planned, waiting for the real files: a second bank, "The Literature"**
The Anglo-Saxon bank now (50 easy, 50 hard) is based on the *age*. A second 100 (50 easy, 50 hard) based
on *literature* is still to come. When the real files arrive (after the duplicate check above):
- Add them next to the first bank: `assets/instant/anglo-saxon-literature-easy.json` and `-hard.json`,
  ids `asl-e-NN` and `asl-h-NN`. Leave the existing files and ids alone.
- The selection box gets a row of topic buttons at the TOP: The Age / The Literature / Both. Level and
  Number of questions stay below, exactly as they are. "Both" mixes the two banks (still 10 to 50),
  never-seen first across both.
- Still open, the owner has not decided (ask if it is still open): the final names of the three buttons
  (these three are placeholders) and the default (suggested: Both, Easy, 10).
- Update the page text from 100 to 200 questions: the banner line, the "About This Quiz" list and the
  meta description. Write one line under each button from the real questions.
- Look for near-duplicates between the two banks (the Beowulf questions overlap) and show them to the
  owner before building.

## 9. Working with the owner, and applying database changes
The owner (Prof. Afsar Khan) is **not a programmer**. When something has to be done
by hand, give **click-by-click steps, one at a time**: which link to open, copy,
paste where, which button to press, and what a success message looks like. Then wait
for the result before the next step. Do not assume shell, git, or dashboard fluency.

**This session cannot reach Supabase.** The cloud container's network proxy blocks the
Supabase host, so Claude can neither apply nor test a migration against the database
from here. So: **Claude writes the SQL; the owner runs it** in Supabase → SQL Editor
(New query → paste → Run → expect "Success. No rows returned."). For a long file, point
the owner to the migration file's GitHub **raw** link and the copy button rather than
pasting hundreds of lines into chat. To confirm row counts, give a `select count(*)`
— the dashboard table view only shows 100 rows at a time, so hand-counting misleads.

## 10. Accounts and the database (Supabase)
User accounts are **live**. Backend is a Supabase project; the browser talks to it with
the **publishable** key, which is public by design and lives in `assets/supabase-config.js`
(shipped to the browser; RLS protects the data). **Never put the secret key in the repo,
and never ask the owner for it.**
- Auth glue `assets/auth.js` (header Login/name, session) loads on every page via the
  chrome transform; `/login/` and `/account/` are the auth pages; `assets/login.js`,
  `assets/account.js`. supabase-js is vendored at `assets/supabase-2.118.0.js` (no CDN).
- Schema: `profiles`, `attempts`, `reading_progress`, `exams`, `topics`, `exam_topics`,
  `user_exams`, `notify_requests`. RLS is own-rows-only (a user sees only their rows);
  reference tables (`exams`, `topics`, `exam_topics`) are world-readable; anon gets nothing.
- Migrations live in `supabase/migrations/` (ordered, run once by the owner). Each is one
  transaction; data loads use `on conflict (id) do nothing`; topic rows are inserted
  parents-first. `supabase/full-setup.sql` is a consolidated, idempotent one-shot.
  `docs/db-notes.md` explains every table in plain English. **Never gate existing content
  behind login** — articles, the Daily quiz and the MCQs stay open to everyone.

## 11. Topic taxonomy
`topics` is a self-referencing tree with `parent_id` and `kind`
(`area | period | movement | writer | work | concept`). 1476 rows across 8 areas
(British, American, Indian, New Literatures, Criticism & Theory, Literary Terms,
Language/ELT, Research Methodology). The per-area CSVs the rows were built from are in
`supabase/data/`. **`supabase/data/taxonomy-master-reference.csv` is the single source
of truth for valid topic ids.** Convention: a writer sits directly under its period;
named schools are `movement` siblings (grouping lives in `exam_topics`, not the tree);
concept-only areas go area > group > term. Invent no topics — the owner supplies them.
The 10 British ages (`old-english` … `contemporary`) are parents of 18 child `period` nodes, one
per site period (Daily page names and years). Ids are the site slug, except `jacobean-era`,
`restoration-era` and `modern-era` (the plain slug is already an age node). The Renaissance
(1500–1660) and Neoclassical (1660–1785) banks have no node: each spans two ages. Writers and
works stay under their age, not under the sub-period.

## 12. Question ids, tagging, and attempt tracking
- Every question carries a **stable, frozen `id`** — never derived from array position.
  Daily: `<period><e|h>-NN` (e.g. `as-e-01`). MCQ: `<setId>-<e|m>-NN` (e.g.
  `old-english-set-1-e-01`). Ids are never renumbered or reused: if a question is removed,
  retire its number; a new question takes the next free one. Readers' records hang on these.
- New question files carry `topicId` = one id from the master reference. The quiz engines
  (`assets/instant.js` Daily, `assets/cbt.js` MCQ/CBT) call `assets/track.js`, which writes
  one `attempts` row per answered question **only for a logged-in user**, fire-and-forget,
  with `question_id = q.id`, `topic_id = q.topicId || null`, `source` `'daily'`/`'cbt'`.
  It never blocks the quiz; guests keep playing with `localStorage` only (which stays).
- **Build gate:** `npx eleventy` runs `tools/check-topics.js` and fails the build if any
  question's `topicId` is not in the master reference, or if two questions share an `id`.
  Keep ids unique and topicIds real, or the build (and publish) stops. (Extends rule 4.)

## 13. Not built yet (ask before assuming these exist)
- `attempts.topic_id` is still `null` everywhere until questions are tagged with `topicId`
  (backfill pending) and the MCQ generator is aligned to emit `id` + `topicId`.
- Migrate a guest's `localStorage` attempts into the DB on login — planned, not built.
- Password reset needs an SMTP provider in Supabase first (none yet); the "Forgot
  password?" link currently shows a contact-us note instead of a reset email.
- Pre-existing MCQ hub links `/quizzes/mcq/build/` and `/quizzes/mcq/topic/*` 404 — unrelated
  to accounts, to be fixed separately.
