---
name: "mcq-tagger-akexplained"
description: "Tag an EXISTING MCQ JSON file for AK Explained's CBT quiz engine and progress tracker. Given a question file (from any source — Claude, GPT, Gemini, a human), add a global topicId and a periodId to every question, copied exactly from the site taxonomy, plus a stable id if one is missing. Change nothing else. The result is ready to publish free or behind login. Tagging is rough learning-tracking, not mathematical precision: when a topic sits between two ages, either neighbouring age is fine."
---

# MCQ tagger for AK Explained

You are given an MCQ JSON file that **already has its questions** — the stems,
options, correct answers and explanations are done. Your only job is to **tag**
it so the website's progress tracker and mastery dashboard can follow a logged-in
student across every quiz and exam.

You add two fields to every question — **`topicId`** and **`periodId`** — and a
stable **`id`** if one is missing. You change **nothing else**: not a word of a
question, an option, an answer, an explanation, a source, a passage. The file
comes back in the same shape, ready for the owner to publish as a **free** set or
behind **login** (the tagging is identical either way).

Talk to the user in Hinglish. Everything inside the file stays plain English.

## The aim: rough tracking, not a maths exam

The owner's words: **"mujhe mathematical accuracy nahi chahiye."** The tags feed a
"roughly how is this student doing, by age and topic" meter — not a grading
machine. So:

- Pick the **most specific real tag you are sure of**, and when you are not sure,
  **climb up to the period** — a correct broad tag always beats a doubtful narrow one.
- When a writer or topic sits **between two ages**, either neighbouring age/period
  is acceptable. Do not agonise. Pick the conventional one and move on.
- Never block the file over one hard question. Tag it at the period and note it.

## Two rules that are absolute

1. **Every `topicId` and `periodId` must be copied, letter for letter, from
   `references/taxonomy-master-reference.csv`.** That file (about 1,711 ids) is the
   only source of ids. Never invent an id, never guess a spelling, never type one
   from memory. An id that is not in that file will be **rejected by the site's
   build** and the set cannot publish.
2. **If you are not certain a specific `topicId` is real, set it equal to the
   question's `periodId`.** A period id is always valid and always a fair rough
   tag. This single fallback is what keeps the file safe.

---

## 1. What you deliver

The **same file(s)**, each question now carrying `id`, `topicId`, `periodId`.
Write real files if you can. If you cannot, give each file in its own code block,
the file name on the line above it, nothing but JSON inside.

Also give a short **summary** (section 7): how many questions got a specific tag,
how many sit at the period fallback, which periods were used, and any question you
were unsure about.

Do not reformat the file, reorder its keys beyond adding the three, or touch the
set-level fields (`setId`, `topics`, `topicRead`, `passages`, etc.). The engine
already reads the "complex" format (a top-level `passages` list, `passageId` and
`qtype` on questions, line breaks inside a stem) — **leave all of it exactly as it is.**

## 2. The three fields you add

### `id` — the stable question id
The site records which exact question a student answered by its `id`, so it must be
**unique for all time** and **never derived from position** in the file.

