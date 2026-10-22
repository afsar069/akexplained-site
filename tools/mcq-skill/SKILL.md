---
name: mcq-generator
description: Writes Easy and Medium multiple-choice question files (JSON) for an AK Explained English-literature age, in the exact format the site loads, so they can be published without editing. Facts come from the site's own notes article first, then only Wikipedia, Encyclopaedia Britannica, the British Library and Project Gutenberg. Use when the user asks for MCQs, a "batch" or a "set" for an age, for example "Old English Set 3, 50 easy and 50 medium".
---

# MCQ generator for AK Explained

Turn a request such as **"Romantic Age, Set 2, 50 easy and 50 medium"** into files the site can publish as they are. The person who publishes them will not research, fix or reformat anything. So every fact must already be checked, and the format must be exact.

The site teaches students for BA, MA, UGC-NET and PGT exams. A wrong fact misleads a student, so **a smaller, correct set is always better than a full, doubtful one.**

---

## 1. What you deliver

Three files for each request (names use the age slug and set number):

| File | What it is |
|---|---|
| `<age>-set-<n>-easy.json` | The Easy questions, final format |
| `<age>-set-<n>-medium.json` | The Medium questions, final format |
| `<age>-set-<n>-report.md` | A short report (section 9) |

Default is **50 questions per level**. Use another number only if the user says so.
Deliver real files if you can. If you cannot, give each file in its own code block, with the file name above it and nothing but JSON inside.

## 2. What you need before you start

Ask the user **once, in one message**, for anything missing:

1. **Age** (see the table in section 4).
2. **Set number and set name / scope**, for example "Set 3, Prose and its writers: Alfred, the Chronicle, Ælfric, Wulfstan, the law codes".
3. Optional: the files of other sets of the same age, so you do not repeat their facts; a quote the user wants stored.

Do not start without the age and the set scope. Do not guess a scope.

## 3. Sources (strict)

Use sources in this order and **no others**:

1. **Our own article** for the age, on akexplained.com (section 4). Always read it first.
2. **Wikipedia** (en.wikipedia.org)
3. **Encyclopaedia Britannica** (britannica.com)
4. **The British Library** (bl.uk), for periods, manuscripts and writers
5. **Project Gutenberg** (gutenberg.org), only to check what a primary text actually says

Never use: blogs, study-guide or summary sites (SparkNotes, Shmoop, CliffsNotes and similar), quiz sites, flashcard sites, forums, social media, AI-written pages, or your own memory.

Rules that cannot be broken:

