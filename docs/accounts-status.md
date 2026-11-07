# Accounts / database / auth — where things stand

A dated snapshot so a new session (or a different AI) can pick up without re-reading the chat history.
The **rules** live in `CLAUDE.md` (rules 9–14); this file is only *current state + what is pending*.
Keep it updated when the state changes.

_Last updated: 2026-11-07 (UP PGT card text and spacing were matched to the PGT and NET hubs on a review branch. The resource cards and detail header remain live.)_

## UP PGT card scale — awaiting publication (2026-11-07)

- The owner asked whether the new UP PGT page matches other pages and requested a fix if it does not. Current-run browser measurements found that the hero heading and 22px content insets already match, while the four resource titles (24.8px desktop, 20px phone), helper text and icons were larger than the PGT/NET card scale.
- Branch `feat/up-pgt-card-scale` sets resource titles to 16.96px, helper/status text to 14.72px and icons to 34px; it also aligns card padding, gap, border and featured phone title with the PGT hub. Visual captures and measured before/after values are in `docs/up-pgt-card-scale/`. No publication instruction has been given for this correction.

## UP PGT resource cards — publication approved (2026-11-07)

- The owner selected an image proposal for five UP PGT resources: Complete course in 60 days, Download Syllabus, MCQs, Mock Tests and PYQs. `/exams/pgt/up-pgt/` now uses that composition: one featured course card and a two-column resource grid, with the existing faded header and shared footer. On phones the four resources stack in one column.
- No course, official syllabus file or question banks were supplied for these resources. Each card opens a clearly marked Coming soon route that is excluded from search indexing. The existing English study guidance moved intact to `/exams/pgt/up-pgt/study-guide/` and stays linked from the card page and placeholder pages. The study guide remains explicitly general, not an official UP PGT syllabus.
- The owner explicitly said “live kar do” for PR #22 (`feat/up-pgt-resource-cards`). Merging it into `main` triggers Cloudflare Pages publication. Screenshots, responsive measurements and design comparison are in `docs/up-pgt-cards/`.

## UP PGT detail header — publication approved (2026-11-07)

- The owner asked to carry the PGT hub's illustrated header onto `/exams/pgt/up-pgt/`, with a fade that signals a subpage. The detail page reuses the hub illustration and live text placement, at 58% image opacity and a shorter desktop height. Its breadcrumb, separate back link, four study sections and shared footer remain.
- The owner explicitly said “live kar do” for PR #21 (`feat/up-pgt-faded-hero`); merging that PR into `main` triggers Cloudflare Pages publication. Eleventy build and 7,556 internal references pass. Browser checks at 320, 390, 768, 1024 and 1440px found contained text, no overflow or console errors, and the shared footer. The back link opens the PGT hub. Evidence: `docs/up-pgt-hero/`.

## Anglo-Norman Set 2 — login set, merged to main (2026-11-07)