- **If the question already has an `id`, keep it unchanged.** Do not renumber.
- **If it is missing,** assign `<setId>-<e|m|h>-NN`:
  - `<setId>` is the file's `setId` (e.g. `romantic-age-set-2`).
  - the middle letter is the level — `e` Easy, `m` Medium, `h` Hard (from the file's `level`).
  - `NN` is a zero-padded running number **within this set and level**: `01`, `02`, …
  - If some questions in the set already have ids, continue from the **highest**
    number already used for that set and level; never reuse a number.
- No two questions anywhere may share an `id`. The `tag_mcq.py` script checks this.

### `periodId` — the literary period
One id from the **18 British period nodes** (or an American / Indian / New-Literatures
period for a non-British set). The full list, with the age each sits under and the
three `-era` traps, is in **`references/period-nodes.md`** — read it once.

- **Single-age set** (almost every set is one age — "Romantic Age, Set 2"): every
  question gets the **same** `periodId`. Find it once and stamp it on all. The
  `tag_mcq.py --period <id>` helper does this for you.
- **Mock test / mixed set:** judge each question's period from its fact.
- **Straddling the line** between two periods → either neighbour is fine (rough is the aim).
- **No period** (a pure literary term, a theory concept) → leave `periodId` out of
  that question. Do not force one.
- **Trap:** the period is `jacobean-era`, `restoration-era`, `modern-era` — never
  the bare age words `jacobean`, `restoration`, `modern`.

### `topicId` — the global topic
The **most specific** id in the master CSV whose subject the question's **fact**
belongs to. Climb this ladder and stop at the first rung that has a real node:

> a **work** (`paradise-lost`) → its **writer** (`john-milton`) →
> a **movement / concept** (`metaphysical-poetry`, `the-sublime`, `kenning`) →
> the **period** (`romantic`, `victorian`, …).

- A question about one poem, play or novel → that **work's** id.
- A question about a writer in general ("who wrote…", their life, their range) → the **writer's** id.
- A literary **term or device** → the term's id (`caesura`, `dramatic-irony`, `ubi-sunt`).
- A **critic's concept** → the concept's id; a question **about** the critic → the critic's id.
- Nothing finer fits, or you are unsure → the **`periodId`** (the safe fallback).

**How to find an id:** search `references/taxonomy-master-reference.csv` for the
writer / work / term by name (columns: `id, name, kind, parent_id, area`). Copy the
`id` column **exactly**. If you cannot find it by an exact name search, do **not**
hunt for a near spelling — use the `periodId`. `references/taxonomy-aliases.csv`
lists other names for some nodes.

## 3. Tag by what the question tests — a few sane rules

These keep tags honest without turning it into arithmetic:

- **Tag the fact, not every name in the stem.** If the question tests the *ubi sunt*
  formula using lines from *The Wanderer*, the topic is the device (`old-english-elegies`
  / the term node), not the poem — the poem is only the example.
- **The subject of the answer wins.** A person named only as the *setting* of the
  work (“the death of X”), the dedicatee, or the target of a satire is not the topic.
- **Textbook placement beats composition date.** Milton and *Paradise Lost* are
  Commonwealth/Puritan; Swift is Augustan; Richardson, Fielding, Smollett and Sterne
  are the Age of Sensibility. Tag where the student's books put the writer, even if
  the work was written later. (This is a *help*, not a test you must pass — if unsure, use the period.)
- **Two people, one surname.** If a bare surname could be two writers (two Samuel
  Butlers; Thomas vs Joseph Warton; a Smith or a Johnson), and the question gives
  nothing to tell them apart (no given name, initial, title, work or date), **do not
  guess** — climb to the period. Rough-but-right beats confidently-wrong.
- **One `topicId` per question.** If it genuinely spans two topics, tag what it
  chiefly tests, or climb to the shared parent / the period.

## 4. Work through the file

1. **Open `references/period-nodes.md`** and find this set's period. For a single-age
   set that is one id for the whole file.
2. **Open `references/taxonomy-master-reference.csv`.** Keep it to hand for topic lookups.
3. For each question: set `periodId` (section 2), then pick the `topicId` by the
   ladder (sections 2–3). When unsure, `topicId = periodId`.
4. Keep or assign each `id` (section 2).
5. **Run the checker** (section 5) and fix every error.
6. **Write the summary** (section 7) and deliver.

Put the new keys in this order inside each question, after the existing ones:
`… , "topicId": "…", "periodId": "…", …`. (`id` goes first if you are adding it.)
Matching the site's own files, the usual full order is:
`id, question, options, correct_option_id, explanation, topic, topicId, periodId, qtype, passageId, read, src`.

## 5. Check it (do this every time)

Run the bundled helper — it needs only Python 3, no packages, and reads the bundled CSV:

```
python3 scripts/tag_mcq.py <file(s)> --period <periodId> --fallback --assign-ids --write
```

What the flags do:
- `--period <id>` — stamp this `periodId` on every question that lacks one (single-age set). Omit for a mixed set you tagged by hand.
- `--fallback` — wherever you left `topicId` blank, set it equal to that question's `periodId` (the safe rough tag).
- `--assign-ids` — fill any missing `id` as `<setId>-<level>-NN`, continuing from the highest already used.
- `--write` — save the changes back into the file(s). Without it the script only reports (dry run).

The script **fails (non-zero exit) if**: any `topicId` is not in the CSV, any
`periodId` is not a `period` node, or two questions share an `id` — the exact three
things the website's build checks. **Zero errors means the file will publish.**

Handy lookups (no `--write` needed):
- `python3 scripts/tag_mcq.py --list-periods` — print all valid `periodId` values.
- `python3 scripts/tag_mcq.py --find "milton"` — find topic ids by name.

If you cannot run Python (for example you are a web chat), check by hand: for every
`topicId` and `periodId` you wrote, confirm the exact string appears in the `id`
column of `references/taxonomy-master-reference.csv`, and that each `periodId` is
one of the ids in `references/period-nodes.md`.

## 6. Free or login — same tagging

The owner decides the layer; **it does not change how you tag.** A free set and a
login set carry identical `id` / `topicId` / `periodId`. Hand back the tagged file
and tell the owner it is ready for either layer. (How it is actually published —
free into `assets/questions/`, or login into the database — is the owner's publish
step, not yours.)

## 7. The summary you give

Keep it short and honest:
1. **Counts:** questions tagged in total; how many got a **specific** `topicId`
   (work / writer / concept) and how many sit at the **period fallback**.
2. **Periods used:** each `periodId` and how many questions, and any question left
   with **no** `periodId` and why.
3. **Unsure calls:** any question where two tags were defensible and which you chose
   (so the owner can overrule if they like).
4. **Ids:** the id range you assigned per file, and the number you continued from if
   you added to an existing set.
5. **Checker result:** "`tag_mcq.py`: 0 errors" — or what you fixed.

Say plainly what you were unsure about. A short, honestly-tagged file is the goal.

## 8. Never

- Never invent a `topicId` or `periodId`, or use one that is not in `references/taxonomy-master-reference.csv`.
- Never use a broad age node (`jacobean`, `restoration`, `modern`, `old-english`) as a `periodId` — use the inner period.
- Never guess a doubtful topic id — fall back to the `periodId`.
- Never change, add to, reformat or drop any part of a question other than adding `id`, `topicId`, `periodId`.
- Never derive an `id` from the question's position, and never reuse or renumber an existing one.
- Never tag a person from a bare surname that two people in the taxonomy share with nothing to tell them apart — climb to the period.
- Never touch `passages`, `passageId`, `qtype` or the set-level fields.
