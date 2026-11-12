# AGENTS.md — start here if you are an AI agent (Claude, Codex or another)

**`CLAUDE.md` is the full rulebook. Read it before you change anything.** This page is the short version of the
rules that must never be broken, so that any agent, or a new session, can carry on the work.
Where things stand today: `docs/accounts-status.md`. What each database table is: `docs/db-notes.md`.

## What this is
AK Explained (akexplained.com): a static site built with Eleventy and published by Cloudflare Pages from the
`main` branch, plus a Supabase project (accounts, quiz answers, login-only MCQ sets). The owner, Prof. Afsar Khan,
is **not a programmer**: explain in plain words, and when something must be done by hand give click-by-click
steps, one at a time. Chat may be in Hinglish. **Everything a visitor reads on the site is simple English.**

## Never break these
1. **The GitHub repo is public.** Never commit the questions of a login (or paid) MCQ set, nor any SQL that
   contains them. A file committed here is public for good, even if deleted later.
2. **Free or login? Ask.** When question files arrive, the owner says which. If not said, ask before writing
   anything into the repo. Never assume free.
3. **Never put the Supabase secret key** in the repo, a chat, or a file, and never ask the owner for it. The
   browser uses the public (publishable) key only; row level security protects the data.
4. **Nothing is invented**: no dates, titles, counts, prices, limits or hub texts that were not supplied or
   checked. Leave a placeholder and ask. Verify a fact on the provider's own page.
5. **Merging to `main` publishes the site.** Work on the feature branch; merge only when the owner asks
   (how: `CLAUDE.md` rule 5). `npx eleventy` must build clean and no internal link may 404 (rule 4).
6. **Never gate content that is already free** (articles, the Daily quiz, the free MCQ sets).
7. Anything destructive in the database (drop, delete, truncate) needs the owner's word first.

## The two jobs you will meet most
- **Publish an MCQ set**: free = `CLAUDE.md` rule 7 (files in `assets/questions/`, registry row in
  `_data/mcqSpec.json`; check new files with `python3 tools/mcq-skill/validate_mcq.py <files> --strict`; files from the UGC NET skill
  must already pass it). Login = rule 15 (questions go into the Supabase table `mcq_papers` with
  `tools/mcq-skill/make_gated_sql.py`, read back with the fingerprint, files never in the repo).
- **Change the database**: rules 9 and 14. Test the SQL on a scratch local Postgres first, then apply it,
  read it back, run the security advisors, keep the migration file in `supabase/migrations/`. If you have no
  Supabase connection, write the SQL and give the owner the steps to paste it in Supabase → SQL Editor.

## How to check your work
- `npm install` once, then `npx eleventy` (the build also checks every question's topic and period tags).
- Browser tests: Playwright against `_site`, with Supabase mocked (`CLAUDE.md` rule 14).
- A cloud session cannot open akexplained.com: give the owner the live links to look at.

## Where the rules live
Question ids and tags: rules 11 and 12. Accounts, login, dashboard: rule 10. Access layers (free, login, paid):
rule 15. What is not built yet (paid layer, R2 for big PDFs): rule 13. Daily quiz: rule 8.
