# Accounts / database / auth — where things stand

A dated snapshot so a new session (or a different AI) can pick up without re-reading the chat history.
The **rules** live in `CLAUDE.md` (rules 9–14); this file is only *current state + what is pending*.
Keep it updated when the state changes.

_Last updated: 2026-11-04._

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
the privacy boundary: at most a display name, a question count and an accuracy, top ten only. EXECUTE
revoked from `public`/`anon`, granted to `authenticated`. **Run the security advisors after applying it.**

`/privacy/` changed in the same commit (rule 10): a new section says reaching the top ten makes the name
on the account and the accuracy visible to other logged-in students, nothing else is, and how to stay off.

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
