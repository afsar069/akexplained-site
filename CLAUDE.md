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

## Image weight and format (owner, 2026-11-19)
Use **WebP for website pictures**, aiming for **200 KB or less per image**. Do not add heavy JPG/JPEG pictures. Convert and compress generated or supplied artwork before using it, inspect visual quality, and check the actual exported file size. Keep agreed dimensions unless the owner asks to change them. When replacing a cached image, use a fresh asset filename and update its reference so visitors receive the lighter version.

## Article image width (owner, 2026-11-19)
A standalone article image must span **100% of the text column**, aligned with the left and right edges of the paragraphs. Show the whole image at its natural aspect ratio (`width:100%; height:auto`), without cropping or a narrower centred maximum width. A small image is appropriate when prose sits beside it; on phones, stack it at the full text width. Use a smaller standalone image only if the owner explicitly asks for one.

## Article text column width (owner, 2026-11-20)
The reading column of every article is **720px** wide on a desktop (`.article{max-width:720px}` in `assets/site.css`; it was 640px). It is one shared rule in the layout `_includes/base.njk`, so it applies to every existing and every future article; never set a width in one article. Images keep the same ratio as the text: full-width images are 100% of the column (so they grew 640 to 720 with it), and the side images raise their caps by the same 720/640 ratio (`--float` 20.25rem, `--portrait` 14.6rem). If the column is ever changed again, scale those two caps by the same ratio.

## Article artwork across literary ages (owner, 2026-11-19)
Change the artistic treatment as the literary age advances, drawing on visual traditions appropriate to that period. Within an article, give each image a distinct subject and composition; do not repeat near-identical scenes. Include a relevant war scene when requested, with equipment appropriate to its date. Label imagined literary scenes and representative historical reconstructions clearly; do not present generated artwork as a surviving historical object. Where a well-known writer or ruler is discussed, add a small portrait beside the relevant prose when useful. Keep people recognisable through established portrait iconography; label generated portraits as modern painted interpretations rather than authentic historical portraits.

