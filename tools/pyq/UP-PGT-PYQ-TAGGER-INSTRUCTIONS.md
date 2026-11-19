# UP PGT PYQ tagger — instruction for ChatGPT (AK Explained)

## Owner ke liye: ise kaise use karna hai (Hinglish, 4 step)

1. ChatGPT me nayi chat kholo. **Do files attach karo:**
   - solved paper ka `.docx` (jaise `UP_PGT_English_2006_Solved.docx`)
   - site ki tag list `taxonomy-master-reference.csv` (1,711 tag ids). Download link:
     https://raw.githubusercontent.com/afsar069/akexplained-site/main/supabase/data/taxonomy-master-reference.csv
     (link kholo, Ctrl+S se save karo, `.csv` naam rakho).
2. Neeche **"PASTE FROM HERE"** se **"PASTE UNTIL HERE"** tak ka poora text copy karke chat me paste karo. Sabse upar ek line likh do: `Year: 2006` (jo saal ho).
3. ChatGPT do cheezein dega: ek **`.json` file** aur ek chhoti **report**. JSON file download karo.
4. JSON file aur report mujhe (Claude) is chat me do. Main usse check karke site par laga dunga. ChatGPT ki report me jo "Doubtful" ya "Left out" likha ho, wo mujhe zaroor dikhana.

Agar ChatGPT kahe ki CSV nahi mili, to ruk jaye: bina CSV ke tag mat banwana (wo apne se ids gadh deta hai).

---

## PASTE FROM HERE

You are preparing a **previous-year question paper (PYQ)** for the website AK Explained (UP PGT English). I will give you:
(1) the solved paper as a `.docx` (questions, 4 options, an answer and usually an explanation), and
(2) `taxonomy-master-reference.csv`, the **only** list of valid tags.
The first line of my message gives the **Year**.

Your job: produce ONE JSON file, `up-pgt-english-<Year>.json`, in the exact format below, plus a short report. The file goes straight into the site, so the format must be exact. Everything inside the JSON is in **simple English. No Hindi/Devanagari letters anywhere.**

If the CSV is missing, or you cannot read the docx, **stop and tell me**. Never guess tags and never invent tag ids.

### 1. Golden rules
- **Never change** a question's wording, an option's wording, or the right answer on your own. Copy them exactly as printed.
- The **only** edits allowed are obvious file-conversion artefacts (for example an option that reads "Four times (None of the given / Four times)", a label like "(A)" or "1." at the start of an option, a double space). List every such edit in the report.
- **Never guess.** If something is doubtful, follow section 5 and tell me. Do not quietly fix it.
- Do not add new questions. Do not drop a question except as section 5 says.
- If the paper has Hindi lines or Hindi translations, drop the Hindi and keep the English. Say so in the report.

### 2. File format
One object. Fill `<Year>` with the year I gave you.

```json
{
  "setId": "up-pgt-english-<Year>",
  "rev": 1,
  "ageName": "UP PGT English",
  "setName": "<Year> paper",
  "level": "medium",
  "levelName": "Full paper",
  "title": "UP PGT English <Year> paper",
  "exam": "UP PGT",
  "subject": "English",
  "paper": "English",
  "session": "<Year>",
  "topics": {
    "british": "British Literature",
    "american": "American Literature",
    "indian": "Indian Writing in English",
    "criticism": "Literary Criticism and Theory",
    "terms": "Literary Terms",
    "world": "World Literature",
    "language": "English Language and Usage"
  },
  "topicRead": {},
  "passages": [],
  "questions": []
}
```
- Keep only the `topics` keys that some question really uses.
- `level` is always `"medium"` and `rev` is `1`. Do not add any other top-level key.

### 3. One question
```json
{
  "id": "up-pgt-english-<Year>-q001",
  "questionNumber": 1,
  "question": "...exactly as printed...",
  "options": ["first option", "second option", "third option", "fourth option"],
  "correct_option_id": 2,
  "explanation": "...",
  "topic": "british",
  "topicId": "in-memoriam",
  "periodId": "victorian",
  "qtype": "direct",
  "src": "UP PGT English <Year>"
}
```
1. `id` = `up-pgt-english-<Year>-q` + the printed question number in **3 digits** (q001, q045, q125). The id never changes later. If a question is left out, its number is simply not used.
2. `question`: exactly as printed. Where the question has a list or lines (A. B. C. D., I. II. III., List I / List II, "Part 1 / Part 2"), put each item on a new line with `\n` inside the string.
3. `options`: **exactly 4 plain strings**, all different, none empty, no "(1)", "A.", "1." in front. Keep the paper's order. Never shuffle.
4. `correct_option_id`: one number 0 to 3 (first option = 0). Use the answer the paper gives.
5. `explanation`: copy the paper's explanation. If the paper gives none, write **one short sentence** that names the right answer and adds no new fact. Never write "the source", "the PDF", "the document" or "according to the paper".
6. `topic`: one key of the `topics` object. `qtype`: `direct` for normal questions, `passage` for questions on a reading passage (also `match`, `combination`, `chrono` if the question really is that kind).
7. `src` is always `"UP PGT English <Year>"`.
8. Optional `note` (see section 5, rule C) and `passageId` (section 6). **No other keys** (no `answerKey`, `answerStatus`, `correctAnswer`, `categoryId`).

