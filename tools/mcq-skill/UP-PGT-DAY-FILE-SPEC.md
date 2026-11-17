# How to make a UP PGT English MCQ "day" file

Give this page to whichever tool (a Claude skill, another AI, or a person) writes the question files
for **UP PGT English — MCQ Day** (`/exams/pgt/up-pgt/mcqs/`). A file made exactly to this page uploads
at `/admin/upload-paper/` with no corrections and no extra steps.

Written 2026-11-17, after Day 13. Keep it in step with CLAUDE.md rules 12 and 15 when either changes.

---

## 1. What you deliver

**One JSON file for one day.** Name it `up-pgt-mcq-day-<N>-medium.json` (for example
`up-pgt-mcq-day-14-medium.json`).

The file is one object:

```json
{
  "setId": "up-pgt-mcq-day-14",
  "setNumber": 14,
  "setName": "Shakespeare: Histories",
  "level": "medium",
  "rev": 1,
  "questions": [ ... ]
}
```

A plain list of questions (`[ { ... }, { ... } ]`) is also accepted; the upload page then asks for the
level. The object above is better, because nothing is left to be chosen by hand.

`setId`, `setNumber` and the title are rewritten by the upload page from the owner's own choice there,
so a small mistake in them is harmless — they are in the file only to make it readable.

---

## 2. Every question

```json
{
  "id": "up-pgt-mcq-day-14-m-01",
  "question": "Which play opens with the line 'Now is the winter of our discontent'?",
  "options": ["Richard II", "Richard III", "Henry IV, Part 1", "King John"],
  "correct_option_id": 1,
  "explanation": "Richard of Gloucester speaks it in the first scene of Richard III.",
  "topicId": "richard-iii",
  "periodId": "elizabethan"
}
```

Required, every time:

| Field | Rule |
|---|---|
| `id` | `up-pgt-mcq-day-<N>-m-<NN>`, `NN` from `01`. **Unique across every paper on the site**, and **frozen**: never renumber, never reuse. If a question is dropped, retire its number and give the next question a new one. |
| `question` | One clear question. Plain English. No Hinglish. |
| `options` | Exactly **four**, all different, none empty. Keep them short and of similar length. |
| `correct_option_id` | A **number**: 0, 1, 2 or 3 — the position of the right option. |
| `explanation` | One or two plain sentences saying why that option is right. Never leave it out. |
| `topicId` | A real id from the topic list (section 4). |
| `periodId` | A real period id from the table in section 4. |

Optional, and kept if you send them: `topic` (a short label of your own), `qtype`, `src` (the page that
proves the fact — useful for checking later; the site does not show it).

Do **not** add any other field, and do not nest the questions inside anything else.

---

## 3. Level, rev, and how many

- **`level`: `"medium"`** for a mixed-difficulty day. The day pages read the `medium` level only, so a
  file saved as `easy` or `hard` would be invisible to students. Use `easy` or `hard` only if the owner
  asks for a whole file at that level.
- **`rev`: `1`** for a new day. Sending a corrected file for a day that is already open? Raise it to
  `2`, then `3`, and so on — the upload page refuses a rev that goes backwards.
- **How many questions:** the owner decides. Every day so far has **50**.

---

## 4. The two tags

Both tags must be ids that already exist in the site's topic list. The list is one file:

`supabase/data/taxonomy-master-reference.csv` — columns `id,name,kind,parent_id,area`
(raw copy: https://raw.githubusercontent.com/afsar069/akexplained-site/main/supabase/data/taxonomy-master-reference.csv)

**An id that is not in that file is refused**, and the upload page names it, so check every tag against
the file before sending.

### `topicId` — what the question is about
The **most specific** real id the question clearly targets: a work, a writer, or a named concept.
If nothing fits, use the same id as the `periodId`. Rules the owner has settled:

1. If the question's own text names a period, tag to that period.
2. The usual textbook placement of a writer or work beats its date of writing.
3. The date decides only where convention is silent.
4. The right answer is the subject: a person named only as the setting, a relative, or the target of
   the answer is not the subject.

### `periodId` — which age it belongs to
One of these **18** ids, and no other (the ten wider "age" nodes — `old-english`, `renaissance`,
`jacobean`, `restoration`, `modern` and so on — are parents and must not be used):

| id | Age |
|---|---|
| `anglo-saxon` | Anglo-Saxon Period (450–1066) |
| `anglo-norman` | Anglo-Norman Period (1066–1340) |
| `age-of-chaucer` | Age of Chaucer (1340–1400) |
| `fifteenth-century` | Fifteenth Century (1400–1500) |
| `early-tudor` | Early Tudor Period (1500–1558) |
| `elizabethan` | Elizabethan Age (1558–1603) |
| `jacobean-era` | Jacobean Age (1603–1625) |
| `caroline` | Caroline Age (1625–1649) |
| `commonwealth` | Commonwealth Period (1649–1660) |
| `restoration-era` | Restoration Age (1660–1700) |
| `augustan` | Augustan Age (1700–1745) |
| `age-of-sensibility` | Age of Sensibility (1745–1785) |
| `romantic` | Romantic Period (1785–1832) |
| `victorian` | Victorian Period (1832–1901) |
| `edwardian` | Edwardian Period (1901–1914) |
| `georgian` | Georgian Period (1910–1936) |
| `modern-era` | Modern Period (1914–1945) |
| `postmodern` | Postmodern Period (1945–) |

### How Day 13 was tagged (a worked example)
A day on Shakespeare's tragedies:

- Questions on *Hamlet* (about 1600–01) → `elizabethan`.
- Questions on *Othello* (1604), *King Lear* (1605), *Macbeth* (1606) → `jacobean-era`.
- A question on T. S. Eliot's 1919 essay about *Hamlet* → `modern-era` (the essay is the subject).
- A question on Coleridge's phrase "motiveless malignity" → `romantic`.
- A question on Sidney's *Arcadia* as the source of the Gloucester subplot → `elizabethan` (*Arcadia*
  is the answer, and it is Elizabethan).
- A question on Nahum Tate's 1681 version of *King Lear* → `restoration-era` (the question itself
  says "Restoration playwright").

A question about a source, an adaptation or a critic takes **that** work's age, not the play's.

---

## 5. Facts

- **Nothing is invented.** Every fact must be checkable in a standard reference (Britannica, the Oxford
  Companion to English Literature, a standard history of English literature). If a date or an
  attribution is disputed, leave the question out.
- Exactly **one** option may be defensible as right. The other three must be clearly wrong — not merely
  less good.
- Do not repeat a question that an earlier day already uses, even with the options in another order.
  The database refuses a question id that another paper holds, and a repeated question wastes a day.
- Keep the owner's wording where the owner supplies text.

---

## 6. Check before you send

- [ ] The file is readable JSON, and the questions sit under `questions`.
- [ ] `level` is `medium`; `rev` is right (1 for a new day, higher for a correction).
- [ ] Every question has: id, question, 4 different options, `correct_option_id` 0–3, explanation,
      `topicId`, `periodId`.
- [ ] No id is used twice in the file, and no id repeats one from an earlier day.
- [ ] Every `topicId` and `periodId` appears in `taxonomy-master-reference.csv`, and every `periodId`
      is one of the 18 in the table above.
- [ ] No question repeats an earlier day's question.

Then the owner uploads it: `/admin/upload-paper/` → **UP PGT English — MCQ Day** → the day number →
the day's topic as the Title → **Live**. The page checks the file again, saves it, and the day opens on
the site at once.
