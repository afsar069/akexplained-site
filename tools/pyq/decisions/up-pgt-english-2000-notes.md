# UP PGT English 2000 — notes (2026-11-19)

Source: the owner's tagged file `up-pgt-english-2000.json` (98 questions). The owner said the questions are verified and asked for no re-check, so nothing
below is a fact check. The file was copied exactly as supplied.
Output: `assets/questions/up-pgt-english-2000.json`. Registry: `_data/pgtPyqs.json`. Rule: `CLAUDE.md` rule 23.

## Checks run
- `python3 tools/pyq/check_upload_file.py` on the supplied file: no errors. 98 questions, 4 notes, key spread A 22, B 22, C 29, D 25.
- `npx @11ty/eleventy` builds clean (the topic gate passes: every `topicId` and `periodId` is a real master node, ids are unique).
- Browser test on the built site (1280 and 375 px): hub, test screen, passage questions, score screen and review page work, no script errors, no sideways scroll.

## Left out (2 numbers)
The file's question numbers run 1 to 100, but **39 and 45 are not in it**. The file does not say why. The hub therefore uses its own note (`leftOutNote` in the
registry) that says only what is true: the numbers are 1 to 100, 39 and 45 are not in our copy, 98 are shown. It does not claim "damaged options" (that sentence is
for 2006). `printedCount` is 100, the highest question number in the file. If the owner sends the two questions, add them with ids `…-q039` and `…-q045`
(ids are frozen), raise `rev`, and remove `leftOutNote` and `printedCount` from the registry line.

## Left as supplied (the owner may decide)
- **Every explanation is the same one line**, "Official examination answer: Option (X) <text>. Verified from examination board answer key and standard
  literature/grammar reference." It names the right option but does not give a reason. 11 of them show doubled punctuation ("?." or ".."), for example "To live or to die?.".
- **Three passage questions (Q77, Q78, Q79)**: the quoted lines are already inside the question text AND in a separate passage card above it, so a student reads them twice.
  The card is titled "Question 77", "Question 78", "Question 79", but because Q39 and Q45 are missing the screen header reads "Question 75 of 98", "76 of 98", "77 of 98".
- **Notes** on Q60, Q61, Q64 and Q70 (grammar and spelling wording). They do not name the right option.
- Wording and spelling in the questions are as printed in the paper ("Gertude", "Germeny", "treaties", "Noble Prize", "master of English verse"); not edited.
- Tags: 49 of 98 questions carry a `periodId` (literature questions only); language and grammar questions have none, as in 2006. Q44 (Nobel Prize) sits on `world-literature`.
