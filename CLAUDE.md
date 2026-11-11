# AK Explained — working rules

**For any AI agent (Claude, Codex or another):** this file is the full rulebook and wins on any difference.
`AGENTS.md` is the one-page short version with the rules that must never be broken. `docs/accounts-status.md`
says where things stand today.

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
- `exams/net/` — preparation hub and related pages use Nunjucks (`index.njk`, `about/`, `syllabus/`, and `coming-soon.njk`), with `_includes/net-layout.njk`, `_includes/net-action.njk`, `assets/net.css`, and `_data/netResources.json`. The two information pages are available; the other NET hub resources are coming soon. Do not create `exams/net/index.html` alongside its template.
- `exams/pgt/` — exam hub in `index.njk`, with `_includes/pgt-layout.njk`, `_includes/pgt-exam-card.njk`, `assets/pgt.css` and `_data/pgtExams.json`. Only `/exams/pgt/up-pgt/` is active; the other ten state and three central destinations are non-interactive Coming soon cards. The UP PGT page has five preparation resource cards from `_data/pgtResources.json`. Its MCQ card opens `/exams/pgt/up-pgt/mcqs/`, a six-group day index driven by `_data/pgtMcqDays.js`; each of the 60 day routes is a noindex Coming soon page until questions are supplied. No day has a topic assigned yet; the owner will decide each topic when its questions are uploaded. Its Mock Tests card opens `/exams/pgt/up-pgt/mock-tests/`, a matching six-group index driven by `_data/pgtMockTests.js`; Mock Tests 1–5 are free public CBT papers; Tests 6–8 are login-only CBT papers stored in Supabase with hub locks for guests, while tests 9–60 remain noindex Coming soon pages. Each open test has 90 questions and a review route. The remaining resource destinations use `up-pgt/coming-soon.njk` until real content arrives. The former general English study guide is preserved at `/exams/pgt/up-pgt/study-guide/` and is clearly distinguished from an official UP-specific syllabus. Do not recreate `exams/pgt/index.html` beside the template.
- `exams/state-psc/` — exam hub in `index.njk` with the UP PGT visual scale, `_includes/state-psc-layout.njk`, `assets/pgt.css` and `assets/state-psc.css`. UP Assistant Professor is its only active exam card. `/exams/state-psc/up-assistant-professor/` has the five owner-specified resource cards from `_data/statePscResources.json`; **Paper 2 English Literature Mock Tests** (`paper-2-mock-tests/`) has Mock Tests 1 and 2, both login-only 100-question CBT papers using `_includes/state-psc-cbt.njk` and separate test/review routes. Questions are the `public.mcq_papers` rows `up-ap-p2-mock-test-1` and `up-ap-p2-mock-test-2`, never files in the repo (rule 15). The other four resource cards still open a noindex Coming soon page from `coming-soon.njk` (the list is `_data/statePscComingSoon.js`, which skips any resource marked `"live": true` in `statePscResources.json`) until content is supplied. Do not recreate `exams/state-psc/index.html` beside its template.
- `quizzes/mcq/<age>/…` (hub, `build/`, `custom/`, `set-<n>/`) is **generated**, not hand-written:
  templates in `quizzes/mcq/_templates/` and `_includes/mcq-page.njk`, data in `_data/mcqSpec.json`
  (see rule 7). Change the template or the registry, never a generated page.
  `quizzes/mcq/index.html` (all ages) is still hand-written.
- `quizzes/daily/<period>/index.html` — instant-quiz hub for one period (hand-written, standalone).
  Engine `assets/instant.js`, questions in `assets/instant/` (see rule 8). Open so far: `anglo-saxon/`, `anglo-norman/`, `age-of-chaucer/`, `fifteenth-century/`, `renaissance/`, `early-tudor/`, `elizabethan/`, `jacobean/`, `caroline/`, `commonwealth/`, `neoclassical/`, `restoration/`, `augustan/`, `age-of-sensibility/`, `romantic/`, `victorian/`, `edwardian/`, `georgian/`, `modern/`, `postmodern/` (all 20 periods are open).
- `CLAUDE.md`, `AGENTS.md`, `docs/` and `tools/` are notes for maintainers: `eleventy.config.js` keeps them out of the published site.
- `assets/site.css` — everything shared; `eleventy.config.js` syncs the header,
  footer, page-head motif and `nav.js` into every built page

