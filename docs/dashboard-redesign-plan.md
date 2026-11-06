# Dashboard redesign — plan for the next session

A handoff note so the next session can design the richer dashboard without re-reading the chat.
The owner (Prof. Afsar Khan) shared a mockup (a 6-tile KPI row, a "Learning Journey" age strip,
Today's Plan, a study streak, progress bars, a performance-trend chart, Quick Tools, Recent Activity)
and asked **how much of it we can actually build**. This file records the answer and the decisions.

_Written 2026-11-06. Pairs with `docs/accounts-status.md` (live state) — read that first._

## The rule that governs all of it
**Nothing is invented** (CLAUDE.md rule 2; the About page promises it). So any tile whose data we do
not really have is shown as **"Coming soon"** or replaced with an **honest substitute** — never a made-up
number. The dashboard is **read-only** and attempts-only until a real computation exists (rule 10).

## What is ALREADY live (after this branch merged — see accounts-status.md)
Welcome hero (name), Your overall progress (attempted / correct / accuracy), **Your level in English
literature** (British = 20 Daily ages, each 5%; age cleared at 60% coverage + 60% accuracy; ladder
Beginner→Master; per-age tiles), Your rank + Top students (leaderboard RPC, live), Today's activity,
Daily streak (+ week grid), By period, By topics, Your strengths, Areas to improve, Your paths.
Login → after choosing a journey, lands on `/dashboard/`.

## Mockup → what we can achieve, in three buckets

### 1. Real data NOW (just design/wire it)
- Welcome + name + line; a rotating **quote** (owner supplies real quotes + real attribution).
- **Enrolled Courses** = count of `user_exams` (paths).
- **Average Score** = accuracy; the **"+8%" trend** = compare this week's accuracy vs last (bucket
  `attempts` by week — real, computable now).
- **Current Streak** + **weekly ✓ grid** — already computed (`computeStreak`).
- **Overall Progress** = the British 20-age % (already computed).
- **Your Learning Journey** age strip = our per-age **cleared** status + portraits
  (`/assets/topics/<age>.webp` exist) + "5 / 20 Ages". Already have the data.
- **Progress by Period / Area** bars — have it.
- **Next Goal** = next milestone from the level model.
- **Performance Trend** line chart = weekly accuracy buckets from `attempts` (real; needs a small chart).
- **Recent Activity** — **for quizzes only** (`attempts.answered_at` → "2h ago", with question/period).
- **Quick Tools** row — link only the tools that exist: **MCQ Practice**, **Timeline**.

### 2. Buildable, but needs NEW tracking first (data fills from then on, not retroactive)
- **Study Time (e.g. 12h 30m)** — NOT tracked. The quiz engines (`instant.js`, `cbt.js`) would need to
  record time into the DB (new column/table). Only truthful from the day it ships.
- **Quizzes Taken (e.g. 42)** — **built 2026-11-06** as `public.quiz_runs` (one row per finished quiz; see
  `supabase/migrations/20261106120000_add_quiz_runs.sql`). The tile counts real rows and says "Questions
  answered" until the first row exists. Not retroactive.
- **Today's Plan** (tasks + checkboxes + Add Task) — a new **planner system** (a `tasks` table + UI).
- **Recent Activity** entries "Studied notes" / "Watched lecture" — need reading tracking
  (`reading_progress` table exists but is **empty**) and video-watch tracking (none).

### 3. Needs a whole new FEATURE (does not exist — a link would 404)
- **Flashcards, Mind Maps, Compare & Contrast, Quote Bank** — not built.
- **Notification bell, Calendar** — no system behind them.

## Hard data facts (so the next session doesn't re-check)
- `attempts` columns used: `id, is_correct, answered_at, period_id, topic_id, question_id` (+ `source`,
  `user_id`). **No time field.** ~130 rows, 2 users (live) as of 2026-11-04.
- `reading_progress` = **0 rows**. No video-watch table. So no Study Time, no "notes read", no "watched".
- `public.leaderboard()` RPC is **live** (rank + top students work; 100-different-questions floor).
- Build generates **`assets/syllabus-british.json`** (`tools/build-syllabus.js`, from the 20 Daily banks,
  each 100 Qs; grouped by question-id prefix `as-`,`rn-`,`nc-`…). Only **British literature** is measured;
  the other 8 journeys (American, Indian, Linguistics, Theory, Criticism, Culture, World) + the **NET
  grand-total** wait for their syllabus + content — show as "Coming soon".
- Dashboard still loads all of a user's `attempts` into the browser (v1 limit; a grouped DB view/RPC is
  the planned fix — see accounts-status.md).

## Rough verdict given to the owner
Visual design: ~100% achievable (it fits the site's style). Truthful-data version **now: ~65–70%**; the
rest needs new tracking (time, tasks, reading, video) or new features (flashcards, quote bank, …), and a
few tiles must **not** be faked.

## Open decisions for next session (owner to steer)
1. Build the achievable mockup-style layout now (real tiles filled, the rest "Coming soon")?
2. Start the **tracking** that unlocks tiles — priority order? (suggest: study-time → quizzes-taken →
   reading/video → tasks/planner.)
3. Which **new tools** to build first (Flashcards, Quote Bank, Mind Maps, Compare & Contrast)?
4. **No-demotion** high-water mark for the level (small DB column) — when content grows (also in
   accounts-status.md).
5. Quotes + age portraits: owner supplies real quotes/attribution; confirm which portrait per age.
