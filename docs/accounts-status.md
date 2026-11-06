# Accounts / database / auth — where things stand

A dated snapshot so a new session (or a different AI) can pick up without re-reading the chat history.
The **rules** live in `CLAUDE.md` (rules 9–14); this file is only *current state + what is pending*.
Keep it updated when the state changes.

_Last updated: 2026-11-07 (dashboard fixes are live; login illustration updated)._

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

## Live since 2026-11-06: the dashboard (v3 layout)
The whole dashboard was merged to `main` at the owner's word on 2026-11-06, so everything described
in the three "Dashboard" blocks below is **now on akexplained.com**, not waiting on a branch:
`/dashboard/`, `/dashboard/ages/`, `/dashboard/topics/`, the top bar, the designed header and the
two header pictures. The name is set in **Playfair Display italic 700** (the owner's pick from five
faces shown on 2026-11-06); changing it means the `.dashhero-name` rule and `dashboard/index.html`'s
font link, both. Still open: the bell has nothing behind it, "Quizzes taken" waits for the
`quiz_runs` SQL (next block), and the other eight journeys have no syllabus.

## Dashboard fixes, 2026-11-06 — LIVE on `main` (merged at the owner's word). Leaderboard SQL RUN; the quiz_runs SQL still WAITS FOR THE OWNER
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
  — NOT RUN YET (the table does not exist in the live project as of this note).** Until the owner runs it the tile keeps saying
  "Questions answered" and the engines' inserts fail silently, which is the designed safe state. After it runs: re-run the
  security advisors; `quiz_runs` must add none.
- **Top students shows everyone ranked, up to ten, by POINTS.** **SQL:
  `supabase/migrations/20261106130000_leaderboard_rank_everyone.sql` — RUN by the owner on 2026-11-06 and checked live
  (read-only): the function carries `score`, floor 1, anon cannot execute, advisors show only the two accepted WARNs; the two
  live students read 34 points (58%) and 2 points (23%).** The floor drops from 100 different questions to 1, and the rank is no longer by accuracy alone: **points =
  right answers x accuracy** (= right x right / answered, each question once by its latest answer), so more questions AND
  better accuracy both lift a student and a lucky 1-of-1 is worth 1 point (owner's rule, 2026-11-06). Ties: accuracy, then
  more questions, then earlier start. Cards show rank, name, points and accuracy; `/privacy/` says points and accuracy
  together hint at how many questions a student has answered. If the function ever lacks `score`, the dashboard falls back to the
  accuracy wording.
- `/privacy/` and `/terms/` now say quiz completions are kept and the list is on the dashboard (Last updated 6 Nov 2026).
- Tested: 123 dashboard checks and 26 quiz-engine checks in a browser with Supabase mocked; both migrations on a scratch
  Postgres 16 (run twice, RLS own-rows, anon denied, constraints, cascade, ten-student ranking). Security advisors must be
  re-run after the owner applies the SQL (the `leaderboard` WARN is still the accepted one; `quiz_runs` must add none).
- **Left for later (owner's word, 2026-11-06):** the bell (with the owner's own dashboard), the other journeys (only British
  for now), reading progress and exam-wise progress, tile PNGs (nothing to do until the owner has pictures).

## Waiting on a feature branch
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
