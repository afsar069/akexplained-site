# UP PGT English 2006 — decisions and audit trail (2026-11-19)

Source: the owner's file `UP_PGT_English_2006_Solved.docx` (125 questions, "Booklet: L-03/B", a key and an explanation under each question).
Output: `assets/questions/up-pgt-english-2006.json` (122 questions). Registry: `_data/pgtPyqs.json`. Rule: `CLAUDE.md` rule 23.
The owner said: do not re-verify every question (they are PYQs); fix only where there is doubt. Every question below was found doubtful while reading all 125.

## Left out (3). The owner may send the original wording and they can be added back
- **Q84.** Choose the misspelt word:
    (1) Subsistence
    (2) Mismerise
    (3) Anamolous
    (4) Ninth
    Supplied key: (2) Mismerise (and (3) Anamolous)

Why: two of the four options are misspelt ("Mismerise" and "Anamolous"), so the question has two right answers.

- **Q111.** Find out the misspelt word:
    (1) Monstrous
    (2) Monsterous
    (3) Monstorous
    (4) Monstoros
    Supplied key: (3) Monstorous (or (2))

Why: the supplied key itself says "(3) Monstorous (or (2))". Three of the four options are misspelt. The only correct spelling is option (1).

- **Q119.** Mark the part containing an error: Neither Ram nor his parents are (1) / to blame. (2) / No error (3/4)
    (1) Neither Ram nor his parents are
    (2) to blame.
    (3) No error
    (4) No error
    Supplied key: (4) No error (or (3))

Why: the sentence has only two parts and the options repeat "No error" twice. The site needs four different options. The original third part is missing from the supplied copy.

## Changed after checking
- **Q118** "Every one of us / should do our duty / to the country": the supplied key said (2) is the error. "Every one of us ... our" agrees with "us", so the key now counts (4) No error.
  Web search found a similar error-spotting item ("Everyone of us should realise ... our country's security") marked "No error". **Still the owner's call**: if the exam's own key said (2), change `correct_option_id` back to 1.
- **Q32**: option 4 was "Four times (None of the given / Four times)", an artefact of the converted file. It is now "Four times". Robert Frost won the Pulitzer Prize for Poetry four times (1924, 1931, 1937, 1943).
- **Q35**: three options (Islands in the Stream, A Moveable Feast, The Garden of Eden) were all left unfinished or published after Hemingway's death (a Cambridge page lists four unfinished works). The supplied key (The Garden of Eden) is kept; the question carries a note and the explanation says so.
- **Q87**: "Irreconciliable" is an archaic/obsolete form of "irreconcilable" (Merriam-Webster, Wiktionary). The explanation now says that option (3) is only the closest of the four.
- **Q26**: Britannica dates the sailing to England to August 1912; the Robert Frost Farm chronology dates the sale of the Derry farm to 1911, other pages to 1912. Key (1912) kept; the explanation says sources differ.
- **Q27**: Swinburne, "Essays and Studies" (1875): "He was alone the perfect singing-god" (Wikisource scan). Explanation updated.
- **Q1**: sources disagree on the stanza number of "Let knowledge grow from more to more" in the Prologue of In Memoriam (stanza 5 on one page, 7 on another); the explanation now says only "the Prologue".
- **Q5**: search results attribute "abundantly and enchantingly sensuous" to Matthew Arnold (no page with the exact essay and page could be opened). Key kept; the explanation no longer names an essay series or year.
- **Q10, Q61**: removed years that could not be confirmed ("Rugby Chapel (1857)", "October 1798"). **Q113, Q116**: the explanations talked about parts of the passage that the shortened copy does not contain; they now rest on the visible text only.

## Doubtful but kept as supplied (the owner may decide)
- **Q2** "most furious character in Fagin's Den": key Bill Sikes. A web summary of the den scene has Fagin and not Sikes as the furious one, but Fagin is not an option.
- **Q114** "mode" = (3) form; (4) manner is also a fair meaning.
- **Q121** "agree ___ your proposal": key (3) to. "With" is also common usage.
- **Q112 to Q117** use a reading passage that is shortened in the supplied copy (marked "..."). Wording such as "contingent assemblages" (Q115) and "ecclesiastical" (Q113) is not in the visible text. The full passage could not be found online (search tried with the opening sentence and those two phrases), so the page shows the supplied text and says it is shortened.

## Tags (rule 12)
Every question has `topicId` from `supabase/data/taxonomy-master-reference.csv`; `periodId` only for literature questions (inner periods and the American / Indian ones). Vocabulary, spelling and idiom questions use
`english-language-and-elt`; grammar, narration, tense and preposition questions use `traditional-grammar`; neither has a period. Where the answer is a person, the person is the subject
(for example Q5, Q17, Q27, Q48, Q53); where the answer is a work or a term, that is the subject. Macbeth is tagged `jacobean-era`, Hamlet and Henry IV `elizabethan`, Samson Agonistes `commonwealth` (Milton, rule 12).
Q60 (chronicle plays) has no generic node, so it sits on the `elizabethan` period node. Nodes that do not exist (Arthur Hugh Clough, William James, Polonius) were not invented: Q18 sits on `matthew-arnold`, Q66 on `stream-of-consciousness`, Q15 on `hamlet`.