## 3. Structure
- `index.html` — landing page (plain HTML + `assets/home.css` + `assets/home.js`)
- `_includes/base.njk` — layout for markdown article pages (Pages CMS publishes these)
- Other `*/index.html` — hub and utility pages, standalone HTML
- `exams/net/` — preparation hub and related pages use Nunjucks (`index.njk`, `about/`, `syllabus/`, and `coming-soon.njk`), with `_includes/net-layout.njk`, `_includes/net-action.njk`, `assets/net.css`, and `_data/netResources.json`. The two information pages, **UGC NET English PYQs** (`english-pyqs/`, rule 18; most papers are free, a paper marked login-only is self-serve) and the two links to the MCQ and Daily quizzes are live (the Daily link is titled **Quick Quizzes**; these three active Paper 2 cards carry a teal "Open" box, set by `"badge":"Open"` in `netResources.json`, and none is styled green any more); the other NET hub resources are coming soon (`coming-soon.njk` skips any resource marked `available: true` in `netResources.json`). Do not create `exams/net/index.html` alongside its template.
- `exams/pgt/` — exam hub in `index.njk`, with `_includes/pgt-layout.njk`, `_includes/pgt-exam-card.njk`, `assets/pgt.css` and `_data/pgtExams.json`. Only `/exams/pgt/up-pgt/` is active; the other ten state and three central destinations are non-interactive Coming soon cards. The UP PGT page has five preparation resource cards from `_data/pgtResources.json`; its four active cards (Download Syllabus, MCQs, Mock Tests, PYQs) end in a teal **Open** button (`.pgt-resource-open`), and it carries the Important Links band (rule 21) with its own PGT list `_data/pgtHubLinks.json` (the band include takes `hubLinksList` for another list and `hubLinksSkip` to leave out the page's own link). Its MCQ card opens `/exams/pgt/up-pgt/mcqs/`, a six-group day index driven by `_data/pgtMcqDays.js`; Days 1–3 are free, no-login CBT sets of 50 easy Figure of Speech questions each; Days 4–6 are free, no-login CBT sets of 50 mixed questions: Rhetoric & Prosody 1 on Day 4, Prosody 2: Rhyme & Stanza Forms on Day 5, and Major Stanza Forms: Sonnet, Ballad, Elegy, Ode, Epic & Mock Epic on Day 6. Day 7 is a free, no-login CBT set of 50 mixed Chaucer 1 questions on the age, Middle English, the Canterbury Tales and pilgrims. Day 8 is a free, no-login CBT set of 50 mixed Chaucer 2 questions on dream visions, Troilus and Criseyde, The Legend of Good Women, and epithets. Day 9 is a free, no-login CBT set of 50 mixed Renaissance and Reformation questions. Day 10 is a free, no-login CBT set of 50 mixed Shakespeare 1 questions on his life, chronology, four career periods and comedies. Day 11 is a login-gated CBT set of 50 mixed Shakespeare 2 comedy questions; its questions live only in `public.mcq_papers`, not a public file. Day 12 is a login-gated CBT set of 50 mixed Shakespeare major comedies questions; its questions live only in `public.mcq_papers`, not a public file. **Days 11–60 are login days and are self-serve-published** (owner, 2026-11-17, rule 17): `gated-day.njk` and `gated-day-review.njk` pre-build the day and review page of every slot 11–60 (from `_data/pgtMcqGatedDays.js`), each with `data-gated` and `data-catalog-check`, so a live day opens login-gated and anything else shows "This set is not open yet"; on the hub every slot 11–60 carries `data-paper-slot` + `data-slot-id` and `assets/paper-list.js` (slot mode) flips it between "Coming soon" and lock/Start from the **live** `paper_catalog` at view time. So the owner uploads a day at `/admin/upload-paper/` (destination **UP PGT English — MCQ Day**), marks it Live on `/admin/papers/`, and its card and page open with no rebuild; Draft hides them at once. A new day's id is `up-pgt-mcq-day-N`; Days 11 and 12 keep the ids they were loaded with, which `_data/pgtMcqLoginDays.js` holds and the upload page reuses. How big the series is lives in `_data/pgtMcqSeries.js` (`total`, `freeMax`, `prefix`) — raise `total` to add days past 60, and nothing else changes. The printed cards, the `sitemap.njk` lines and the noindex flag (a day not live at build is noindex) are the build-time picture, from the registry plus the live rows in `_data/paperCatalog.json`. The database stores these mixed-difficulty papers under level `medium`, the only compatible single-level choice. Each free day has a public question file and review page. Free-day metadata lives in `_data/pgtMcqLiveDays.js`; `_data/pgtMcqDays.js` supplies all index cards, and the day templates use `_includes/up-pgt-mcq-day-cbt.njk` and `data-exam-day` in `assets/cbt.js`. Days 13–60 are pre-built, noindex, login-gated pages that say "This set is not open yet" until their questions are uploaded. A day's topic is the title the owner types on the upload page; never invent one. Its Mock Tests card opens `/exams/pgt/up-pgt/mock-tests/`, a matching six-group index (60 slots) driven by `_data/pgtMockTests.js`. Mock Tests 1–5 are free public CBT papers (files, hand-written `test-N.njk` / `review-N.njk`, 90 questions each): never catalog-checked, leave them as they are. **Slots 6–60 are login tests and are self-serve-published** (owner, 2026-11-15, rule 17): the questions are `public.mcq_papers` rows (`up-pgt-mock-test-N`, never files in the repo, rule 15); `login-test.njk` and `login-review.njk` pre-build the test and review page of every slot 6–60 (from `_data/pgtMockTestsLogin.js`), each with `data-catalog-check`, so a live set opens login-gated and anything else shows "This test is not open yet"; on the hub every slot 6–60 carries `data-paper-slot` and `assets/paper-list.js` (slot mode) flips it between "Coming soon" and lock/Start from the **live** `paper_catalog` at view time. So the owner uploads a test, marks it Live on `/admin/papers/`, and its card and page open with no rebuild; Draft hides them at once. The printed cards, the `sitemap.njk` lines and the noindex flag (a slot not live at build is noindex) are the build-time picture from `_data/paperCatalog.json`. Do not hand-write `test-N.njk` for a login slot again. **Download Syllabus** (owner, 2026-11-19) opens `/exams/pgt/up-pgt/syllabus-download/` (`syllabus-download/index.njk`, styles `.pgt-download*` in `assets/pgt.css`): two cards side by side (the cards share rows by subgrid, so the buttons sit level), each with one big teal button that starts its PDF download in one click. Left: **General Paper Syllabus** (`assets/downloads/up-tgt-pgt-general-knowledge-syllabus.pdf`, the commission's "General Knowledge" syllabus for TGT and PGT, "Number of Question-30", 3 units). Right: **English Literature Syllabus** (`assets/downloads/up-pgt-english-syllabus.pdf`, "Lecturer (PGT) – English, Subject Code 03", Section 1 Language and Section 2 Literature). The two names are the owner's; the PDFs do not say "Paper 1" or "Paper 2", so the page does not either (rule 2). **Both are free for everyone and kept in the repo, not Supabase** (public files on purpose; they are syllabi, not question sets, so rule 15 does not apply). Both are one page, headed by the UP Education Service Selection Commission, Prayagraj; our copies came from sarkariresult.com and the page says so and says we did not change them. To replace a file, overwrite that PDF and update its size line on the page; never state a year or "latest" unless the owner supplies it. After a click the button turns light parrot green (`#A9DC6B`, dark text) and says "Download again" (`assets/syllabus-download.js`, owner 2026-11-19, who picked green; first it was navy); it never stops the download, a second click downloads again, and with no JavaScript the button simply stays "Download PDF". Green, not gold, because gold means "Get access" on paid cards. `_data/pgtComingSoon.js` skips this slug, so there is no coming-soon page for it. The remaining resource destinations use `up-pgt/coming-soon.njk` until real content arrives. The former general English study guide is preserved at `/exams/pgt/up-pgt/study-guide/` and is clearly distinguished from an official UP-specific syllabus. **PYQs** (owner, 2026-11-19) open `/exams/pgt/up-pgt/pyqs/`, a year-by-year list of **free, no-login** previous-year papers (rule 23); `up-pgt/coming-soon.njk` skips this slug. Do not recreate `exams/pgt/index.html` beside the template.
- `exams/state-psc/` — exam hub in `index.njk` with the UP PGT visual scale, `_includes/state-psc-layout.njk`, `assets/pgt.css` and `assets/state-psc.css`. UP Assistant Professor is its only active exam card; six other state Assistant Professor exams (Haryana, Himachal Pradesh, Jammu and Kashmir, Madhya Pradesh, Rajasthan, Uttarakhand) are non-link Coming soon cards from `_data/statePscExams.json` (rule 21). `/exams/state-psc/up-assistant-professor/` has the five owner-specified resource cards from `_data/statePscResources.json`; **Paper 2 English Literature Mock Tests** (`paper-2-mock-tests/`) has the live Paper 2 Mock Tests, all login-only 100-question CBT papers using `_includes/state-psc-cbt.njk`. **This series is self-serve-published** (owner, 2026-11-14, rule 17): its hub cards are drawn from the **live** `public.paper_catalog` in the browser by `assets/paper-list.js` (static fallback cards from `_data/statePscMockTests.js` stay in the HTML for no-JS/SEO). The `test.njk` and `review.njk` routes are **pre-built for a fixed range** `test-1..30` (from `statePscMockTests.range`), and each page checks the catalog at view time (`data-catalog-check`, `assets/cbt.js`): a live set opens login-gated, anything else shows "This test is not open yet" (never a login wall). So the owner uploads a test, marks it Live on `/admin/papers/`, and its card and page appear with no rebuild; Draft hides them at once. The `sitemap.njk` lines and the static fallback cards still list only the **live** tests, from `statePscMockTests.tests`. Do not hand-write `test-N.njk` or `review-N.njk` here again. Questions are `public.mcq_papers` rows (`up-ap-p2-mock-test-N`), never files in the repo (rule 15). **English PYQ 2026** (owner, 2026-11-21) is a sixth, live card (`english-pyq-2026`, a teal Start button) that opens `/exams/state-psc/up-assistant-professor/english-pyq-2026/`: a **Quick Quiz** (the Daily engine `assets/instant.js`, **not CBT**) of the 90 questions 31 to 120 of the UP AP 2026 English paper, **free, no login, indexable**, in the public file `assets/questions/up-ap-english-2026.json` (ids `upap26-q031` to `upap26-q120`, frozen; level `paper`; kept in `assets/questions/`, not `assets/instant/`, so `_data/passFree.js` does not count it as a Daily age). The owner said it is verified, so nothing was re-checked and **no `topicId` / `periodId` was added** (few students will take it; the quiz still records answers for a logged-in student with no tag). Text, options and answers are as supplied; only the docx's "[Explanation refined in review]" marks were dropped, and each question's `src` is the docx's Reference line (38 have none). **Q104** (code-switching) carries a review caution in the docx (the switch is at a clause boundary; the stem should be clarified before high-stakes use); the answer is kept as listed. A small italic **disclaimer** (`_includes/state-psc-pyq-disclaimer.njk`) sits under the quiz: we tried to be careful, we make no claim that every answer is right, answers are unofficial until the official key is published, study use only. Keep it, and do not call the answers official until the owner says the key is out. `instant.js` got two optional attributes for this page (`data-levels="paper"` = one file, no level choice, and `data-max="90"`); a page without them behaves exactly as before. The other four resource cards still open a noindex Coming soon page from `coming-soon.njk` (the list is `_data/statePscComingSoon.js`, which skips any resource marked `"live": true` in `statePscResources.json`) until content is supplied. Do not recreate `exams/state-psc/index.html` beside its template.
- `quizzes/mcq/<age>/…` (hub, `build/`, `custom/`, `set-<n>/`) is **generated**, not hand-written:
  templates in `quizzes/mcq/_templates/` and `_includes/mcq-page.njk`, data in `_data/mcqSpec.json`
  (see rule 7). Change the template or the registry, never a generated page.
  `quizzes/mcq/index.html` (all ages) is still hand-written.
  **Login MCQ sets are self-serve-published** (owner, 2026-11-14, rule 17): a set that is **planned**
  in the registry — whether already live-login (`access: "login"`) or still a "Coming soon" slot — goes
  live the moment the owner uploads its questions and marks the set **Live** on `/admin/papers/`, with no
  rebuild; marking it Draft hides it again. Every not-yet-live planned slot gets a pre-built, login-gated,
  catalog-checked set/review page (`_data/mcqPendingSets.js` + `set-pending-test.njk` / `set-pending-review.njk`;
  no question file in the repo, rule 15), and every login set page (live or pending) carries
  `data-catalog-check` so `assets/cbt.js` opens it only when `<age>-set-N` is a **live** `paper_catalog` row,
  else "This set is not open yet" (no login wall). On the age hub, `assets/mcq-age.js` flips a login/pending
  set row (marked `data-catalog-set`) between "Coming soon" and Start/lock from the live catalog at view time.
  **Free sets are never catalog-checked** and behave exactly as before. A brand-new login set still needs its
  slot planned in the registry once (title, topics, levels, count); after that, publishing is self-serve.
  **The dashboard age pool follows the live catalog** (owner, 2026-11-17; this closes the gap this series
  shipped with): `assets/dashboard.js` adds the MCQ part of each age's pool up again against the live
  `paper_catalog` — a free set is a file and always counts, a login set the build counted counts only while it
  is live, and a login set published into a Coming-soon slot is added. `tools/build-syllabus.js` writes the
  per-age `liveSets` list that makes this possible. If the catalog cannot be read, the built pool stands.
  **American Literature MCQ ages** (owner, 2026-11-23: "american literature ko bhi vese hi plan karo"): `_data/mcqSpec.json` also
  holds five American ages after the 20 British ones, each with `"tradition": "american"` (`american-colonial`, `american-renaissance`,
  `american-realism`, `american-modernism`, `american-contemporary`; the slug is the notes article's `age:` value and the taxonomy's period id;
  `article` is `ages/<slug>`, the notes of the timeline cards). They are a **separate series**: `_data/mcqAges.js` counts "the Nth of five
  American ages" and the next / previous links inside the series, `tools/build-syllabus.js` leaves them out of the British dashboard pool, and
  `tools/build_skill_zip.py` leaves them out of the UGC NET skill. **The plan** was made by Claude at the owner's request from each age's own
  notes article (every writer, work, term and critic named in a set's one-line scope is in that article; nothing from outside), so the owner may
  change any title, scope or level. **Five sets each, six for Postwar and Contemporary** (32 writers in its notes against 11 to 18 elsewhere).
  Pattern: Set 1 = the whole age (easy + medium); the next sets are one group or genre each; the early sets easy + medium, the later ones
  medium + hard; "terms and criticism" is a hub topic woven into every set, as for the Victorian age. Fifty questions at each level, as for
  the British sets. **Every set is a planned slot with no questions yet** (Coming soon, noindex hub and pages): it opens the way every planned set
  does (rule 17): the owner uploads it at `/admin/upload-paper/` (**American Literature — MCQ set**, then the age; owner, 2026-11-23: it is its own destination beside **British Literature — MCQ set** (the old "English Literature — MCQ set"), each showing only its own series' ages, and both make the id `<age>-set-N` with no exam) and marks it Live, with no
  rebuild; the hub row flips at view time. `/quizzes/mcq/` has an **American Literature By Age** section (`#american-literature`, five cards in
  one line, same card markup and the timeline's painted pictures), under **British Literature By Age** (that heading used to read "Practise By
  Age"); its cards link to the hubs through `SOON_HUBS` in `assets/mcq.js` and keep saying "Questions coming soon". **An age's card opens by itself
  (owner, 2026-11-23)**: `assets/mcq.js` `catalogAges()` reads the live `paper_catalog` at view time and, when it holds a Live set `<age>-set-<n>` of a `SOON_HUBS` age, turns that card into a
  ready card ("Ready when you are", then the reader's own progress) with no rebuild; a failed read leaves "Questions coming soon". So an American set uploaded and marked Live needs no change in
  `assets/mcq.js`. What still waits for a rebuild (needs Claude, step 5 of rule 7 and the registry): the hub's own noindex flag and its `sitemap.njk` line, and the hub's **Build your own test**
  row with its `build/` and `custom/` pages, which exist only for an age with a set marked `"live": true` in `_data/mcqSpec.json` (a British age has them from its free sets). Not done on purpose:
  American answers are not in the British level pool (the dashboard has no American level yet), and `validate_mcq.py` only warns "age is not in the
  known list" for an American file (it has no American slugs; the upload page does not run it).
  **Indian English Literature MCQ ages** (owner, 2026-11-24: "american literature ko mcqs ke liye plan kiya hai, set wise vese hi indian english literature ko bhi karo"):
  the same again, a third series. `_data/mcqSpec.json` holds six Indian English ages after the American ones, each with `"tradition": "indian"`, **one per notes
  article**, the same six cards as the timeline's `#indian-english-literature`: `indian-english-introduction`, `indian-english-beginnings`, `indian-english-early-growth`,
  `indian-english-freedom-years`, `indian-english-independence-era`, `indian-english-late-twentieth` (the slug is the article's `age:` value; `article` is the notes
  folder itself, e.g. `indian-english-beginnings`, not `ages/...`). A name is "Indian English: " plus the article's own label ("Introduction", "Beginnings to 1857",
  "1857 to 1920", "1920 to 1947", "1947 to 1980", "1980 to 2000"); the Introduction's years line says "All periods". **The plan** was made by Claude at the owner's
  request from each article's own text (every writer, work, term and critic named in a set's one-line scope is in that article; nothing from outside; checked name by
  name with a script, no word missing), so the owner may change any title, scope or level. **29 planned sets**: Introduction 3 (background to 1835; names and the language
  debate), Beginnings 4 (five writers), 1857 to 1920 5, 1920 to 1947 5, **1947 to 1980 6** (about twenty writers across novel, poetry and drama) and **1980 to 2000 6**
  (twelve writers). Same pattern as the American ages: Set 1 = the whole age (easy + medium); Set 2 = the world of the age (easy + medium); then one group or genre per set,
  early ones easy + medium, later ones medium + hard; "terms and criticism" is a hub topic woven into every set; fifty questions at each level. **Every set is a planned slot with
  no questions yet** (Coming soon, noindex hub and pages) and opens the way every planned set does (rule 17): the owner uploads it at `/admin/upload-paper/` (**Indian English
  Literature — MCQ set**, its own destination beside the British and American ones, then the age; the id is `<age>-set-N`, no exam) and marks it Live, with no rebuild; the hub
  row flips at view time and the age's card on `/quizzes/mcq/` opens by itself (`SOON_HUBS` in `assets/mcq.js` holds the six slugs; `catalogAges()`). `/quizzes/mcq/` has an
  **Indian English Literature By Age** section (`#indian-english-literature`) under the American one: six cards (the timeline's painted pictures), **six in one line from 1400px,
  three to a line from 761px**, a list on a phone (`#indian-english-literature .mcq-agegrid` rules in `assets/site.css`; the five-column grid would strand the sixth card).
  `_data/mcqAges.js` counts "the Nth of six Indian English parts" and the next / previous links inside the series (`SERIES_WORDS`); `tools/build-syllabus.js` and
  `tools/build_skill_zip.py` leave the series out of the British dashboard pool and the UGC NET skill (a registry entry with no `tradition`, or `"british"`, is British).
  **When the seventh article (2000 to the present) is written:** add one registry entry in the same shape, one card in the `/quizzes/mcq/` section, its slug to `SOON_HUBS` and its period node (see Tagging below);
  the series text counts to "seven" by itself, and its card on the timeline and the landing page is added as the timeline note says. Same as American, not done on purpose:
  Indian English answers are not in the British level pool, and `validate_mcq.py` only warns "age is not in the known list" for such a file. **Tagging (settled 2026-11-24; owner: "if there is no node, build it"):** the master taxonomy's Indian area had only five genre `period` nodes
  (`iwe-beginnings`, `iwe-poetry`, `iwe-fiction`, `iwe-drama`, `iwe-prose`), none for the six articles, so **six `period` nodes were added**, one per article: the id is the article's
  `age:` slug and the name is the hub's own name (`indian-english-introduction` ... `indian-english-late-twentieth`, under `indian-writing-in-english`; migration
  `20261124120000_add_indian_english_period_nodes.sql`, also in `taxonomy-indian.csv`, the master and the tagger skill's copy; applied to the live database and read back, 1711 to 1717 rows).
  Nothing was moved: the five genre nodes and the writers under them stay, and PYQ files already tagged with them keep them. A question in an Indian English set takes `periodId` = its hub's
  node (the Introduction's questions take `indian-english-introduction`); `topicId` is the writer, work or concept, and every topic id in the six articles' front matter is already in the master.
  **When the seventh article is written, add its period node the same way** (one migration, `taxonomy-indian.csv`, the master and the tagger copy, `period-nodes.md`, then `python3 tools/build_skill_zip.py`).
  **Owner's answers, 2026-11-24:** the Introduction stays a hub of its own (3 sets); 6 sets for both 1947 to 1980 and 1980 to 2000 is right; whether Indian English goes into the UGC NET skill zip and
  into a dashboard level is **to be decided later** (do not add either unasked). Built and browser-tested 2026-11-24 (live row opens a card and hub rows, Draft and a failed read change nothing, "not open yet" pages, filters, 375px). Built and browser-tested 2026-11-24 (live row opens a card and hub rows, Draft and a failed read change nothing, "not open yet" pages, filters, 375px).
- `quizzes/daily/<period>/index.html` — instant-quiz hub for one period (hand-written, standalone).
  Engine `assets/instant.js`, questions in `assets/instant/` (see rule 8). Open so far: `anglo-saxon/`, `anglo-norman/`, `age-of-chaucer/`, `fifteenth-century/`, `renaissance/`, `early-tudor/`, `elizabethan/`, `jacobean/`, `caroline/`, `commonwealth/`, `neoclassical/`, `restoration/`, `augustan/`, `age-of-sensibility/`, `romantic/`, `victorian/`, `edwardian/`, `georgian/`, `modern/`, `postmodern/` (all 20 periods are open).
- `quizzes/pyq/` — the **PYQ front door** (rule 19): one card per exam, made by `quizzes/pyq/index.njk` from `_data/pyqHub.js`. UGC NET English is live (links to `/exams/net/english-pyqs/`, rule 18); **UP PGT English is live too** (links to `/exams/pgt/up-pgt/pyqs/`, rule 23; its card, count and years are read from `_data/pgtPyqPapers.js`); TGT English is a non-link Coming soon card. Not hand-written HTML any more.
- `quizzes/mock-tests/` — the **mock-test front door** (rule 20): one card per exam, made by `quizzes/mock-tests/index.njk` from `_data/mockHub.js`, same look as `/quizzes/pyq/` (`.exam-cat*`). UP PGT English and UP Assistant Professor English are live cards; UGC NET English and TGT English are non-link Coming soon cards.
- `literary-criticism/index.njk` — the Literary Criticism hub (**Nunjucks since 2026-11-25**, when the Literary Theory cards began to be drawn from a registry; it was `index.html` before, so the file has no braces of its own and anything added must be valid Nunjucks). Five sections: History of Literary Criticism (eight live articles in `notes/literary-criticism-*`), **Literary Theory**, **Cultural Studies**, **Indian Poetics** and **Key Terms &amp; Concepts** (all four series are registry-driven, Coming soon until an article is written). **Literary Theory** (owner, 2026-11-25) is a series of **8 parts holding 28 chapters**, numbered 1 to 28. **The numbers are not typed**: `_data/literaryTheory.js` counts the chapters in order, so removing or adding one never leaves a gap. **Chapter 1 is "Introduction to Literary Theory"** (owner's answer, 2026-11-25), the first chapter of Part 1 — what theory is, how it differs from criticism, and a map of the other chapters; it has no article yet, so it is a Coming soon card with no thinkers line (the owner supplies the article; invent nothing). **Scope rule (owner, 2026-11-25: "NET syllabus ke according chalenge")**: what belongs here is NET Unit IX, *Literary Theory post World War II* (structuralism, semiotics, poststructuralism, deconstruction, psychoanalysis, Marxism, feminism, reader-response, New Historicism, postcolonialism, queer theory, ecocriticism); what belongs to NET Unit VII, *Cultural Studies*, lives in the **Cultural Studies series** below. Three chapters of the owner's original 32-chapter plan moved there for that reason (the Birmingham School, Popular Culture, Media and Consumer Society, and Nation, Diaspora and Globalisation), and a fourth, **The Frankfurt School and Critical Theory, moved later the same day on the owner's word** ("Frankfurt School chapter Cultural Studies me le jao", 2026-11-25: past NET questions file it under Cultural Studies); the Theory chapters after them were renumbered by the counter, Part 4 (*Society, history and culture*) now holds two chapters, and its summary no longer says it covers everyday culture. Part 7's summary no longer mentions the diaspora. **One topic, one home**: a chapter is either a *school or method for reading a literary text* (Theory) or *culture itself as the subject* (Cultural Studies); where a thinker is in both (Gramsci, Williams) each chapter says so and the other one links. The section shows eight cards (`.ltx-card`, the part number, its name and how many chapters); a card opens that part's own page at `/literary-criticism/literary-theory/<slug>/`, which lists the part's chapters and has previous / next part links. **Everything comes from the one registry `_data/literaryTheory.js`** — the eight cards, the part pages (`literary-criticism/literary-theory/part.njk` paginates it, layout `_includes/literary-theory-layout.njk`), and the sitemap lines. Never hand-write a part page, and never type a part or chapter list into `literary-criticism/index.html`: change the registry. A chapter's article will live at `/notes/<slug>/`; the registry holds that slug and `live: false`, so the card is a plain dashed "Coming soon" box and links nowhere. **A chapter's card opens by itself when its article exists** (owner, 2026-11-26, rule 24): `live` is read from `notes/<slug>/index.md` by `tools/article-live.js`, so publishing the article is the whole job. A typed `live: true` still works, but the build stops if that slug has no article. **The chapters are picture cards too** (owner, 2026-11-25): a chapter is the same `.ltx-card` as a part card (picture on top, then "Chapter N", the title, the thinkers, and a Read / Coming soon line at the foot), three to a line on a desktop, two from 1120px, a row with the picture on the left on a phone. So a chapter can carry its own painting: the same two WebP files in `assets/literary-theory/` and `image` + `alt` on that chapter in the registry — nothing else. With no picture the card shows the chapter number on a plain tinted panel, which is a finished look, not a placeholder gap. The slugs are planned, not fixed: the owner may change any of them while the chapter is not live. `/literary-criticism/literary-theory/` itself has **no page**; `_redirects` sends it (with and without the trailing slash) to `/literary-criticism/#literary-theory`, which is the eight cards. **The eight cards carry a picture** (owner, 2026-11-25): the card is the same shape as the History cards above it, with a 16:10 picture on top and a small "Part N" badge on it. The part cards of Literary Theory, Cultural Studies, Indian Poetics and Key Terms & Concepts and the eight History cards each have their own painted illustration (History card pictures use the slugs in `_data/criticismHistory.json` and live in `assets/literary-criticism/`); the 28 Literary Theory chapter cards have their own pictures too (PR 262, and the Key Terms part cards in PR 263); the Cultural Studies, Indian Poetics and Key Terms & Concepts chapter cards have none yet, so each of those shows its number on a plain tinted panel (`.ltx-thumb-plain`), which is a finished look, not a placeholder gap. To add one: two WebP files in `assets/literary-theory/` (`<slug>.webp` 480 x 300 under 200 KB, and `<slug>-240.webp` 240 x 150), then `image` and `alt` on that part — or on that chapter — in the registry; both kinds of card read it through the one `pic()` helper there. Cards with and without a picture sit side by side correctly. Full note: `docs/literary-theory-card-artwork.md`. The counts printed under the cards come from `_data/literaryTheoryTotals.js` (Nunjucks cannot add a list up), so no number is ever typed into the page. Styles are `.ltx-*` at the end of `assets/site.css`. Still open with the owner (rule 2, do not decide this): whether New Criticism gets a chapter of its own or keeps being covered by `notes/literary-criticism-mid-twentieth`. Part 7 was renamed on 2026-11-25, on the owner's word, from "Race, empire and nation" to **"Empire, race and postcolonial thought"** (its nation chapter had moved to Cultural Studies; the part keeps its old slug, so its URL `/literary-criticism/literary-theory/race-empire-and-nation/` is unchanged). Writer pages are planned but not built: because a thinker appears in several chapters (Barthes in 4, Foucault in 3, Kristeva, Lacan, Jung, Jameson, Williams and Frye in 2 each), a writer page must NOT sit under a chapter — one shared page per thinker, reused by every chapter that names them.
  **Cultural Studies** (owner, 2026-11-25: "NET syllabus ke according chalenge … format wahi jo abhi banaya hai, cards ke andar hub, isi page par") is the same format as Literary Theory, on the same hub page (`#cultural-studies`, under Literary Theory): **3 part cards** (a three-column grid, `.ltx-cards-3` in `assets/site.css`; two columns on a tablet, a list on a phone), each opening a part page at `/literary-criticism/cultural-studies/<slug>/` that lists its chapters as picture cards. **Everything comes from the one registry `_data/culturalStudies.js`** (the cards, the three part pages made by `literary-criticism/cultural-studies/part.njk`, and the totals in `_data/culturalStudiesTotals.js`; the sitemap lines are typed in `sitemap.njk`). Both series draw their part page from one shared include, `_includes/ltx-part.njk`, so a change to the part page is made once. **Its scope is NET Unit VII, Cultural Studies.** **The official UGC NET Bureau syllabus (English, code 30, read 2026-11-25) gives only the unit title, with no topics or thinkers under it**, so every list of Unit VII topics is a study guide's. Our `/exams/net/syllabus/` page words it as *the Birmingham school, ideology and hegemony, popular culture, media, subculture, gender, identity, diaspora and globalisation, including Williams, Hoggart, Hall, Gramsci and Bourdieu* and labels that text "study-guide notes"; never call it official. **12 chapters in 3 parts** (owner, 2026-11-25: "Introduction jod do, aur web search karke jo mile wo add karo"): Part 1 *Culture, class and ideology* (Introduction to Cultural Studies; Raymond Williams: Meanings of Culture and Structure of Feeling; the Birmingham School; Ideology and Hegemony; Bourdieu: Class, Taste and Cultural Capital), Part 2 *Popular culture, media and subculture* (The Frankfurt School and Critical Theory; Popular Culture, Media and Consumer Society; Media and Audiences: Encoding and Decoding; Subculture), Part 3 *Identity, diaspora and globalisation* (Gender and Identity; Race, Ethnicity and Culture; Nation, Diaspora and Globalisation). Four are the owner's own chapters moved from Literary Theory (the Birmingham School, the Frankfurt School, Popular Culture and Nation / Diaspora / Globalisation), with their titles and thinkers unchanged; the Introduction was asked for by the owner; **the other seven were made from the Unit VII words and from web-search results, and `docs/cultural-studies-scope.md` records what each rests on.** **What was checked (2026-11-25, after the owner allowed the sites):** the official syllabus (titles only), the EBSCO Birmingham School overview, and limitlessliterature.com's Unit VII list and its page of 33 past NET Cultural Studies questions (topics counted, no question copied). `mu.ac.in` still did not resolve and the Warwick module address is a 404. The past questions mention Williams, Hall, the Birmingham school, Hoggart, the Frankfurt School and the culture industry most; Gramsci, Bourdieu, Hebdige, subculture, gender and caste are not in them (chapters 4, 5, 8 and 9 rest on the study-guide lists only; Bourdieu and Subculture are the weakest). **Chapter 10, Race, Ethnicity and Culture, is kept on the owner's word** (EBSCO says the Centre studied class, race and feminism; the limitless identity line names race). `docs/cultural-studies-scope.md` records what each chapter rests on and what was found but not added (film studies, caste, cultural imperialism). **Owner's decisions, 2026-11-25:** the Frankfurt School chapter moves here (done); the two weakest chapters, Bourdieu and Subculture, **stay**. Their `people` lines hold only names and books the owner or the search sources gave (Gramsci; Hall; Hebdige's *Subculture*; Hall's *Policing the Crisis* and *The Empire Strikes Back*; Williams's *Culture and Society*, *The Long Revolution*, *Keywords* and *Marxism and Literature*), and nothing for the rest: **add a name only when the owner supplies it** (rule 2). Every chapter is `live: false` (Coming soon). Same article rule as Theory: write the article at `/notes/<slug>/` and set that chapter `live: true`. Pictures: the same two WebP files, in `assets/cultural-studies/` (`pic()` in the registry), then `image` and `alt`. `/literary-criticism/cultural-studies/` has no page; `_redirects` sends it to `#cultural-studies`. Known overlaps the owner has accepted by this split, to keep clear in the articles: Gramsci (Theory chapter 12 and Cultural Studies Ideology and Hegemony) and Williams (Marxist chapter and Birmingham chapter); *Gender and Identity* here is identity in everyday culture and media, not the feminist and queer theory of Theory Part 6. Nothing is open with the owner for this series now (Part 7 of Literary Theory was renamed, see above). Overlaps to keep clear in the articles: Williams (Literary Theory's Marxist chapter, the Birmingham chapter and his own chapter), and *Race, Ethnicity and Culture* versus Theory's Race and Africana Theory.
  **Indian Poetics** (owner, 2026-11-25: "find out Indian poetics chapters and subchapters according to the NET syllabus and add it there") is the same format again, on the same hub page (`#indian-poetics`, under Cultural Studies): **7 part cards** (the default four-column grid, `.ltx-cards`: four and three), each opening a part page at `/literary-criticism/indian-poetics/<slug>/`. Registry `_data/indianPoetics.js` (totals in `_data/indianPoeticsTotals.js`; `literary-criticism/indian-poetics/part.njk`; sitemap lines typed in `sitemap.njk`; `_redirects` sends the bare folder to `#indian-poetics`). **New in this series: subchapters.** A chapter may carry `sub`, a short list shown on its card (`.ltx-subs`, and `.ltx-has-subs` for the phone layout in `assets/site.css`); `_includes/ltx-part.njk` draws it for every series, and Literary Theory and Cultural Studies simply have none yet. **35 chapters, 158 subchapters, in 7 parts**: Part 1 *Drama, rasa and the schools* (Introduction; Bharata and the Natyashastra; the Ten Types of Sanskrit Drama; Sanskrit Dramatists: Bhasa, Kalidasa and Bhavabhuti; Rasa; Interpretations of the Rasa Sutra), Part 2 *Alankara, guna and riti* (Bhamaha; Dandin; Vamana; Rajashekhara), Part 3 *Dhvani, vakrokti and auchitya* (Anandavardhana; Abhinavagupta; Kuntaka; Kshemendra), Part 4 *Later systems and other traditions* (Mammata; Vishwanatha; Bhartrhari; Tolkappiyam), Part 5 *Medieval Indian thought* (Jnanesvara; Bhakti Rasa; Amir Khusrau; Keshavadasa; Al-Badaoni), Part 6 *Modern Indian aesthetics* (Ghalib; Bankimchandra; Tagore; Aurobindo; Coomaraswamy; Jainendra Kumar; Suresh Joshi), Part 7 *Nativism, the margins and the contemporary* (Bhalchandra Nemade; the Hungry Generation; Folk and Tribal Aesthetics; Dalit Aesthetics; Contemporary Indian Poetics). **The first 17 chapters were built first; on 2026-11-25 the owner said "yes, jodlen hai" to adding the rest of the ePG course (modules 18 to 34, now Parts 5 to 7) and the Sanskrit dramatists (chapter 4).** The ePG dramatists module has no body text in the page, so that chapter's subchapters come from its title and the past NET questions only. Parts 5 to 7 have no NET evidence behind them; they follow the UGC course. **What NET actually says: the official UGC NET Bureau syllabus (English, code 30) names no Indian poetics at all; Unit VIII is only "Literary Criticism"**, and our NET page does not mention Indian aesthetics, so the request "according to the NET syllabus" has no official text behind it. Only one coaching site's own list puts "Indian aesthetics: rasa, dhvani, alankara, vakrokti, auchitya and their theorists" under Unit VIII, and its 10 past "Indian Aesthetics" questions are mostly about Sanskrit drama. **The chapters and subchapters therefore follow the UGC's own ePG Pathshala English course, *Indian Literary Criticism and Theory*, and its sister course *Indian aesthetics and fine arts*** (read 2026-11-25; the host `ebooks.inflibnet.ac.in` was allowed in the environment for this). `docs/indian-poetics-scope.md` records what every chapter rests on, the cautions for the articles (course texts, not primary sources; sources disagree on some points), and what was found but not added (types of kavya and nayakas and nayikas from the sister ePG course, Indian and Western poetics compared, Jagannatha). Same article rule as the other series: write the article at `/notes/<slug>/` and set that chapter `live: true`; pictures go in `assets/indian-poetics/`. People lines hold only names and works the sources give. The master taxonomy already has the Indian Poetics nodes (rule 11).
  **Key Terms & Concepts** (owner, 2026-11-25: "Key Terms & Concepts wala section bhi isi format me banao") is the same format again, on the same hub page (`#key-terms`, the last section, under Indian Poetics): **8 part cards** (the default four-column grid, `.ltx-cards`: four and four), each opening a part page at `/literary-criticism/key-terms/<slug>/`. Registry `_data/keyTerms.js` (totals in `_data/keyTermsTotals.js`; `literary-criticism/key-terms/part.njk`; sitemap lines typed in `sitemap.njk`; `_redirects` sends the bare folder to `#key-terms`), shared include `_includes/ltx-part.njk`, terms in `sub` (shown as strips, see below). **40 chapters, 271 terms, in 8 parts**: Part 1 *Figures of speech* (5 chapters), Part 2 *Sound, metre and rhyme* (6), Part 3 *Poetic forms* (5), Part 4 *Genres and modes* (4), Part 5 *Drama and narrative* (6), Part 6 *Rhetoric and general terms* (4), Part 7 *Terms of criticism* (3: classical, Indian poetics, formalism and New Criticism), Part 8 *Terms of modern theory* (7: structuralism, post-structuralism, psychoanalysis and myth, Marxism and culture, gender, readers and history, postcolonial and postmodern). **Every term is a node of the owner's master taxonomy** (rule 11: the 198 terms of "Literary Terms and Devices" and the 76 criticism concepts, 274 nodes of which *Decorum*, *The Sublime* and *Archetype* are in both lists, so 271); a script checked that no taxonomy term is missing and none was added from outside. **The grouping into parts and chapters is an editorial one made by Claude**, so the owner may rename, merge or move any of it, as with the other series. **What NET says: the official UGC NET Bureau syllabus (English, code 30) lists no literary terms at all**; the site must not call any chapter "the NET syllabus". The `people` line is given only on Parts 7 and 8, and only with names the taxonomy gives as the parent of one of that chapter's terms. **Term buttons (owner, 2026-11-25: "ye jo list hai, unke buton bana do, ek patti jo puri idhar se udhar, uske beech naam, click karne se seedha article khulega"):** unlike the other series, every term in a chapter card is a **full-width strip** (`.ltx-term`, 44px high, name centred; in `_includes/ltx-part.njk`, only for a chapter the registry marks `strips`), not a bullet. **Each term has its own article** at `/notes/term-<name>/` (the name lower-cased, plain letters, hyphens: `term-simile`, `term-the-nine-rasas-navarasa`; `termSlug()` in `_data/keyTerms.js`, which stops the build if two terms make the same address). In Pages CMS the owner creates the article with the folder name `term-<name>`. **A term whose article does not exist is a plain strip with no link** (no 404; a screen reader hears "article coming soon"). **A term's strip opens by itself once `notes/term-<name>/index.md` exists** (owner, 2026-11-26, rule 24). The `liveTerms` list at the top of `_data/keyTerms.js` still works for a term you want to name explicitly (e.g. `"Simile"`); the build stops with a plain message if the name is not a term or `notes/term-<name>/index.md` is missing, and the strip turns teal and links to the article. A chapter card around its strips is only a box, so it never links and never lifts on hover; its foot says "Coming soon", then "N of M articles ready" (counted, never typed). A chapter's own `slug` / `live` are not used for Key Terms (the terms are the articles); the part page and the hub line "Articles coming soon" go by the terms' live count. The part page's intro line is set by `series.note` in `literary-criticism/key-terms/part.njk` (the shared include falls back to its old text for the other series). The other series keep their plain bullet lists. Pictures go in `assets/key-terms/` (`pic()` in the registry). Full record: `docs/key-terms-scope.md`. Add a term only after the owner adds its node to the taxonomy (rule 11). **Owner's answer, 2026-11-25: the short Indian poetics list in Part 7 stays** (do not move it into the Indian Poetics series; the articles should link to that series for the full treatment). Still open with the owner (ask, do not decide): whether the grouping into parts and chapters is what they want.
- `download/index.html` — the **Download hub** (owner, 2026-11-19): one page that lists everything a visitor can download, or the page that holds it, **by exam**. Standalone HTML (not templated, so use `<!-- -->` comments, never `{# #}`). Five exam cards (UGC NET / JRF, UP PGT, UP Assistant Professor, BA, MA); a card opens one panel below it, and each panel has the sub-sections **Syllabus**, **Important Books** and **Notes** (`assets/download-hub.js`, styles `.dlx*` at the end of `site.css`). `/download/#dl-net`, `#dl-up-pgt`, `#dl-up-ap`, `#dl-ba`, `#dl-ma` open a panel directly; with no JavaScript every panel is open. Item kinds: a real PDF (teal **Download PDF**, one click, turns green and says "Download again"; today only the two UP PGT syllabus PDFs in `assets/downloads/`, the same files as `/exams/pgt/up-pgt/syllabus-download/`), a link to a page that really exists (**Read** / **Open**), or a dashed non-link **Coming soon** row. Add an item only when the file or page really exists (rule 2): move a Coming soon row up when the owner supplies the file, and add its size line (`PDF · N pages · N KB`). NET Important Books and NET Complete Syllabus are still `available: false` in `_data/netResources.json`; the Important Books, UP Assistant Professor syllabus, and BA / MA syllabus rows are Coming soon too.
- `video-lessons/index.njk` — the **Video Lessons page** (owner, 2026-11-20): real videos of the AK Explained YouTube channel, listed from `_data/videoLessons.js` (one line per video: YouTube id, topic, title exactly as on YouTube, length; read from the channel with vidIQ). A dark bar **"Choose Your Playlist"** (`.vl-bar`) opens a panel of 11 playlists plus "All lessons" (owner's request: Poems, Novels, Biography, Essays and so on); picking one filters the cards, shows the name and a "More on YouTube" link when the channel has a matching real playlist (`yt` in the `topics` list; ids read through vidIQ, linked by name only), and closes the panel. Cards show 12 at a time with "Show more" (`assets/video-lessons.js`, styles `assets/video-lessons.css`); with no JavaScript the bar is hidden and every video is listed; `/video-lessons/#poems` opens a playlist directly. The four videos on the landing page (`videos` in `assets/home.js`) come first in "All lessons". Each card opens the video on YouTube in a new tab (no embed, so nothing new is collected). Titles are kept as published (typos too, rule 2); each video's playlist was chosen from its title, so move a line to another topic key if one looks wrong. Playlist names do not say "in Hindi" because not every title says it. The page is just the head (`h1` and one line) and then one section, "Browse the lessons" (owner, 2026-11-20: the "Lessons from the channel" text band and its picture were removed; the only YouTube channel link left is the note under the list). The bar is a light teal (`#0F766E` to `#16847A`, white text above 4.5:1), not the dark navy-green it first had. To add lessons, add lines to `rows`; the channel has more videos than the list (not Shorts).
- `pass/` (the All Access pass page, `assets/pass.js`) and `refund-policy/` — the paid layer's public pages (rule 22).
- `admin/` — the owner-only admin area (rule 16). `admin/index.html` is the home; the tools are `admin/upload-paper/` (a login paper, rule 15, `assets/upload-paper.js`), `admin/upload-article/` (a notes article from its `.md` file, rule 24, `assets/upload-article.js`), `admin/articles/` (every article, and the chapters still to write, rule 24, `assets/admin-articles.js`), `admin/upload-mcq/` (a FREE MCQ set from its question files, rule 25, `assets/upload-mcq.js`), `admin/upload-daily/` (a corrected Daily quiz, rule 26, `assets/upload-daily.js`), `admin/papers/` (all papers, make Live/Draft), `admin/notify/` (send a dashboard notice), `admin/students/` (who signed up), `admin/reviews/` (moderate reviews), `admin/payments/` (pass price, promo codes, orders; rule 22). The last five plus the home and the nav run on `assets/admin.js`. Every admin page is **noindex, in no menu, in no sitemap, and `/admin/` is Disallowed in `robots.txt`**, and shows nothing but "You are not allowed to use this page." to everyone except the logins in `public.paper_admins`.
- `sitemap.njk` builds `/sitemap.xml`: hand-written lines, except the UP Assistant Professor mock tests, which come from the paper catalog, and **every `/notes/` article, which comes from `_data/notesIndex.js`** (rule 24) — never add a notes line by hand. Pages CMS edits it as "Sitemap" (`.pages.yml`).
- `CLAUDE.md`, `AGENTS.md`, `docs/` and `tools/` are notes for maintainers: `eleventy.config.js` keeps them out of the published site.
- `assets/site.css` — everything shared; `eleventy.config.js` syncs the header,
  footer, the shared Daily artwork for existing illustrated non-article page heads, and `nav.js` into every built page

The list of literary periods (20, from Old English to Postmodern; the five American and the six Indian English MCQ ages are separate series, see rule 3's `quizzes/mcq` note) is the same on three pages and
must stay in step: `_data/mcqSpec.json` (+ the cards in `quizzes/mcq/index.html` and the slugs in
`assets/mcq.js`), the cards in `quizzes/daily/index.html` (and its period filter, one option per age), and `ages` in `assets/home.js`.
The timeline page `english-literature/index.html` shows the same 20 ages (one small tile each, 6 to a line on a wide screen, same names, years, writers and notes link as `ages` in `assets/home.js`), so those details must stay in step too. **The timeline and landing page share one card artwork series** (owner, 2026-11-20): original representative painted scenes, one distinct scene per age in one consistent style, in `assets/age-cards/`. Do not replace these with public-domain portraits or reuse these card files as article heroes. Each has a 480 × 300 WebP and a 240 × 150 responsive copy; keep both compressed and inspect them at card size. See `docs/age-card-artwork.md`.
**American Literature section** (owner, 2026-11-20): a second section on the timeline page (`#american-literature`, same tile markup) holds five American age cards, from Colonial and Early National (1600–1830) through Postwar and Contemporary (1945–present). On wide screens its cards fill one row in five equal columns; the British section keeps six. It is separate from the 20 British ages above, so it is not in the 20-age `ages` list of `assets/home.js` or in `_data/mcqSpec.json`. **The landing page shows the same five cards too** (owner, 2026-11-21): a section "American Literature by Ages" (`#american-ages`) under the British one, drawn by `assets/home.js` from its own `americanAges` list (name, years, writers and alt text copied from the timeline cards; keep both in step) with the same `.agecard` markup, and its "View complete timeline" link goes to `/english-literature/#american-literature`. On a wide screen the five fill exactly one line; it has no "+" tab, so all five show on every screen width. Its band has its own soft sand background (`--tint`, with a top border) so it reads as a separate group from the British section, which stays on the page background (owner, 2026-11-21; rule in `assets/home.css`). See `docs/age-card-artwork.md`.
**Indian English Literature section** (owner, 2026-11-23): a third section on the timeline page (`#indian-english-literature`, same tile markup, under the American one) with one card per article so far: the introduction `/notes/indian-english-introduction/` (`notes/indian-english-introduction/index.md`), **Beginnings to 1857** `/notes/indian-english-beginnings/` (`notes/indian-english-beginnings/index.md`) and **1857 to 1920** `/notes/indian-english-early-growth/` (`notes/indian-english-early-growth/index.md`), all supplied by the owner (the slug of each is its own `age` front matter value); four period articles follow in the series, so add their cards to this section in order. Each card's words come from its article (the second card shows 1794 – 1857, the article's own working boundaries, and the names Roy, Derozio, Dutt; the third shows 1857 – 1920, its title is the article's own `crumb_label`, and its names are the first three in the article's description: Toru Dutt, Tagore, Aurobindo). The introduction card's painting is `assets/age-cards/indian-english-painted.webp` (480 × 300, 40,816 bytes) and `-240.webp` (240 × 150, 12,112 bytes): an imagined early nineteenth-century Calcutta college verandah with students, a teacher, books, a globe, a hand press and sailing ships on the river (no real person). It was made with vidIQ from a text prompt only (the tool picked GPT Image 2.6), centre-cropped from 16:9 to 1.6:1 and exported to WebP. The Beginnings card's painting is `assets/age-cards/indian-english-beginnings-painted.webp` (480 × 300, 28,688 bytes) and `-240.webp` (240 × 150, 8,302 bytes): an imagined young poet writing by lamplight, with books, palm-leaf manuscripts and the Hooghly at dusk (no real person), made the same way, cropped with the window shifted 48 px right of centre so the ship stays in frame. The 1857 to 1920 card's painting is `assets/age-cards/indian-english-early-growth-painted.webp` (480 × 300, 40,428 bytes) and `-240.webp` (240 × 150, 11,690 bytes): an imagined late nineteenth-century Bengal garden at golden hour with two young women reading under a tall casuarina tree (a nod to *Our Casuarina Tree*, not a portrait of anyone), a colonnaded house and the river with a sailing boat, made the same way and centre-cropped. The line under the section heading says the card pictures are original painted interpretations, as the artwork rule asks. Keep the `.yr` badge short ("Intro"): a long one is clipped by the 84px thumbnail on phones. It is not in the 20-age or the American lists. **Six cards now** (owner, 2026-11-23): the three above, **1920 to 1947** `/notes/indian-english-freedom-years/` (Anand, Narayan, Raja Rao), **1947 to 1980** `/notes/indian-english-independence-era/` (Ezekiel, Desai, Karnad) and **1980 to 2000** `/notes/indian-english-late-twentieth/` (Rushdie, Ghosh, Seth); one more period article follows. **The landing page shows these cards too** (owner, 2026-11-23): a band "Indian English Literature by Ages" (`#indian-ages`) under the American one, its six cards are **plain HTML in `index.html`** (`#indianTrack`), not made by `assets/home.js` (owner's screenshot, 2026-11-23: the band showed no cards when a browser ran an older `home.js` against the new HTML; cards that exist in the HTML cannot go missing that way; `home.js` `setupIndianSlider` only runs the slide button). Name, years, writers and alt text are copied from the timeline cards, so keep both in step by hand; same `.agecard` markup and card files (the introduction's picture is `indian-english`); its "View complete timeline" link goes to `/english-literature/#indian-english-literature`. **It is a slider, not a grid** (owner, 2026-11-23: "5 hi cards rakho"; chosen from three options): the track is one row that scrolls sideways (`#indianTrack`, `.slider*` in `assets/home.css`, `setupIndianSlider` in `assets/home.js`); 5 cards are in view on a wide screen (3 on a tablet, 2 from 560px), the rest wait off to the right. A round arrow button at the right end slides the row on by one screenful (`More`); once the last card is in view the same spot becomes a link to `/english-literature/#indian-english-literature` (`Full timeline`), and a small back arrow shows after the row has slid. The header link "View complete timeline" stays. On a phone it is a plain list of the first five cards with a full-width "Read the full timeline" link under it (the sixth card and later ones are only on the timeline page). Touch swipe, trackpad and keyboard work too. Add each new article's card to the track in `index.html` and to the timeline section together; the slider needs no other change. If the JavaScript does not run, the five cards still show, scroll sideways, and the timeline link works. Its band stays on the page background with a top line (the American band above it is the sand `--tint`), so the three bands alternate. All the articles are in the home search (a `Note` line each in `searchIndex`, `assets/home.js`) and in `sitemap.njk`. Their front matter `tradition: indian` is free text, like `tradition: american`: nothing in the build reads or validates it.
**Landing page band colours (owner's rule, 2026-11-26): har section ka background apne saath wale section se thoda alag dikhna chahiye.** The page steps gently down: British ages on the page background `--bg`, American on the sand `--tint`, Indian English back on `--bg`, History of Literary Criticism on `--sand-deep` (`#EFEAD9`, defined in `assets/home.css` and used only there) — `--tint` next to `--bg` read as the same colour to the owner, so the fourth band needed its own deeper shade. When picking a new shade, keep the section's teal "View all …" link at 4.5:1 or better against it (`#EFEAD9` gives 4.55; a shade darker fell below).

**The History of Literary Criticism articles are in the home search** (owner, 2026-11-26): the hub `/literary-criticism/` as a `Page` row and the eight articles as `Note` rows in `searchIndex` (`assets/home.js`), each labelled with the article's own `title:`. The hub row sits **before** the eight, because the list's order is the result order and the panel shows only seven hits, so "criticism" opens with the hub. Add a ninth article's row here when it is written **only to give it a different label**: since 2026-11-26 every notes article is in the home search by itself (`/assets/notes-search.json`, rule 24), so a missing row no longer hides an article.

**History of Literary Criticism on the landing page** (owner, 2026-11-26): a fourth band (`#criticism-history`) under the Indian English one, with the eight History of Literary Criticism cards in **one line**. It is a slider like the Indian band (5 cards in view on a wide screen, 3 from 620px, 2 from 560px; the round button slides the row and then becomes a link to `/literary-criticism/`; on a phone it is a list of the first five cards with a full-width "Read all the criticism notes" link under it). The cards are **plain HTML in `index.html`**, like the Indian ones, not made by `assets/home.js`. **The card design is exactly the age cards' above** (owner, 2026-11-26): same `.agecard` markup — picture with a short year badge (`.yr`), name, teal era line, then the names line. Their words are copied from `_data/criticismHistory.json` (title, summary, alt — the same words as the History cards on `/literary-criticism/`), the teal era line is each article's own `period:` front matter (`notes/literary-criticism-<slug>/index.md`) written with the same spaced dash as the age cards, and the badge is the first date of that period ("Intro" for the introduction card, as on the Indian card). Two things on the introduction card are shortened so it reads like the others, and only there: its name is the article's own `crumb_label` ("Introduction to Criticism") and its names line is its own summary in the same dotted form ("What criticism is · What critics do · Its kinds"). Keep all of it in step by hand, and invent no date. The pictures are the hub's own card files in `assets/literary-criticism/`. The band's background is `--sand-deep` (see the band-colour rule above), so no two neighbouring bands look the same. The slider script in `assets/home.js` is now one shared `setupSlider(name, endCap)` (ids are `<name>Track`, `<name>Prev`, `<name>Next`, `<name>End`, `<name>Cap`), used by both bands; `.slider*` in `assets/home.css` is shared too. When a ninth criticism article is written, add its card here and on `/literary-criticism/` together.

Names and years come from the Daily page. Invent none of them. The landing page uses the same painted card files and responsive variants as the timeline (owner, 2026-11-20). Daily keeps its existing pictures unless the owner asks to change them.

The menu lives in three places and must stay in step: `_includes/base.njk` and the
sidebar markup copied into `index.html` and `404.html` (every other page gets it from base.njk at build).

**The default footer belongs on every public page**, including custom exam hubs and their related pages (owner, 2026-11-07). Keep the shared footer from `_includes/base.njk`; custom layouts use `<footer class="site-footer"></footer>` so `syncChrome` supplies it automatically. A new page design must not replace it with a page-specific footer.

**Literary-age article headers (owner, 2026-11-19):** every age article and its query-specific period view uses its own continuous, full-width painting with `hero-article-full`, the fade approved on Old English. Keep period-specific `hero_variants` working. New artwork is WebP under about 200 KB; preserve original dimensions and keep old artwork available. This treatment does not apply to the dashboard, landing page or non-article headers.

## SEO rules (owner, 2026-11-19)
- **Anything free and open without a login is indexable** (free MCQ sets, free PGT MCQ days 1–10, free mock tests, free PYQs, hubs, notes). Login/paid pages, review pages, "build your own test", dashboard, admin, login and coming-soon pages are `noindex`. A login page that is not live at build is noindex too. A noindex page is never in `sitemap.njk`; an indexable page should be.
- `eleventy.config.js` has a `seoTags` transform: every indexable page gets a canonical link and Open Graph / Twitter tags (from its own URL, `<title>` and description) unless it already has them. A new page needs only a good `<title>` and `<meta name="description">` (about 50–160 characters).
- Each page has exactly one `<h1>` (a `noscript` message is an `<h2>`).
- **Link card picture: the owner's wide card art (owner, 2026-11-21; settled on the third try, so ASK before changing it again).** The "card" is the preview box that WhatsApp, Facebook, X, LinkedIn and Telegram build when a link of the site is shared; it is never shown on the site itself (the owner learned this and chose the wide card for it: "jo maine diya tha wapas usi ko lagao, card social media ke liye"). The picture is the **owner's own card art**: the logo, "AK Explained", "English Literature, explained.", the exam areas and the four boxes (Study Notes, MCQ Practice, Previous Year Qs, Exam Guides). It is `assets/share-card.jpg`: **1200 x 600, exactly 2:1, a light JPEG (about 137 KB)**, made by `python3 tools/make-share-card.py` from the owner's original `tools/share-card-source.webp` (1774 x 887). The card type is `twitter:card = summary_large_image`. **The portrait logo stays the site's logo, not the link card:** it is the tab icon (`<link rel="icon" href="/assets/logo.png">`, all 747 pages), the header logo and the Organization logo in the home page JSON-LD. **History, so nobody redoes it:** the wide text banner `assets/social-card.png` was replaced by this art; a square portrait-only card (`assets/share-logo.png`, `tools/make-share-image.py`) was tried and published for a short time (PR 216) and then dropped on the owner's word; the logo-only files are in git history (commit `32830f3`) and the old banner in earlier commits. **Why 2:1 and nothing cropped:** X shows 2:1 whole; Facebook and LinkedIn trim a 2:1 picture to 1.91:1, about 2.4% (27 px) off each side, and WhatsApp's own limit is a 4:1 maximum ratio; the art keeps the logo, all text and the four boxes inside the middle of the width, so only blank margin and the edge of the big faded "A" can be trimmed (checked 2026-11-21 with a simulated 1.91:1 crop). If the art is ever redrawn, keep text and the logo at least 40 px (at 1200 wide) from the left and right edges. **A page has one preview picture for WhatsApp, Facebook, LinkedIn and Telegram** (they all read `og:image`); only X can take a different one (`twitter:image`), which is not used. **Why JPEG:** it is the one format every link-card app reads (WebP is read by Facebook and X, but sources disagree for LinkedIn and one WhatsApp guide says avoid it); a palette PNG ruined the portrait (blocky skin and hair) and a full-colour PNG was 330 KB. Keep the file small (WhatsApp's official limit is 600 KB, some guides say 300 KB). The picture's URL is one constant, `SHARE_IMAGE` in `eleventy.config.js`; the `shareImage` transform there puts the image, its size (1200 x 600), type, alt text and card type on **every** built page, noindex pages too (login, tests, reviews, coming soon, admin), and `404.html` carries the same tags by hand because it is copied, not built. The hand-written pages and the two layouts (`base.njk`, `mcq-page.njk`) carry the image and card type in their source. The alt text repeats only what the picture says (rule 2). **A changed picture needs a new file name**, because WhatsApp and Facebook remember the old one. After any change, check that no built page lacks the tags (the 2026-11-21 check: 747 of 747 pages).

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
- Honest limit: "Confirm email" is ON (rule 10), so a review needs an email the student has opened or a Google
  account; that is a real wall, but not a perfect one. The one-per-user rule and easy removal are the net. `/privacy/` states what a review stores and that it
  is public — keep it true in the same commit as any change here (rule 10).
- **Long reviews are cut at 12 lines** (owner, 2026-11-13): on the home carousel a review that needs more than 12 lines
  shows 12 lines and a round "+" button under the text; the button opens the whole review (it turns into a "−") and a
  second tap closes it. A review that fits in 12 lines gets no button. It is CSS `.txt.clamp` plus `markClamps()` in
  `assets/home.js` (the line count is measured, so it follows the screen width). While any review is open the carousel does
  not auto-advance. Keep this working when the review card is touched.
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
7. **Files from the UGC NET skill** (`tools/ugc-net-mcq-skill/`, Drive folder "UGC NET"): they are made in the site's exact format and must
   already pass `validate_mcq.py <files> --strict` with no errors; if they do not, send them back rather than editing them. The skill's
   zip (`tools/dist/ugc-net-mcq-generator-tagger.zip`) holds a copy of the taxonomy and of the set plan: after a set goes live, or the
   taxonomy, the registry or the validator changes, run `python3 tools/build_skill_zip.py` and commit the new zip (`--check` says when).
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
   card on the Daily page ("Start Quiz →"), add the page to `sitemap.njk` (it builds `/sitemap.xml`). Anglo-Norman was done this way.
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

**A login paper does not need SQL any more** (2026-11-12). The owner uploads the question file at
`/admin/upload-paper/` with their own login, and the database checks it (rule 15). Prefer that over writing a
load SQL: it is fewer steps for everyone and no 90 KB of SQL moves through chat. Claude still does the rest —
the registry row, the pages, `tools/sync_catalog.py`, the build and the push.

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
  not live is not in the pool. **Paid sets count only for a student who can open them** (owner, 2026-11-19: "jo question vo
  open kar sakta hai"): an admin or someone with a running pass; otherwise those sets are left out of the pool AND their
  answers are left out of the count (`loadPaidAccess`, `applyLiveCatalog(…, paidOpen)`, `syl.paidLocked` / `freeSetIds`,
  `computeBritish`), so coverage never inflates; the level card then says paid tests count once there is a pass. If the
  pass / admin read fails nothing is held back (the built pool stands). Free sets are files and always count. **Which login sets are live is read from the live `paper_catalog` when the
  dashboard opens** (owner, 2026-11-17, rule 17), so a set published or hidden self-serve changes the pool at
  once; the syllabus file's `liveSets` says what the build counted, and a failed read leaves the built pool
  as it is. Strengths and Areas to improve judge **specific topics only** (never a whole
  period, never "not sorted"), at least 3 answers each. **Top students** shows up to 10, ranked by **points =
  right answers x accuracy** (each question once, latest answer; owner, 2026-11-06: rank must depend on both how
  many questions and how accurate, never one lucky answer on top). The board shows rank, name, points and accuracy;
  every student who has **logged in** (`auth.users.last_sign_in_at` set; an unconfirmed sign-up is not listed, so a stranger cannot put a name
  on the board) is ranked, a student with no answers has 0 points and "No answers yet" and falls off once ten are above them
  (`min_questions` is 0; set it to 1 for "only after the first answer"). The name is the profile name, else the account name, else
  "Student", never an email. Both are one place in the SQL (`min_questions`, `score`).
  `/dashboard/` has **no page head and no breadcrumb**: its own top bar (`.dashtop`, static markup in
  `dashboard/index.html`) carries the `h1`, the bell and the profile button, and the header card sits right
  under it. The **bell is wired to `public.notifications`** (2026-11-13, `assets/dashboard.js` `wireBell`): it
  stays `disabled` with no dot while the student has **no** notification at all, wakes up once there is one, and
  shows a dot with the unread count only while some are unread; opening the panel writes `notification_reads` so
  the count clears on every device. Never show a dot or count with nothing real behind it. An admin sends the
  messages from `/admin/notify/`. The header keeps its original pictures (owner clarification, 2026-11-19): `assets/dash-banner.webp`
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
  keeps one `user_id` and their `attempts` stay together. There is no switch to turn this off. Caveat
  (only if "Confirm email" is ever turned OFF again): every email signup would count as confirmed, so anyone could
  pre-register someone else's address with a password and later share the account when that person uses Google.
  **"Confirm email" is ON today** (owner, 2026-11-03; live check 2026-11-11: `/auth/v1/settings` gives
  `mailer_autoconfirm = false`), so that hole is closed. Keep it ON. A Google email that differs from the account's email makes a
  second account (manual linking is a separate, off-by-default beta).
- **One domain.** The site lives on `https://akexplained.com`. www is a different origin to the browser (separate
  login, separate saved progress, and Supabase only lets Google return to the bare domain), so `auth.js` sends
  anyone on `www.akexplained.com` to the same page on the bare domain. The proper fix is a Cloudflare redirect
  rule (the site is on Cloudflare Pages, whose `_redirects` cannot match a domain; the owner sets the rule in the
  Cloudflare dashboard). **That rule is live since 2026-11-03** (a 301 from `https://www.*` to `https://${1}`);
  the `auth.js` net stays as a backup. Details in `docs/accounts-status.md`.
- **Delete my account** (`/account/`, 2026-11-11): the Edge Function `delete-account` (`supabase/functions/delete-account/`) removes the login user; everything else goes by `on delete cascade`, **so every new table with a `user_id` must reference `auth.users (id) on delete cascade`**. Details and the test record: `docs/accounts-status.md`. `/privacy/` and `/terms/` say students can delete their own account: keep them true.
- **Keep `/privacy/` and `/terms/` true.** They state what is collected: with an account, name, email, a
  hashed password or Google sign-in, chosen path(s), "notify me" requests, and quiz answers while logged in, held
  in Supabase. Change them in the same commit as any change to what is collected (for example a new table, a
  new provider, or emails after SMTP). The Terms line "no paid tier" is the owner's and must change when that does.
- Schema: `profiles`, `attempts`, `quiz_runs`, `reading_progress`, `mcq_papers` (login / paid MCQ sets, rule 15; it has a `status` column, `draft` or `live`), `paper_admins` (the admin allow list — who may upload a paper AND use every other admin tool), `paper_catalog` (a paper's public metadata, no questions), `notifications` + `notification_reads` (dashboard bell messages and who has opened them, rule 16), `pass_plans`, `promo_codes`, `pass_orders`, `passes`, `paper_opens` (the paid layer, rule 22), `exams`, `topics`, `exam_topics`,
  `user_exams`, `notify_requests`. RLS is own-rows-only (a user sees only their rows); an **admin** (a `paper_admins`
  row) also reads all `profiles`, `attempts`, `quiz_runs`, `reviews` and `mcq_papers`, and may moderate reviews and
  send notifications (rule 16). Reference tables (`exams`, `topics`, `exam_topics`) are world-readable; anon gets nothing.
- Migrations live in `supabase/migrations/` (ordered, run once by the owner). Each is one
  transaction; data loads use `on conflict (id) do nothing`; topic rows are inserted
  parents-first. `supabase/full-setup.sql` is a consolidated, idempotent one-shot.
  `docs/db-notes.md` explains every table in plain English. **Never gate content that is already free**
  — articles, the Daily quiz and the free MCQ sets (all 300 Old English questions so far) stay open to everyone.
  New MCQ sets may be login sets, only when the owner says so (rule 15).

## 11. Topic taxonomy
`topics` is a self-referencing tree with `parent_id` and `kind`
(`area | period | movement | writer | work | concept`). 1738 rows across 9 areas
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
The Indian area has five genre `period` nodes (`iwe-*`) and, since 2026-11-24, six `period` nodes with the Indian English notes articles' `age:` slugs as ids (rule 3, `quizzes/mcq` note);
writers and works stay under the genre nodes.
**Twenty-one thinkers of the live Literary Theory chapters were added on 2026-11-27** (owner: "i approve 21 nodes"; migration `20261127120000_add_theory_thinker_nodes.sql`, also in `taxonomy-criticism.csv`, the master and the tagger skill's copy; tested on a scratch Postgres, applied to the live database and read back, 1717 to 1738 rows, 0 orphans): Husserl, Heidegger, Gadamer, Ricoeur, Schleiermacher, Dilthey, Ingarden, E. D. Hirsch, Bakhtin, Voloshinov, Medvedev, Peirce, Eco, Mukařovský, Bal, Prince, Chatman and Hoggart directly under the area, Rosenblatt and Holland under `reader-response-criticism`, Tynianov under `russian-formalism`. **No school, concept or period node was added** (none was approved); re-parent with one UPDATE if the owner adds a school.

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
- **Four plans the owner asked for on 2026-11-27, none started** (full text: `docs/future-plans.md` section 7): **UP PGT English PYQs as paid** papers (the three free years 2000, 2002, 2006 stay free); **UGC NET Paper 1 PYQs, free and paid** (blocked first by the taxonomy: it has no Paper 1 topics, and the owner must supply them, rule 11); **UGC NET mock tests** (Paper II English, and Paper 1 if the owner says so); and **Literary Theory MCQs, free and paid**, where the owner wants the **plan made first** (from the chapter articles, as for the American and Indian English sets) before any page or upload slot is built. **That plan is drafted, version 2 (2026-11-27): `docs/literary-criticism-mcq-plan.md`**, after the owner's answers: it covers **every section of the Literary Criticism hub** (History, Literary Theory, Cultural Studies, Indian Poetics, Key Terms), each chapter has **at least 3 sets** (as many as it takes to cover its article, checked by `node tools/criticism-mcq-plan.js --check`), **a chapter whose article is not written is not planned until it is**, New Criticism is a separate small set, **Set 1 of every hub is free and the rest paid**, hub and section keep the names of the Literary Criticism pages, no `periodId`. Ready now: 18 chapters, 62 sets; nothing is in the registry yet and no page or slot is built. The 21 thinker nodes were approved and added the same day (rule 11). Ask the owner the "Decisions owed" lines there before building any of them.
- **The paid layer** is launched (rule 22): every login paper is paid; the pass goes **On sale** only when the owner ticks it. **Big PDFs go to Cloudflare R2** (owner, 2026-11-07): nothing is built for it; ask before building.
- `attempts.topic_id` and `attempts.period_id` are `null` for attempts made before the tags reach the
  live site. All 2,000 Daily and 300 Old English MCQ questions now carry `topicId` + `periodId`
  (tagged with `tools/tagging/write_tags.py`; the owner's ruling on each doubtful kind is in rule 12).
  The UGC NET skill (`tools/ugc-net-mcq-skill/`) now emits `id` + `topicId` + `periodId` + `qtype` and is checked by `validate_mcq.py --strict`;
  the older generator (`tools/mcq-skill/SKILL.md`) still does not. (`validate_mcq.py` accepts these fields; for a login set `make_gated_sql.py` is the real gate.) Nodes still missing from the master are collected in
  `tools/tagging/reports/node-gaps.md` (next migration batch; the owner decides).
- Migrate a guest's `localStorage` attempts into the DB on login — planned, not built.
- Password reset and email-confirmation landings are built in `assets/login.js` (implicit flow:
  `auth.js` latches the `PASSWORD_RECOVERY` event and reads the link `type` from the URL). "Forgot
  password?" shows the real reset form when Confirm email is ON in Supabase
  (`/auth/v1/settings` → `mailer_autoconfirm = false`, i.e. custom SMTP is live) or with `?reset=1`;
  with it OFF it shows the contact-us note. **Live today: custom SMTP (Resend) is on and Confirm email is ON**
  (since 2026-11-03; the reset flow was tested end to end). Keep it ON; it must only ever be ON with working SMTP, or
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
- **Testing signup / login flows.** Resend refuses `example.com` (and similar test domains) with
  `550 Invalid 'to' field`, and Supabase then answers a signup with **"Error sending confirmation email"** (500).
  That is the test address, not a broken site: real signups work. To test something that needs a logged-in user (as the
  delete-account test did, 2026-11-11), insert a confirmed throwaway user by SQL on the connector, sign in with
  `POST /auth/v1/token?grant_type=password`, run the test, and delete the user afterwards. Do not spend real email on tests.
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
- **paid**: LIVE since 2026-11-18 (rule 22). **Every** `mcq_papers` row is now `access = 'paid'` (there are no login rows
  left); a student reads one only while a pass of theirs is running (`mcq_papers_paid_read`); an admin reads all. The
  registry (`_data/mcqSpec.json`, `_data/netPyqs.json`) still labels these sets `"access": "login"` (it means "not a public
  file"; `_data/mcqAges.js` stops the build on `"paid"`); the database decides login vs paid, and the pages read it from
  `paper_catalog.access`. Paid → free is never done silently: it publishes the questions.
- **The upload page** (`/admin/upload-paper/`, built 2026-11-12) is the normal way to get a login paper in.
  The owner picks the file(s), a Title, a Category and Draft or Live, and the browser writes the rows itself with
  the publishable key and the owner's login. There is **no service key and no Edge Function** (owner's decision).
  - Who may write: a row in `public.paper_admins` (added by SQL only, never from a browser). Everyone else —
    guest or student — sees only "You are not allowed to use this page."
  - The database is the real gate, not the page's JavaScript: the trigger `mcq_papers_check_body` refuses a paper
    unless every question has a unique id (in this paper and in every other paper), exactly four different
    non-empty options, the right option marked 0 to 3, an explanation, a real `topicId` and, when given, a real
    `periodId`; it refuses a paper in which **more than 10** questions are already in another paper (owner, 2026-11-18: one to ten shared questions are allowed, because two exam papers do repeat a question; more than ten is a copy or a file saved under the wrong name; migration `20261118120000_allow_few_similar_questions.sql`; the upload page then lists the shared ones as information through the admin-only `paper_similar_questions(set_id)`), anything but `access = 'login'`, a body that names
    another set, level or rev, a rev that goes backwards, and (since 2026-11-18) an access other than login/paid or a
    paid paper re-uploaded as login. Its messages are plain English and the page shows
    them as they are.
  - `mcq_papers.status` is `draft` (only an admin can read it) or `live` (students can). New uploads default to
    draft; everything loaded before 2026-11-12 is live.
  - `public.paper_catalog` keeps each paper's public metadata (title, exam, kind, number, question count, status)
    in step by trigger — **no questions**. `tools/sync_catalog.py` copies the live rows into
    `_data/paperCatalog.json`, and the pages are built from that (rule 3: the UP AP mock tests already are).
    Most hub pages stay static. **Exception (owner, 2026-11-14, rule 17): the self-serve-published series
    read the live catalog in the browser at view time** (today: the UP Assistant Professor Paper 2 mock tests;
    more as each series ships). For those, a newly-live paper appears with no rebuild. See rule 17.
  - **The owner picks the destination, and the page builds the id** (2026-11-13, "upload hi aisa ho jo galti hi na
    ho"): a **Where does it go?** step (`_data/paperDestinations.js`, which stops the build if a listed page is
    missing) with the series (UP AP Paper 2 Mock Test → `up-ap-p2-mock-test-N`, UP PGT Mock Test →
    `up-pgt-mock-test-N`, British, American or Indian English Literature MCQ set → `<age>-set-N`), a number, and (for a literature set) an
    age. `assets/upload-paper.js` builds the `set_id` from that and **overwrites the file's own `setId`,
    `setNumber`, `examId`, `kind` and `title`** to match — so a file made with a wrong id (as Mock Test 4 was:
    `up-ap-mock-test-4` instead of `up-ap-p2-mock-test-4`) cannot land in the wrong place. Question ids inside the
    file are left exactly as supplied (frozen, rule 12). `examId` is a real `exams` row, or none for the literature
    sets (`paper_catalog.exam_id` stays null). `autoPage` is true for the UP AP Paper 2 mock tests, the UP PGT mock tests and the UP PGT MCQ days, and all three are also `selfServe` (rule 17:
    Live shows on the page at once, and the page says so); the literature set saves the questions correctly, and its
    page works at once only for a slot already planned in the registry (rule 17). A self-serve destination carries
    `minNumber` / `maxNumber` (read from the series' own data: UP PGT mock tests 6–60, because 1–5 are the free files;
    UP AP 1–30, the pre-built range; UP PGT MCQ days 11–60, because 1–10 are the free days) and the page **refuses a number outside it**, because such a paper could never be opened. TGT is not offered:
    it has no page yet.
  - **The final check after an upload** (owner, 2026-11-15, `assets/upload-paper.js` `finalChecks()`): the Done card no longer
    gives one fixed line. It shows a verdict (green = Live and open to students now, amber = check the points, red =
    saved but students cannot open it) and a list: saved copy matches (fingerprint), the paper is in `paper_catalog`,
    the levels and the question count match the registry plan, and the test and review pages exist on the live site (a
    same-site fetch). The plan comes from `_data/uploadPlan.js` (embedded as `#upPlan`; no question text); a mock series
    uses `pageBase` from `_data/paperDestinations.js`. A set number with no planned slot, a missing planned level, a
    different count, a clash with a free set and a rev that differs from the registry all show here in plain English.
    When anything is amber or red the card also shows a **"Copy this for Claude"** text (and the same on a failed upload)
    that the owner pastes to Claude. Keep these checks in step when a destination or the registry changes.
  - **A file may be just the list of questions** (owner, 2026-11-17: their generator hands over a bare JSON
    array, and the page used to answer "This is not a question file."). Such a file is accepted: the page wraps
    it, and because a bare list names no level and no rev, a **Which level?** field appears (Medium first, which
    is what every mock-test and MCQ-day page reads) and the **rev is worked out** — 1 for a new id, else the
    highest saved rev of that level plus one. A file that DOES name its level or rev still rules, and a named rev
    that goes backwards is still refused. Only one such file can be uploaded at a time (there is one level
    choice), and every other check — the per-question checks, the tag check, the fingerprint, the database
    trigger — is unchanged. `out.level` and `out.rev` are written into the saved body, so the body never
    disagrees with its row.
  - **Replacing / correcting a live paper (owner, 2026-11-24): just upload the corrected or edited file to the
    same destination again, and it replaces the old one — even when the old copy sits at the wrong level.** Two parts:
    - *Same level:* the owner no longer hand-edits the `rev`. When the file's rev is not above what is already saved,
      `assets/upload-paper.js` takes the next free rev by itself, so the replace always goes through (the database only
      ever refuses a rev that goes DOWN, and never treats the same set + level as a clash with "another paper"). The
      Done card says "This replaced the paper … (rev N → rev N+1)".
    - *Wrong level (the Day 25 case, 2026-11-24):* a slot can hold a **stale copy at a level its page never reads** —
      UP PGT MCQ Day 25 had been loaded at `easy`, but the day pages read `medium`, so the old copy never showed AND
      its frozen question ids blocked the correct `medium` file ("These question ids already belong to another paper").
      Now, before saving, the upload page **removes any row at the SAME slot, at a level NOT being uploaded, that holds
      a question id in the new file** (a stale prior copy — the real levels of a set carry different ids, so a genuine
      easy/medium pair is never touched). The Done card says "Removed the old copy … at the easy level … and put this
      file in its place." This needs a DELETE, which the browser did not have: migration
      `20261124140000_admin_delete_and_replace_paper.sql` adds an **admin-only DELETE policy** on `public.mcq_papers`
      and `public.paper_catalog`, plus `mcq_papers_sync_catalog_delete` (an AFTER DELETE trigger that recomputes the
      set's catalog count/status, or drops the catalog row when the set has no rows left). The service-role connector
      could already delete; this opens the browser path for an admin only.
    - Before the upload the page shows, in `#upSummary`, whether a paper is already saved at that slot and at which
      level ("… Uploading will REPLACE it" / "An old copy … is saved here at the Easy level. Uploading will replace
      it"), so an overwrite is never a surprise. A file that names an explicitly higher rev is still honoured; a
      brand-new upload is unchanged. Browser-tested 2026-11-24 (same-level replace → rev bump; wrong-level copy →
      removed, correct file saved; new-paper path unchanged). No standalone "delete a paper" button was built — the
      owner's need was replace, not delete — but the admin DELETE policy now exists if a delete button is ever wanted.
      To take a paper off the site without replacing it, still hide it with `status = 'draft'` on `/admin/papers/`.
- **Publishing a login set with SQL** (the older route, still fine when the owner is not at a browser; instead of
  rule 7 steps 3 to 6). The question files stay in the session's scratchpad.
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
- **Questions and time chooser = the default of the CBT engine** (owner, 2026-11-12: "jahan bhi CBT MCQs honge wahan ye system hoga"). The start
  screen of **every** CBT page except the custom test ("Your own test") lets the reader pick how many questions (10 to 100, capped at the set's size) and
  how long (5 to 120 minutes): MCQ sets (free and login) and mock tests alike. It is `assets/cbt.js` only (`PLAN_CHOICE`, `planChoiceInit`, `planChoiceBlock`,
  `wirePlanChoice`); a new set or a new mock test gets it with no template work. Questions are the first N of the set in its own order. The attempt record's
  `count` carries the choice, so resume, result, review and "Practise my mistakes" follow it. Keep this working when `cbt.js` is touched.
- **The lock on the hub** (owner, 2026-11-07, said twice: "jahan par Start, wahan par lock; kone me nahi"): on the
  hub row of a login set, a guest sees a padlock BUTTON in the place of the Start button (same slot, same height; template
  `quizzes/mcq/_templates/age-hub.njk`, `.agehub-go-lock` in `assets/site.css`). It links to `/login/?next=<that set's
  page>`. A logged-in student sees Start instead. The lock is `data-guest-only` and Start (made by `assets/mcq-age.js`) is
  `data-auth-only`, so `auth.js` swaps them by login state; `mcq-age.js` runs before `auth.js` and sets Start's first
  state from the lock. There is no text tag ("Login needed" was removed on the owner's word) and no lock in the title.
  **Since 2026-11-19 (rule 22) a logged-in student with no running pass sees "Get access" in place of Start on a paid card**
  (`assets/pass-gate.js`), and a guest who opens a gated test page by link is sent straight to the login page. The old "Log in
  to take this test" screen (`cbt.js` `needLogin()`) now only shows when sign-in itself is unavailable. The "Build your own test" page still says "Needs a free
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

## 16. The admin area (`/admin/...`, owner, 2026-11-13)
The admin area is the one place the owner runs the site from a browser. **One allow list for every power:**
a row in `public.paper_admins` (added by SQL only, never from a browser). A guest or an ordinary student
sees only "You are not allowed to use this page." on every admin page. No service key, no Edge Function: the
browser writes with the publishable key and the admin's own login, and **RLS is the real gate** (the page's
JavaScript is only quick feedback). Migration `20261113120000_admin_dashboard.sql`. Pages run on
`assets/admin.js` (home, papers, notify, students, reviews) except upload-paper, which keeps
`assets/upload-paper.js`; admin.js there only builds the shared tools nav. Every admin page is noindex, in no
menu, in no sitemap, and `/admin/` is Disallowed in `robots.txt`.
- **Upload a paper** — `/admin/upload-paper/`, rule 15.
- **Publish an article** — `/admin/upload-article/`, rule 24.
- **All articles** — `/admin/articles/`, rule 24.
- **Free MCQ set** — `/admin/upload-mcq/`, rule 25.
- **Correct a Daily quiz** — `/admin/upload-daily/`, rule 26.
- **All papers** (`/admin/papers/`) — lists `paper_catalog`; a button flips a set between Live and Draft
  (`update mcq_papers set status=… where set_id=…`; the status-only path skips re-validation; the catalog
  trigger follows). The change is in the database at once. For a **self-serve-published series (rule 17)** this
  button is a real **publish / unpublish**: the card and page appear or disappear with no rebuild (today, the
  UP AP Paper 2 mock tests, the UP PGT login mock tests, the UP PGT login MCQ days and the planned English Literature login sets). For a series still built statically, the public page updates on the next build +
  `tools/sync_catalog.py`.
- **Send a notice** (`/admin/notify/`) — inserts `public.notifications`: `audience 'all'` (broadcast, `user_id`
  null) or `'user'` (one student, picked by name from `profiles`). Title, optional message, optional **same-site**
  link (starts with one "/"; the DB check enforces it). `created_by` is stamped as the admin. A sent notice can be
  deleted. It shows on the student's dashboard bell (rule 10).
- **Students** (`/admin/students/`) — name (`profiles.display_name`), joined (`profiles.created_at`), answers +
  accuracy (`attempts`), quizzes (`quiz_runs`), last active. **No email and no auth.users** (so no new security
  advisor; a non-admin still sees only their own rows). "Last active" = last answer or finished quiz.
- **Reviews** (`/admin/reviews/`) — reads every review (even hidden), hides/shows one (`visible`), or deletes one.
  Owner's rule 6 stands: moderate **only** for rude or inappropriate language; a low rating is kept. This replaces
  running the SQL by hand; the browser path is admin-only by RLS.
- **Data layer:** `notifications` (RLS: a student reads a broadcast or their own; an admin reads all, inserts,
  deletes — no one updates), `notification_reads` (a student reads/inserts only their own; it clears the bell
  count across devices). Admin **read** policies were added to `profiles`, `attempts`, `quiz_runs` and `reviews`,
  and admin **update/delete** to `reviews`. `/privacy/` now lists dashboard notices (kept true, rule 10).
- **Payments** (`/admin/payments/`, rule 22) — the pass price and "on sale", promo codes (make, turn off), **Give a free pass**
  (owner, 2026-11-18: pick a student, a number of days and a note; a `passes` row with `source = 'admin'`, stacked after any
  running pass; "Stop now" ends it; migration `20261118150000_admin_give_pass.sql`; **an ended free pass can then be deleted from
  the list with a red Delete button**, owner 2026-11-21, migration `20261121120000_admin_delete_ended_given_pass.sql`: the database
  allows DELETE on `passes` only for an admin, only `source = 'admin'` with no order, and only when `ends_at <= now()` or
  `ends_at <= starts_at` (stopped before it began); a running pass must be stopped first, and a paid or promo pass is never deleted
  from a browser), and orders with "paid test opened?" for the refund rule and a Mark refunded button.
- **Not here yet:** big PDFs on Cloudflare R2 (rule 13).

## 17. Self-serve publish — a live paper appears with no rebuild (owner, 2026-11-14)
The owner uploads a login paper at `/admin/upload-paper/` and marks it **Live** on `/admin/papers/`; for a
self-serve series the paper then appears on its page **with no rebuild and no Claude**, and Draft hides it at
once. The site is static (Cloudflare Pages from the repo) and there is **no service key and no Edge Function**
(rule 15), so a browser button cannot rebuild or commit. The only safe way is to **render the paper lists in
the browser at view time** from the live `public.paper_catalog`, which has a public read policy for
`status = 'live'` rows (a guest reads live rows; drafts stay hidden — confirmed in the DB). **This is the one
approved exception to rule 3's "hub pages stay static; nothing is fetched from Supabase when a page is
viewed"**, and only for the paper-list pages of a self-serve series. No new data is collected (the catalog is
already public for live rows), so `/privacy/` needs no change.

**How a series is made self-serve (the parts, all general):**
- **Hub cards** come from the live catalog via `assets/paper-list.js`. The hub's card grid carries
  `data-paper-list` plus the filter and how to build each link: `data-exam-id`, `data-kind`, optional
  `data-prefix` (a `set_id` guard), `data-base`, `data-route` (e.g. `test-{n}/`), `data-label`, `data-empty`.
  The script waits for `window.akAuth`, reads with the publishable key, and on any failure leaves the **static
  fallback cards** (the papers live at build time, kept in the HTML for no-JS/SEO). It reuses the site's
  guest-lock / Start swap: each card has `data-guest-only` (padlock → `/login/?next=…`) and `data-auth-only`
  (Start), and it re-runs `window.akAuth.refreshHeader(session)` after injecting so the new cards swap by login
  state. Add `<script src="/assets/paper-list.js" defer></script>` to the hub.
- **Paid cards must carry `data-pass-start`** on their Start button (owner, 2026-11-19, rule 22): `assets/pass-gate.js` then
  adds a "Get access" twin and shows it instead of Start to a logged-in student with no pass. A hub script that builds or
  flips cards at view time must call `window.akPass.refresh()` right after (paper-list.js, mcq-age.js and net-pyq-live.js do);
  select `access` from the catalog and mark only `access = 'paid'` cards. Without the attribute a new series quietly keeps Start.
- **Routes are pre-built for a fixed range** (a static host 404s on an unbuilt path), e.g. UP AP `test-1..30` +
  their review routes, paginated over a range array (see `statePscMockTests.range`, `RANGE_MAX`). Raising the
  range is a one-number change.
- **Each test page checks the catalog at view time** via `data-catalog-check="<set_id>"` on the `[data-cbt]`
  element. `assets/cbt.js` then, before the normal flow: live row → opens exactly as before (login-gated);
  checked-and-not-live → a plain "This test is not open yet" screen (never a login wall for a set that does not
  exist); could-not-read (network) → **fail-open** to the normal flow, so a live test is never blocked by a
  blip. Pages **without** `data-catalog-check` (free MCQ sets, other series not yet converted) are untouched —
  `cbt.js` runs exactly as before, which is how the rollout stays one series at a time.
- **Sitemap + static fallback still list only the live papers** (from the `…MockTests.tests`-style live list),
  never the whole pre-built range; the login test pages need no SEO.

**Shipped so far:**
1. UP Assistant Professor Paper 2 mock tests (`exams/state-psc/up-assistant-professor/paper-2-mock-tests/`) —
   hub cards from `assets/paper-list.js`, pre-built `test-1..30`, `data-catalog-check` in `cbt.js`.
2. English Literature login MCQ sets (`quizzes/mcq/<age>/`) — the owner chose the **"flip planned sets live"**
   approach (no `paper_catalog` metadata column, no upload-page change): a planned slot (live-login or
   Coming-soon) flips live from the catalog at view time. Parts: `_data/mcqPendingSets.js` + the two
   `set-pending-*.njk` templates (pre-built gated+catalog-checked pages for not-yet-live planned slots),
   `data-catalog-check` added to the live-login set/review pages, `data-catalog-set` on login/pending hub rows,
   and the flip logic (`catalogFlip`/`flipOn`/`flipOff`) in `assets/mcq-age.js`. See the `quizzes/mcq` note in
   rule 3 for the full behavior and the known dashboard-pool gap.

3. UP PGT login mock tests (`exams/pgt/up-pgt/mock-tests/`, owner 2026-11-15) — the hub is a fixed grid of 60
   numbered slots with free tests in it, so it uses **slot mode** of `assets/paper-list.js`: the host carries
   `data-paper-slots` (same filter attributes as `data-paper-list`, `data-prefix` is required) and each managed
   card carries `data-paper-slot="<n>"` + `data-slot-state` (+ `data-slot-count`); the script flips a slot to the
   lock/Start card when `prefix + n` is a live row and to the "Coming soon" card otherwise, and never touches a
   card without `data-paper-slot` (the free tests 1–5). Pages: `login-test.njk` / `login-review.njk` pre-build
   slots 6–60 with `data-catalog-check` (`_includes/up-pgt-cbt.njk`); `cbt.js` needed no change. A slot that is
   not live now shows "This test is not open yet" (it used to be a Coming soon page).
   **`paper-list.js` asks for `status = 'live'` itself** (both modes): an admin can read drafts by RLS, so
   without it the owner would still see a Draft card. (The test page itself still opens a Draft for an admin:
   that is a preview by address, students get "not open yet".)

4. UP PGT login MCQ days (`exams/pgt/up-pgt/mcqs/`, owner 2026-11-17) — the same **slot mode** as series 3, with two
   additions that are general, not day-specific: a slot may name its own paper with `data-slot-id` (Days 11 and 12 were
   loaded under their own ids before the series became self-serve, so the id comes from the registry and both kinds of id
   work side by side), and in slot mode `paper-list.js` now asks the catalog for **exactly those ids** (`set_id=in.(…)`)
   instead of filtering by exam and kind, so a paper's id is the only thing that has to match. `data-copy="title"` on the
   host makes a card's second line the paper's own title (the day's topic), and `cbt.js` takes that title from the catalog
   when the page did not know it at build. Pages: `gated-day.njk` / `gated-day-review.njk` pre-build days 11–60 with
   `data-catalog-check`. How big the series is lives in `_data/pgtMcqSeries.js`; `_data/pgtMcqDays.js` also reads the live
   rows of `_data/paperCatalog.json`, so a day published self-serve gets a proper static card and a sitemap line at the
   next rebuild, with nothing typed by hand. On the upload page the destination **UP PGT English — MCQ Day** builds the id
   (`up-pgt-mcq-day-N`, or Day 11's or 12's own id), and the final check now also says when a file's level is one the
   series' pages cannot read. 60 Playwright checks passed (guest / student, live / not live / read fails, old and new ids,
   free days untouched, mock-test and UP AP regressions, 375px).

**Two follow-ups shipped with series 4** (owner, 2026-11-17):
- `assets/mcq-age.js` now asks the catalog for `status = 'live'` itself, as `paper-list.js` already did. An
  admin can read drafts by RLS, so without it the owner saw a Draft literature set as open while students did
  not.
- The **dashboard age pool is no longer a build-time number**: `assets/dashboard.js` re-adds the MCQ part of
  each age's pool from the live catalog (`applyLiveCatalog`), using the per-age `liveSets` list that
  `tools/build-syllabus.js` now writes into `assets/syllabus-british.json`. A set published self-serve counts
  at once, one put back to Draft drops out, and a failed read keeps the built number. This closes the "known
  gap" series 2 shipped with.

**Still static:** nothing that has pages. UGC NET mock tests / Paper 1 are blocked on their pages
(`docs/self-serve-publish-plan.md`, series 5). Do each series on its own branch, test it
(Playwright + mocked Supabase: guest vs student, live vs not-yet-live, 375px and desktop; prove a new live set
shows and Draft hides with no rebuild), and merge on its own (rule 5) so a bug can never take down every page at
once. Update rules 3, 15, 16 and this rule, and `docs/self-serve-publish-plan.md`, as each ships.

## 18. UGC NET PYQs (previous-year papers) — free, no login; a paper can also be login-only (owner, 2026-11-14 / 2026-11-18)
The NET hub's **UGC NET English PYQs** button opens `/exams/net/english-pyqs/` (`exams/net/english-pyqs/index.njk`, styles
`.net-pyq-*` in `assets/net.css`): one group per year, **oldest first** (owner, 2026-11-18: the free 2012 papers stay on top,
newer years below), every year group **open by default** so no paper is hidden; inside a year one section per paper (Paper II,
Paper III), with its cards oldest first (June, then December, and Shift 1 before Shift 2), each card numbered 1, 2 and carrying a Start button (owner, 2026-11-14). The full name
("UGC NET English Paper II — December 2012") is the card's aria-label and the test page's title. Each paper is a CBT page at
`/exams/net/english-pyqs/<slug>/` with its review at `.../review/` (`test.njk` and `review.njk` paginate over
`_data/netPyqPapers.js`; markup in `_includes/net-pyq-cbt.njk`). The hub, the two routes and the sitemap lines all come
from the registry `_data/netPyqs.json` (`slug`, `year`, `month`, `file`); the title, paper and question count are read
from the question file, and the build stops with a plain message if a file is missing or a question is not scoreable.
- **Free, no login** (the owner said "login ke bahar"). The questions are the public file `assets/questions/<setId>.json`
  (the papers are public UGC documents). If a future paper should be login, the owner must say so: ask, never assume (rule 15).
  Not self-serve (rule 17): a new paper needs a registry line and a build.
- **Engine: the same `assets/cbt.js` as the British MCQs** (questions-and-time chooser, clock, palette, resume, result,
  review, "Practise my mistakes", dashboard tracking). `data-exam-pyq` on the page switches on the one-paper "exam" behaviour
  (no levels, "Paper" label, no age-notes links) and only changes names: eyebrow "UGC NET English · Previous-year paper",
  the paper's `setName` ("Paper II — December 2012"), the result badge "Paper complete" and the next-step links
  (NET syllabus, English PYQs). Keep this working when `cbt.js` is touched.
- **Adding a paper.** The owner sends the tagged file (`…-tagged.json`, every question carries an `answerKey`) and says it is
  verified, so do **not** re-check its facts. (1) Run
  `python3 tools/pyq/prepare_pyq.py --in <file> --decisions tools/pyq/decisions/<setId>.json --out assets/questions/<setId>.json`.
  It copies text, options, ids and tags exactly as supplied and stops on a bad option count, a repeated id, an unknown
  `topicId` or `periodId`, or any question whose key is not "single". (2) **Owner's rule (2026-11-14): a question with two
  or more right ids becomes ONE**, because the engine scores one option. For each `multiple_accepted` or `credit_all`
  question write a decision in `tools/pyq/decisions/<setId>.json` (`correct` = one option the official key accepts, plus an
  `explanation` that says what the test counts). Verify the fact for that pick on a reliable page, say which, and never
  guess; the decisions file is the audit trail. (3) Add one line to `_data/netPyqs.json`. (4) `npx eleventy`, link check,
  browser test, push the branch (`main` only when asked, rule 5).
- **First paper** (2026-11-14): UGC NET English Paper II, December 2012, 50 questions. Four decisions: Q10 counts (c) Gyanpeeth
  (official key: c and d), Q45 counts (c) Lucien Goldmann (official: a or c), Q15 counts option "1" (a tragicomedy in two
  acts) and Q32 counts the first option, the Battle of the Books pairing (official: marks to all). The paper and key links
  in the file (`sourceQuestionPaper`, `sourceAnswerKey`) are kept in the data and not shown on the page.
- **Login PYQs** (owner, 2026-11-18: "login ke andar"): a paper the owner wants behind login has `"access": "login"` in `_data/netPyqs.json`
  (plus `setId`, `title`, `paper`, `session`, `count`, `rev`, and **no `file`**). Its questions are the Supabase row `public.mcq_papers`
  (`set_id` = `ugc-net-english-<year>-<jun|dec>-paper-<ii|iii>`, level `medium`, `kind` `mcq-set`, `examId` `ugc-net`), never a file in the repo
  (rule 15); `_data/netPyqPapers.js` stops the build if a public `assets/questions/<setId>.json` exists for it. It is **self-serve (rule 17)**: its hub card
  and its pre-built test + review pages (the same `net-pyq-cbt.njk`, with `data-gated` and `data-catalog-check`) open only while the paper is a **live**
  `paper_catalog` row. The card (`data-net-pyq-slot`, `assets/net-pyq-live.js`) shows "Coming soon" until then, then the padlock to a guest and Start to a
  student; the page says "This paper is not open yet" for anything not live. The owner uploads it at `/admin/upload-paper/` (destination **UGC NET English —
  Previous-year paper**: the owner picks the paper by name from the planned login PYQs, no number, and the id is built from that) and marks it Live on
  `/admin/papers/`; no rebuild. The login test pages of a paper not live at build are noindex and not in the sitemap; the review pages are always noindex.
  The source file's tags are **not** trusted: its `topicId` / `periodId` must be re-mapped to master nodes (rule 12; the database refuses anything else), and a
  question with two accepted ids or a dropped key still becomes ONE (the rule above), with the decision written into that question's explanation. A different
  front-door copy follows: "Some need a login" on `/quizzes/pyq/`, "Most papers are free" on the hub. To add another login PYQ: one registry line, build, then the owner uploads.
- **Faint note under a question** (owner, 2026-11-18): a question may carry `"note"` (one short line, simple English, 220 characters or less).
  `assets/cbt.js` `noteHtml()` shows it as a small italic line under the question on the test screen, the review and the wrong-answer cards
  (`.cbt-note` in `site.css`). It is for a question whose key accepts two options, was dropped, or has a printing slip, and it **must not name the right
  option** because it shows during the test; the counted option goes only in the explanation (review). The upload fingerprint covers the note.
- **Generator instruction + checker** (owner, 2026-11-18): `tools/pyq/PYQ-TAGGER-INSTRUCTIONS.md` is the instruction for the AI that tags PYQ papers, so its
  file is upload-ready (format, key decisions, note, master tags, inner periods only, English only, no Devanagari). `python3 tools/pyq/check_upload_file.py <file>`
  runs the upload page's and the database's checks plus the site's own (tags real, no broad age, a note must not give the answer). Run it on every PYQ file
  before it goes to the owner; send a file back that does not pass rather than editing it (rule 7 step 7 habit).
- **First login paper** (2026-11-18): UGC NET English Paper II, June 2013, 50 questions. Four decisions (the questions are not in the repo, so only the numbers
  and the picked letters are recorded here): Q12 and Q17 (key dropped, marks to all) count (a) and (b), the answers the supplied explanations give; Q31
  (key accepts a and b) counts (b), the caverns the river reaches directly; Q33 (key accepts a and b) counts (b), checked against Browne's own sentence
  "I love to lose my self in a mystery, to pursue my Reason to an O altitudo!" (Religio Medici, Part I, section IX, Fordham Internet History Sourcebooks
  and the Harvard Classics text on Wikisource, found through web search; the Kubla Khan pages could not be opened from the session, so Q31 rests on the
  poem's own line order). Q40 keeps the supplied key: its fourth pair (Doll Tearsheet, a Henry IV Part 2 character, set against The City Madam) is a printing slip, the other three
  pairs are right and only option (a) fits them, so it carries a note. Q8, Q16 and Q19 still say "the source" in their supplied explanations (not edited; the owner decides).
- **Exam patterns the registry carries** (owner, 2026-11-18; the CBT engine already takes any question count, so only the
  registry/hub/uploader label them). 2012–2017 (CBSE, 3-paper era): a subject paper is `"paper": "II"` (50 questions) or
  `"paper": "III"` (75 questions). 2018 onward (NTA, 2-paper era): one subject paper, `"paper": "II"` with 100 questions, held
  in shifts — add `"shift": "Shift 1"` (or `"Shift 2"`) so two papers of the same month/year/paper read apart; the card shows
  the shift and the slug/setId carry it (`2019-june-paper-ii-shift-1`, `ugc-net-english-2019-jun-paper-ii-shift-1`).
  `_data/netPyqPapers.js` validates the shift label; `netPyqYears.js` sorts Shift 1 before Shift 2. A new login paper is still
  one registry line (then build, then the owner uploads at `/admin/upload-paper/`): the **UGC NET English — Previous-year paper**
  destination lists every planned login PYQ by its full title, so the owner can publish any year, not only 2013.
- **The whole 2012–2025 archive is planned** (owner, 2026-11-18, from the Drive folder "UGC NET PYQ"). The four 2012 papers stay FREE
  (already in the repo); every other paper is a login slot, pre-built and "Coming soon" until the owner uploads it and marks it Live
  (self-serve, rule 17). Paper II + Paper III run June 2012 → November 2017 (CBSE); Paper II only (100 Q) from July 2018 (NTA). A paper
  is grouped by the **cycle it is for, not the year it was held** (owner, 2026-11-18: an exam delayed into the next year still belongs to
  its cycle), so the year is the earliest year in the session name: "December 2020 / June 2021" under **2020**, "December 2021 / June 2022"
  under **2021**, and "December 2024 (07.01.2025)" (held January 2025) under **2024**. The session string keeps the real name; June 2024 is
  kept as "(Cancelled)" and its re-exams (21 Aug two shifts, 4 Sept) sit under 2024. Counts in the registry are the exam's standard per-era counts (50 / 75 / 100); the
  hub card shows the **exact** count from the live catalog once a paper is live (`assets/net-pyq-live.js` updates `[data-pyq-count]`),
  so a dropped-question paper reads right. The card heading is the paper's `session` (not month+year), so the merged cycles read
  correctly. The `/quizzes/pyq/` front-door card shows "N papers · 2012–2025 · ..." with the access worded from the free/login split.
- **Paper 1 PYQs** (`paper-1-pyqs`) stay "Coming soon". Do not mix them into this hub unasked: the hub is English Paper 2 only.
- **Dashboard:** PYQ answers feed the by-topic and by-period views through their tags. They are not in an age's level pool
  (their ids do not start with an age prefix, rule 10), so the level meter is unchanged.

## 19. The PYQ front door — `/quizzes/pyq/` (owner, 2026-11-15)
The page's job: every previous-year paper we publish is reachable from here. The student picks an **exam card**, and a live
card goes straight to that exam's PYQ page (UGC NET English → `/exams/net/english-pyqs/`, rule 18).
- Cards live in **`_data/pyqHub.js`** (one entry per exam: `title`, `icon`, `blurb`, and for a live exam `href`, `meta`, `live: true`).
  The page is `quizzes/pyq/index.njk` (Nunjucks, so the UGC NET card counts its own papers and years from `_data/netPyqPapers.js`:
  a new NET paper changes the card with no page edit). Styles `.exam-cat*` in `assets/site.css`.
- A card with `live: false` is a plain box with "Coming soon" and **no link** (so no 404). To open an exam: build its PYQ page, then set `href` and `live: true`.
- Today: **UGC NET English** and **UP PGT English** live; **TGT English** Coming soon. The owner wrote "UPSC TGT"; the card says "TGT English"
  (UPSC does not run TGT exams) — confirm the exact name with the owner before adding a body or state name. Never invent a paper count or year.
- **Important Links** (owner, 2026-11-15) sit under the cards, **in their own tinted band with a gold tab on its top edge** (`.hub-links`; owner: the exam cards are the main part of the page, the links must read as a separate section below). Keep that partition: same-site links only, from **`_data/hubLinks.json`** (`title`, `text`, `href`; styles `.hub-link*`). The words are taken from each target page's own title or description; add a link by adding a line, and never invent what a page offers. External official links (for example the NTA bulletin, already on `/exams/net/about/`) are not on this page: add one only with a URL the owner or a reliable page confirms.
- **Apart from the cards and these links, the page has nothing below the head** (owner, 2026-11-15: the three text sections — "What a previous-year paper is really for", "A method that works", "Where to get authentic papers" — were removed). They are in git history (commit `d3212c9` and earlier) if the owner ever wants them back.

## 20. The mock-test front door — `/quizzes/mock-tests/` (owner, 2026-11-15)
Same idea as rule 19, for mock tests: the student picks an exam card and lands on that exam's mock-test page.
- Cards live in **`_data/mockHub.js`** (`title`, `icon`, `blurb`, and for a live exam `href`, `meta`, `live: true`). Page: `quizzes/mock-tests/index.njk`. Cards use the shared `.exam-cat*` styles (the same ones as the PYQ page, rule 19).
- **Live:** UP PGT English → `/exams/pgt/up-pgt/mock-tests/` (its card says "N free tests" counted from the free files, "N questions each" only when every open test has the same count, read from the question files and `paperCatalog.json`, and "more with a free login" when a login test is live at build; **it no longer counts the login tests**, because they are self-serve since 2026-11-15 and that number changes with no rebuild); UP Assistant Professor English → `/exams/state-psc/up-assistant-professor/paper-2-mock-tests/`.
- **UP Assistant Professor is self-serve (rule 17)**, so its card does **not** show how many tests there are (that changes with no rebuild). It shows only "N questions each" (when all live tests agree) and "Log in to take them".
- **Coming soon (no link, so no 404):** UGC NET English (the NET hub's own Mock Tests and Paper 1 Mock Tests are still `available: false`) and TGT English (name still to be confirmed by the owner, rule 19). To open one: build its mock-test page, then set `href`, `meta` and `live: true`.
- Never invent a test count or a question count; the card reads them from the data.

## 21. Other state exams on `/exams/state-psc/` — Coming soon cards (owner, 2026-11-15)
The State PSC hub lists UP Assistant Professor (live) and, under it, **Coming soon cards for other states' Assistant Professor exams**, in the same box style as the PGT hub (`_includes/pgt-exam-card.njk`). Data: **`_data/statePscExams.json`**. Cards are plain boxes with no link (so no 404) and show only the exam name and the state: **no vacancy counts, dates or syllabus**, because those were not confirmed on the commissions' own sites.
- **Level rule (owner): only exams at the level of UP Assistant Professor** — a state commission's recruitment of Assistant Professors for government colleges. Not school-level (PGT, TGT, Lecturer) exams, not the eligibility tests (SET), not other states' PGT exams (those sit on `/exams/pgt/`).
- **Added 2026-11-15, after a web search (commission recruited Assistant Professors in English):** HPSC (Haryana), HPPSC (Himachal Pradesh), JKPSC (Jammu and Kashmir), MPPSC (Madhya Pradesh), RPSC (Rajasthan), UKPSC (Uttarakhand). Sources were mostly news and coaching sites; the official sites could not be opened for a count. **Not added because English was not confirmed:** JPSC (Jharkhand), BPSC (Bihar), Punjab. Add any of them only after English is confirmed.
- To open one: build its page like `up-assistant-professor/`, then move its entry out of `statePscExams.json` into a live card. Never invent a number or a date on a card.
- **Resource cards on `/exams/state-psc/up-assistant-professor/`** (owner, 2026-11-15): a **live** card (`"live": true` in `_data/statePscResources.json`) ends in a teal **Start** button (`.state-psc-start`) and has no "Open" line; a Coming soon card keeps its "Coming soon" line and the arrow. The whole card stays the link. Today only Paper 2 English Literature Mock Tests is live.
- **Important Links band on that page too** (owner, 2026-11-15), under the resource cards. The band is now one shared include, **`_includes/hub-links.njk`** (list `_data/hubLinks.json`, text from `hubLinksText`), used by `/quizzes/pyq/`, `/quizzes/mock-tests/`, this page and the Paper 2 mock tests list (`paper-2-mock-tests/`, owner 2026-11-15; the test and review pages themselves have no band); `state-psc-layout.njk` shows it when a page sets `hub_links: true` and `hub_links_text` in its front matter. Edit the markup once and all three change.

## 22. The paid layer — All Access pass, promo codes, Razorpay (owner, 2026-11-18)
**State: LAUNCHED 2026-11-18 and ON SALE** (owner: "launch karo"; the owner then set the price and ticked On sale
themselves). Razorpay live keys and live webhook are set (owner, in Supabase secrets); one Test Mode payment passed end to end
before that. Every login paper was made paid by the one-time UPDATE, `_data/paidLayer.js` is `live: true`. Day-to-day state
and open items: `docs/accounts-status.md` ("START HERE").
- **Where it stands (read from the live DB, 2026-11-19):** plan `all-access` is **active at Rs 199 per 30 days** (price and
  On sale are the owner's, set on `/admin/payments/`; never change them unasked). 64 `mcq_papers` rows / 48 papers are `paid`, 0
  `login`. A student without a running pass cannot open any paid paper (they see "needs the All Access pass"); free files and
  the dashboard are untouched. Promo codes made by the owner: **FIRSTIME50** (Rs 50 off, once per student, shown to everyone
  on `/pass/`) and **UPPGT100** (Rs 100 off, **one use per student, no total limit** — `max_uses` null, `once_per_student` true; not shown on the page; it is for the owner's own students who bought his course). The only paid
  order so far is the owner's Test Mode test (note on the row); **no real-money payment has been made yet**, so the live
  keys are still unproven end to end (the owner may do a small real payment and refund it in Razorpay). The owner can open
  access for one student with **Give a free pass**. The owner's own account is an admin AND holds a test pass to 18 Dec 2026,
  so it opens everything: to see the paywall use a second account with no pass (the owner did, 2026-11-18, and it sent them
  to `/pass/`).
- **Owner's decisions.** One pass for now, "All Access": one payment opens every paid test. 30 days per period,
  1 to 6 periods at a time (both editable). The **price is not in code**: it is `pass_plans.price_paise`, set by the owner on
  `/admin/payments/`; never invent one. Later each course gets its own plan (one more `pass_plans` row; the paid read policy
  then needs to check the plan, today any running pass opens every paid paper). **What becomes paid** (owner, 2026-11-18,
  final word): "what is free without a login stays free; everything behind a login goes behind the pay wall". So at launch
  **every** `mcq_papers` row becomes paid — mock tests, MCQ days, UGC NET login PYQs and the English Literature login practice
  sets — and every new upload after the pass is On sale is paid. One pass ("single pay door") opens all of it; per-course
  passes come later. Free files stay free for good (they are public in git). **The dashboard stays free**
  (owner): it reads only the student's own `attempts` / `quiz_runs` and the public catalog, never a paid paper, so a student
  without a pass still sees all their progress.
- **Launch switch `_data/paidLayer.js` (`live`).** **`true` since the launch (2026-11-18).** (`false` = the old "free login"
  wording; it was flipped in the same commit as the one-time UPDATE.) With `true` the same pages say "needs the All Access pass" (NET PYQ hub,
  UP PGT MCQ days and mock tests hubs, UP AP mock tests hub, the four CBT includes, the literature "Build your own test" row
  and pending-set pages, the `/quizzes/pyq/` and `/quizzes/mock-tests/` cards). The static About / Privacy /
  Terms lines were reworded by hand in that commit, and `cbt.js` reads `paper_catalog.access` for its banner and guest
  screen. The launch UPDATE that ran: `update public.mcq_papers set access = 'paid' where access = 'login';` (64 rows, 48 papers). From the moment the pass is **On sale**, the upload page saves every new paper as paid by itself. Refund rule (`/refund-policy/`, the owner's words): no refund after a paid
  test is opened; 100% back if asked within 24 hours and no paid test opened; failed, wrongly taken and double payments are
  returned; an approved refund is sent within 72 hours. No automatic renewal.
- **Database** (`20261118130000_paid_pass.sql`): `pass_plans` (public read of active plans, admin update), `promo_codes`
  (admin only; percent 1–100 or rupees off, optional plan, max uses, dates, once per student, switch off — never deleted),
  `pass_orders` (student reads own; written by the server; an admin may only mark paid → refunded or add a note, trigger
  `pass_orders_guard`; refunded ends the pass, trigger `pass_orders_end_pass`), `passes` (own read; written by the server; a
  new purchase starts when the last pass ends), `paper_opens` (the first time a student opened each paid paper; written by
  `cbt.js`, read by the refund rule). `paper_catalog.access` says login or paid. `pass_quote` / `pass_create_order` /
  `pass_grant` are **service-role only** and are the only place a price is worked out; `pass_grant` is idempotent (row lock)
  and notes a second, different payment on a paid order as a double payment. All user tables cascade on account delete.
- **Edge Functions** (verify_jwt off, they check the token themselves): `pass-checkout` (`quote`, `order`, `verify`: checks the
  Razorpay signature with the key secret, reads the payment back from Razorpay and captures it if only authorized) and
  `razorpay-webhook` (signature on the raw body with the webhook secret; payment.captured / order.paid grant, payment.failed
  marks failed, refund.processed in full marks refunded). Secrets `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
  `RAZORPAY_WEBHOOK_SECRET` are added by the owner in Supabase → Edge Functions → Secrets; **never in the repo or chat**. CORS
  allows only `https://akexplained.com`.
- **Pages.** `/pass/` is `pass/index.njk` (redesigned 2026-11-18, owner: "professional"; order set by the owner; shrunk
  2026-11-19 because it read bigger than the other pages: it now uses the site's own type scale, hero ~440px, h1 1.55–2.05rem, h2
  from the global rule, 34px sections — keep new pass-page sizes at that scale): dark hero with live stat strip (paid tests, questions, series; the strip and the "Secure payment" line sit at the bottom of the left column, level with the bottom of the buy card — owner's request) + buy card, then the Free vs pass table, then "What the pass opens today" (5 boxes in one line; a swipe row on narrow screens) (paid counts per series read **live** from `paper_catalog` where `access = 'paid'` by `loadInventory()` in `assets/pass.js`), the table's free counts come from `_data/passFree.js` (the site's own files, at build; it stacks into cards under 640px; owner, 2026-11-23: it also counts the free **UP PGT English PYQs** from `_data/pgtPyqPapers.js` and the free **UP AP English PYQ 2026** file while its card is `live` in `statePscResources.json`, each with its own row; a new free paper or quiz means a new row in `pass/index.njk` and a count here, so the table never goes stale; the paid side needs nothing, it is read live), then the FAQ, and the three steps last (3 boxes in one line). Never type a count into the page. `assets/pass.js`: a plan with a price is public even before it is on sale (migration `20261118140000`), so the page shows the price and "Payments open soon" for Razorpay's website review; Pay appears only when On sale. Price, how long, promo code, Razorpay Checkout (`checkout.razorpay.com/v1/checkout.js`,
  loaded only on Pay), `?next=` back to the test. A 100% promo skips Razorpay. `assets/cbt.js`: a paid test page opened with no pass no longer shows a middle page (owner, 2026-11-19). A **guest** is sent
  straight to `/login/?next=<that page>`; a **logged-in student with no running pass** is sent to the exam's own page
  (`data-back`, where the free tests are) with a note in `sessionStorage['ak:passNeeded']` that `pass-gate.js` shows as a
  banner ("That test needs the All Access pass. You can try the free tests on this page first…") whose Get access button goes
  to `/pass/?next=<that test>`; the old "needs the pass" screen (`needPass`) is only the fallback if that redirect cannot
  happen. A paid paper that loads writes `paper_opens`. The upload page keeps a paid paper paid (the database also refuses a paid → login
  re-upload); once the pass is On sale every new upload is saved as paid (and a destination with `access: 'paid'` in
  `_data/paperDestinations.js` always is). The page reads "is the pass on sale" once when the admin check passes; if the
  pass is ever switched off again, or that read fails, a brand-new upload is saved as **login** (any logged-in student can
  open it). **After every upload check `select access from paper_catalog where set_id = '…'`**, and flip a login row with one
  UPDATE (`update public.mcq_papers set access='paid' where set_id='…'`) if it should be paid.
- **Legal pages** were changed with it: Terms ("The All Access pass"), Privacy (order record, `paper_opens`, Razorpay as the sixth
  service), Contact and About (only payment = the pass, on akexplained.com through Razorpay), footer link to `/refund-policy/`.
  Keep them true with any change here (rule 10). Razorpay fees and limits: never state a number not read on Razorpay's own page.
- **Razorpay setup as done with the owner (2026-11-18)** — for any later change of keys:
  Razorpay account + KYC done. Secrets in Supabase → Edge Functions → Secrets: `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
  (now the **live** `rzp_live_` pair; the owner pressed "Replace" over the test pair) and `RAZORPAY_WEBHOOK_SECRET` (the live
  webhook's own secret). Webhooks in Razorpay are per mode: a Test Mode one and a **Live Mode** one, both to
  `https://almlqoxcyzwieuwrgwry.supabase.co/functions/v1/razorpay-webhook` with events payment.captured, payment.failed,
  order.paid, refund.processed. A key secret is shown once; if lost, Regenerate in Razorpay and Replace in Supabase.
  Quick health check from a session: `curl -X POST .../functions/v1/razorpay-webhook -H 'x-razorpay-signature: 00' -d '{}'`
  must answer `Bad signature` (a missing secret answers `Not set up`); `.../pass-checkout` with no token answers "Please log in first".
  The one Test Mode payment (Rs 25, owner's account, pass to 18 Dec 2026) carries the order note "Razorpay Test Mode payment".
- **Promo code shown to everyone** (owner, 2026-11-18: FIRSTIME50, Rs 50 off, once per student): `pass_plans.featured_promo` +
  `featured_label` (migration `20261118160000_featured_promo.sql`) put one code in an "Offer" strip on the pass card with a
  "Use code" button (fills and applies it). On `/admin/payments/` each active code has **Show to everyone** / **Hide**;
  turning a shown code off also hides it. Only ONE code per purchase (one field; the server applies one code) and the page
  says so. The code is still checked by the server (dates, limits, once per student).
- **How the owner runs it (no Claude needed):** price / On sale, promo codes and free passes on `/admin/payments/`; a refund is
  made in the Razorpay dashboard and the webhook marks the order Refunded and ends that pass (or "Mark refunded" by hand). The
  orders table shows "Paid test opened?" for the 24-hour rule.
- **"Get access" on paid cards** (owner, 2026-11-19: the middle "needs the pass" page was dropped for a direct button): on every
  hub with paid cards (UP PGT mock tests and MCQ days, UP AP mock tests, literature age hubs, NET PYQs) the Start button of a
  paid card becomes **Get access** → `/pass/?next=<that test>` for a logged-in student with no running pass; guests keep the
  padlock (login); a pass holder or an admin keeps Start; free cards are untouched. `assets/pass-gate.js` does it (reads the
  student's own `paper_admins` / `passes`; if a read fails Start stays, the database is still the real lock; pages with no paid
  card make no request; Start is hidden only while the check runs, max 5 s). Colour: gold (`#E3B65A`, navy text) so it reads as different from the teal Start (owner, 2026-11-19; rules at the end of `assets/site.css`). Wording: "Get access", not "Subscribe", because
  the pass never renews by itself (Terms). Browser-tested 2026-11-19: 4 hubs x (no pass / pass / admin / read fails / guest),
  free card unchanged, three ways into a test page, review link, 375px.
- **Decided 2026-11-19 (owner):** the "All Access pass" tag on paid cards became the **Get access** button above (no separate
  tag was built); a student sees only the tests they can open in the dashboard level (done, rule 10); the footer line
  "free for every student" became "for every literary student's need" on all 31 pages (sentence case; `_includes/base.njk` is
  the source and the other footers are hand copies, so a future change needs a sed over `*.html`/`*.njk`); **UPPGT100 is for the
  owner's own students who bought his course**; the real-money check of the live keys is postponed ("abhi nahi"); the owner
  saw the FIRSTIME50 strip on the live pass page.
- **Settled later on 2026-11-19 (owner):** UPPGT100 means "one use per student" (the owner's words: "ek student ek use"), so
  `max_uses` was set to null with one SQL UPDATE; anyone who knows the code can use it once, so keep it unshown. The Terms
  section "Other payments" and the Contact note now say only what is true: this website takes payment only for the All Access
  pass (Razorpay), any course or coaching the owner gives is not sold or paid for on this website, and a doubtful payment
  request in the name of AK Explained should be reported to the owner first. The old lines "no coaching enrolment and no
  paid group" were removed (the About page already says the owner does classroom and examination coaching). Do not add a
  course name, price or place of sale to these pages unless the owner supplies them (rule 2).
- **Still open with the owner** (ask, do not decide): per-course passes later; the real-money check of the live keys.
- **Working notes for the next session.** The owner chats in Hinglish, wants click-by-click steps one at a time, never pastes
  a secret, and merges only by saying "live kar do". Site text stays simple English. Never type a count or price into a page:
  paid counts are read live from `paper_catalog` (`assets/pass.js` `loadInventory`), free counts from `_data/passFree.js`.
  Supabase connector: `apply_migration` takes the SQL inline (strip comment lines and BEGIN/COMMIT, keep the file in
  `supabase/migrations/` complete); Edge Functions are deployed with `deploy_edge_function` (`verify_jwt: false`, file text from
  `supabase/functions/<name>/index.ts`), so a change to a function needs a redeploy, not just a merge. Health checks:
  `pass-checkout` with no token says "Please log in first"; `razorpay-webhook` with a wrong signature says "Bad signature".
  Browser test recipe (Playwright, `_site` served with `python3 -m http.server`): mock `**/rest/v1/**` (PostgREST: a
  `maybeSingle` read sends `Accept: …vnd.pgrst.object`), `**/functions/v1/pass-checkout`, and `checkout.razorpay.com`
  (a fake `window.Razorpay` whose `open()` calls `handler`); log in by writing the session JSON to
  `localStorage['sb-almlqoxcyzwieuwrgwry-auth-token']`. CSS traps hit here: global `ul,ol{max-width:74ch}` needs
  `max-width:none` in grids, and an element with `display:flex` needs its own `[hidden]{display:none}` rule. `.html` files are
  not templated (`htmlTemplateEngine:false`), so anything with Nunjucks must be `.njk` (the pass page is), and Nunjucks in
  front matter needs `eleventyComputed`. Razorpay's own pages cannot be opened from a session; its docs were read through search.
- **This session cannot open razorpay.com** (network policy), like akexplained.com: give the owner click-by-click steps and
  ask for screenshots without secrets.

## 23. UP PGT English PYQs — free, no login (owner, 2026-11-19)
`/exams/pgt/up-pgt/pyqs/` (`exams/pgt/up-pgt/pyqs/index.njk`) lists previous-year UP PGT English papers **year by year, oldest first**, each year a
`.pgt-practice-group` with one Start card. Each paper is a CBT page at `/exams/pgt/up-pgt/pyqs/<slug>/` with its review at `.../review/` (`test.njk` and
`review.njk` paginate over `_data/pgtPyqPapers.js`; markup in `_includes/up-pgt-pyq-cbt.njk`). The hub, the two routes, the sitemap lines and the
`/quizzes/pyq/` card all come from the registry `_data/pgtPyqs.json` (`slug`, `year`, `file`, `printedCount`); the title and question count are read from the
question file, and the build stops with a plain message if a file is missing or a question is not scoreable.
- **Free, no login** (owner: "free for all student, login ke bahar"). The questions are the public file `assets/questions/<setId>.json` (`up-pgt-english-<year>`),
  never `mcq_papers`. If a future year should be login, the owner must say so: ask, never assume (rule 15).
- **Engine: the same `assets/cbt.js`** as the NET PYQs (`data-exam-pyq`). Two small, general changes were made for it: the "Suggested reading" link of a PYQ page
  comes from `data-suggest-href` / `-label` / `-note` (the NET page keeps its NET syllabus link when they are absent), and a PYQ may choose **more than 100
  questions** (the 10-to-100 limit stays for every other page), because a real paper can be longer (the 2006 paper has 122).
- **Disclaimer** (owner, 2026-11-19, in English): the line in `_includes/pgt-pyq-disclaimer.njk` ("We checked these questions, answers and explanations and corrected
  the doubtful ones ourselves ... AK Explained is not responsible.") sits small at the bottom of the hub and of every test and review page (`.pgt-pyq-disclaimer`
  in `site.css`). Keep it on any new PYQ page. A year's card also says when questions were left out (`printedCount` minus the file's count).
- **Adding a year.** The owner sends the solved paper (the 2006 one was a .docx with the key and an explanation under every question) and says it is verified
  except doubtful questions. (1) Tag it (rule 12; ladder in `tools/pyq/PYQ-TAGGER-INSTRUCTIONS.md`; a vocabulary or grammar question has no period) and write
  `assets/questions/up-pgt-english-<year>.json` (setId = file name, ids `up-pgt-english-<year>-qNNN`, frozen). (2) `python3 tools/pyq/check_upload_file.py <file>`.
  (3) One line in `_data/pgtPyqs.json`. (4) `npx @11ty/eleventy`, link check, browser test, push the branch (`main` only when asked, rule 5).
  Verify only the doubtful questions (a web search, say which page); a question whose options are damaged beyond repair is **left out**, never guessed, and
  `printedCount` keeps the printed total so the hub says so. The audit trail is `tools/pyq/decisions/<setId>-notes.md`.
  **The owner can have the tagging done by ChatGPT** with `tools/pyq/UP-PGT-PYQ-TAGGER-INSTRUCTIONS.md` (self-contained; the owner attaches the .docx and `taxonomy-master-reference.csv`). Its file and report come back to Claude, who runs `check_upload_file.py` and still checks the left-out and doubtful lists; the generator never changes a key or a fact by itself.
- **First paper** (2026-11-19): UP PGT English **2006**, 125 printed questions, **122 shown**. Left out: Q84 (two options misspelt in print), Q111 (three of the four options
  misspelt in print) and Q119 (a two-part sentence whose options repeat "No error"); their text is in the notes file so the owner can supply the original. Changed after
  checking: Q118's key (the supplied key said "our" is an error; "Every one of us ... our" agrees, so it now counts "No error"), Q32's option text ("Four times"), a note on
  Q35 (Hemingway left more than one work unfinished), and the explanations of Q1, Q5, Q10, Q26, Q27, Q35, Q61, Q87, Q113 and Q116. The reading passage of Q112 to Q117 is shortened in
  the supplied copy (marked "..."), so the page says so under the passage; its author is not named because the file does not name one (rule 2).
- **Second paper** (2026-11-19, owner: "same as the 2006 one, free, no login, verified"): UP PGT English **2000**, 98 questions (`assets/questions/up-pgt-english-2000.json`, copied exactly as
  supplied; `check_upload_file.py` passed). The file's numbers run 1 to 100 but **Q39 and Q45 are not in it**, and nobody said why, so the registry line carries `printedCount: 100` and its own
  **`leftOutNote`** (an optional sentence that replaces the default "damaged options" one on the hub; use it whenever the reason is not damaged options, and never guess a reason). Kept as supplied
  and noted for the owner in `tools/pyq/decisions/up-pgt-english-2000-notes.md`: every explanation is one template line, and the three passage cards (Q77 to Q79) repeat text that is already in the
  question and are titled by the printed number ("Question 77") while the screen counts by position ("Question 75 of 98").
- **Third paper** (2026-11-19, same request: free, no login, verified): UP PGT English **2002**, 72 questions, numbered 1 to 85 with 5 to 11, 13, 14, 33, 39, 75 and 78 missing, so its registry line has
  `printedCount: 85` and a `leftOutNote`. `check_upload_file.py` gave one error, "Q81 is in the file twice": Q76 and Q81 share the stem "Which sentence is correct-" but have different options, so it is a false alarm
  for a free PYQ (the checker compares stems only); file used as supplied. Audit notes: `tools/pyq/decisions/up-pgt-english-2002-notes.md`.

## 24. The article publish engine — `/admin/upload-article/` (owner, 2026-11-26)
The owner asked for the MCQ engine's equivalent for articles: "men .md file du … or aasani se website par publish ho jaae".
They chose (2026-11-26, from three options each): the article stays a **`.md` file in the repo**, **text only** for now (pictures
go the old way), and **preview then Publish**, with no Draft step.

**Why this one is not instant.** A paper opens from the database at view time (rule 17). An article may not: Google must get a
real HTML page, so the file is written to the repo and Cloudflare Pages rebuilds. The page says so and the article is live in
about two to three minutes. Never "fix" this by rendering an article from Supabase in the browser — that would cost the SEO the
articles exist for.

**The three parts.**
1. **The page** `admin/upload-article/index.html` + `assets/upload-article.js`. The owner picks a `.md` file (or pastes the
   text); the page reads the heading block, fills the web address from the file name (else the title), and runs its checks.
   **Blocking** (red): no heading block, no title, no description, a bad web address, a line starting with a single `#` in the
   body (the page makes the `<h1>` from `title`, so a second one breaks the one-`h1` SEO rule), a `<script>` tag, over 400 KB,
   or a picture the site does not have (that would publish empty boxes). **Warnings** (amber, still publishable): a description
   outside 50–160 letters, no `eyebrow`, no `updated`, no `##` headings, a link inside the article that opens no page yet, and
   "the `layout: base.njk` line was added for you". The existing-article and picture/link checks are plain same-site `fetch`es,
   which work because the page runs on the live site. **Preview** renders with the vendored `assets/markdown-it-14.3.3.js` —
   the same parser and the same options (`{ html: true }`, Eleventy's default) the build uses, so the preview is not an
   approximation. Keep it that way if markdown-it is ever upgraded.
2. **The server** `supabase/functions/publish-article/` (deployed 2026-11-26, `verify_jwt` off, it checks the token itself).
   This is the **real** gate, as the database trigger is for papers: login token → `paper_admins` row (rule 16's one allow
   list; **that read runs as the caller, never with the service key** — `public.paper_admins` grants SELECT to
   `authenticated` only, with `paper_admins_read_own` giving each user their own row, and `service_role` has no SELECT on it
   at all, so the service-key read was refused with "permission denied" on the first real publish. Checking as the caller is
   also what every admin page and every RLS policy on the site does, and nothing gets a bulk read of the table) → folder is `""` or `ages` → slug shape and reserved names → heading block with title and description → body not
   empty → no `<script>` → 400 KB. Only then does it PUT `notes/<slug>/index.md` on **`main`** through the GitHub Contents
   API, and it can write nowhere else. Replacing needs the file's `sha`, so the page's replace box is honoured by the server
   too. Repo and branch are constants in the code; **the only secret is `ARTICLE_REPO_TOKEN`** (a GitHub fine-grained token,
   this repo only, Contents: read & write), which the owner puts in Supabase → Edge Functions → Secrets, never in the repo.
   Without it the function answers "the website key is missing" and nothing happens.
3. **The build-side automation**, which is what makes one file enough. Before this, a new article needed three hand edits —
   a `sitemap.njk` line, a `searchIndex` row in `assets/home.js`, and `live: true` in a series registry — and forgetting one
   hid the article from Google or from the site's own search. Now: `_data/notesIndex.js` reads `notes/<slug>/index.md` and
   `notes/ages/<slug>/index.md` from disk (a collection cannot: the age articles carry `eleventyExcludeFromCollections`) and
   feeds both the sitemap loop and `notes-search.njk`, which writes `/assets/notes-search.json`; `assets/home.js` merges
   those rows into `searchIndex`, **skipping any address already listed**, so the 26 hand-written rows keep their own labels.
   `tools/article-live.js` decides a chapter's `live` from its article file in `_data/literaryTheory.js`,
   `_data/culturalStudies.js` and `_data/indianPoetics.js` (and a Key Terms term in `_data/keyTerms.js`); a typed
   `live: true` with no article now stops the build with a plain message instead of shipping a card that 404s.
   Checked on 2026-11-26: with these changes the whole built site is **byte-identical** except `/admin/`, and the sitemap
   holds the same 46 `/notes/` addresses as the hand-written list did.

**The planned-address check** (added 2026-11-26, after the first real publish went wrong in a way nobody would have
noticed). The Phenomenology article was published at `/notes/phenomenology-hermeneutics/` while its Literary Theory chapter
named `literary-theory-phenomenology-hermeneutics`; the article was live and perfect, and its card still said "Coming soon",
because `tools/article-live.js` looks for the article at the **registry's** slug. The page now carries every planned chapter
of Literary Theory, Cultural Studies and Indian Poetics (`_data/articlePlan.js`, embedded as `#arPlan`; names and addresses
only), and says in the checks either "this is the planned address for chapter N of <series>" or, when the article's **title**
matches a planned chapter at another address, warns which address the plan expects and that the card will keep saying "Coming
soon" until the two agree. That is also why the page is `index.njk` and not `.html` (a `.html` file is not templated).
When the owner publishes at a different address on purpose, the fix is one line: point the registry's `slug` at the published
address, as was done for this chapter (its slug is now `phenomenology-hermeneutics`, matching Structuralism, Narratology,
Semiotics and Bakhtin, which are all bare too). Never move a published article to a new address to match the plan: the old
address is already out in the world.

**And the card no longer waits for that one line.** It happened twice in a day (Reader-Response went to
`/notes/reader-response-reception-theory/` against the registry's `literary-theory-reader-response`), so `resolveChapter()` in
`tools/article-live.js` now gives each chapter both its `live` state **and its `slug`**: the article at the registry's slug if
there is one, else **the article whose `title` is exactly the chapter's title**, wherever it was published. The card opens by
itself and its link points at the real address, which is what the engine promises. The build prints one `[article-live]` line
naming the chapter and both addresses — tidy the registry's slug when you next touch it, but nothing is broken until you do.
A chapter with a typed `live: true` and no article under either rule still stops the build. Matching is on the title alone, so
two different chapters must never share a title.

**What the engine does NOT do** (do not tell the owner otherwise): a Draft step, a timeline or landing-page card for a new
age article, a series registry entry for a brand-new chapter slug, and taxonomy work. A broken YAML heading block cannot take
the site down: the build fails and Cloudflare keeps serving the last good deploy, so only the new article is missing.

## What the owner asked for next (2026-11-26, all four built the same day)
The owner asked what more the admin page could do. Four things were chosen and built; the engine now covers a whole article,
not only its text.

**1. Previous / next chapter links, by themselves.** These come from an article's `prev:` / `next:` front matter and were
typed by hand, so the first two articles published through the engine had none — the reader could not move on. `_data/eleventyComputed.js`
(the site's only global computed data) now fills them for any article that is a chapter of a series, from the registry's own
order: the nearest **written** chapter each way, inside the same series, labelled "Previous chapter" / "Next chapter".
**An article's own `prev:` / `next:` always wins** — nothing typed is ever overwritten — and an article that is not a series
chapter (age notes, the criticism articles) is untouched. Adding this changed exactly four pages.

**2. Editing a published article from the browser.** `/admin/upload-article/?edit=<slug>` (and `&folder=ages`) asks the
function for that article's text with `action: "read"` — admin-only, read-only — puts it in the paste box, fills the address,
ticks replace and says in a banner which article is being changed. Then it is the ordinary flow: checks, preview, Publish.
A typo no longer costs a re-upload. Reading an article that is not there says so plainly.

**3. `/admin/articles/`** (`admin/articles/index.njk`, `_data/articleAdmin.js`, `assets/admin-articles.js`, `.allist` styles):
every notes article with its series and chapter number, its address, and an **Edit** button that opens it in the page above;
under it, the chapters still to be written, by series. The list is built at build time, so an article published in the last
few minutes joins it when that build finishes — the page says this.

**4. Pictures, through the same engine.** The page already refused an article whose picture was missing; that check is now a
**fix-it step**. Each missing address gets a row with a file box: the browser converts the chosen file to **WebP and shrinks
it under 200 KB** (quality then size, capped at 1600px wide — the reading column is 720px), shows the result in KB, and the
block clears. On Publish the pictures are sent with the article; the function writes **the pictures first and the article
second**, so a page is never live with empty boxes, and it **never overwrites a picture that is already there**. Only
`/assets/….webp` addresses can be filled this way (the site's own rule), and any other address still says so and stays
blocking. Limits in both places: 200 KB each, 10 pictures per publish.

**Pages CMS still works** on the same files, and so does Claude: there is one copy of every article, in the repo.
Browser-tested 2026-11-26 (56 checks): guest and non-admin see only "You are not allowed to use this page"; a good file
publishes and the body sent is the whole file; `#` heading, missing description and missing picture each block; the missing
`layout` line is added; an existing address shows the replace box and sends `replace: true`; the ages folder sends
`folder: "ages"`; a refusal says nothing changed and offers the copy-for-Claude text; pasting works; 375px has no sideways
scroll. Four more were added the same day (60 in all): a file named `index_<topic>.md` drops the "index" from the
suggested address (the owner's generator names files that way, and the first publish was headed for
`/notes/index-phenomenology-hermeneutics/`), and the planned-address check both ways.

## 25. The free MCQ engine — `/admin/upload-mcq/` (owner, 2026-11-27)
The owner asked for the article engine's twin for the **free, no-login** MCQ sets ("jo mcqs login ke bahar sbke liye free
hote hai"). It fits, because a free set is not a database row at all: it is a **public file**, `assets/questions/<setId>-<level>.json`
(rule 15). So publishing one is publishing a file, exactly like an article — and the same three parts.

**The owner's three choices (2026-11-27):** its **own page**, not a mode of `/admin/upload-paper/` (one wrong click there
would make paid questions public for good); **only sets already planned** in `_data/mcqSpec.json` — **114 free slots** are
planned across the British, American and Indian English ages, each with its title, topics, levels and question count, so a
brand-new set still needs Claude once; and **MCQ sets only for now** — the Daily quiz files (`assets/instant/`) have their own
shape and are not in this page yet.

**1. A planned free set goes live when its files exist.** `_data/mcqAges.js` now works out a free set's `live` from its level
files instead of waiting for `"live": true` to be typed (`freeFilesPresent`), the way a chapter's card follows its article
(rule 24). A typed `live: true` still works. The hub row, the set page, the review page, "Build your own test" and the sitemap
line are then generated as always, and `_data/mcqPendingSets.js` drops that slot by itself, so the two templates never build
the same route. When the registry has no `lede`, one is written from the set's own count, title and levels — the fallback
rule 15 already allows. **An age's card opens too:** `mcq-live-ages.njk` writes `/assets/mcq-live-ages.json` at build (the
ages with at least one live set) and `assets/mcq.js` merges it, because a free set has no `paper_catalog` row for
`catalogAges()` to find.

**2. The page** `admin/upload-mcq/index.njk` + `assets/upload-mcq.js`, with a red band at the top: free means open to
everyone **for good** — it can never become paid, and the owner must tick a box saying so before Publish turns on. The set is
chosen from the planned slots (`_data/freeMcqSlots.js`, embedded as `#fqPlan` with the master topic ids); a login set is never
listed. Then the question files, one per level. **Blocking:** a level missing, a file for a level this set does not have, a
question count that is not the plan's, an id that does not belong to the set or is used twice, not exactly four different
non-empty options, no right option 0–3, no explanation, a `topicId` that is not in the master list, a `periodId` that is not a
period, or two questions with the same words. A file that is a bare list of questions is wrapped (the owner's generator does
that), and the set name, number and level are always taken from the chosen slot, so a file can never land in the wrong set.
**Preview** shows the first three questions of each file with the right option marked and the tags printed.

**3. The server** is the same Edge Function, `publish-article`, with `action: "publish-questions"` (version 6, 2026-11-27).
It reads `_data/mcqSpec.json` **from the repo** to confirm the slot is planned and **free** — so a login set's questions can
never be written as a public file, whatever the browser sends — and the master taxonomy CSV to check every tag, then repeats
every per-question check and writes the files. Existing files are never replaced without the replace box.

**Why the checks are stricter here than for an article:** a question with a tag that is not in the master stops the whole
build (`tools/check-topics.js`, rule 12), and free is irreversible. Both gates run, and nothing is written until every file
has passed.

Browser-tested 2026-11-27 (40 checks): guest and non-admin blocked; the planned sets listed and no login set among them; two
good files pass and publish, with the right payload; one level missing, a wrong count, a tag that is not real and a question
with three options each block; the server's refusal says nothing changed and offers the copy-for-Claude text; an
already-published set says so; 375px has no sideways scroll. The 92 article checks still pass, and the built site is
unchanged apart from `/admin/`.

## 26. The Daily quiz engine — `/admin/upload-daily/` (owner, 2026-11-27)
Right after the free MCQ engine the owner asked for the Daily (Quick) quizzes too: "daily quiz wali function add karo
lekin ek new section admin page par, ek new card means" — so it is **its own page and its own card on `/admin/`**, not a
mode of another page. It fits for the same reason: a Daily quiz is a **public file**, `assets/instant/<period>-<level>.json`
(rule 8), so publishing one is publishing a file, like an article (rule 24) or a free MCQ set (rule 25).

**What makes this one different: there is nothing to create.** All 40 banks (20 periods x easy/hard) are already on the
site, every one 50 questions at rev 1, and each has its hub page written. So the page's job is **correcting a quiz students
are already using** — a wrong answer, a clumsy sentence, or reasons added later — and it is built around that:
- **It shows what changes.** On picking a quiz the page fetches the live file and lists, question by question, whose words,
  options, answer or reason are not the same ("1 question would change, 49 stay exactly as they are"), with a before/after
  view of the first ten. Nothing is published blind.
- **Ids are frozen** (rules 8 and 12). A student's saved progress hangs on the question id, so an id that is on the website
  and not in the file is **blocking** ("Ids are never taken away"), and an id must carry the bank's own prefix — read from
  the live file, never typed, so this code can never drift from rule 8's prefix table. A genuinely new id is a warning, and
  it says the quiz page's "100 questions" line needs Claude.
- **Reasons may be missing, but never lost.** `explanation` is optional in a Daily file and the two Age of Chaucer banks have
  none (rule 8). So: a file that drops a reason this quiz already shows is blocking; a file that brings reasons to a quiz
  that has none is allowed with a warning that **the quiz page's own text must be changed by Claude**, because that page
  today says nothing about reasons.
- **Two options are allowed** for a True / False question (one of the 2,000 questions is one), four otherwise.
- **The wrong-file check of rule 8 step 2.** It compares the file with the other level of the same period and blocks it when
  60% or more of the questions match word for word — the mistake that actually happened once, a "Literature" upload that was
  the Age questions with the options shuffled.
- **`rev` rises by itself.** The owner never edits it: a file whose rev is not above the live one is saved at the next number,
  and a file that names a higher rev keeps it. `bankId`, `period` and `level` are always taken from the chosen quiz, so a
  file can never land on another quiz. A bare list of questions is wrapped, as on the other two pages.

**The three parts**, as for rule 25: `_data/dailyBanks.js` reads all 40 files and hands the page each bank's name, count,
rev, id prefix, whether it has reasons and its hub address (every one read from the file or the folder, nothing assumed);
`admin/upload-daily/index.njk` + `assets/upload-daily.js`; and the same Edge Function `publish-article` with
`action: "publish-daily"` (version 7, 2026-11-27), which is the real gate — admin check, the file **must already exist**
(so a brand-new bank cannot be created from a browser), bankId/period/level unchanged, rev above the live one, every
per-question check, the master taxonomy read from the repo for the tags, no id taken away, no reason lost. The taxonomy
reader `tools/taxonomy-ids.js` is now shared by this page and the free MCQ page.

**What it does NOT do** (do not tell the owner otherwise): a brand-new Daily bank, including the planned second
"The Literature" bank of rule 8 — that needs the hub page's words, its topic buttons and its counts, which is Claude's work;
the Daily hub's own text (how many questions, whether reasons are shown); and a Draft step.

Browser-tested 2026-11-27 (94 checks): guest and non-admin see only "You are not allowed to use this page"; the 40 quizzes
are listed in 20 groups; picking one reads the live file and reports it; a one-question correction passes, previews
before/after and sends the right payload at rev 2; an identical file says nothing would change; a missing id, an id of
another quiz, a repeated id, three options, an unreal topicId, a periodId that is not a period, a lost reason and the other
level's questions each block; True / False and a new question pass; a bare list is wrapped; a refusal says nothing changed
and offers the copy-for-Claude text; changing the quiz clears the checks; 375px has no sideways scroll; the nav and the
`/admin/` card are there. The 92 article and 40 free-MCQ checks still pass, and the built site is unchanged apart from
`/admin/`.