- **Open every page you cite.** Never write a web address from memory or build one by guessing. If you cannot open web pages in this chat, say so, and ask the user to paste the article text or attach files. Then cite them as `user-supplied: <title>`. **Never write questions from memory.**
- **Our article comes first.** If it covers the fact, use it and cite it.
- **If our article and another source disagree,** do not choose silently. Leave that fact out and list it in the report.
- **If you cannot find the answer in a trusted source, do not keep the question.** Write a different question whose answer you can verify.
- **Contested points** (who wrote a poem, when it was written, what a riddle's answer is, what a poem "means") are allowed only if the stem names the view, for example "According to Bede…" or "The usual solution to Riddle 26 is…". If it is truly disputed, skip it.
- Numbers and dates: use them only where sources agree. Write "c." for approximate dates.

## 4. Our article for each age

Article address: `https://akexplained.com` + the path below. Read the whole article. Each question's `src` and `read` come from it where possible.

| `age` slug | `ageName` | Years | Article path (`notes`) | `notesTitle` |
|---|---|---|---|---|
| `old-english` | Old English | 450–1066 | `/notes/old-english/` | Old English — the full notes |
| `middle-english` | Middle English | 1066–1500 | `/notes/middle-english/` | Middle English — the full notes |
| `renaissance` | Renaissance | 1500–1558 | `/notes/renaissance/` | Renaissance — the full notes |
| `elizabethan` | Elizabethan | 1558–1603 | `/notes/renaissance/` | Renaissance — the full notes |
| `jacobean` | Jacobean | 1603–1625 | `/notes/jacobean-and-caroline-age/` | Jacobean and Caroline — the full notes |
| `caroline` | Caroline | 1625–1649 | `/notes/jacobean-and-caroline-age/` | Jacobean and Caroline — the full notes |
| `restoration` | Restoration | 1660–1700 | `/notes/restoration-age/` | Restoration — the full notes |
| `augustan-age` | Augustan | 1700–1798 | `/notes/augustan-age/` | Augustan Age — the full notes |
| `romantic-age` | Romantic Age | 1798–1837 | `/notes/romantic-age/` | Romantic Age — the full notes |
| `victorian-age` | Victorian Age | 1837–1901 | `/notes/victorian-age/` | Victorian Age — the full notes |
| `modern` | Modern | 1901–1945 | `/notes/modern-age/` | Modern — the full notes |
| `contemporary` | Contemporary | 1945 onwards | `/notes/contemporary-age/` | Contemporary — the full notes |

Some articles cover two ages (Renaissance and Elizabethan share one; Jacobean and Caroline share one). Ask only about the years of the age you were given.

### Anchors (`read`)

Every heading (`##` and `###`) on the article page has an anchor, for example `/notes/old-english/#poetry`. Read the real ids from the page if you can. If you only have the text, make them like this: lower-case; remove accents; every run of characters that is not a–z or 0–9 becomes one hyphen (so æ, þ and ð become hyphens too); trim hyphens; if the same heading appears again, add `-2`, `-3` in page order.

Never use these as `read` or `topicRead`: `the-world-of-this-age`, `literature-in-this-age`, `important-points-to-remember` (and `-2`, `-3`), `quick-revision-50-points`, `quick-quiz-25-questions`, `frequently-asked-questions`, `sources`.

`read` rule: give a question a `read` anchor **only when that section of the article deals with the question's subject**. A section that merely mentions a name does not count. If no section fits, leave `read` out. Never invent an anchor.

## 5. The file format (exact)

Both files of a set have the same set details. They differ only in `level`, `levelName`, `levelNote` and `questions`.

```json
{
  "setId": "old-english-set-2",
  "rev": 1,
  "age": "old-english",
  "ageName": "Old English",
  "setNumber": 2,
  "setName": "Poetry and the verse line",
  "notes": "/notes/old-english/",
  "notesTitle": "Old English — the full notes",
  "topics": {
    "verse": "Verse and craft",
    "beowulf": "Beowulf",
    "elegies": "The elegies",
    "religious": "Religious poetry"
  },
  "topicRead": {
    "verse": "poetry",
    "beowulf": "poetry",
    "elegies": "poetry",
    "religious": "poetry"
  },
  "level": "easy",
  "levelName": "Easy",
  "levelNote": "The main facts: the verse line, Beowulf, the elegies, the religious poems and the riddles.",
  "questions": [
    {
      "question": "How many strongly stressed syllables, or lifts, appear in each half-line of Old English verse?",
      "options": ["Four", "Three", "One", "Two"],
      "correct_option_id": 3,
      "explanation": "Each half-line has two strongly stressed syllables, so a full line has four.",
      "topic": "verse",
      "read": "poetry",
      "src": "https://akexplained.com/notes/old-english/#poetry"
    },
    {
      "question": "Which Old English poem is spoken by a cross that describes its own part in the Crucifixion?",
      "options": ["The Dream of the Rood", "The Seafarer", "Elene", "Deor"],
      "correct_option_id": 0,
      "explanation": "In The Dream of the Rood a dreamer sees a cross, and the cross itself begins to speak.",
      "topic": "religious",
      "src": "https://en.wikipedia.org/wiki/The_Dream_of_the_Rood"
    }
  ]
}
```

(The real file has all 50 questions in `questions`, and every topic has at least four of them. Two questions are shown here only to show the shape.)

Field rules:

| Field | Rule |
|---|---|
| `setId` | `<age>-set-<number>`, for example `romantic-age-set-2` |
| `rev` | `1` for a new set. Raise it only when told to replace a set that is already published. |
| `age`, `ageName`, `notes`, `notesTitle` | Exactly as in the table in section 4 |
| `setNumber`, `setName` | As the user gave them. The set name is short, in plain English. |
| `topics` | 4 to 6 topics. Key: 2–24 characters, lower-case letters, digits or hyphens, starting with a letter. Value: a short label, under 30 characters. |
| `topicRead` | Every topic key, with an anchor of our article that covers that topic (section 4) |
| `level` / `levelName` | `easy` / `Easy` or `medium` / `Medium` (`hard` / `Hard` only if the user asks for it) |
| `levelNote` | One short sentence on what this level tests, true for this file |
| `question` | One question, ends with `?` |
| `options` | Exactly 4 |
| `correct_option_id` | The position of the right option: 0, 1, 2 or 3 |
| `explanation` | One or two sentences that say why the answer is right |
| `topic` | Exactly one key from `topics` |
| `read` | Optional anchor, rule in section 4 |
| `src` | **Required.** The one page that proves the answer: a full web address you opened, with `#anchor` for our own article, or `user-supplied: <title>` |
| `quote` | Leave it out unless the user gives you one |

No other fields. No comments. No trailing commas. No markdown inside the file. UTF-8, with real letters such as æ, þ, ð and é, never "ae" or "oe" stand-ins.

## 6. How to write the questions

**Language.** Simple, plain English. Short sentences. No Hinglish, no slang, no Hindi script. If a technical word is needed, use it, and make the stem make sense without a dictionary.

**Easy** tests the main facts: who, what, when, where; names, dates, definitions, titles, the main works of each writer. **Medium** tests finer detail: episodes, causes and effects, sources and influences, how two works or writers compare, manuscript and publication detail, and a named critic's argument. Inside each file, put the easier questions first.

**The question.**
- One idea, one answer that sources agree on.
- Under about 35 words.
- Do not hide the answer in the question. Do not repeat a distinctive word of the right option in the stem. Do not let "a" or "an" point to the answer.
- No "which is NOT…", no trick wording, no questions that need a picture, no opinions ("the greatest…").

**The four options.**
- One is right. Three are definitely wrong according to the sources.
- Wrong options must be **real** names, terms or works of the same kind (other writers of the same age, other poems of the same type). **Never invent a name, word or title** to fill a slot.
- Similar length and grammar. The right option must not be the longest in most questions.
- No "all of the above", "none of the above" or "both A and B".
- No two options that mean the same thing, and no wrong option that is secretly right (for example, two options that name the same person in different words).
- Spread the right answer evenly: about the same number of 0, 1, 2 and 3 in each file (for 50 questions, 11 to 14 each). No runs of the same position, no pattern.

**The explanation.** Say why the answer is right, in one or two sentences, from the source you cite. Do not add a fact you did not check. Do not write "as we saw".

**Facts used once.** Do not ask the same fact twice, in the same file, between Easy and Medium, or in any other set the user gave you. Two questions about the same work are fine if they test different facts.

**Topics.**
- 4 to 6 per set, taken from the scope the user gave.
- Every question has exactly one topic.
- Every topic has at least 4 questions in each file. The result page judges a student by topic, and it needs enough questions to do that.
- Keep the spread natural, not equal to the number: a larger topic may have 12.

**Spelling.** Use the spelling of our article for names, works and terms, and keep it the same in both files. Check capital letters and apostrophes (Beowulf's, not Beowulf). Give dates the way the sources do.

**Things that went wrong before. Check for them.**
- An option that was an invented word. Only use terms you saw in a trusted source.
- A detail added from memory (a material, a colour, a number) that no source gave.
- Two options that were the same person under different names.
- A stem that gave the answer away.
- Riddle numbers, line numbers or similar that change between editions. Name the edition in the stem, or skip.
- A "fact" that is really one scholar's interpretation, written as if it were settled.

## 7. Working method

1. **Ask** for anything missing (section 2).
2. **Read our article** for the age. Write down its headings with their anchors, and the facts it gives for this set's scope.
3. **Plan.** Decide the topics and how many questions each gets, for each level. Show the plan to the user in a short table. Continue unless they correct it.
4. **Draft in batches of about 10 questions.** For each question, open the source first, then write the question from what it says. Keep the source address with the question as you go.
5. **Check each answer against its source,** once more, after drafting. Where our article and a second source do not agree, drop the fact.
6. **Self-check** (section 8).
7. **Write the report** (section 9) and deliver the three files.

## 8. Self-check before delivering

If you can run Python, save `validate_mcq.py` from this skill next to the files and run:

```
python3 validate_mcq.py <age>-set-<n>-easy.json <age>-set-<n>-medium.json --notes article.md
```

(`article.md` is the article's text saved as Markdown, with its `##` and `###` headings.) Fix every error. Read every warning and fix the real ones.

If you cannot run it, check by hand:

- [ ] Exactly 50 questions in each file, or the number the user asked for
- [ ] The set details are identical in both files
- [ ] Every question has `question`, `options` (4), `correct_option_id`, `explanation`, `topic`, `src`
- [ ] Every `src` is a page you opened, on an allowed site
- [ ] Every `read` and every `topicRead` anchor exists on the article page
- [ ] Right answers are spread over 0, 1, 2, 3
- [ ] Each topic has at least 4 questions in each file
- [ ] No fact is asked twice
- [ ] No invented names or words in the wrong options
- [ ] Plain English, correct apostrophes and spellings

## 9. The report (`<age>-set-<n>-report.md`)

Keep it short and exact:

1. **Set**: age, set number, set name, number of questions in each file.
2. **Topics**: each topic's key and label, with the number of questions at each level.
3. **Sources used**: how many questions come from our article, Wikipedia, Britannica, British Library, Gutenberg and `user-supplied`.
4. **Not in our article**: a list of the questions (file and number) whose fact our article does not contain, with a few words on the missing fact. This tells the site owner what to add to the notes.
5. **Dropped or replaced**: questions you could not back up and what you did instead.
6. **Conflicts and doubts**: any fact where sources disagreed, or where you used a stem like "According to…", and why.

Say plainly what you could not do. A report that says "all checked" without saying how is not acceptable.

## 10. Never

- Never make up a fact, a name, a title, a quotation, a date or a web address.
- Never cite a page you did not open.
- Never use a site outside the list in section 3.
- Never change the format, add fields, or leave out `src`.
- Never pad a set to reach 50 with doubtful questions. Deliver fewer, say so in the report, and say which topics are short.
- Never write the site's text in Hinglish.

## 11. If you are asked for something else

If the user asks for Hard questions, other formats, other ages' set names, or a change to the site, say that this skill covers only Easy and Medium question files in this format, and ask them to take that part to the site owner.
