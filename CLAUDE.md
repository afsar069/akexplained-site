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
  Engine `assets/instant.js`, questions in `assets/instant/` (see rule 8). First: `anglo-saxon/`.
- `assets/site.css` — everything shared; `eleventy.config.js` syncs the header,
  footer, page-head motif and `nav.js` into every built page

The list of literary periods (20, from Old English to Postmodern) is the same on three pages and
must stay in step: `_data/mcqSpec.json` (+ the cards in `quizzes/mcq/index.html` and the slugs in
`assets/mcq.js`), the cards in `quizzes/daily/index.html`, and `ages` in `assets/home.js`.
Names, years and pictures come from the Daily page. Invent none of them.

The menu lives in two places and must stay in step: `_includes/base.njk` and the
sidebar markup copied into `index.html`.

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
  `{bankId, period, level, rev, questions:[{id, question, options, correct_option_id, explanation}]}`.
  The question text is the owner's and stays exactly as supplied; only `id` and `rev` are added.
  Ids never change or get renumbered (`as-e-01`, `as-h-01`): readers' records and the future dashboard
  hang on them. If a question's meaning changes, raise `rev`.
- The engine shuffles options, except an option that points at the others ("All of the above",
  "Both A and B"). Order of questions: never seen, then missed, then right.
- Progress stays in this browser only (`akd:<bank>:v1`, per question id) so it can move to an account later.
- **Answering must never scroll the page** (focus is set with `preventScroll`). The owner asked for
  this. Keep it in every new quiz screen. A screen change may scroll only if its top is out of view.
- Site text never promises "a new set every day".
- Planned after login: the dashboard shows these results, and the level moves up by how many questions
  were done and how much was read. The owner gives the rule for moving up. Never invent thresholds.

**When the owner sends question files for it**
1. The owner marks them verified: do not re-check the facts. If something stood out while reading,
   say so once and leave it as it is. Do run the structure check (counts, 4 options,
   `correct_option_id` in range, no duplicate questions).
2. **Duplicate check against every live file of the same period** (compare the question text).
   If the files are the same questions, even with the options in another order, STOP. Add nothing, tell
   the owner what matched, and ask for the right files. (This happened once: a "Literature" upload was
   the Age questions again, with the options shuffled.)
3. Genuinely new questions for another period: copy the Anglo-Saxon hub page, add the pair of files,
   open the card on the Daily page, add the page to `sitemap.xml`.
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
