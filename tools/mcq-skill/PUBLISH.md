# Publish one MCQ set — short runbook (for any AI with the Supabase connector)

The full rules are in `CLAUDE.md` (rules 7, 12, 15). This is the short, repeatable checklist so a
set goes from "owner hands a file" to "live" with the least effort. Follow it top to bottom.

## 0. What the owner must say when handing the files
Two things, one line each. If either is missing, ask before touching the repo.
- **Layer:** `free` or `login`. ("login me lagao" = login.) A **free** set's file is public for good
  (the repo is public); a **login** set's questions go into the database only, never into the repo.
- **Where:** which age and set number (e.g. "Old English, set 5").
- **Optional but cheap:** "verified". If the owner says the facts are verified, **do not re-check facts**
  (no web searches). Only run the structure checks below. This is the single biggest cost saver.

The file format is already handled end to end: a top-level `passages` list with `passageId` on the
questions that use it, line breaks inside a question (List I / List II, A. B. C. D.), and the fields
`id` / `topicId` / `periodId` / `qtype`. The engine (`assets/cbt.js`, `assets/site.css`) renders all of
it. You do **not** need to change the engine for a set in this format.

## 1. Structure check (always)
```
python3 tools/mcq-skill/validate_mcq.py <file(s)> --notes notes/<article>/index.md
```
- Add `--legacy` only for an old set with no `src` field (set 1 and 2 style).
- Add `--strict` for a **new** file (and always for files from the UGC NET skill, `tools/ugc-net-mcq-skill/`): it also
  checks the file name, `setId`, `age`, `ageName`, `notes`, `setName`, ids and level letter, the tags against the master
  taxonomy, the fields that must not be there, and explanations that name their source. The skill's files must pass it with
  no errors, so they need no renaming. Without `--strict` the same faults are only warnings, so old live files stay valid.
- Add `--others <other sets' files>` to catch repeated facts.
- **Errors must be zero.** Warnings are advice (a long stem, a stem that shares a word with its answer);
  fix only what is truly wrong. If the owner said "verified", do not fact-check beyond this.

## 2. Tags (login sets, and any set the build gate can't see)
Every question needs `topicId` (a real id in `supabase/data/taxonomy-master-reference.csv`) and
`periodId` (a `kind = period` node). For a free set the build gate (`tools/check-topics.js`) checks this.
For a **login** set the build cannot see the file, so tag first with `tools/tagging/` if the file is not
already tagged (`make_gated_sql.py` will warn if a tag is missing).

## 3a. FREE set
1. Spot-check ~10 questions against their `src` (skip if "verified").
2. Copy the file(s) into `assets/questions/`.
3. In `_data/mcqSpec.json`, set the set `"live": true` and give it `lede`, `titleCase` (the owner's words;
   if none, use only the file's own `setName` / topic names — invent nothing). `rev` is read from the file.
4. In `assets/mcq.js`, move the age's slug from `SOON_HUBS` to `LIVE_AGES` if this is its first live set.
5. `npx eleventy` (clean, no 404), browser-test, push the branch. `main` only when the owner asks.
6. The UGC NET skill keeps a copy of the set plan (which sets are live). After a set goes live, or the taxonomy or the registry
   changes, run `python3 tools/build_skill_zip.py` and commit the new `tools/dist/*.zip` (`--check` says when it is out of date).

## 3b. LOGIN set (questions go to the database, never to the repo)

**The owner can now do this part themselves at `/admin/upload-paper/`** (built 2026-11-12). The page takes
the file, checks it, and writes the rows with the owner's own login — no SQL, no pasting. Steps 2 to 4 below
are the old route, still needed when the owner wants someone else to load it, or when a paper must be loaded
from a session rather than a browser. Either way the registry step (1) and the page work (5 to 7) are the same.

**The upload page route**
1. Registry as in step 1 below (an MCQ set); a mock test needs no registry row.
2. Tell the owner: open `/admin/upload-paper/`, choose the file(s), check the report, set Title, Category
   and Status, press Upload. The page shows a short code for each level; the code matching proves the
   database holds exactly their file.
3. The paper's metadata lands in `public.paper_catalog` by itself. To put it on the site, read the live
   rows and run `tools/sync_catalog.py` (see that file's header), then `npx @11ty/eleventy` and push.
4. Only the owner's own login is on the allow list (`public.paper_admins`). To add another, insert one
   row by SQL — never from a browser.

**The old SQL route**
1. Registry `_data/mcqSpec.json`: `"live": true`, `"access": "login"`, `"rev": <n>`, `count`, `levels`,
   `titleCase`, `lede` (owner's words; else the file's own words).
2. Make the load SQL (this does NOT touch the database; it checks the file against the registry, the master
   tags and the public files, then writes SQL + a read-back check + prints an md5 per level):
   ```
   python3 tools/mcq-skill/make_gated_sql.py --access login <file(s)> --out <scratchpad>/load.sql --chunk 25
   ```
   Keep the file and the SQL in a scratchpad, **never in the repo**.
3. Run the SQL parts **in order** through the connector (`execute_sql`). Each part is idempotent.
4. Read back with `<scratchpad>/load.check.sql`: one row per level, `count` matches, `rev` matches, and
   **the md5 equals what the tool printed** (it covers id, question, options, answer, reason, tags — one
   changed letter shows). The tool's md5 does **not** cover `passages`, `qtype`, `passageId` or the header;
   if the file has passages, read those back too (see `docs/accounts-status.md` → Set 5 for the exact SQL).
5. Run the Supabase **security advisors**; they should be unchanged (a data load changes no schema).
6. `git status` must show **no question file and no load SQL**. `npx eleventy`, browser-test (guest sees
   "Log in to take this test" and no question text; a logged-in student gets the test), push the branch.
7. Tell the owner to keep their own copy of the file (the table is the live copy; the scratchpad vanishes).

To change a live login set: run `make_gated_sql.py` again with the corrected file and a **raised `rev`**
(it upserts), then read back as in step 4.

## Keep it cheap
- "verified" from the owner → no fact-checking, just the structure check and the load.
- The engine already handles the complex format → no per-set engine work.
- Don't paste the big SQL into chat to "look" at it; run it, then read it back with the check SQL.
- A same-format set needs no new browser test code; reuse the one in `docs/accounts-status.md` (Set 5).