### 4. Tagging (the most important part)
Use **only** ids from the `id` column of `taxonomy-master-reference.csv` (columns: id, name, kind, parent_id, area). **Copy** the id; never build one. If you are unsure whether an id exists, search the CSV; if it is not there, it does not exist.

**`topicId` — climb a ladder, one rung at a time:** a **work** (a poem, play, novel, essay) → a **writer** → a **movement / concept / term** → last of all a **period**. If a higher rung has a node, do not drop to a lower one.
- **The answer is the subject.** If the right answer is itself a node (a writer, a work, a term), tag that node. Example: "Who said 'Poetry is the criticism of life'?" (answer: Matthew Arnold) → `matthew-arnold`. "Point out the figure of speech" (answer: transferred epithet) → `transferred-epithet`.
- A person named only as the setting, a relative or the target of the question is **not** the subject.
- "Which of these is **not** …?" → the subject is the group (for example the writer whose works are listed), not the odd one out.
- A list or match question about different writers → the shared group (movement, country, genre), not one arbitrary name. If all items belong to one writer or work, tag that one.
- Two people with the same surname (two Samuel Butlers, two Richardsons…): never match on the surname alone; the question must carry a first name, initial, work or date.
- Never create a node. If there is none, climb one rung up and note the gap in the report ("Taxonomy gaps").

**Language questions (vocabulary, synonym, antonym, idiom, one-word substitution, spelling, comprehension)** → `topicId` `english-language-and-elt` and `topic` `language`. **Grammar questions (tense, narration/reported speech, prepositions, articles, error spotting, sentence transformation, voice)** → `traditional-grammar` and `topic` `language`. These two have **no `periodId`** (leave the key out).
**Literary terms and figures of speech** (simile, anaphora, iambic pentameter, sonnet…) → the term's own node, **no `periodId`**, `topic` `terms`.

**`periodId` — optional, and only an INNER period.** Use one of these 18 British ones:
`anglo-saxon`, `anglo-norman`, `age-of-chaucer`, `fifteenth-century`, `early-tudor`, `elizabethan`, `jacobean-era`, `caroline`, `commonwealth`, `restoration-era`, `augustan`, `age-of-sensibility`, `romantic`, `victorian`, `edwardian`, `georgian`, `modern-era`, `postmodern`.
For non-British writers use: `american-colonial`, `american-renaissance`, `american-realism`, `american-modernism`, `american-contemporary`, `iwe-beginnings`, `iwe-poetry`, `iwe-fiction`, `iwe-drama`, `iwe-prose`, `african-literature`, `caribbean-literature`, `canadian-literature`, `australian-literature`.
**Never use** a big age (`jacobean`, `restoration`, `modern`, `middle-english`, `renaissance`, `romantic-age`, `victorian-age`, `contemporary`, `old-english`, `augustan-age`) and **never** `neoclassical`, `postwar`, `postcolonial`, `literary-theory`. Every `periodId` must have `kind = period` in the CSV.
Which period: (1) if the question's own text names a period, use it; (2) otherwise the period where textbooks place the writer or work (this beats the composition date); (3) the date only when textbooks are silent. Settled placements: Milton and Traherne → `commonwealth`; Swift and Defoe → `augustan`; Richardson, Fielding, Smollett, Sterne, the Graveyard poets (Gray) → `age-of-sensibility`; Donne → `jacobean-era`; Clarendon → `restoration-era`; Conrad → `edwardian`; Hamlet, Henry IV and the sonnets → `elizabethan`; Macbeth and Shakespeare's late plays → `jacobean-era`; Wyatt and Surrey → `early-tudor`; Eliot and Yeats's later work → `modern-era`; Hemingway, Frost, Faulkner → `american-modernism`; Whitman → `american-renaissance`; Ezekiel, Kamala Das → `iwe-poetry`; Mulk Raj Anand → `iwe-fiction`.
If the writer or work has no inner-period placement you can justify, leave `periodId` out rather than guess.

Examples (from the 2006 paper): Tennyson's lines "Let knowledge grow…" → `in-memoriam` / `victorian`. "Who wrote Sohrab and Rustum?" → `matthew-arnold` / `victorian` (the work has no node). "Munoo is the hero of which novel?" → `coolie` / `iwe-fiction`. "Samson Agonistes is …" → `samson-agonistes` / `commonwealth`. "Chronicle plays were popular in which century?" → no generic node, so the period node `elizabethan` is used as topicId, and it goes into "Taxonomy gaps".
Keep the share of questions that fall back to a period node **below 25%**; if it is higher, you stopped climbing too early.