The list of literary periods (20, from Old English to Postmodern) is the same on three pages and
must stay in step: `_data/mcqSpec.json` (+ the cards in `quizzes/mcq/index.html` and the slugs in
`assets/mcq.js`), the cards in `quizzes/daily/index.html` (and its period filter, one option per age), and `ages` in `assets/home.js`.
The timeline page `english-literature/index.html` shows the same 20 ages (one small tile each, 6 to a line on a wide screen, same names, years, writers, pictures and notes link as `ages` in `assets/home.js`), so it must stay in step too.
Names, years and pictures come from the Daily page. Invent none of them.

The menu lives in three places and must stay in step: `_includes/base.njk` and the
sidebar markup copied into `index.html` and `404.html` (every other page gets it from base.njk at build).

**The default footer belongs on every public page**, including custom exam hubs and their related pages (owner, 2026-11-07). Keep the shared footer from `_includes/base.njk`; custom layouts use `<footer class="site-footer"></footer>` so `syncChrome` supplies it automatically. A new page design must not replace it with a page-specific footer.

## 4. Before pushing
`npx eleventy` must build clean, and no internal link may 404.

## 5. Deploys
Work goes on the feature branch. Merging to `main` publishes to akexplained.com,
so do that only when asked.
**How to merge when the owner says so** (worked twice on 2026-11-07): `git fetch origin main` and check that
`git log HEAD..origin/main` is empty (if not, merge main into the branch, rebuild and retest first). Open a pull
request with the GitHub tools (`create_pull_request`, then `merge_pull_request` with `merge_method: merge` and
`expectedHeadSha` set to the commit you tested). Then `git fetch origin main`,
`git checkout -B <branch> origin/main` and `git push -u origin <branch>`, so the branch equals main (the
session's stop hook complains about unpushed commits otherwise). Cloudflare Pages then builds `main`. A cloud
session cannot open akexplained.com (rule 14), so give the owner the live links to look at.

## 6. Student reviews — live, login-gated, auto-live (owner, 2026-11-11)
- Reviews are **login-gated and auto-live**: a logged-in student writes one at `/write-a-review/`
  (`assets/review-form.js`) and it appears on the home page at once — **no approval step**. Guests see
  a login wall there (`/login/?next=%2Fwrite-a-review%2F`). **One review per student.**
- Storage is `public.reviews` in Supabase (migration `20261111120000_add_reviews.sql`): RLS lets anyone
  read `visible = true` rows, a student read/insert only their own; no client UPDATE/DELETE. The home
  carousel (`assets/home.js` `loadReviews`) reads visible rows with the publishable key; empty state is
  a "Be the first" invite, never fake reviews (rule 2).
- **Moderation is by exception only** (owner's rule): hide or delete a review **only for inappropriate
  language** — a low-star review is kept. Do it from the owner side via the Supabase connector, e.g.
  `update public.reviews set visible = false where id = '…';` (hide) or `delete from public.reviews
  where id = '…';` (remove). Never from the browser.
- Honest limit: while "Confirm email" is OFF (rule 13), login is not a hard spam wall; the
  one-per-user rule and easy removal are the net. `/privacy/` states what a review stores and that it
  is public — keep it true in the same commit as any change here (rule 10).
- The old static `assets/reviews.json` + Pages CMS "Student Reviews" collection were retired when this
  shipped (they no longer feed the home page).

## 7. MCQ question sets
Question files are made with `tools/mcq-skill/SKILL.md` (by Claude Work or another AI) and
arrive in the final format: `<age>-set-<n>-easy.json`, `-medium.json` and a `-report.md`.
Every question carries `src` (the page that proves it); the site does not show it yet.
**First: is the set free or login?** The owner says so when the files arrive ("login me lagao"). If the
owner did not say, **ask before writing anything into the repo**: the repo is public, so a file committed
here is public for good. Free: the steps below. Login: rule 15 (the files never enter the repo).
To publish a (free) set:
1. `python3 tools/mcq-skill/validate_mcq.py <easy> <medium> --notes notes/<article>/index.md --others <other sets' files of the age>` — no errors.
2. Spot-check about ten questions against their `src`, and every one a warning or the report flags.
   Fix or replace a wrong one; never keep a guess. **If the owner says the files are already verified** (as
   for Old English Set 4, 2026-11-07: "verified, overlaps are fine"), do not re-check the facts or the
   near-duplicates: run the structure checks only and mention once anything that stood out.
3. Files go to `assets/questions/` (free sets only; a login set never goes there, rule 15).
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

**Claude runs the SQL itself** (owner's decision, 2026-11-07; before that the owner ran every migration).
The Supabase connector reaches the live project (ref `almlqoxcyzwieuwrgwry`). Claude tests the SQL first
on a scratch local Postgres (rule 14), applies it through the connector (`apply_migration` for structure,
`execute_sql` for data), reads the result back (row counts, policies, grants), runs the security advisors,
and tells the owner in plain words what ran and what was checked. The same SQL goes into
`supabase/migrations/` in the same commit (never the question data of a login set: rule 15). The owner is not
asked to open the SQL Editor. Anything destructive (drop, delete, truncate, a change that removes data)
still needs the owner's word first. If the connector is not attached or fails, fall back to the old way:
Claude writes the SQL and gives click-by-click steps (SQL Editor → New query → paste → Run → expect
"Success. No rows returned."), pointing to the file's GitHub **raw** link and the copy button rather than
pasting hundreds of lines into chat. To confirm row counts use `select count(*)` — the dashboard table
view only shows 100 rows at a time, so hand-counting misleads.

## 10. Accounts and the database (Supabase)
User accounts are **live**. Backend is a Supabase project; the browser talks to it with
the **publishable** key, which is public by design and lives in `assets/supabase-config.js`
(shipped to the browser; RLS protects the data). **Never put the secret key in the repo,
and never ask the owner for it.**
- Auth glue `assets/auth.js` (header Login/name, session) loads on every page via the
  chrome transform; `/login/` and `/account/` are the auth pages; `assets/login.js`,
  `assets/account.js`. supabase-js is vendored at `assets/supabase-2.118.0.js` (no CDN).
  `/dashboard/` (`assets/dashboard.js`) is the read-only progress page: `/account/` stays the profile page and
  nothing profile-like moves there. It shows only what `attempts` supports (totals, recent activity, by period
  and topic, the paths picked). **Never add mastery, levels, decay, a "next step" or readiness meters until the
  computation exists** (owner's rule). New sections are added with `addSection()` in that file. Counts say
  "including repeats" (a repeat answer counts again). Known limit and its fix: `docs/accounts-status.md`.
  The row order is the owner's (2026-11-06; the list is at the top of `dashboard.js` and in
  `docs/accounts-status.md`) — do not re-order it unasked. A card with `col:'half'` shares its line with the
  next `col:'half'` card. Rows 6 and 7 show **five rows each**; the "+" in the corner opens the full list at
  `/dashboard/ages/` or `/dashboard/topics/`, which are the same script with `data-view` on `#dashSections`.
  Tile artwork goes through `art()` / `KPI_ART` — put a PNG in `/assets/dash/`, name it there, change nothing
  else. **"Quizzes taken"** is a real count: one `quiz_runs` row per finished quiz (`track.js` `recordRun`, called
  from `instant.js` and `cbt.js`). The tile says "Quizzes taken" once at least one row exists and keeps saying
  "Questions answered" before that (or if the table is missing). It is not retroactive.
  **The level counts MCQs too** (owner, 2026-11-06): an age's pool = its Daily questions + the questions of its
  live MCQ sets (`tools/build-syllabus.js` matches the 20 MCQ ages to the 20 Daily ages by position). Daily and
  MCQ answers count the same, each question once by its latest answer, 60% answered at 60% right. A set that is
  not live is not in the pool. Strengths and Areas to improve judge **specific topics only** (never a whole
  period, never "not sorted"), at least 3 answers each. **Top students** shows up to 10, ranked by **points =
  right answers x accuracy** (each question once, latest answer; owner, 2026-11-06: rank must depend on both how
  many questions and how accurate, never one lucky answer on top). The board shows rank, name, points and accuracy;
  every student who has **logged in** (`auth.users.last_sign_in_at` set; an unconfirmed sign-up is not listed, so a stranger cannot put a name
  on the board) is ranked, a student with no answers has 0 points and "No answers yet" and falls off once ten are above them
  (`min_questions` is 0; set it to 1 for "only after the first answer"). The name is the profile name, else the account name, else
  "Student", never an email. Both are one place in the SQL (`min_questions`, `score`).
  `/dashboard/` has **no page head and no breadcrumb**: its own top bar (`.dashtop`, static markup in
  `dashboard/index.html`) carries the `h1`, the bell and the profile button, and the header card sits right
  under it. The **bell is `disabled` and shows no dot or count** until something real is behind it — never
  add one for looks. The header is two pictures and nothing else to edit: `assets/dash-banner.webp`
  (the wide painting, 2268x494, shown at 1134x247) and `assets/dash-box.webp` (the panel the centred
  greeting sits on, 1988x422, stretched — art at the two ends, middle clear, **no frame in the picture**:
  the gold frame is a 1px CSS border; the picture stays at every width, the type just steps down on a
  phone). The name is **Playfair Display italic 700** (the owner's pick, 2026-11-06) — changing it
  means the `.dashhero-name` rule and that page's font link, both. The dashboard is **live on
  akexplained.com since 2026-11-06**. The quote and the frame are inside the pictures, so the page
  never repeats them, and `dashboard/index.html` loads Literata `1,700` for the italic name — keep it.
  `.dashbar` is the thin progress bar, not the top bar — do not confuse the two.
- **Continue with Google** (on `/login/`, both forms): the button stays hidden until Supabase reports
  Google as enabled (`GET /auth/v1/settings` → `external.google`), so it can ship before the dashboard
  setup is finished (test aid: `/login/?google=1` shows it anyway, to tell "Google is not set up" from "the check failed"). It sends the person to Google with `redirectTo = <origin>/login/` (that exact URL
  must be in Supabase → URL Configuration → Redirect URLs) and an account chooser. On the way back a
  first-time person gets the same "Choose your path" screen as a new email signup and their Google name
  is saved to `profiles`; someone who already has a path goes to `/account/`.
  **Identity linking** (Supabase auth server, `DetermineAccountLinking`): an OAuth sign-in whose provider
  email is verified is linked automatically to the one existing user with that email, so the same person
  keeps one `user_id` and their `attempts` stay together. There is no switch to turn this off. Caveat:
  while "Confirm email" is OFF, every email signup counts as confirmed, so anyone could pre-register
  someone else's address with a password and later share the account when that person uses Google.
  Turn "Confirm email" ON once SMTP works. A Google email that differs from the account's email makes a
  second account (manual linking is a separate, off-by-default beta).
- **One domain.** The site lives on `https://akexplained.com`. www is a different origin to the browser (separate
  login, separate saved progress, and Supabase only lets Google return to the bare domain), so `auth.js` sends
  anyone on `www.akexplained.com` to the same page on the bare domain. The proper fix is a Cloudflare redirect
  rule (the site is on Cloudflare Pages, whose `_redirects` cannot match a domain; the owner sets the rule in the
  Cloudflare dashboard). **That rule is live since 2026-11-03** (a 301 from `https://www.*` to `https://${1}`);
  the `auth.js` net stays as a backup. Details in `docs/accounts-status.md`.
- **Keep `/privacy/` and `/terms/` true.** They state what is collected: with an account, name, email, a
  hashed password or Google sign-in, chosen path(s), "notify me" requests, and quiz answers while logged in, held
  in Supabase. Change them in the same commit as any change to what is collected (for example a new table, a
  new provider, or emails after SMTP). The Terms line "no paid tier" is the owner's and must change when that does.
- Schema: `profiles`, `attempts`, `quiz_runs`, `reading_progress`, `mcq_papers` (login / paid MCQ sets, rule 15), `exams`, `topics`, `exam_topics`,
  `user_exams`, `notify_requests`. RLS is own-rows-only (a user sees only their rows);
  reference tables (`exams`, `topics`, `exam_topics`) are world-readable; anon gets nothing.
- Migrations live in `supabase/migrations/` (ordered, run once by the owner). Each is one
  transaction; data loads use `on conflict (id) do nothing`; topic rows are inserted
  parents-first. `supabase/full-setup.sql` is a consolidated, idempotent one-shot.
  `docs/db-notes.md` explains every table in plain English. **Never gate content that is already free**
  — articles, the Daily quiz and the free MCQ sets (all 300 Old English questions so far) stay open to everyone.
  New MCQ sets may be login sets, only when the owner says so (rule 15).

## 11. Topic taxonomy
`topics` is a self-referencing tree with `parent_id` and `kind`
(`area | period | movement | writer | work | concept`). 1711 rows across 9 areas
(British, American, Indian, New Literatures, Criticism & Theory, Literary Terms,
Language/ELT, Research Methodology, World Literature). The per-area CSVs the rows were built from are in
`supabase/data/`. **`supabase/data/taxonomy-master-reference.csv` is the single source
of truth for valid topic ids.** Convention: a writer sits directly under its period;
named schools are `movement` siblings (grouping lives in `exam_topics`, not the tree);
concept-only areas go area > group > term. Invent no topics — the owner supplies them.
The 10 British ages (`old-english` … `contemporary`) are parents of 18 child `period` nodes, one
per site period (Daily page names and years). Ids are the site slug, except `jacobean-era`,
`restoration-era` and `modern-era` (the plain slug is already an age node). The Renaissance
(1500–1660) and Neoclassical (1660–1785) banks have no node: each spans two ages. Writers and
works stay under their age, not under the sub-period.
Writers named in the questions but missing from the tree were added in
`20261030120000_add_writers_schools_and_world_literature.sql` (222 writers and 3 `concept` school nodes
— Spasmodic School, Satanic School, Blue Stockings — each name approved by the owner). Non-English
writers sit in the area `world-literature`. The critics A. C. Bradley and the two Leavises sit directly
under the Criticism area and Robert Lowth directly under Language/ELT; no school was invented for them
(re-parent later with one UPDATE if a real one is added). Ids of people with initials: joined initials +
hyphen in the British area (`ts-eliot`), hyphenated in the other areas (`i-a-richards`).
`supabase/data/taxonomy-aliases.csv` (`node_id,alias,note`) holds other names for existing nodes, for
the tag matcher. A second batch of 9 nodes (vorticism, war-of-the-theatres, gorboduc, thomas-norton,
thomas-sackville, three-estates, samuel-butler-hudibras, ohthere-and-wulfstan, theatrical-licensing-act-1737)
came in `20261031120000_add_vorticism_gorboduc_and_other_missing_nodes.sql`. Two writers named Samuel
Butler: `samuel-butler` is the Victorian one and is not to be touched; the author of Hudibras is
`samuel-butler-hudibras`.

## 12. Question ids, tagging, and attempt tracking
- Every question carries a **stable, frozen `id`** — never derived from array position.
  Daily: `<period><e|h>-NN` (e.g. `as-e-01`). MCQ: `<setId>-<e|m>-NN` (e.g.
  `old-english-set-1-e-01`). Ids are never renumbered or reused: if a question is removed,
  retire its number; a new question takes the next free one. Readers' records hang on these.
- New question files carry `topicId` = one id from the master reference. The quiz engines
  (`assets/instant.js` Daily, `assets/cbt.js` MCQ/CBT) call `assets/track.js`, which writes
  one `attempts` row per answered question **only for a logged-in user**, fire-and-forget,
  with `question_id = q.id`, `topic_id = q.topicId || null`, `period_id = q.periodId`
  (a `kind = period` node; sent only when the question has one), `source` `'daily'`/`'cbt'`.
  It never blocks the quiz; guests keep playing with `localStorage` only (which stays).
  `attempts.period_id` keeps the period an attempt was answered under, so re-tagging a
  question later does not change old attempts (migration `20261029180000_attempts_add_period_id.sql`).
- **Tagging rules (owner's).** Every question gets a `periodId` (one of the 18 child `period`
  nodes) and a `topicId` (the most specific master node the question clearly targets: writer,
  work or concept; if none fits, the period node itself). A single-age Daily bank takes its
  period straight from the bank (rule 11), no per-question judgement. Where a question has to be
  placed (the Renaissance and Neoclassical banks, MCQ sets): (1) if the question's own text names
  a period, tag to that period, so the explanation the student reads and the mastery meter never
  disagree; (2) the conventional textbook placement of a writer or work beats its composition
  date, because the tag drives a mastery meter that must agree with the student's books;
  (3) composition date only decides where convention is silent; (4) the period is the last rung,
  not an escape hatch: a doubtful tag first climbs the ladder again (work, writer, movement/concept,
  then the neighbouring age and other areas) and only a true tie between named people, or a
  question about something with no node, stays on the period. When the right answer is a node, the
  answer is the subject and a person named only as the setting, a relative or the target is not.
  The proposing tool is `tools/tagging/` (dry run); its surname-only tags are listed in
  `tools/tagging/reports/surname-only-tags.csv`. Settled: Milton, Traherne
  (taught with Vaughan) -> `commonwealth`; Swift, Defoe -> `augustan`; Clarendon -> `restoration-era`;
  Richardson, Fielding, Smollett, Sterne and the Graveyard poets -> `age-of-sensibility`; Donne -> `jacobean-era`.
  The old MCQ set-local `topic` / `topicRead` / `read` keys stay: they drive the UI.
- **Same-name rule (owner's).** When two people in the master share a surname, neither may be matched
  on the bare surname. A disambiguator — a given name, an initial, a title, a work or a date — must
  appear in the question. If none does, the match is refused and the ladder climbs. (In
  `tools/tagging/match_topics.py`: a given name or initial turns it into a full-name match; a work of
  that writer, or a year that fits only that writer's age, counts as the disambiguator; a title alone
  is not checked yet. Two people with the same full name are handled the same way.)
- **Build gate:** `npx eleventy` runs `tools/check-topics.js` and fails the build if any
  question's `topicId` is not in the master reference, if its `periodId` is not a `kind = period`
  node, or if two questions share an `id`. Keep ids unique and tags real, or the build (and
  publish) stops. (Extends rule 4.)

## 13. Not built yet (ask before assuming these exist)
- **The paid layer** (rule 15): no entitlements, no promo codes, no payment gateway. A set can be free or
  login today. **Big PDFs go to Cloudflare R2** (owner, 2026-11-07): nothing is built for it; ask before building.
- `attempts.topic_id` and `attempts.period_id` are `null` for attempts made before the tags reach the
  live site. All 2,000 Daily and 300 Old English MCQ questions now carry `topicId` + `periodId`
  (tagged with `tools/tagging/write_tags.py`; the owner's ruling on each doubtful kind is in rule 12).
  Still to do: align the MCQ generator (`tools/mcq-skill`) to emit `id` + `topicId` + `periodId`, so
  new sets arrive tagged. (`validate_mcq.py` also still reports "unknown field(s)" for `id`, `topicId`, `periodId`, `qtype`,
  `passageId` and `passages`, as Old English Set 5 arrived in that format; for a login set `make_gated_sql.py` is the real gate.) Nodes still missing from the master are collected in
  `tools/tagging/reports/node-gaps.md` (next migration batch; the owner decides).
- Migrate a guest's `localStorage` attempts into the DB on login — planned, not built.
- Password reset and email-confirmation landings are built in `assets/login.js` (implicit flow:
  `auth.js` latches the `PASSWORD_RECOVERY` event and reads the link `type` from the URL). "Forgot
  password?" shows the real reset form only once Confirm email is ON in Supabase
  (`/auth/v1/settings` → `mailer_autoconfirm = false`, i.e. custom SMTP is live) or with `?reset=1`;
  until then it shows the contact-us note. **Turn Confirm email ON only after custom SMTP works**, or
  real users cannot confirm or reset. The reset redirect lands on `/login/` (must be in Supabase →
  URL Configuration → Redirect URLs; `https://akexplained.com/**` already covers it).
- Pre-existing MCQ hub links `/quizzes/mcq/build/` and `/quizzes/mcq/topic/*` 404 — unrelated
  to accounts, to be fixed separately.

## 14. Working on the backend from a cloud session (tools, testing, hygiene)
- **The live database.** A Supabase connector is attached to the session (project ref
  `almlqoxcyzwieuwrgwry`). You may read it (schema, rows, policies, grants, advisors) **and, since
  2026-11-07, run SQL on it yourself** (migrations and data loads), as rule 9 says: test on a scratch
  Postgres first, apply, read back, run the advisors. Anything destructive needs the owner's word first.
  The browser talks to Supabase with the publishable key only; the secret key never goes in the repo.
- **Security hygiene.** After any schema change, run the Supabase **security advisors** and keep them
  empty. A `SECURITY DEFINER` function in `public` (a trigger function especially) must have `EXECUTE`
  revoked from `public, anon, authenticated`, or advisors 0028/0029 fire — it is still callable at
  `/rest/v1/rpc/<name>` otherwise (see `20261103120000_…`). The event trigger `ensure_rls`
  (`rls_auto_enable()`, `20261103130000_…`) turns RLS on for every new `public` table as a safety net;
  never rely on it alone — always add explicit own-rows policies with the table.
- **Test before you push** (extends rule 4). Migrations: run them on a throwaway local Postgres
  (`/usr/lib/postgresql/16/bin` → `initdb`/`pg_ctl`), after first running the earlier topic/account
  migrations, and check row counts, idempotency (run twice), and no orphans. (`initdb` must run as the `postgres` OS user in a folder that user can read, e.g. under `/var/tmp`, not the scratchpad; delete it afterwards.) Auth and other JS flows:
  browser-test with the pre-installed Playwright (`require('playwright')`, `chromium.launch()`, no
  options) against `_site` served locally, with Supabase routes mocked. Test switches already in the
  code: `/login/?google=1` (show the Google button), `/login/?reset=1` (show the reset form).
- **Facts, prices and limits.** Never invent a figure (a free-tier limit, a price, a quota). Verify it
  on the provider's **own** page — aggregator/comparison sites are unreliable (owner's rule). If a host
  is blocked (the network policy blocks some: Supabase over plain `WebFetch`, provider pricing pages),
  either ask the owner to add it under the environment's Network access, or ask the owner for the fact.
- **What this session cannot reach** (2026-11-07): `akexplained.com` and `en.wikipedia.org` do not resolve
  (the network policy). `WebSearch` works. So Claude cannot look at the live site: say so and give the owner the
  links to check. Britannica and the Oxford Companion are the question files' `src`; say which source could not
  be opened.
- **The owner cannot open your container.** Never point them at a `/tmp/...` (scratchpad) path — those
  are inside the session and vanish when it is reclaimed. Paste the content into chat, or give a repo
  path / GitHub link they can open themselves.
- **Where things stand** at the end of a work block is kept in `docs/accounts-status.md` (a dated
  snapshot of what is live, what is on the branch unmerged, and what is pending). Update it when the
  state changes so the next session starts without re-reading the whole history.

## 15. Access layers: free, login, paid (owner, 2026-11-07)
**Short runbook for publishing a set (free or login), for any AI with the connector: `tools/mcq-skill/PUBLISH.md`.**
Three layers for MCQ sets. **The owner decides the layer of every set when the files are handed over**
("login me lagao" = login; otherwise free). **If the owner did not say, ask before touching the repo. Never assume.**
- **free**: a public file in `assets/questions/` (and the Daily files). The 300 Old English MCQs and every set
  the owner calls free stay here, open to everyone. **A set that went live as a file is public for good** (the
  repo is public and git keeps history), so the layer is decided BEFORE the first commit.
- **login**: the questions are rows in `public.mcq_papers` (`access = 'login'`, one row per level, `body` = the
  whole question file). RLS lets any logged-in student read them; logged-out visitors get nothing. **No file
  of a login set, and no SQL that contains its questions, is ever committed.** The set's page, title and lede
  are public; only the questions are not. A logged-in student can still copy what they see; the wall stops
  the public, not copying.
- **paid**: NOT BUILT. `access = 'paid'` is allowed in the table but no policy reads it (invisible to everyone,
  it fails closed), and `_data/mcqAges.js` stops the build if a set says `"access": "paid"`. The owner's plan:
  every gated set starts as login; later the owner picks which become paid; a **promo code** gives a student
  the paid pass for free ("paid but free by promo code"). To build it: an entitlements table (who has a pass,
  from payment or promo, until when; only the server writes it, never the browser), a promo-codes table, a
  server-side redeem function, one more RLS policy, then allow `"paid"` in the registry. Payment gateway: not
  chosen; never invent a fee or a limit (rule 14). The "no paid tier" lines in `/terms/` and `/contact/`, and
  the About line, change in the same commit that makes paid real. Moving a set login → paid later is one
  UPDATE of `access` plus the registry label. Paid → free is never done silently: it publishes the questions.
- **Publishing a login set** (instead of rule 7 steps 3 to 6). The question files stay in the session's scratchpad.
  1. `validate_mcq.py` on them (rule 7 steps 1 and 2), as for any set.
  2. `_data/mcqSpec.json`: the set gets `"access": "login"`, `"rev": <n>` (the registry carries rev, because there
     is no file to read it from), `count`, `levels`, `titleCase`, `lede` (the owner supplies the words), `"live": true`.
  3. `python3 tools/mcq-skill/make_gated_sql.py --access login <files> --out <scratchpad>/load.sql --chunk 25`. It checks
     the files against the registry, the master topics and the public files, and writes the SQL (with `--chunk` in
     parts `load.01.sql` ...); it never touches the database. It also prints an expected fingerprint (one md5 per
     level) and writes `load.check.sql`. Tags (`topicId`, `periodId`) must be there: run the tagging tool first
     (rule 12), because the build gate cannot see these files.
  4. Run the parts through the connector IN ORDER (rule 9). Read back with `load.check.sql`: one row per level, the
     count equals `count`, `rev` equals the registry's, and **the md5 equals the one the tool printed** (it covers every
     id, question, option, answer, reason and tag, so one changed letter shows). `git status` must show no question
     file and no load SQL. If the owner's files carry another set number than the slot they name, rename only `setId`,
     `setNumber` and the ids in the scratchpad copy (check that nothing else changed) and say so.
  5. `npx eleventy`, link check, browser test: a guest sees "Log in to take this test" and no question text; a
     logged-in student gets the test. Push the branch; `main` only when asked (rule 5).
  6. Tell the owner to keep their own copy of the files: the table is the live copy, but the scratchpad vanishes.
  Changing a live login set: run the tool again with the corrected file and a raised `rev` (it upserts).
- **What the build cannot check** for a login set: that its rows exist in the table (the build cannot reach
  Supabase), that its tags are real, that its ids are unique. The tool checks the last two before loading and the
  SQL refuses an id another set already holds; step 4's read-back covers the first.
- The dashboard pool counts a login set as `count x levels` from the registry (`tools/build-syllabus.js`).
- Engine: `assets/cbt.js` reads a login set with `data-gated` on the page (`gatedPaper()`); it must wait for
  `window.akAuth`, because `cbt.js` runs before `auth.js`.
- **Passages and line breaks** (Set 5, 2026-11-07). The "complex" generator's files may carry a top-level `passages`
  list (`id`, `title`, `attribution`, `text`, `src`), `passageId` on the questions that point at one ("Read Passage p1 above"),
  `qtype`, and `\n` inside a question ("List I / List II", "A. B. C. D."). The engine handles all of it: `withPassages()` in `cbt.js`
  attaches the passage to its questions when a paper loads (so a custom test keeps it), `passageHtml()` draws the card above the
  question on the test screen, the review page and the wrong-answer cards, and `white-space: pre-line` (`.cbt-q`, `.cbt-fcq`, `.cbt-rq`)
  keeps the line breaks. The passage `text` is shown exactly as supplied and `src` is not shown. A file with no `passages` behaves as
  before. Empty `topicRead` is fine (no per-topic notes links for that set). Keep this working when `cbt.js` is touched: a passage
  question without its passage is unanswerable.
- **The lock on the hub** (owner, 2026-11-07, said twice: "jahan par Start, wahan par lock; kone me nahi"): on the
  hub row of a login set, a guest sees a padlock BUTTON in the place of the Start button (same slot, same height; template
  `quizzes/mcq/_templates/age-hub.njk`, `.agehub-go-lock` in `assets/site.css`). It links to `/login/?next=<that set's
  page>`. A logged-in student sees Start instead. The lock is `data-guest-only` and Start (made by `assets/mcq-age.js`) is
  `data-auth-only`, so `auth.js` swaps them by login state; `mcq-age.js` runs before `auth.js` and sets Start's first
  state from the lock. There is no text tag ("Login needed" was removed on the owner's word) and no lock in the title.
  The set page itself still shows "Log in to take this test" to a guest (its button links to
  `/login/?next=<page and query>`, `cbt.js` `needLogin()`). The "Build your own test" page still says "Needs a free
  login" on the row (the owner has not asked to remove it). `/login/?next=…` shows one line (`#nextNote`): "Log in, or
  create a free account, to open this page. Then you will come straight back to it."
- **Login and come back** (owner: "login karke seedha wahin jahan se chhoda hai"): `?next=<same-site path>` on
  `/login/` is kept in `localStorage` (`ak:next`, with a time) so it survives Google and an email link opened
  in a new tab, for **one hour**. **Every** way out of the login page calls `goAfterLogin()` in `assets/login.js`:
  password sign-in, already logged in, Google (new or returning), email-confirm landing, "Choose your path"
  Save and Skip, and the new-password form. With nothing stored they go where they always went (`/account/` or
  `/dashboard/`). A visit to `/login/` without `?next=` drops an old one, except on the way back from Google or an
  email link. Only a path on this site is accepted (not `https://…`, `//…`, `/\…`, `javascript:`).
  The email-confirm redirect URL itself is untouched (Supabase's allowed-URL list). Change an exit only through
  `goAfterLogin()`. **A new student** (owner: "naya hai to pehle profile bnae, phir usi page par") signs up (or uses Google),
  then sees "Choose your path" (the profile step), then Save or Skip returns them to the page they came from.
- **Hub words when the owner gives none:** use only the file's own `setName`, topic names, count and levels,
  say so, never invent (Old English Set 4 was done like this and the owner kept it). Two sets on the same
  topic get the file's own different names.
