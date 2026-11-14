# Reference example: 20 questions in the exact site format

`romantic-age-set-1-medium.json` is a **format reference** for any AI that writes question files for
AK Explained. It is not a live set and is never published: `tools/` is kept out of the build
(`eleventy.config.js`), and the file is not in `assets/questions/`.

Copy its shape, not its facts. A real file has 50 questions and a real set has two files (easy and medium).

## What it proves

Check it with the site's own checker (a real file has 50 questions, so the demo needs `--count 20`):

```
python3 tools/mcq-skill/validate_mcq.py tools/ugc-net-mcq-skill/example/romantic-age-set-1-medium.json --notes notes/romantic-age/index.md --strict --count 20
```

Result: **No errors, no warnings.** It was also copied into a scratch copy of the site as a live set
and built: the build gate passed, a guest answered all 20 questions and scored 20/20, all 8
multi-line questions kept their line breaks, and the review page showed the reasons and no source name.

## What the file shows

| Rule | In the file |
|---|---|
| File name, `setId`, ids | `romantic-age-set-1-medium.json`, `romantic-age-set-1`, `romantic-age-set-1-m-01` to `-20` |
| Header | `age` is the hub slug, `ageName` and `notes` come from the site plan, `setName` is the plan's title, `topicRead` is `{}` |
| Topics | 5 keys, 4 questions each, labels under 30 characters |
| Question types | 12 `direct`, 4 `combination` (three statements, four statements, Statement I and II, Assertion and Reason), 2 `chrono`, 2 `match` = 40% complex, as a medium file should be |
| Answer key | positions A, B, C, D each 5 times, no run of five |
| Tags | every `topicId` is a real node, the most specific one (work, then writer, then concept); the answer is the subject (for example Q02 is tagged `blank-verse`, Q11 `samuel-taylor-coleridge`); `periodId` is the inner period `romantic`; none is tagged at the period only |
| Explanations | one to three sentences, the reason itself, no "Per ..." and no book name |
| `src` | a real Britannica or Wikipedia address; a note or book would be `user-supplied: <title>` |

The exact shape of each complex type (line breaks, option wording) is in
`tools/ugc-net-mcq-skill/references/question-types.md`.

## Not in this example

- **A `passage` question.** The exact text of a poem or extract cannot be written from memory, and
  the sites that hold it could not be opened when this file was made. Add one only with a passage
  the owner supplies, in the shape given in `question-types.md`.
- **An easy or a hard file.** Same format; only `level`, `levelName`, `levelNote`, the id letter
  (`e`, `m`, `h`) and the complex share (about 10%, 50%, 80%) change.

## How the facts were checked

Every fact was checked against Britannica through web search results naming the Britannica entry
(Lyrical Ballads, William Wordsworth, The Prelude, Biographia Literaria, Songs of Innocence, John
Keats, Percy Bysshe Shelley, A Defence of Poetry, Lord Byron, Childe Harold's Pilgrimage, Don Juan,
Frankenstein, Haunted Summer of 1816, Waverley, When was Pride and Prejudice written, Kubla Khan),
and the 1800 Preface wording against the Wikipedia article on the Preface. The Britannica pages
themselves could not be opened from the build session (the host is blocked), so a person who wants
full certainty should open each `src` address once. In the questions that join several facts
(chronology and match), `src` names the page for the main subject.
