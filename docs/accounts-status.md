# Accounts / database / auth — where things stand

A dated snapshot so a new session (or a different AI) can pick up without re-reading the chat history.
The **rules** live in `CLAUDE.md` (rules 9–14); this file is only *current state + what is pending*.
Keep it updated when the state changes.

_Last updated: 2026-11-03._

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
  emails ("Five outside services"; "no newsletter" line untouched; "Last updated" 3 November 2026).
- **Account emails are live** (owner, 2026-11-03): custom SMTP via **Resend** is on, **Confirm email is ON**,
  and the owner tested the full reset flow end to end (reset mail arrives, a new password can be set).
  The reset / confirm code (`60cac7e`, `assets/login.js`, `auth.js`) is on `main`.
- **www safety net** in `auth.js` sends `www.` visitors to the bare domain.

## Waiting on a feature branch
- Nothing. (`claude/zen-hamilton-41vw9q` carried only the privacy change and is merged to `main`.)

## Owner to do in the dashboards (not code)
1. **Enable leaked-password protection** — Supabase → Auth → Password security. (Only remaining security WARN.)
2. ~~SMTP + Confirm email~~ — done. Still optional: raise the 30/hour email rate limit if sign-ups need it.
3. **Cloudflare www→apex 301** redirect rule (the JS net covers it meanwhile).

## Decisions owed by the owner
- **Node-gaps batch 3** — the 21 quoted titles that recur in ≥2 questions, listed in
  `tools/tagging/reports/node-gaps.md`, awaiting a one-pass approval. The ~122 one-off quoted titles are
  deferred to a later "titles pass".

## Backlog (labels the owner uses)
- **C** — migrate a guest's `localStorage` attempts into the DB on login.
- **I** — dashboard v1 (show a user their attempts).
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
