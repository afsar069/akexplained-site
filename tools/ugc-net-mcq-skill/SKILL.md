---
name: ugc-net-mcq-generator-tagger
description: Writes publish-ready UGC NET English (Subject Code 30) MCQ files for AK Explained (akexplained.com) from the owner's Google Drive folder "UGC NET". One JSON file per level, in the exact format the site loads (set id, ids, age, notes, set name, topicRead), tagged with topicId and periodId from the site taxonomy under the owner's tagging rules, and checked with the bundled strict validator, so nobody has to rename or fix anything afterwards. Use when the user asks for UGC NET MCQs, "batches", topic sets or age sets from the "UGC NET" Drive folder, for example "topic :: Age of Chaucer, 50 easy, 50 medium".
---

# UGC NET MCQ generator and tagger for AK Explained

Turn a request such as **"topic :: Age of Chaucer, Set 2, 50 easy, 50 medium"** into files that the site can
publish **exactly as they are**. The person who publishes them (the owner's Claude Code) must not rename,
reformat, retag or reword anything. Every earlier batch needed that, so follow the format below to the letter
and finish with the validator.

Talk to the user in **Hinglish (Roman script)**. Everything inside the JSON files is plain, simple English.

## 0. Why files were edited before — never again

| What went wrong | What the site needs |
|---|---|
| `setId` `age-of-chaucer-batch-2`, ids `...-batch-2-m-01` | `setId` is `<age>-set-<n>`, ids are `<setId>-<e\|m\|h>-<NN>`. There is no "batch" on the site. |
| `setNumber` 2 for the Medium file of Set 1 | `setNumber` is the **set** number, the same in both level files |
| `setName` "Age of Chaucer - Batch 1 (Easy)" | `setName` is the set's page title, e.g. "Across the whole age", **identical in both level files**; the level is shown separately |
| `age` "middle-english" (the notes article) | `age` is the **hub slug** of the age: `age-of-chaucer`, `romantic-age`, ... (`references/site-ages.md`) |
| no `topicRead` | `topicRead` is required (`{}` when you have no real anchors) |
| `examCode`, `examName`, `difficulty`, `"passages": []` | not read by the site: leave them out |
| a "Medium & Hard Mix" file with `-m-` and `-h-` ids | one file = one level = one id letter |
| explanations like "Per Upkar Guide Book ..." | students read the explanation and the repo is public: give the reason, never the book |
| `topicId` of a famous name in the stem, not of the answer | tag what the question tests (section 5) |

## 1. Read the request

Find: **age or topic**, **set number**, **levels and counts**. Ask **once, in one Hinglish message**, only for what is missing.

- **"Batch" is not a site word.** "2 batch, 50 easy, 50 medium" means **one set with two files**, `<age>-set-<n>-easy.json` and `<age>-set-<n>-medium.json`. Make two different sets only if the owner clearly says so.
- **Set number and title.** Look the age up in `references/site-plan.md`. If the plan has that set, use its title as `setName`, its scope for the topics, and its levels. If the owner names another title, use theirs and tell them the site registry must be updated. If no set number is given, show the plan's titles for that age and ask.
- **Levels.** `easy`, `medium`, `hard` are three separate files. "medium/hard" means a Medium file **and** a Hard file. "mix" is not a level: write a `medium` file and say so.
- **Count** is 50 per level unless told otherwise. A smaller correct set always beats a full doubtful one: if the notes support only 36 good questions, deliver 36 and say which topics are short.
- **Topic sets** (criticism, theory, Indian writing in English, and so on) are fine: `age` is then the nearest hub slug the owner confirms, and `periodId` is left out for questions with no period (section 5).

## 2. Sources (the owner's rule: the Drive notes are the authority)

1. **Find the folder.** Search Drive for a **folder named exactly `UGC NET`** (`mimeType = 'application/vnd.google-apps.folder' and title contains 'UGC NET'`, then pick the one whose title is exactly that). List its contents with `parentId = '<folder id>'`, go into sub-folders, and find notes with `fullText contains '<writer or work>'`. **If there is no folder with that exact name, or more than one, ask the owner for the link. Do not guess.**
2. **Past-paper files are not sources.** Anything named PYQ, Solved Papers, Telegram, Polls, Mock or similar shows the *pattern* of the exam. Some are reconstructions with errors. Never take a question, an answer or a fact from them.
3. **Write each question from a note you have read in this session.** Facts come only from the folder's notes (and what the owner pastes or attaches). No web search, no second verification pass, no memory. Memory may tell you where to look; it is never the source.
4. **Cross-check with our own article** when you can open it (`https://akexplained.com/notes/<article>/`, the path is in `references/site-ages.md`): use its spellings for names, works and terms, and take real heading anchors from it. If a note and our article disagree, **do not choose silently**: leave the fact out and list it in the report.
5. **Risky facts need two agreeing places.** A date or century, a number (lines, books, cantos, editions), any "first / earliest / only / last", who said or coined something, a birth or death year. If two notes (or a note and our article) do not agree, or a note says "about", write "c." in the question or leave it out. If our article gives only a birth year, do not ask a death year.
6. **Contested points** (who wrote it, when, what it "means") only when the stem names the view: "According to Bede...". If truly disputed, skip.
7. **Name the source only in `src`.** Never in a question, an option, an explanation, a `levelNote` or the `setName`.
8. **No source, no question.** If the notes do not cover a fact, do not write the question.

## 3. The file (exact)

Two level files of one set share every set-level field. They differ only in `level`, `levelName`, `levelNote` and `questions`.

```json
{
  "setId": "age-of-chaucer-set-2",
  "rev": 1,
  "age": "age-of-chaucer",
  "ageName": "Age of Chaucer",
  "setNumber": 2,
  "setName": "Chaucer and his works",
  "notes": "/notes/middle-english/",
  "notesTitle": "Middle English — the full notes",
  "topics": {
    "duchess": "The Book of the Duchess",
    "troilus": "Troilus and Criseyde",
    "tales": "The Canterbury Tales",
    "verse": "Verse forms"
  },
  "topicRead": {},
  "level": "medium",
  "levelName": "Medium",
  "levelNote": "Finer detail of Chaucer's poems, their forms and their sources.",
  "questions": [
    {
      "id": "age-of-chaucer-set-2-m-01",
      "question": "What name is given to the five short rhyming lines that close each stanza of Sir Gawain and the Green Knight?",
      "options": ["Rhyme royal", "Bob and wheel", "Heroic couplet", "Fitt"],
      "correct_option_id": 1,
      "explanation": "Each stanza ends with a short line, the bob, and four rhyming lines, the wheel. Together they are called the bob and wheel.",
      "topic": "verse",
      "topicId": "sir-gawain-and-the-green-knight",
      "periodId": "age-of-chaucer",
      "qtype": "direct",
      "src": "user-supplied: <title of the note you read>"
    },
    {
      "id": "age-of-chaucer-set-2-m-02",
      "question": "Consider the following statements regarding Chaucer's Troilus and Criseyde:\nI. It is written in rhyme royal.\nII. Its stanza has seven lines.\nIII. It is written in heroic couplets.\nWhich of the statements given above are correct?",
      "options": ["I and II only", "II and III only", "I and III only", "I, II and III"],
      "correct_option_id": 0,
      "explanation": "Troilus and Criseyde uses the seven-line rhyme royal stanza. Statement III is false because the heroic couplet is the form of The Canterbury Tales.",
      "topic": "troilus",
      "topicId": "troilus-and-criseyde",
      "periodId": "age-of-chaucer",
      "qtype": "combination",
      "src": "user-supplied: <title of the note you read>"
    }
  ]
}
```

| Field | Rule |
|---|---|
| file name | `<age>-set-<n>-<level>.json` (the build looks for exactly this) |
| `setId` | `<age>-set-<n>`, the same in both files |
| `rev` | `1` for a new set. Raise it only when told to replace a published set. |
| `age`, `ageName`, `notes`, `notesTitle` | exactly as in `references/site-ages.md` for the age |
| `setNumber`, `setName` | the set's number and its short plain-English title (from the plan, or the owner's) |
| `topics` | 4 to 6 keys (2 to 24 characters: lower-case letters, digits, hyphens, starting with a letter), each with a label under 30 characters, taken from the scope. Every key has at least 4 questions in each file. |
| `topicRead` | `{}` unless you have **real** heading anchors from our article (then topic key: anchor). Never guess an anchor. Leave `read` out of the questions in that case. |
| `level`, `levelName` | `easy`/`Easy`, `medium`/`Medium`, `hard`/`Hard` |
| `levelNote` | one short sentence on what this level tests, in plain English, naming no source |
| `id` | first field of the question: `<setId>-<e\|m\|h>-<NN>`, section 5 |
| `question`, `options`, `correct_option_id`, `explanation` | section 4. Exactly 4 options; the right one's position is 0 to 3 |
| `topic` | one key from `topics` (groups the questions on the result page) |
| `topicId`, `periodId`, `qtype` | all required, section 5 and `references/question-types.md` |
| `passageId` | only for `qtype` `passage`; the file then has a `passages` list (see question-types). No passages: leave the key out. |
| `src` | **required**: `user-supplied: <title of the book or note you read>`. Not "UGC NET folder", not a chapter dump, not "Per ...". |

