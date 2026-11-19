# UP PGT English 2002 — notes (2026-11-19)

Source: the owner's tagged file `up-pgt-english-2002.json` (72 questions). The owner said the questions are verified and asked for no re-check, so nothing below is a
fact check. The file was copied exactly as supplied.
Output: `assets/questions/up-pgt-english-2002.json`. Registry: `_data/pgtPyqs.json`. Rule: `CLAUDE.md` rule 23.

## Checks run
- `python3 tools/pyq/check_upload_file.py`: **one error, a false alarm.** "Q81: this question is in the file twice". Q76 and Q81 both have the stem "Which sentence is correct-", but
  their options are completely different ("I was born in India" set and "We travelled by auto" set), so they are two real questions. No question repeats with the same options.
  The checker (and the upload page) compare the stem only; that rule matters for a paid upload, not for a free file in the repo, whose build gate checks ids and tags only. Nothing was edited.
- `npx @11ty/eleventy` builds clean (topic gate passes).
- Browser test (1280 and 375 px): hub, test screen, score screen and review page work; no script errors, no sideways scroll.

## Left out (13 numbers)
The file's question numbers run 1 to 85, but **5 to 11, 13, 14, 33, 39, 75 and 78 are not in it**. The file does not say why. The hub uses its own note (`leftOutNote`) that says only that;
`printedCount` is 85, the highest number in the file. If the owner sends the missing questions, add them with ids `…-q005` and so on (ids are frozen), raise `rev`, and drop the note.

## Left as supplied (the owner may decide)
- **Every explanation is the same one template line** ("Official examination answer: Option (X) …"), and 5 end in doubled punctuation (for example "…ate sweets..").
- **13 questions carry a note** (Q16, Q18, Q21, Q23, Q30, Q46, Q47, Q52, Q74, Q79, Q80, Q81 and Q84). The checker confirms none names the right option. Q52's note says the line to be
  identified is missing from the question text, and Q21 and Q30 say the quoted line may have a printing error; these are the owner's words.
- Wording and spelling are as printed ("Startford", "Nightangle", "In Memorium", "W.B. Yeast", "Dicken's", "treaties"); not edited.
- Tags: 47 of 72 questions carry a `periodId` (literature only); language, grammar, terms and Q56 (Goethe, `world-literature`) have none.