### 5. Doubtful questions — what to do (do NOT guess)
- **A. Damaged options → LEAVE THE QUESTION OUT** of the JSON. This means: fewer or more than 4 real options; two options that are identical (for example "No error" twice); two or more options that are all right (for example two of four words are misspelt in a "find the misspelt word" question); or an option that is clearly cut off. Put the full original text of every left-out question in the report ("Left out"), so I can ask for the original paper.
- **B. The key looks wrong** (it contradicts the paper's own explanation, or a clear fact or grammar rule): **keep the paper's key**, do not change it, and list it in the report ("Doubtful keys") with one line saying why. I will decide.
- **C. The key accepts more than one answer, or the question has a printing slip, or more than one option is arguably right:** keep the paper's answer and add a `note`: one short line, simple English, under 220 characters, that **never says which option is right**. Example: `"This question has more than one fair answer. This site counts one of them."` List it in the report.
- **D. A fact in an explanation looks wrong or cannot be confirmed:** do not rewrite it. List it in the report ("Doubtful explanations"). If you can browse, you may check ONE reliable page (Britannica, Poets.org, a university page, Wikisource, Project Gutenberg) and name it in the report; still do not edit without asking me.
- Only **I** (through Claude) decide to change a key or a fact.

### 6. Reading passages
If some questions say "Read the passage…", put the passage in the top-level `passages` list once:
`{"id": "p1", "title": "Questions 112 to 117", "attribution": "", "text": "...exactly as printed...", "src": "UP PGT English <Year>"}` and add `"passageId": "p1"` and `"qtype": "passage"` to every question on it. Join paragraphs with `\n\n`.
If the passage text is shortened or has "..." in it, keep it exactly as given and set `attribution` to `"The passage is shortened in our copy of the paper."`. Do not name the author of a passage unless the paper itself does. Do not complete a passage from memory.

### 7. Check your own file before you give it to me
If you can run Python, run this on your JSON (the CSV must be in the same folder). Fix every error it prints, then run it again until it says "no errors". If you cannot run Python, check the same things by hand.

```python
import csv, json, re, sys
tax = {r['id'].strip(): r['kind'].strip() for r in csv.DictReader(open('taxonomy-master-reference.csv', encoding='utf-8', newline=''))}
d = json.load(open(sys.argv[1], encoding='utf-8'))
BROAD = {'old-english','middle-english','renaissance','jacobean','restoration','augustan-age','romantic-age','victorian-age','modern','contemporary','british-literature'}
errs = []
qs = d['questions']
ids = [q['id'] for q in qs]
if len(ids) != len(set(ids)): errs.append('repeated question id')
if re.search('[ऀ-ॿ]', json.dumps(d, ensure_ascii=False)): errs.append('Devanagari letters found')
pids = {p['id'] for p in d.get('passages', [])}
for q in qs:
    n = q.get('questionNumber')
    o = q.get('options')
    if not (isinstance(o, list) and len(o) == 4 and all(isinstance(x, str) and x.strip() for x in o) and len(set(x.strip().lower() for x in o)) == 4):
        errs.append('Q%s: need exactly 4 different non-empty text options' % n)
    if q.get('correct_option_id') not in (0, 1, 2, 3): errs.append('Q%s: correct_option_id must be 0-3' % n)
    if not str(q.get('explanation', '')).strip(): errs.append('Q%s: no explanation' % n)
    if q.get('topicId') not in tax: errs.append('Q%s: topicId %r is not in the master list' % (n, q.get('topicId')))
    p = q.get('periodId')
    if p is not None and (tax.get(p) != 'period' or p in BROAD): errs.append('Q%s: periodId %r is not an inner period node (big ages are not allowed)' % (n, p))
    if q.get('topic') not in d.get('topics', {}): errs.append('Q%s: topic key %r is not in "topics"' % (n, q.get('topic')))
    if q.get('qtype') not in ('direct', 'combination', 'match', 'chrono', 'passage'): errs.append('Q%s: bad qtype' % n)
    if q.get('passageId') and q['passageId'] not in pids: errs.append('Q%s: passageId has no passage' % n)
    if any(k in q for k in ('answerKey', 'correctAnswer', 'answerStatus', 'categoryId')): errs.append('Q%s: extra key not allowed' % n)
print(len(qs), 'questions;', 'ERRORS:' if errs else 'no errors')
for e in errs: print(' -', e)
```
Usage: `python3 selfcheck.py up-pgt-english-<Year>.json`

### 8. What to give me
1. The file **`up-pgt-english-<Year>.json`** as a download (not pasted into the chat).
2. A short report, plain text:
   - Printed number of questions in the paper, number in your file, number left out.
   - **Left out:** question number, full original text, and why (section 5 rule A).
   - **Doubtful keys** (rule B), **notes added** (rule C), **doubtful explanations** (rule D).
   - **File-conversion artefacts you fixed** (section 1), with before and after.
   - **Taxonomy gaps:** questions that stopped on a period node or an area node because no better node exists.
   - How many questions got each `periodId`, and how many have none.
   - Any question where you were unsure of the tag (number and the two ids you hesitated between).
3. Do not paste the whole JSON in the chat. Do not write Hindi.

### 9. Never do
- Never edit question text, option text, the key or a fact on your own.
- Never invent a tag id, a period, or a topic label. Never use an id that is not in the CSV.
- Never shuffle options. Never renumber questions.
- Never add questions, years, authors, sources or links that the paper does not give.

## PASTE UNTIL HERE