**No other fields.** No `examCode`, `examName`, `difficulty`, no comments, no trailing commas, no markdown. UTF-8 with real letters (Ælfric, Ngũgĩ, é).

## 4. Writing the questions

- **Language.** Plain English, as simple as the idea allows. No Hinglish, no Hindi script. Technical words are fine.
- **Mix.** Follow the shares for the level in `references/question-types.md` (easy about 10% complex, medium about 50%, hard about 80%). The owner's own mix, if given, wins. Put the easier questions first in each file.
- **The stem.** One idea, one answer the notes agree on. Direct stems end with `?`. Do not put the answer or a distinctive word of the right option in the stem. No trick wording, no opinions ("the greatest...").
- **The four options.** One right, three clearly wrong according to the notes. Wrong options are **real** names, works or terms of the same kind; never invent one. Similar length and grammar. **Never put a date or a detail on the right option only**: give all four or none. No bare "All of the above" or "None of the above": use real groupings (`I and II only`, `Both Statement I and Statement II are true`).
- **The key.** In 50 questions, positions 0, 1, 2 and 3 each 11 to 14 times, no run of four equal.
- **The explanation.** One to three sentences saying why the answer is right. For complex questions, also say which statement or pairing fails. **Do not start with "Per", "According to" or "As per", and do not name the book, guide or note.**
- **Facts once.** No fact twice in a file, across the levels of a set, or in an earlier set the owner attached.
- **Things that went wrong before. Check each.** An invented word in an option. A detail added from memory (a colour, a number, a date) that no note gave. Two options naming the same person differently. A stem that gives the answer away. Only the right option carrying a date. A scholar's reading written as settled fact. A line or riddle number that changes between editions.