- The owner supplied 50 medium and 50 hard questions for the planned "Poetry and romance" Set 2, chose login access, and said the facts are verified. No fact or near-duplicate review was repeated. The files incorrectly said `middle-english-set-1`; only `setId`, `age`, `ageName`, `setNumber` and the 100 question IDs were changed in private scratch copies to `anglo-norman-set-2`. The question text, options, answer indices, explanations, tags, citations and five passage records stayed exactly as supplied. The corrected files and load SQL are not in the public repository; the owner should retain copies of the uploads.
- Both papers are in `public.mcq_papers` with `access = login` and `rev = 1`. Full JSON body hashes matched the local PostgreSQL test: hard `a113bfb89b5d5006b02f5a154fb9214e`, medium `69765a0e8599d7f598607db5ba250146`. Question fingerprints matched too: hard `8761753d84bb77d7f5411ae25064c58b`, medium `b73916e298a1c9390caba70136683774`. Each has 50 questions; hard has three passages and medium has two. The five existing Old English gated rows' hashes did not change.
- Validator: zero errors, 54 advisory warnings (mostly long stems; no corrections because the owner marked content verified). The loader checked IDs, tags, registry levels and public-question collisions. Its four SQL chunks were tested twice in local PGlite with no duplicates; guest read and student write were blocked, authenticated read succeeded. Live read-back confirms RLS on, no `anon` SELECT grant, authenticated SELECT only, and the existing login policy. Security advisors have the same two pre-existing warnings (leaderboard function and leaked-password protection), with no new finding.
- Eleventy build and topic gate passed; 7,089 internal links/assets resolved. Mocked-auth browser tests passed 386 checks: guest lock and no question fetch, signed-in start and all 50 questions at both levels, passages and line breaks, saved score and review, custom 100-question mix, mobile width, and free Set 1 regression. The owner asked to put Set 2 on the Anglo-Norman page; [PR #19](https://github.com/afsar069/akexplained-site/pull/19) was merged as `82a98e5`. Cloudflare Pages deploys `main`.

## Anglo-Norman Set 1 — free, merged to main (2026-11-07)

- The owner supplied 50 easy and 50 medium questions and explicitly chose free access without login. Both public files are in `assets/questions/`; no Supabase load or access rule change was needed. Set 1 is live in the registry on `main`; Set 2 is now login-only and Set 3 stays planned. The MCQ age card opens the hub, and guest visitors can start either Set 1 level. The owner approved merging [PR #17](https://github.com/afsar069/akexplained-site/pull/17), which was merged as `d289b0e`.
- The uploads used `middle-english-set-1` as the set ID while the MCQ page uses `anglo-norman`. Only `setId`, `age`, `ageName` and each question ID were changed to match the page; all question text, options, answer indices, explanations, sources and passages were preserved exactly. The Middle English notes link remains correct. Validator: zero errors, 58 advice warnings about length and answer clues. The topic/period build gate passed.
- The existing plan excludes the 1362 Statute of Pleading and later mystery/morality plays from this period. The owner reviewed this mismatch and explicitly chose to keep the uploaded comparative questions unchanged in Set 1. The cited Oxford Companion entries were not attached for independent fact checking; accessible Wikipedia/Gutenberg citations were spot checked. The quiz data is public in Git history once pushed.
- Eleventy build passed, 6,971 internal links and assets resolved. Guest-browser checks passed for the MCQ age card, free Start link, easy/medium test screens, a medium-level passage and the build page. The live website cannot be opened from this cloud session; production is checked through Cloudflare Pages.

## NET header matched to PGT — live (2026-11-07)

- The owner asked for the PGT hub's illustrated header on `/exams/net/`. The NET hub now reuses the exact PGT hero image and its desktop/phone proportions, with NET-specific, selectable HTML text on the illustration's left side. The older text-baked NET banner is no longer displayed. The NET cards, related pages and shared default footer are unchanged.
- The owner explicitly asked to make it live. PR #15 (`feat/net-pgt-hero`) was merged into `main` at `8e77322`, and the Cloudflare Pages check reports a successful deployment.
- Eleventy build and 7,114 internal href/src/srcset references pass; the four `/go/` links resolve through Cloudflare redirects. Browser checks at 320, 390, 768, 1024 and 1440px found a loaded image, contained text, no horizontal overflow or console errors, and the default footer. About and syllabus navigation works. Screenshots and measurements: `docs/net-pgt-hero/`.

## PGT shared-footer correction (2026-11-07)

- After the approved PGT release, the owner pointed out that the default footer must accompany every page. The custom PGT footer was an implementation mistake, not a new site-wide footer choice.
- `_includes/pgt-layout.njk` now uses the shared `site-footer` marker; the existing `syncChrome` transform inserts the complete default footer from `_includes/base.njk` on both `/exams/pgt/` and `/exams/pgt/up-pgt/`. Removed the unused custom footer styles. Recorded the every-page footer rule in `CLAUDE.md`.
- This is a correction to the owner's immediately preceding instruction to merge and publish the PGT page. The rest of the page design stays as approved.
- Build passed. Both routes at 390px and 1440px contain exactly the shared footer, all 24 footer links, visible Privacy/Terms and no overflow or console errors. Desktop pixels above the footer match the approved capture exactly. Evidence: `docs/pgt-footer/`.

## PGT exam hub — production release approved, PR #13 (2026-11-07)

- The owner approved the revised visual in `docs/pgt-hub/reference.png` and asked to build it. `/exams/pgt/` has the illustrated header, one active full-width UP PGT button, ten other state cards and three central cards. All thirteen other destinations say Coming soon and are non-interactive; no extra study/practice sections on the hub.
- UP PGT opens `/exams/pgt/up-pgt/`, retaining the previous general English study guidance without claiming it is an official UP-specific syllabus. All seven literature areas and the preparation method remain. Outdated UPSESSB and cross-board weighting assertions are not repeated as UP facts; UPESSC comes from the owner's list.
- Uses `_includes/pgt-layout.njk`, `_includes/pgt-exam-card.njk`, `_data/pgtExams.json`, `assets/pgt.css`, optimized generated artwork and licensed icons. Existing global navigation, NET pages, quizzes and backend are unchanged.
- Build and browser checks passed at 320, 390, 768, 1024, 1440 and 1920px: keyboard UP navigation, back navigation, mobile menu, local fonts/images, zero overflow, zero console errors and 62 resolved local references. Visual evidence: `docs/pgt-hub/`; latest `design-qa.md` result: passed.
- The owner explicitly instructed "merge karke live kar do now" on 2026-11-07. PR #13 is the release vehicle; merging publishes through the existing Cloudflare Pages main-branch deployment. Deployment results are attached to its merge commit in GitHub checks.
- Phone refinement: the owner approved desktop unchanged and asked for smaller hero text over the left side of the image on phones. Updated only the max-width 760px hero rules. Checked 320–760px text containment and confirmed the 1440px desktop screenshot is pixel-identical to the approved capture. Evidence: `docs/pgt-hub/mobile-top.png`, `mobile-hero-comparison.png`, `mobile-hero-checks.json`. Included in the approved PR #13 release.

## Anglo-Norman MCQ plan — Sets 1 and 2 live (2026-11-07)

- The owner asked for a plan like the Old English one, "Set 1, Set 2, Set 3", with the age prepared from the UGC NET point of view, and left the topics to Claude. The plan is in `_data/mcqSpec.json` (`anglo-norman`: three sets and five hub topics). Set 1 is free; Set 2 is live behind login; Set 3 remains "Coming soon". The hub topic and level filters work.
- Set 1 "Across the whole age" (easy, medium): the Conquest, the three languages, the chroniclers, the poems, the prose, the first plays. Set 2 "Poetry and romance" (medium, hard). Set 3 "Chronicles, religious writing and early drama" (medium, hard). 50 questions per level, so 300 questions in all if every level is filled.
- Where the words come from: the scope line the owner approved for the Daily Anglo-Norman page ("It covers the Norman Conquest and its languages, Wace, Layamon, Marie de France, the Arthurian chronicles, the early romances and the religious prose") and the works named in the 100 Daily questions, plus the Middle English notes. Only works those sources already name are in the meta lines.
- The NET side is **not** checked against the official syllabus text: `ugcnetonline.in` and the NTA site do not resolve from a cloud session. The unit mapping uses only the unit titles already on `/exams/net/syllabus/` (Unit I Drama, Unit II Poetry, Unit V Language). Check it against the official syllabus before calling a set "NET level" (Old English Set 6 carries the extra tag "UGC NET level"; add it only when the files match that pattern).
- The initial plan left out a criticism and scholarship set (the notes say almost nothing on criticism for this age; Old English had one as Set 6). It also excluded later mystery/morality plays and the Statute of Pleading (1362), which fall beyond this page's 1066–1340 period. The owner later approved keeping the supplied Set 1 questions that mention those topics as comparisons; this does not change the planned scope of Sets 2 and 3.
- The hub line "All 150 as one timed test · coming soon" adds the per-level count of each set (3 × 50), as for every age; it is not the number of questions if two levels are filled. Not changed.

## Old English Set 6 — login set, medium and hard (2026-11-07)

- Publication approved: the owner explicitly asked to merge and make [PR #11](https://github.com/afsar069/akexplained-site/pull/11) live on 2026-11-07. Database loading and verification are complete. Merging branch `feat/old-english-set-6-login` into main releases the registry changes through the existing Cloudflare Pages production deployment.
- The owner supplied two files and asked to correct format/rule issues and publish behind login, matching Sets 4 and 5. Set 6 is "Criticism and scholarship": 50 medium questions (the file describes a UGC NET pattern) and 50 hard questions, rev 1. The registry retains its planned title and UGC NET tag, adds medium alongside hard, and enables `live` with `access: login`. No engine or access-policy changes were needed.
- Question files and generated load SQL stayed outside the public repository. Both papers are in `public.mcq_papers`; Set 4 and Set 5 body hashes are unchanged. The complete JSON bodies, including headers, sources, question types and all six passages, were read back and compared exactly with the corrected input files. Tool fingerprints: medium `68c0d7cd544adbaefc43db65e2e23c56`; hard `683b08cb03c167ac25155d05b275636e`.
- Corrections before loading: 31 combination stems said TWO while the existing answer and explanation selected three or four statements; their counts now agree. Two hard stems were broadened to include the existing Leeds appointment and multiple critics they asked about. Two medium topic tags targeted King Alfred as background rather than the scholarly subject; they now use the existing Old English node. Stable IDs, answer indices, options, explanations and passages are unchanged. The validator reports zero errors; remaining advice concerns long stems/options and question marks on list-based questions. Cited Wikipedia articles were spot-checked for the scholarship, editions and translations; the cited user-supplied Oxford Companion pages were not attached, so those pages were not independently verified.
- The generated data load was tested twice in local embedded PostgreSQL (PGlite): full JSON equality and idempotency passed, authenticated reads succeeded, anonymous reads and student writes were denied. Live read-back confirms 100 Set 6 questions, no duplicate question IDs across gated papers, RLS enabled, anonymous SELECT denied and authenticated access read-only. Security advisors have the same two existing warnings (leaderboard function and leaked-password protection); no new finding.
- Browser validation used installed Chromium with Playwright and mocked Supabase: 392 checks passed. Guests see the lock in the Start slot and no question text; members see Start and can take either level. Both 50-question tests preserve every stem, option and referenced passage; deliberate wrong answers produce 48/50, 50 tagged attempt rows and a quiz completion. Review shows all 50 questions and seven passage cards per level. Both levels mix into a 100-question custom test; free Set 1 still works. No browser errors or horizontal overflow at 390/1200 px.
- Eleventy build passed; 6,607 internal link/asset references resolved. No Set 6 question IDs appear in the public build. The generated Anglo-Saxon pool now has 550 MCQ questions plus 100 Daily questions (650 total). A private backup ZIP of the corrected files was prepared for the owner; retain it because session scratch files are temporary. The live website cannot be reached from this environment, so deployment is checked through GitHub/Cloudflare status rather than a live browser session.

## NET compact layout — publication approved (2026-11-07)

- Release: PR #10 (`feat/net-compact-layout`). The owner asked for a thinner hero matching the newly attached wide crop and for NET text, buttons and side margins to match the other site pages, then explicitly approved publication with “live kar do” on 2026-11-07. Cloudflare Pages automatically builds and deploys `main` after the merge.
- The existing banner is displayed in a 14:5 frame with `object-fit: cover` and a 33% vertical focal position. At a 1440 px viewport it is approximately 1168 × 417 px, down from 1168 × 501 px. The original image files are unchanged; title, subtitle, statistics and lower text stay visible.
- `assets/net.css` now follows the shared typography and `.wrap` width: 22 px side padding, 1180 px maximum container, 36.8 px introductory heading, 27.52 px desktop section headings, 16.96 px action titles, 14.72 px helper text and 15.2 px mock-test button text. Paper/resource gaps, row padding, icon sizes and button corners are reduced to the site's normal scale. The related NET pages use the same container and heading scale.
- Verified against Quizzes at 1440 and 1920 px: computed heading/action/helper sizes and content edges match exactly. Viewports 320–2560 px, related pages, crop aspect ratio, image loading and mobile menu pass without overflow or browser errors. Evidence: `docs/net-compact/`; latest report: `design-qa.md`.

## NET preparation hub — publication approved (2026-11-07)

- Release: PR #9 (`feat/net-preparation-hub`). The owner selected the visual in `docs/net-hub/reference.png` and asked for a faithful build on `/exams/net/`, with About UGC-NET and View NET Syllabus available and all other NET hub resources coming soon. The owner explicitly approved publication with “live kar do” on 2026-11-07. Cloudflare Pages automatically builds and deploys `main` after the merge.
- Hub: four resource links, separate Paper 2 and Paper 1 practice sections, a mock-test band, and a full-width, text-only examination overview. The existing supplied banner and shared navigation/footer remain. Icons are licensed Feather plus Tabler's target-arrow; Literata and Source Sans 3 are self-hosted under `assets/fonts/net/` with OFL licenses.
- Available pages: `/exams/net/about/` and `/exams/net/syllabus/`. The latter has ten expandable English units, a Paper 1 outline, and jump links. Exam facts were checked against the official NTA December 2026 bulletin; syllabus unit summaries reuse the previous NET page, with the official UGC syllabus index linked as the source. The signed syllabus PDF links could not be fetched by the research tool; Paper 1 headings were cross-checked with Payyanur College's published UGC syllabus.
- Eight resource-specific coming-soon pages are generated from `_data/netResources.json` through `exams/net/coming-soon.njk`; they are `noindex,follow` and omitted from the sitemap. The existing global quiz pages are unchanged. Do not mark any NET hub resource available until its content exists.
- Implementation: `exams/net/index.njk`, `_includes/net-layout.njk`, `_includes/net-action.njk`, `assets/net.css`, `_data/netResources.json`, `_data/netComingSoon.js`. Do not recreate `exams/net/index.html`: it would collide with the template's output.
- Verification: build passed; all ten action-to-page-to-hub journeys passed; 36 local links resolved; widths 320–2560 px had no overflow; menu, keyboard unit expansion, paper jump links, print, fonts and images passed with no browser errors. Final screenshots and comparison are in `docs/net-hub/`; `design-qa.md` records the visual QA.

## Old English Set 5 — login set, medium only (2026-11-07, branch `claude/confident-sagan-52en96`; NOT on `main` yet)

- **What.** `old-english-set-5`: 50 questions, one level (medium), `access = login`, rev 1. The owner said "login ke andar", so
  rule 15 applied: the questions are rows in `public.mcq_papers` and are NOT in this repo (no question file, no load SQL).
- **Loaded** through the Supabase connector with `make_gated_sql.py --chunk 25` (2 parts) and read back. The table now has
  3 rows (Set 4 easy + medium untouched, Set 5 medium) and 150 distinct question ids. Data only, no schema change.
  Fingerprints that matched the file: tool md5 `573a02257c08df16c878b9978ab54030` (id, question, options, answer, reason, tags),
  plus three extra md5 for what that tool does not cover: passages `56dfefcb89e11a2c3f06c5bd8e60b2c7`, per-question
  `qtype / passageId / src / topic` `8a6f6fcdfb952acfb270014fdb639fc3`, header `937cae5972b03ab220b67197535bc46e`.
  Security advisors afterwards: two warnings, both unrelated to this data load (`public.leaderboard()` is a `SECURITY DEFINER`
  function that signed-in users can call; leaked-password protection is off). No schema was changed, so nothing new could come from this work.
- **Registry** (`_data/mcqSpec.json`, row 5): the owner's earlier plan (title "Terms, dates and sources", meta line, topic `terms`,
  medium, 50) was kept; added `live`, `access: login`, `rev: 1`, `titleCase`, `focus` (the title in lower case) and `lede`.
  The `lede` uses only the file's own `setName` words and level ("kenning, caesura, comitatus, wergild, futhorc, the Danelaw and
  Danegeld, at medium level"); nothing invented. The owner can send other words. `assets/syllabus-british.json` was regenerated by
  the build: Anglo-Saxon MCQ pool 400 to 450.
- **New file format** (from the "complex" MCQ generator): a top-level `passages` list (id, title, attribution, text, src) and, on 5 questions,
  `passageId`; every question has `qtype` (passage, direct, combination, match, chrono); 20 questions have line breaks (`\n`) for
  "List I / List II" and "A. B. C. D."; `topicRead` is `{}`. Two things the engine did not do and now does (`assets/cbt.js`, `assets/site.css`):
  1. **Passages.** Q1, Q2, Q31, Q32 and Q33 say "Read Passage p1/p2 above". `withPassages()` attaches the passage to its questions when a
     paper loads (single set and custom test alike) and `passageHtml()` draws a "Passage p1 · title" card above the question on the
     test screen, the review page and the wrong-answer cards. A file with no `passages` is untouched.
  2. **Line breaks.** `white-space: pre-line` on `.cbt-q`, `.cbt-fcq`, `.cbt-rq`. Older sets have no `\n`, so they look the same.
  `topicRead` is empty, so this set has no per-topic "Read this part of the notes" links (none were supplied; none invented).
- **`validate_mcq.py` does not know this format.** It reports "unknown field(s)" for `id`, `topicId`, `periodId`, `qtype`, `passageId`,
  `passages`, and "topicRead has no anchor" (same open item as rule 13). For a login set `make_gated_sql.py` is the real gate (ids,
  tags in the master, no repeat of a public question) and it passed. The validator's other findings were advice only (no `?` at the
  end of the multi-line stems, long stems).
- **Tested** (real file from the scratchpad, Supabase mocked, built `_site`): 37 of 37 checks. Hub row shows a padlock to a guest (link
  `/login/?next=…`) and only the "Medium" tag; a guest sees "Log in to take this test" and no question or passage text in the page;
  a logged-in student gets Begin, 50 questions, the passage card on exactly Q1, Q2, Q31, Q32, Q33, stems with line breaks (Q7, Q10),
  options in file order, result 48 of 50 for 2 deliberate wrong answers, the review page (50 questions, 5 passage cards), a custom
  test with Set 5 (5 passage questions, each with its passage), and no sideways scroll at 390 px and 1200 px. Free Set 1 and a free custom
  test: 7 of 7 (no passage card, no change). No JS error anywhere. `npx eleventy` is clean. Link check over the built site: 5 targets
  not found, none on an MCQ page (`/go/*` are Cloudflare redirects in `_redirects`; `/assets/topics/NAME.webp` is a placeholder on the Daily page).
- **Facts: spot-checked, not fully verified** (the owner did not say "verified"; the Britannica site did not open from the session, so
  its `src` pages were checked through search results only; the Oxford Companion could not be opened at all). Confirmed from other
  pages: heregeld 1012 to 1051 and the geld kept until 1162 (Q34, Q35); Vercelli Book found in 1822 (Q46); Cynewulf's four signed poems and
  where they are (Q26); Undley bracteate for the `ōs` rune and St Cuthbert's coffin 698 for the double-barred `hægl` (Q27 A, B);
  eight half-marks and 200 shillings (Q15); Sigeric, Ælfric and Æthelweard, £10,000 in 991 and £16,000 in 994 (Q31 to Q33); a foot cut off
  is 50 shillings (Q13); Roman comitatus as a short raiding company and the Germanic retinue (Q18). **Left as supplied, for the owner to
  decide** (nothing was proved wrong): Q13 the "50 sceattas" for pulling hair could not be found in the pages that opened; Q33 names
  Olaf Tryggvason as leader at Maldon, but the Chronicle does not name the Maldon leader (it is the usual scholarly identification, and he is a
  party to the 991 treaty); Q8 "more than six components" (Snorri's own wording is "to the fifth determinant", which is base-word plus five,
  so six elements, but the Oxford Companion page was not seen); Q27 C "fewer than 200 artifacts" was found only on a mirror of an older
  Wikipedia article; Q23 "94-line" was not confirmed (the 29 runes were). Q2, Q14, Q42, Q43 got the validator's "stem may give the answer
  away" advice (a shared word with the right option).
- **The owner should keep their own copy of the file** (the table is the live copy; the scratchpad vanishes).
- **Not done:** nothing on `main`. Merge only at the owner's word (rule 5). Open for the owner: the hub says "six sets" and Set 5 has one level only
  (set 6 is hard only), which the registry already planned.

## NET exam banner — publication approved (2026-11-07)

- Release: PR #5 (`feat/net-header-banner`). The owner approved publishing it to `main` on 2026-11-07. Cloudflare Pages automatically builds and deploys `main` after the merge.
- `/exams/net/` replaces its plain hero with the owner's supplied illustrated NET banner. Three WebP sizes (768, 1168, and 1915 px wide) keep the whole image visible at its natural ratio. At a 1440 px viewport, the banner image is 1168 × 501 px; the old hero was 1168 × 290 px. The mobile layout also shows the original HTML heading and description below the image for readability. Other exam headers and the NET page content are unchanged.
- Owner's follow-up (2026-11-07): remove the faded painting from “What the examination is” immediately below the NET banner, keeping just the existing text on the cream background across the full available page width. NET-only rules in `assets/net.css` remove the container and paragraph width limits, disable that decorative pseudo-element, and remove its reserved mobile bottom space; other pages retain their illustrations. PR #6 holds this follow-up. After the earlier automatic approval review block, the owner explicitly approved production publication with “yes live kar do” on 2026-11-07.
- Build and local browser checks passed at 320–2560 px, including mobile menu, 26 internal links/redirects, print, and no console errors. `design-qa.md` records the visual check and is excluded from public output. Live-site access remains blocked from the cloud session; check the deployment status and ask the owner to view `/exams/net/` after publishing.

## Live on `main` (akexplained.com)
- **Question tagging done.** All 2,000 Daily + 300 Old English MCQ questions carry `topicId` + `periodId`.
  Tracking is verified working end to end (logged-in answers land in `public.attempts`, fully tagged).
- **Topic tree = 1,711 rows, 9 areas.** Built by the migrations under `supabase/migrations/` (owner ran
  them; `select count(*) from public.topics` = 1711). Source of truth: `supabase/data/taxonomy-master-reference.csv`.
- **Security pass closed.** The two `SECURITY DEFINER` trigger functions have `EXECUTE` revoked from
  `anon`/`authenticated` (owner ran `20261103120000_…`; advisors 0028/0029 clear). `ensure_rls` safety
  net captured in `20261103130000_…`.
- **Google sign-in is live** — enabled in Supabase (OAuth client + consent screen in production). The
  button shows on `/login/` on its own.
- **Privacy/Terms are accurate** (accounts, Google, Supabase, Cloudflare; deletion on request).
  `/privacy/` also names **Resend** as the email provider for the sign-up confirmation and password-reset
  emails ("Five outside services"; "no newsletter" line untouched). **"Last updated" is now 4 November 2026**
  on the branch, for the leaderboard section.
- **Account emails are live** (owner, 2026-11-03): custom SMTP via **Resend** is on, **Confirm email is ON**,
  and the owner tested the full reset flow end to end (reset mail arrives, a new password can be set).
  The reset / confirm code (`60cac7e`, `assets/login.js`, `auth.js`) is on `main`.
- **www safety net** in `auth.js` sends `www.` visitors to the bare domain.
- **Login page redesign** (2026-11-06): `/login/` has a focused auth header, a desktop study preview,
  and a desktop gallery of writers from around the world. At widths of 900 px and below, the page
  shows a simple form layout without the two content images. The existing signup, sign-in, reset,
  and Google sign-in flows remain connected. The site's shared side menu stays available on the login
  page (fixed on desktop, hamburger drawer on mobile). On 2026-11-07 the desktop study preview was
  replaced with the owner's English Literature Study Space picture, whose benefits text is part of the image.
  The lower writers gallery was replaced with the owner's full “A World of Literature” banner;
  its heading, subtitle and six named portraits are part of the image. Both images remain hidden on mobile.

## Live since 2026-11-06: the dashboard (v3 layout)
The whole dashboard was merged to `main` at the owner's word on 2026-11-06, so everything described
in the three "Dashboard" blocks below is **now on akexplained.com**, not waiting on a branch:
`/dashboard/`, `/dashboard/ages/`, `/dashboard/topics/`, the top bar, the designed header and the
two header pictures. The name is set in **Playfair Display italic 700** (the owner's pick from five
faces shown on 2026-11-06); changing it means the `.dashhero-name` rule and `dashboard/index.html`'s
font link, both. Still open: the bell has nothing behind it, "Quizzes taken" waits for the
`quiz_runs` SQL (next block), and the other eight journeys have no syllabus.

## Dashboard fixes, 2026-11-06 — LIVE on `main` (merged at the owner's word). BOTH SQL files RUN by the owner (leaderboard and quiz_runs)
Done at the owner's word after a full check of the live dashboard (see the list the owner got in chat):
- **MCQs count in the level and the ages.** An age's pool = Daily questions + live MCQ questions
  (`tools/build-syllabus.js`; MCQ ages are matched to Daily ages by position). Today only Old English has live sets,
  so **Anglo-Saxon is now 400 questions** (100 Daily + 300 MCQ) and needs 240 answered to clear; every other age is
  still 100. It grows by itself when a set goes live. `/dashboard/ages/` shows "Daily quiz x of 100 · MCQ y of 300".
  The Literature banks (`asl-` …) are not in any pool yet; add them to `build-syllabus.js` when they go live.
- **Strengths / Areas to improve**: specific topics only (no whole periods, no "not sorted"), 3+ answers; areas show
  "N more right answers would bring this to 70%" (plain arithmetic on the person's own counts).
- **"Your paths" strip** stacks on a phone (the badge no longer squeezes or touches the link).
- **Quizzes taken is real**: `quiz_runs` (one row per finished quiz). **SQL: `supabase/migrations/20261106120000_add_quiz_runs.sql`
  — RUN by the owner on 2026-11-06 and checked live (read-only): table exists, RLS on, own-rows select + insert policies only,
  anon has no access, signed-in users cannot update or delete, the four checks and the cascade foreign key are in place, 0 rows
  at the time. Security advisors show only the two accepted WARNs (quiz_runs adds none).** The tile says "Quizzes taken" once
  the first finished quiz is on record; before that it says "Questions answered". Not retroactive.
- **Top students shows everyone ranked, up to ten, by POINTS.** **SQL:
  `supabase/migrations/20261106130000_leaderboard_rank_everyone.sql` — RUN by the owner on 2026-11-06 and checked live
  (read-only): the function carries `score`, floor 1, anon cannot execute, advisors show only the two accepted WARNs; the two
  live students read 34 points (58%) and 2 points (23%).** The floor drops from 100 different questions to 1, and the rank is no longer by accuracy alone: **points =
  right answers x accuracy** (= right x right / answered, each question once by its latest answer), so more questions AND
  better accuracy both lift a student and a lucky 1-of-1 is worth 1 point (owner's rule, 2026-11-06). Ties: accuracy, then
  more questions, then earlier start. Cards show rank, name, points and accuracy; `/privacy/` says points and accuracy
  together hint at how many questions a student has answered. If the function ever lacks `score`, the dashboard falls back to the
  accuracy wording.
- **Top students names (found 2026-11-06):** all three live accounts have an EMPTY `profiles.display_name`; their names
  live on the account (`auth.users.raw_user_meta_data`: Google `name`, email sign-up `display_name`), so the board showed
  "Student" for everyone. **SQL: `supabase/migrations/20261106140000_leaderboard_show_account_names.sql`** makes the board use
  profile name, else the account name, else "Student" (never an email). Status: RUN by the owner on 2026-11-06 and checked live
  (read-only): the board now reads "Mehak Nisar" 34 points (58%) and "Afsar khan" 3 points (25%), no email text in the
  answer, keys unchanged, anon cannot execute, advisors show only the two accepted WARNs. Students with zero answers are not on the board
  (no points); the owner then chose to show them at 0 points (next note).
- **Top students includes everyone who has logged in (owner, 2026-11-06): "only the top is shown, so a 0-point student shows
  until ten are above them".** **SQL: `supabase/migrations/20261106150000_leaderboard_include_everyone_logged_in.sql` — the owner
  must run it, AFTER the dashboard code below is live on `main`** (the code shows "No answers yet" for a student with no accuracy;
  the code already on `main` would print "null% correct"). "Logged in" = `auth.users.last_sign_in_at` is set and not deleted. The
  live account "Afsar Test 2" has never signed in (email never confirmed), so it will not appear until it signs in once. Tested on a
  scratch Postgres (answered, all-wrong and no-answer students, never-signed-in and deleted accounts absent, zero-point students fall
  off the top ten, exactly ten rows, anon denied, run twice).
- First real `quiz_runs` row seen live on 2026-11-06 (MCQ, old-english-set-2, easy, 50 questions, 21 answered, 6 right): the
  write path works end to end.
- `/privacy/` and `/terms/` now say quiz completions are kept and the list is on the dashboard (Last updated 6 Nov 2026).
- Tested: 123 dashboard checks and 26 quiz-engine checks in a browser with Supabase mocked; both migrations on a scratch
  Postgres 16 (run twice, RLS own-rows, anon denied, constraints, cascade, ten-student ranking). Security advisors must be
  re-run after the owner applies the SQL (the `leaderboard` WARN is still the accepted one; `quiz_runs` must add none).
- **Left for later (owner's word, 2026-11-06):** the bell (with the owner's own dashboard), the other journeys (only British
  for now), reading progress and exam-wise progress, tile PNGs (nothing to do until the owner has pictures).

## Waiting on a feature branch (the login-layer block below is already merged; kept here for its details)
- **Lock moved into the Start slot (follow-up, 2026-11-07, branch `claude/youthful-brown-vwwtyp`; NOT on `main` yet).** The owner saw the
  padlock before the title (merged in pull request 3) and said again: the lock must be where the Start button is, not in a
  corner. Now: a guest sees a padlock button in the Start slot of a login set (same position and height; checked in a browser,
  right edges equal and heights 43 px = 43 px), a logged-in student sees Start. The title padlock is gone. `/login/?next=…` shows
  one line saying they will come straight back. Returning student: back to the set page. **New student: signs up (or Google),
  sees "Choose your path" (the profile step), then Save or Skip returns to the set page** (this already worked since pull request 3;
  now covered by a test of the email sign-up that the page to come back to is remembered, and of the email link in a new tab).
  Tested on a scratch copy with the real Set 4 files, Supabase mocked: 25 of 25 new checks plus the earlier 21 of 21. Files:
  `age-hub.njk`, `site.css`, `mcq-age.js`, `login/index.html`, `login-page.css`, `login.js`.
- **Lock on login sets, and "login and come back" through every exit** (2026-11-07, branch `claude/youthful-brown-vwwtyp`; NOT on `main` yet).
  Owner's asks: (1) a login set should look locked from outside, a tap on the lock takes a guest straight to the login page;
  (2) after logging in the student lands exactly where they left ("login karke seedha wahin"); (3) write the rule changes down
  so another AI and the next session can carry on.
  - **Lock:** `quizzes/mcq/_templates/age-hub.njk` (padlock link before the title of a login set, `data-guest-only`, so a
    logged-in student does not see it), `.agehub-lock` in `assets/site.css`. Link: `/login/?next=%2Fquizzes%2Fmcq%2F<age>%2Fset-<n>%2F`.
    The text tag "Login needed" stays removed. The "Build your own test" page still says "Needs a free login" (not asked to change).
  - **Come back:** `assets/login.js`: `?next=` is kept in `localStorage` (`ak:next`) for one hour (survives Google and an email link
    opened in a new tab); all ten exits go through `goAfterLogin()`: password sign-in, already logged in, Google (new and returning),
    email-confirm landing, "Choose your path" Save and Skip, new password. A plain visit to `/login/` drops an old `next`. Only
    same-site paths are accepted. The email-confirm redirect URL is untouched.
  - **Tested** (scratch copy of the site, real Set 4 files, Supabase mocked): 18 of 18 new checks (lock shows to a guest only and
    only on Set 4; plain-words label; tap size 32 px on a phone and no sideways scroll; click goes to `/login/?next=…`; returns to
    the set page after password sign-in, Google (has a path and new person), email link in a new tab, password reset; a 2-hour-old
    `next` and a plain visit are ignored) plus the earlier 21 of 21.
  - **Notes for other AIs:** `AGENTS.md` (new, one page) and `CLAUDE.md` (top pointer; rule 5 has the merge steps; rule 7 the
    "owner says verified" exception; rule 14 what the session cannot reach; rule 15 the lock and the return rule).
    `tools/mcq-skill/README.md` has a login-set section. Not checked on the live site (the session cannot open it).
- **Login layer for MCQ sets** (2026-11-07; MERGED to `main` at the owner's word the same day, pull request 1, merge commit `191c802`, so it publishes to akexplained.com once Cloudflare has built it; the session cannot reach akexplained.com, so the live page was not checked by Claude). Owner's decisions (rule 15):
  free sets stay open (the 300 Old English MCQs and any set the owner calls free); a set the owner calls "login" is kept in the
  database, readable only by logged-in students; paid comes later (the owner picks which sets, and a promo code can give the
  paid pass for free); big PDFs will go to R2 (nothing built). **Claude now runs the SQL itself** (rules 9 and 14 changed).
  - **Database (LIVE, applied with the connector on 2026-11-07):** `supabase/migrations/20261107120000_add_mcq_papers.sql`.
    Read back live: table `mcq_papers` exists with 0 rows, RLS on, one policy (`mcq_papers_login_read`, SELECT, authenticated),
    only `authenticated: SELECT` granted. Security advisors: no new finding (still only `leaderboard` and leaked-password
    protection, both older). Tested first on a scratch Postgres 16: run twice, anon denied, logged-in reads only `login` rows,
    `paid` rows invisible, no write from a client, wrong-shape body refused.
  - **Code (now on `main`):** `assets/cbt.js` (reads a login set from the table; guests see "Log in to take this test"),
    `assets/login.js` (`?next=` returns a returning person to the page; same-site paths only), `_data/mcqAges.js` (`access`,
    `rev`, build stops on `"paid"`), the five MCQ templates (`data-gated`), `tools/build-syllabus.js`
    (a login set counts `count x levels`), `tools/mcq-skill/make_gated_sql.py` (checks the files, writes the load SQL).
  - **Text:** About, Privacy (Last updated 7 Nov 2026) and Terms (Accounts) now say "some MCQ sets ask you to log in first".
    They went live in the same merge as Set 4, so they are true. `/terms/` and `/contact/` still say "no paid tier",
    which stays true until paid is built.
  - **Tested** (scratch site with a fake login set, Supabase mocked, never published): guest sees the login screen, no
    question request and no question text; logged-in student gets the test; a missing row gives the "did not load" screen;
    free sets and custom tests of free sets are unchanged; custom test with a login set; `?next=` return and the refusal
    of `https://`, `//`, `/\` and `javascript:` targets; hub and build pages have no JS error. One real bug was found by this
    test and fixed: `cbt.js` runs before `auth.js`, so it now waits for `window.akAuth`.
  - **FIRST LOGIN SET LOADED (2026-11-07): Old English Set 4, easy + medium, 50 + 50 questions, access `login`, rev 1.**
    The owner sent files named `old-english-set-3-*`, which clashed with live free Set 3 (same `setId`, same 100 ids; the
    question text was different, a second bank on the same topics). At the owner's word ("this is set 4; the questions are
    verified, overlaps are fine") only `setId`, `setNumber` and the ids were renamed to `old-english-set-4` / `-e-NN` / `-m-NN`
    in a scratchpad copy (checked: nothing else changed). Loaded with `make_gated_sql.py --chunk 25` (4 parts) through the
    connector and read back: easy md5 `d42b150e3b43125c68e285840d6644ce`, medium md5 `4443e3e167bdedd7dc441c1f99923f66`, both
    equal to what the tool computed from the files; 100 distinct ids; policy and grants unchanged; advisors unchanged. The
    question files and load SQL are NOT in the repo. The registry row (hub text taken from the owner's own `setName` and
    topic names, nothing invented) is in `_data/mcqSpec.json`; the owner's earlier plan for row 4, "Manuscripts and survival"
    (meta "50 questions &middot; the four codices, the Ruthwell Cross, Sutton Hoo, the 1731 fire", topic `manuscripts`, levels
    medium and hard, 50 questions), was replaced by it and is kept here so it is not lost; re-add it as a new set number
    when the owner wants it (the hub text says "six sets" in four places, so a seventh row means editing those). The hub's
    "Manuscripts and survival" topic option now matches no set. The owner did not re-check facts (they are verified by
    the owner); the loader's own checks passed. Open for the owner: Set 3 and Set 4 both cover prose and its writers.
    Browser-tested against the real files (Supabase mocked) 21 of 21.
  - **Not done / next (after Set 4):** the paid layer (entitlements, promo codes, gateway) is not built; the owner will
    choose which sets become paid. Point 7 of the owner's message of 2026-11-07 was empty. The branch was merged on
    2026-11-07 (Set 4 and the About / Privacy / Terms text went live together). Still to check by the owner on the live
    site: the hub row of Set 4 has no "Login needed" tag (removed at the owner's word on 2026-11-07; login is asked only after Start); Set 4 shows "Log in to take this test" when logged out and the test
    when logged in; `/privacy/` says "Last updated: 7 November 2026".
- **"Choose your path" screen redesigned** (2026-11-07, branch `claude/fervent-wozniak-pz99op`; published to `main` at the owner's word the same day; the owner sent a
  screenshot of `/login/?path=1`). Causes found: `login-page.css` had `.pathscreen{padding:0}` while the card border stayed, so text
  touched the border; the big heading above still said "Welcome back"; `site.css` `section{padding:40px 0}` added 40px above and below
  every path group; "Coming soon" rows were taller and louder than the rows you can pick; and the Literature Journey sat at the very
  bottom under fourteen rows. Now (`login/index.html`, `assets/login-page.css`, `assets/login.js`; CSS is all under `.login-page`):
  heading says "Choose your path" (`openPath` sets it and adds `is-path`); no outer card; pickable rows first in each group, then
  one small "Coming soon" label with quiet rows (the per-row tag stays for screen readers); a group with something pickable comes before
  a group where everything is "Coming soon" (rule is in `render()`, follows the `exams` table, nothing typed per row); picked rows are
  highlighted (`is-on`); Save / Skip stay at the bottom of the screen while the list scrolls. Behaviour is unchanged (same save, same
  Notify, same redirect to `/dashboard/`). Tested in a browser with a mocked session and exams list (the real database is not reachable
  from the session): selection, Main tag, Save payload, Notify, empty Save, logged-out visit. Not seen against the live `exams` table.
- **MCQ page top strips fixed** (2026-11-07, branch `claude/fervent-wozniak-pz99op`; published to `main` at the owner's word the same day). Owner's two asks on `/quizzes/mcq/`:
  1. **"Carry On Where You Left"** led nowhere: "Continue" opened the age hub and "N You Got Wrong" opened
     `/quizzes/mcq/build/?only=wrong`, which 404s. Now (`assets/mcq.js`, no HTML change): Continue opens the
     running test itself (`/quizzes/mcq/<age>/set-<n>/?n=<count>`; the engine resumes only when `?n=` equals the saved
     count) and the wrong row opens the finished test with the most wrong answers (`…/set-<n>/?only=wrong`).
     A row appears only when its page can do that (a test whose clock ran out is not offered). Age and set come
     from the shape of the key (`<age>-set-<n>` / `<age>-custom`), the age name from its card, so a new live age needs
     no edit here (the old `AGE_NAMES` list is gone; it knew only 12 slugs, several of them not real ones).
     Not checked: an attempt saved before a question file's `rev` was raised is not detected here (the engine
     ignores it; the page would show its fresh start screen).
  2. **"Not Sure Where To Begin?"** now goes to `/login/?path=1` (owner's call; it used to go to `/quizzes/daily/`).
     Logged out: the login page. Logged in: straight to "Choose your path" (same link as "Change paths" on
     `/account/`). Strip text and button ("Choose Your Path") rewritten to match. Not browser-tested while logged
     in (Supabase is not reachable from the session); that screen is the existing `?path=1` behaviour.
  The Carry On strip's second line "Sign in later and it will follow you to your phone" promised something that is
  not built (guest answers are not moved to the account, rule 13; this strip reads only this browser). Owner said
  "write what is true" (2026-11-07): the line is now just "Kept on this device only." Bring the promise back only
  when the strip really reads from the account.
- **Dashboard v1 at `/dashboard/`** — on `claude/zen-hamilton-41vw9q`, **NOT on `main`** (the owner wants to see
  it first). Read-only; no migration, no new table or column. Files: `dashboard/index.html`,
  `assets/dashboard.js`, a "Dashboard" block at the end of the account section of `assets/site.css`, a
  logged-in-only "My Dashboard" menu item (`data-auth-only`, in `_includes/base.njk`, `index.html`, `404.html`,
  shown by `auth.js`), and a "Your progress" card on `/account/`. Shows, from the user's own `attempts` only:
  totals (labelled "Questions answered (including repeats)": every answer counts, a repeat counts again),
  answers today (visitor's calendar day) and in the last 7 days (rolling), by period and by topic (names
  from `topics`, never raw ids), and the paths picked (`user_exams`). Logged out: a "Sign in to see your
  progress" panel (login has no "return to" setting, so it lands on `/account/`). New user: an empty state
  with links into the quizzes. Sections are entries in a list in `dashboard.js` (`addSection({ id, order,
  title, needs, render })`), so a new section is an addition, not a rewrite.
  **Deliberately NOT shown** (the computation does not exist; `exam_topics` has 0 rows): mastery or level
  ladders, decay, a suggested next step, knowledge or exam-readiness meters, exam-wise progress. Do not
  approximate them.
  Tested in a browser with Supabase mocked (44 checks: totals, today / 7-day counts, names, empty, logged
  out, errors, paging with 2,350 rows and with a 500-row server cap, the 10,000-row safety cap, mobile
  width). Not yet seen against the live database from the browser; the owner reviews it before any merge.

- **Dashboard v2 (full) pass** — on `claude/compassionate-franklin-ypvye1`, **NOT yet on `main`** (owner's call).
  The owner (2026-11-04) asked for the full set of features *with working computations* on `/dashboard/`, and
  to change rule 8/10 so levels/rank/streak/strengths/areas are allowed now. Built, still read-only:
  - **Welcome hero** with the person's name ("Welcome back, <name>"; first-timer "Welcome, <name>"; main path).
  - **Your overall progress** (KPIs): Questions attempted / Correct answers / Accuracy.
  - **Your level in English literature** (owner's model, 2026-11-04, confirmed): **British literature = the
    20 Daily ages, each an equal 5%** (20×5 = 100%). An age is **cleared** when the learner has covered ≥60%
    of its questions **and** answered ≥60% of those right (each question once, by latest answer). Five stages
    (Beginner→Master), one per 20% band = 4 cleared ages each. Per-age denominators + the id prefix come from
    **`assets/syllabus-british.json`, generated at build** (`tools/build-syllabus.js`, called from
    `eleventy.config.js`; fails the build if an age's ids don't share one prefix). Grouped by **question_id
    prefix** (`as-`,`rn-`,`nc-`…), NOT period_id — Renaissance/Neoclassical tag to sub-age nodes, so only the
    prefix is a clean per-age key (each age = 100 Daily questions today). Card shows the ladder, an overall
    bar with the 4 stage marks, and an expandable per-age list (coverage + accuracy + a 60% gate marker, ✓ on
    clear). Reading is NOT used (reading_progress = 0 rows). **Only British literature is measured**; the other
    8 journeys (American, Indian, Linguistics, Theory, Criticism, Culture, World) + the NET grand-total are
    empty until their syllabus + content exist — shown later as "coming soon".
    **No-demotion caveat:** the level is live-computed, so if Daily questions are ever ADDED to an age its
    denominator rises and a cleared age could un-clear (level could dip). Adding questions is rare and
    owner-controlled; true no-demotion needs a stored high-water mark (a small `profiles`/new-table column) —
    a follow-up when it matters.
  - **Your rank** + **Top students**: from `public.leaderboard()` RPC — **confirmed live** (function exists;
    130 attempt rows, 2 users; nobody ranked yet as the floor is 100 different questions). Cards hide if the RPC
    is ever unavailable.
  - **Today's activity**: attempted / correct today. **Your daily streak**: days in a row + days this week +
    a Mon–Sun grid, all from the active-day set (visitor's local day). **By period**, **By topics**,
    **Your strengths** (topics 3+ answers, ≥70%), **Areas to improve** (3+ answers, <70%), **Your paths**.
  - New in `dashboard.js`: `question_id` in the select; `s.unique`/`s.days` + `computeStreak` + `dayKey` in
    `computeStats`; `loadBoard`, `loadProfileName`, `welcomeHero`, `kpi`/`icon`/`ordinal`/`stars`/`LADDER`/
    `levelIndex`/`measuredTopics` helpers. New styles in `site.css`: `.dashhero`, `.dashkpi*`, `.dashlevel*`,
    `.dashladder`, `.dashstreak`/`.dashweek`, `.dashboardlb`/`.dashlb`.
  - **Still NOT shown**: decay, a suggested next step, knowledge/exam-readiness meters, exam-wise progress.
  - Also this branch: **after choosing a journey, `/login/` sends the person to `/dashboard/`** (was `/account/`);
    the guest score board carries one login CTA; the Download-PDF button is back on the score board.
  - Browser-tested against `_site` with Supabase mocked (hero, all KPIs, the 11 sections in order, the British
    level — ladder, overall bar, per-age tiles with an age cleared at 60/60 and the right "answer N more" hint —
    rank, streak + week grid, strengths/areas split, top-students list, paths).
  **PENDING the owner**: review the British-literature level live, then say when to merge to `main`. Later:
  the other 8 journeys' syllabus + the NET grand-total; no-demotion high-water mark; align the MCQ generator.
  **Next up — a richer dashboard redesign** (owner shared a mockup): the plan, with what is real now vs what
  needs new tracking/features, is in **`docs/dashboard-redesign-plan.md`**.

- **Dashboard v3 layout** — on `claude/practical-heisenberg-6vt2n9`, **NOT on `main`**. The owner gave the
  row order (2026-11-06) and it is now built in `assets/dashboard.js` + the "Dashboard v2 layout" block at the
  end of `assets/site.css`. Same data, same read-only rule — only the arrangement and three new pieces:
  1 welcome header · 2 **six tiles in one line** (enrolled courses, questions answered, correct answers,
  average score, day streak, overall progress) · 3 Your rank | Today's activity · 4 daily streak (two tiles
  + the week line) · 5 Your level in English literature (the five stages) · 6 progress by British age |
  progress by topic · 7 strengths | areas to improve · 8 Top students | Your paths · 9 **Your performance** |
  **Your next goal**, side by side, last.
  - **Five rows per card** on rows 6 and 7 (owner's rule). The age card puts the age being worked on now
    first (the age of the newest answer), then the ages that are furthest along.
  - A **"+" button** in the corner of the age, topic, strengths and areas cards opens the full list:
    **`/dashboard/ages/`** (all 20 ages + answers by period) and **`/dashboard/topics/`** (every topic +
    strengths and areas in full). Both are `noindex`, both reuse `assets/dashboard.js` — the page's
    `#dashSections` carries `data-view="ages"` / `"topics"`, so there is one loader, not three.
  - **Week line colours**: green = answered, **red = missed**, plain with a border = still to come
    (today keeps a gold border until it is answered).
  - **Your performance** is a real weekly chart: 8 Monday-to-Sunday buckets from `attempts`, plotting
    correct-out-of-answered for each week that has answers (hidden until two weeks have data). Nothing is
    smoothed or guessed. The "Average score" tile shows the week-on-week change only when both weeks have
    at least 5 answers.
  - **Your next goal** = the next age in the site's own order that is not cleared, with what is still needed
    and a link to that Daily quiz.
  - **Pictures**: every tile asks `art(key, svg)` for its artwork and gets a line drawing today. When the
    owner's PNGs are ready, drop them in `/assets/dash/` and name them in `KPI_ART` at the top of
    `dashboard.js` — no other change. Suggested size about 96x96, see-through background.
  - **"Quizzes taken" is still not a real number** (plan bucket 2): we count answers, not finished tests,
    so that tile says "Questions answered". It needs a completion row before it can say anything else.
  - Browser-tested against `_site` with Supabase mocked (the six tiles, the five paired rows, the "+" links,
    the missed-day red, the chart, the two full-list pages, mobile width 390px). `npx @11ty/eleventy` builds
    clean; no new internal link 404s.
  - **Top students** takes a line of its own, the five students side by side right across the card
    (`.dashlbrow` / `.dashlbcard`, first place gold, "You" teal, two columns under 720px).
    **Your paths** is the last line of the page, one thin strip (`.dashstrip`).
  - **The header** (owner's design, 2026-11-06) — it had never been in this repo, so the dashboard was
    showing the older plain welcome box. Now: the banner painting `assets/dash-banner.webp` (Prof. AK, the
    university building and his own words, cut from the picture the owner sent), then "Your progress",
    "Welcome back," with the name large in `--accent` and a wave, "Continue your English literature
    journey." and the main path, all **centred on a painted panel** of their own
    (`assets/dash-box.webp`: cream paper, a gold frame, books at the left and leaves at the right).
    The **Study · Practice · Revise · Improve** line was dropped at the owner's word (2026-11-06).
    The name is set in **italic Literata 700**, which is why `dashboard/index.html` asks Google Fonts
    for `1,700` as well — do not drop it from that page's font link.
    A first-time reader gets "Welcome," and "Start your English literature journey.".
    **To replace either picture**: one file, same name, same shape, nothing else to change.
      - `assets/dash-banner.webp` — the wide painting, **2268 x 494 px** (shown at 1134 x 247).
      - `assets/dash-box.webp` — the panel behind the greeting, **1988 x 422 px** (about 4.7 : 1).
        It is stretched to the panel, so keep the art at the two ends and the middle clear, and leave
        the gold frame **out** of it: the frame is a 1px CSS border, so it stays hairline at any size.
    The quote and the frame live inside the pictures, so the page never repeats them.
    The **panel keeps its picture at every width** (the owner asked for it, 2026-11-06); on a phone the
    type steps down and the padding tightens instead, so the whole header is about 230px tall on a
    390px screen and the panel itself 131px. The art does stretch a little on a narrow screen — a
    phone-shaped panel picture would be the fix if the owner wants one.
    The **name is set in EB Garamond italic 600** — Garamond is the old-style face English literature
    has been printed in for centuries, which is why it was chosen over Literata here (the owner asked
    for something that represents English literature). Changing it means two places: the
    `.dashhero-name` rule and `dashboard/index.html`'s font link.
    Watch out: the site's `p{max-width:74ch}` pushed every centred line off-centre inside the panel,
    so `.dashhero-box p` clears it. Any new line added there needs the same.
  - **The dashboard's own top bar** (`.dashtop`, static markup in `dashboard/index.html`): "My Dashboard"
    (the page's `h1`) in the middle, a **bell** and the **profile button** on the right. The old `.pagehead`
    (the "Your progress / My Dashboard" strip with the reading-woman painting) and the breadcrumb were
    removed from this page so the header sits at the very top, as the owner drew it. The bar shows
    "Log in / Guest" until `dashboard.js` fills `#dashUser` with the real name (initial, name, "Student",
    link to `/account/`).
    **The bell is `disabled` and carries no dot or count** — nothing is behind it yet. To switch it on:
    drop `disabled`, change its two labels, add the handler, and only then show a count, from real rows.
    Careful: `.dashbar` was already taken (the thin progress bar), which is why the top bar is `.dashtop`.

## Known v1 limitation: the dashboard loads every attempt row into the browser
`/dashboard/` fetches all of the user's `attempts` rows (4 small columns: `id, is_correct, answered_at,
period_id, topic_id`; newest first, 1,000 per request, at most 10,000 rows) and works out totals and
breakdowns in the browser. That is fine at today's volume (100 rows, 1 user) but **will not scale**: a regular
student will have thousands of rows and pull all of them on every visit, on mobile. The owner accepted this
for v1 so as to avoid a schema change. **The fix, when the mastery computation (backlog item E) is built:**
a grouped database view or RPC (`security invoker`, so RLS still limits it to the caller's own rows) that
returns the totals, the today / 7-day counts and one row per period and topic with count and correct, so the
browser receives a few dozen rows and not thousands. Until then, past the 10,000-row cap the page says so
("These figures use your latest 10,000 answers"). When that view is added: write the migration, the owner runs
it (rule 9), run the security advisors (rule 14), then replace `loadAttempts`/`computeStats` in
`assets/dashboard.js`; the sections themselves need no change.

## Score Board honesty pass + leaderboard (done 2026-11-04, on the branch, NOT on `main`)
The MCQ result screen (`assets/cbt.js`, `showResult()`) was written before accounts existed and still
talked as if they were coming. Fixed in two commits on `claude/zen-hamilton-41vw9q`:

- **Real name.** `whoAmI()` read `window.AK.user.name`, which nothing on the site ever sets, so every
  logged-in student was shown as "Guest User". It now reads the cached header name (`ak:name`) and
  `paintAuthBits()` corrects it from the session and the `profiles` row.
- **Two-sided markup.** Anything that depends on login is written twice, `data-auth-in` and
  `data-auth-out`, and opened by the login state. `auth.js` gained `data-guest-only` (the opposite of
  the existing `data-auth-only`). The stale "Enrol now / Coming soon" rail box in `_includes/base.njk`
  is now two real boxes: sign up, or open your dashboard.
- **Topic-wise table unlocked.** It holds this paper's own numbers; no account was ever needed. Its
  box now points at the dashboard. `.cbt-lockbox` had to leave `position:absolute` or it would have
  covered the last rows.
- **`[hidden]` must be spelled out** where a class sets its own `display` (the pattern already used by
  `.mcq-body` and `.iq-body`). Added for `.cbt` and `.railbox`, or the hidden half of every pair stayed
  on screen. This bit once; check it whenever a new `data-auth-*` pair is added.

### The leaderboard — SQL IS WAITING FOR THE OWNER TO RUN
`supabase/migrations/20261104120000_add_leaderboard_function.sql` creates `public.leaderboard()`.
**Not applied.** Until the owner runs it the card and the rank cell simply stay hidden (tested), so the
branch is safe to publish either way.

The owner's rules (2026-11-04), encoded in the SQL:
- A student joins the ranking after **100 different questions**. (Without a floor, two correct answers
  would be 100% and top the board.)
- Ranking is **by accuracy**. **Names are shown** — the owner chose this over an anonymous board.
- **No minimum number of students.** It runs from the first eligible student and reorders as people
  pass each other. Today exactly one student qualifies (100 answers, 58%); the second has 10.
- One decision Claude took and flagged: **accuracy counts each question once, by its latest answer**,
  not every attempt, or one easy question answered 500 times is 100%. It also means fixing a wrong
  answer raises the score. Only the `latest` CTE changes if the owner wants another rule.

`SECURITY DEFINER` (RLS is own-rows-only, a board must look across students), so the function itself is
the privacy boundary: about another student it returns **only the display name they chose and their
accuracy** (owner's words, 2026-11-04: "name + score, nothing more, like a Telegram group leaderboard"),
top ten only. The question count was dropped from the board entries so it is not even in the network
response for someone else; the caller's own count stays in the `you` object. EXECUTE revoked from
`public`/`anon`, granted to `authenticated`.

**Applied and settled 2026-11-04.** The owner ran the first version, then the question-count tightening
(both confirmed; `create or replace`, so re-running the same file picked it up). A third version that also
dropped the accuracy was written and committed, but the owner decided against it and it was reverted — the
owner's final choice is **rank + chosen name + overall accuracy %**, which is what the live function
already returns and what the UI shows. No further re-run is needed; the migration file in the repo matches
the live function (board = rank, name, accuracy, is_you). Verified live 2026-11-04: board keys are exactly
those four; one student qualifies (100 answers, 58%); `anon` cannot execute, `authenticated` can.

**Security advisor — one expected WARN that will not clear, by design.** After applying, advisor 0029
(`authenticated_security_definer_function_executable`) flags `public.leaderboard()`: a signed-in user
can call a `SECURITY DEFINER` function. This is **intentional and cannot be removed without deleting the
feature** — the whole point is that signed-in students call it, and it cannot be `SECURITY INVOKER`
because RLS would then limit it to the caller's own rows and no board could be built. The function is
written as the privacy boundary (tightly fixed return shape, nothing leaks beyond name + accuracy of the
top ten), so leaving it callable is safe. Treat this WARN like the leaked-password one: **known, accepted,
do not raise it again.** (The other WARN, leaked-password protection, is the pre-existing one the owner
skipped on 2026-11-03.)

`/privacy/` changed in the same commit (rule 10): a new section says reaching the top ten makes the name
on the account and the accuracy visible to other logged-in students, nothing else is (not the question
count, not which questions, not email, not timing), and how to stay off.

### Still open on the Score Board
- The **level card** keeps five empty cells. Two of them can never be filled — **"Tests taken"** and
  **"Left unanswered"** are not in the database (`track.js` writes one row per *answered* question and no
  test id). "Your level" waits on the owner's cut-offs. Decide whether the card is rebuilt from the three
  honest numbers or dropped.
- The **streak card** is still empty, but days in a row / days this week *are* computable from
  `answered_at`. That is the next cheap win (release 2 of the plan).

## Owner to do in the dashboards (not code)
1. ~~Leaked-password protection~~ — **skipped on purpose** (owner, 2026-11-03: it needs the Supabase Pro plan
   and this is a small site). The Supabase advisor WARN for it stays; do not raise it again unless the plan changes.
2. ~~SMTP + Confirm email~~ — done. The 30/hour email rate limit **stays** (owner, 2026-11-03: plenty for now).
3. ~~Cloudflare www→apex 301~~ — **done** (owner, 2026-11-03). Rule "Redirect from WWW to root [Template]"
   (Cloudflare Rules → Redirect Rules → Single Redirects, enabled, 1 of 10 used): Wildcard pattern
   `https://www.*` → `https://${1}`, status 301, Preserve query string left OFF (the `*` already carries
   `?query`). DNS: `www` is a CNAME to `akexplained.pages.dev`, Proxied. On deploy Cloudflare warned "This
   rule may not apply to your traffic"; the owner chose "Ignore and deploy rule anyway" (the `www` record was
   already proxied; a second record would have clashed). **Tested** in the browser Network panel with a private
   window: `https://www.akexplained.com/about/?x=1` gave a real `301` first, then `200` on the bare domain, and
   `?x=1` survived. The `auth.js` JS net stays as a backup. This session cannot edit Cloudflare rules (no tool
   does) and cannot reach akexplained.com, so any later change to the rule is the owner's, in the dashboard.

## Decisions owed by the owner
- **Node-gaps batch 3** — the 21 quoted titles that recur in ≥2 questions, listed in
  `tools/tagging/reports/node-gaps.md`, awaiting a one-pass approval. The ~122 one-off quoted titles are
  deferred to a later "titles pass".

## Backlog (labels the owner uses)
- **C** — migrate a guest's `localStorage` attempts into the DB on login.
- **I** — dashboard v1 (show a user their attempts). **Built on the feature branch, awaiting the owner's
  review**; the server-side grouping that replaces its load-everything query is in "Known v1 limitation" above.
- **L** — leaderboard. Code is on the branch; **the SQL is waiting for the owner to run** (see above).
- **M** — streak section on the dashboard (days in a row / days this week from `answered_at`). Agreed, not built.
- **E** — mastery meter (roll attempts up the topic tree).
- **J** — fix the pre-existing `/quizzes/mcq/build/` and `/quizzes/mcq/topic/*` 404s.
- **D** — NET taxonomy mapping (owner supplies the data).

## Key facts a new session needs
- Supabase project ref: `almlqoxcyzwieuwrgwry`. Browser uses the **publishable** key in
  `assets/supabase-config.js` (public by design; RLS protects data). Secret key never in the repo.
- Auth: implicit flow; email links return to `/login/` with tokens in the URL hash. `auth.js` latches
  `PASSWORD_RECOVERY` and reads the link `type`.
- Identity linking is automatic on a verified email and cannot be switched off — one person, one `user_id`.
- Migrations are owner-run (rule 9). Test them on a local Postgres first (rule 14).