## 5. Tag every question (the owner's rules; they are checked by the build)

Tags feed a student's progress meter, so they must agree with the books the student reads.

**`id`.** `<setId>-<e|m|h>-<NN>`, `NN` two digits, counted within the file from `01`. The letter is the file's level. Never reuse a number, never derive it from position later. If the owner attaches earlier files of the same set, continue from the highest number used.

**`periodId`.** The finer period, copied exactly from `references/period-nodes.md` (the 18 British periods). Use the **inner** period, never the broad age:
`anglo-saxon`, `anglo-norman`, `age-of-chaucer`, `fifteenth-century`, `early-tudor`, `elizabethan`, **`jacobean-era`**, `caroline`, `commonwealth`, **`restoration-era`**, `augustan`, `age-of-sensibility`, `romantic`, `victorian`, `edwardian`, `georgian`, **`modern-era`**, `postmodern`. The bold ones are the traps: `jacobean`, `restoration` and `modern` are the broad ages and are wrong here.
A single-age set uses that age's period(s) (`references/site-ages.md` lists them; `renaissance` and `neoclassical` span several). For a question with no period at all (a pure term, a theory concept), leave `periodId` out and say so in the report.

**Placement (owner's order).** (1) If the question's own text names a period, tag that period. (2) The conventional textbook placement beats the composition date: Milton and Traherne, with Vaughan, go with the `commonwealth`; Swift and Defoe are `augustan`; Richardson, Fielding, Smollett, Sterne and the Graveyard poets are `age-of-sensibility`; Clarendon is `restoration-era`; Donne is `jacobean-era`. (3) The composition date only decides where convention is silent. If a fact sits on the line between two neighbouring periods after this, either neighbour is acceptable (the owner wants rough tracking, not arithmetic).

**`topicId`.** One id copied **letter for letter** from `references/taxonomy-master-reference.csv` (look it up: `python3 scripts/tag_mcq.py --find "hoccleve"`, or search the file by name). Never type one from memory, never guess a spelling. Climb this ladder and stop at the first rung that has a real node:

> a **work** (`troilus-and-criseyde`) → its **writer** (`geoffrey-chaucer`) → a **movement, concept or term** (`rhyme-royal`, `the-lake-poets`) → the **period** (`age-of-chaucer`).

- **Tag what the question tests, and the answer is the subject.** A question whose right answer is a node (a writer, a work, a term) is tagged with that node: "Which disciple of Chaucer mourned him in the *Regiment of Princes*?" → answer Thomas Hoccleve → `thomas-hoccleve`, **not** `geoffrey-chaucer`. A name that is only the setting, the dedicatee, the target of a satire or a detail inside a long option is not the topic.
- **A question about a work** → the work. **About a writer in general** → the writer. **About a term or device** → the term. **About a critic's idea** → the idea; about the critic → the critic.
- **Lists and combinations.** If every statement or pairing is about one work or writer, tag that. If they are about several people with no shared node, a true tie: tag the shared parent (a movement, a group, a shared work) or the period. Do not pick one name arbitrarily.
- **Same-name rule.** If two people in the taxonomy share a surname (two Samuel Butlers, Thomas and Joseph Warton, Esther and Samuel Johnson, Nicholas and Francis Bacon, Robert and Horace Walpole, Stevie and Zadie Smith), never tag from the bare surname. A given name, an initial, a work or a date in the question must tell them apart; if none does, climb.
- **Re-climb before you drop.** When a tag is doubtful, climb to the rung above and look again (work, then writer, then concept, then a neighbouring age). The period is the **last** rung, not an escape hatch. Use `topicId` = `periodId` only when you searched and no node fits, or you cannot confirm an id is real; then list the question in the report under "Taxonomy gaps". If more than a quarter of a file ends at the period, you have not climbed enough.
- One `topicId` per question. If it truly spans two, tag what it chiefly tests.

## 6. Check it (every time)

```
python3 scripts/validate_mcq.py <age>-set-<n>-easy.json <age>-set-<n>-medium.json --strict
```

Add `--others <earlier set files>` when the owner attached earlier sets. The validator reads `references/` by itself. **It must say "No errors."** Fix every error, then read every warning and fix the real ones. It checks the file name, `setId`, `age`, `ageName`, `notes`, `setName`, ids, level letter, `topicRead`, the fields that must not be there, explanations that name a source, every `topicId` and `periodId` against the master taxonomy, the four options, the key spread, the topic counts and the complex share. It also compares the set with the site plan, and warns when the right answer is itself a taxonomy node that is not the `topicId` (the answer-is-the-subject rule): look at each such warning, and change the tag unless the stem is really about something else.

No Python available? Check by hand against section 0 and the field table, and say plainly that the validator was not run.

## 7. Deliver

1. The JSON files (real files if you can; otherwise one code block per file with the file name above it and only JSON inside).
2. `<age>-set-<n>-report.md`, short and exact: set and counts per file; topics with counts per level; `qtype` mix per file; which notes were used and how many questions came from each; **conflicts and doubts** (facts left out because sources disagree, stems that say "According to..."); **taxonomy gaps** (questions tagged at the period, and the node that is missing); **periods** (counts per `periodId`, any question with none, any placement that overrode the date); the id range per file; anything dropped or short.
3. A short Hinglish summary in chat, ending with: "Free ya login? Ye Claude Code ko file dete waqt bol dena." (The layer is the owner's choice at handover; do not decide it.)

Say plainly what you could not do. "All checked" without saying how is not acceptable.

## 8. Never

- Never invent a fact, name, title, date, quotation, `topicId` or `periodId`.
- Never use a past-paper file as a source.
- Never name the book, guide or note in a question, option, explanation, `levelNote` or `setName`.
- Never use `batch` anywhere in `setId`, ids, `setName` or file names; never mix levels in one file.
- Never use a broad age (`jacobean`, `restoration`, `modern`, `middle-english`, ...) as a `periodId`.
- Never drop to the period without climbing the ladder first.
- Never edit the site, the registry or anything outside the question files and the report.
- Never write the site's text in Hinglish.
