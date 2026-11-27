# Literary Theory MCQs — the plan (DRAFT for the owner's approval, 2026-11-27)

> **Status: a draft. Nothing is built.** No registry entry, page, upload slot or question file exists for this series yet.
> The owner may change any title, scope, level or grouping below, as with the American and Indian English plans.
> Nothing is created until the owner answers section 7. This file is the "plan first" step of `docs/future-plans.md` 7.4.

## 1. What the owner asked (2026-11-27)
"literary theory ke complete section ke free and paid mcqs bnane hai, but pehle unko plan karna hai", then "Literary Theory ka plan
banana shuru karo". So: a full MCQ series for the Literary Theory section (8 parts, 28 chapters, `_data/literaryTheory.js`), some sets
free and some paid, **planned first**.

## 2. What the plan rests on
The same rule as the American and Indian English plans (CLAUDE.md rule 3, `quizzes/mcq`): **every writer, work and term in a set's
scope must be in that chapter's own article. Nothing from outside.**
- **10 of the 28 chapter articles are live** (chapters 1 to 10: Introduction, Russian Formalism, Saussure, Structuralism, Narratology,
  Semiotics, Bakhtin, Phenomenology and Hermeneutics, Reader-Response, Post-structuralism). Each is about 6,500 to 7,300 words and has a
  key-terms list, "Important points to remember" lists, a "Critics and works" table and a 50-point revision list (checked in all ten),
  which should support a set of 100 questions (50 at each of two levels), each with a `src` line.
- **18 chapters have no article yet.** Their sets are planned from the registry's own words only (the chapter title and the `people`
  line the owner supplied). Their scope lines say "registry words only" and **must be rewritten from the article when it is published**.
- **The check is a script, not a promise.** `node tools/theory-mcq-plan.js --check` looks for every name in every scope line: in the
  article text for a ready set, in the registry for a waiting set. Run on 2026-11-27 it first caught one wrong phrase ("31 narrative
  functions"; the article says "31 functions") and, after the fix, passes for all 34 sets. `--md` prints the tables below from the same
  data, so the plan and the check cannot differ.

## 3. The shape of the series
- **A fourth MCQ series**, after British, American and Indian English: **"Literary Theory By Part"**, with **8 hubs** (one per part, the
  same eight parts and pictures as `/literary-criticism/`) and **34 sets**.
- **Set pattern** (the one the American and Indian English series use): **Set 1 of each part = the whole part**; then **one set per
  chapter**, joining two neighbouring chapters only where the articles are short companions (Saussure with Structuralism; Narratology
  with Semiotics). **Set 1 and Set 2 of a part are easy + medium; every later set is medium + hard.** 50 questions at each level, so
  100 per set. "Terms and criticism" is woven into every set rather than being a separate hub.
- **Ids:** the set id is `<part-slug>-set-N` (for example `form-language-and-structure-set-1`); a question id is `<setId>-<e|m|h>-NN`,
  frozen once used (rule 12). The registry `tradition` value would be `"theory"` (a free-text value, like `"american"`; the owner may rename it).
- **Where thinkers repeat** (Barthes, Foucault, Kristeva, Lacan, Jameson, Williams, Frye each sit in more than one chapter), a question
  belongs to the set of the chapter whose article develops the point, and its `src` is that article. A thinker's name alone does not
  decide the set.
- **Totals:** 34 sets, 3,400 questions. **10 sets (1,000 questions) can be made now** because their articles are live; **24 sets wait for
  articles**. The small parts could be merged if the owner wants fewer sets: for example Part 8's seven sets could become four; the
  plan keeps one set per chapter because that is how a student studies for NET Unit IX.
- **Scope:** NET Unit IX, *Literary Theory post World War II*, as already ruled for this series (rule 3). Cultural Studies, Indian Poetics
  and Key Terms are other series and are **not** in this plan unless the owner says so.

## 4. The sets
**Ready** means the chapter articles are live, so the questions can be made now. It does not yet mean the tags exist: see section 5.

### Part 1 — Form, language and structure (`form-language-and-structure`)

| Set | Title | Chapters | Levels | Status | Scope |
|---|---|---|---|---|---|
| 1 | Across the whole part | 1–7 | easy + medium | **Ready** | Shklovsky, Jakobson, Propp, Saussure, Lévi-Strauss, Barthes, Genette, Peirce, Umberto Eco and Bakhtin |
| 2 | Introduction to Literary Theory | 1 | easy + medium | **Ready** | theory and criticism, close reading, liberal humanism, the rise of Theory, and one landmark work from each school: Shklovsky's "Art as Technique", Brooks's The Well Wrought Urn, Derrida's Of Grammatology, Freud's The Interpretation of Dreams, Williams's Marxism and Literature, Showalter's A Literature of Their Own, Butler's Gender Trouble, Fish's Is There a Text in This Class?, Said's Orientalism and Lyotard's The Postmodern Condition |
| 3 | Russian Formalism and the Prague Circle | 2 | medium + hard | **Ready** | Shklovsky's "Art as Technique" and Theory of Prose, defamiliarization, Jakobson's six functions of language, Eichenbaum, Tynianov's "On Literary Evolution", Propp's Morphology of the Folktale and its 31 functions, the Prague Linguistic Circle, Mukařovský and foregrounding; the article's section on New Criticism (Ransom, Brooks, Wimsatt and Beardsley) is included (see the open question in the plan) |
| 4 | Saussure and Structuralism | 3–4 | medium + hard | **Ready** | Saussure's Course in General Linguistics (Bally, Sechehaye, Baskin), langue and parole, the sign, synchrony and diachrony; Lévi-Strauss and the mytheme, Barthes's Mythologies and S/Z, Todorov's Grammar of the Decameron, Greimas's actantial model and semiotic square |
| 5 | Narratology and Semiotics | 5–6 | medium + hard | **Ready** | Genette, Mieke Bal, Gerald Prince and Chatman, fabula and syuzhet, anachrony, focalization, kernels and satellites; Peirce's icon, index and symbol, Umberto Eco, Barthes's anchorage and relay |
| 6 | Bakhtin and Dialogism | 7 | medium + hard | **Ready** | dialogism, polyphony, heteroglossia, the chronotope, carnival, grotesque realism, speech genres, Voloshinov, Medvedev and Kristeva |

### Part 2 — Reader and meaning (`reader-and-meaning`)

| Set | Title | Chapters | Levels | Status | Scope |
|---|---|---|---|---|---|
| 1 | Across the whole part | 8–9 | easy + medium | **Ready** | Husserl, Heidegger, Gadamer, Ricoeur, Iser, Jauss, Fish, Rosenblatt and Holland |
| 2 | Phenomenology and Hermeneutics | 8 | easy + medium | **Ready** | intentionality, epoché, the lifeworld, Dasein, the hermeneutic circle, Gadamer's fusion of horizons, Ricoeur's narrative identity, Schleiermacher, Dilthey, Ingarden and E. D. Hirsch |
| 3 | Reader-Response and Reception Theory | 9 | medium + hard | **Ready** | Iser's implied reader and blanks, Jauss's horizon of expectations, Fish's interpretive communities and affective stylistics, Rosenblatt's transaction with its efferent and aesthetic stances, Holland's identity theme |

### Part 3 — Beyond structure (`beyond-structure`)

| Set | Title | Chapters | Levels | Status | Scope |
|---|---|---|---|---|---|
| 1 | Across the whole part | 10–11 | easy + medium | Waits for chapter 11 | later Barthes, Foucault, Kristeva, Lacan, Derrida, de Man and J. Hillis Miller |
| 2 | Post-structuralism | 10 | easy + medium | **Ready** | Barthes's "The Death of the Author" and S/Z (readerly and writerly texts), Foucault's discourse, episteme, archaeology and genealogy, power-knowledge and the author-function, Kristeva's intertextuality, Lacan's mirror stage and the imaginary, symbolic and real |
| 3 | Deconstruction | 11 | medium + hard | Waits for chapter 11 | Derrida, de Man and J. Hillis Miller (registry words only; rewrite from the article) |

### Part 4 — Society, history and culture (`society-history-and-culture`)

| Set | Title | Chapters | Levels | Status | Scope |
|---|---|---|---|---|---|
| 1 | Across the whole part | 12–13 | easy + medium | Waits for chapter 12, 13 | Lukács, Brecht, Gramsci, Althusser, Williams, Eagleton, Jameson, Greenblatt, Montrose, Dollimore and Sinfield (registry words only) |
| 2 | Marxist Literary Theory | 12 | easy + medium | Waits for chapter 12 | Lukács, Brecht, Gramsci, Althusser, Williams, Eagleton and Jameson (registry words only) |
| 3 | New Historicism and Cultural Materialism | 13 | medium + hard | Waits for chapter 13 | Greenblatt, Montrose, Dollimore and Sinfield (registry words only) |

### Part 5 — Mind and myth (`mind-and-myth`)

| Set | Title | Chapters | Levels | Status | Scope |
|---|---|---|---|---|---|
| 1 | Across the whole part | 14–15 | easy + medium | Waits for chapter 14, 15 | Freud, Jung, Lacan, Klein, Bloom, Frazer, Frye and Campbell (registry words only) |
| 2 | Psychoanalytic Criticism | 14 | easy + medium | Waits for chapter 14 | Freud, Jung, Lacan, Klein and Bloom (registry words only) |
| 3 | Myth and Archetypal Criticism | 15 | medium + hard | Waits for chapter 15 | Frazer, Jung, Frye and Campbell (registry words only) |

### Part 6 — Gender and sexuality (`gender-and-sexuality`)

| Set | Title | Chapters | Levels | Status | Scope |
|---|---|---|---|---|---|
| 1 | Across the whole part | 16–19 | easy + medium | Waits for chapter 16, 17, 18, 19 | Woolf, Beauvoir, Millett, Showalter, Gilbert and Gubar, Cixous, Irigaray, Kristeva, hooks, Walker, Mohanty, Crenshaw, Rubin, Butler, Sedgwick and Foucault (registry words only) |
| 2 | Feminist Theory I: early feminism and Anglo-American feminist criticism | 16 | easy + medium | Waits for chapter 16 | Woolf, Beauvoir, Millett, Showalter, Gilbert and Gubar (registry words only) |
| 3 | Feminist Theory II: French Feminism | 17 | medium + hard | Waits for chapter 17 | Cixous, Irigaray and Kristeva (registry words only) |
| 4 | Black, Third-World and Intersectional Feminism | 18 | medium + hard | Waits for chapter 18 | hooks, Walker, Mohanty and Crenshaw (registry words only) |
| 5 | Gender and Queer Theory | 19 | medium + hard | Waits for chapter 19 | Rubin, Butler, Sedgwick and Foucault (registry words only) |

### Part 7 — Empire, race and postcolonial thought (`race-empire-and-nation`)

| Set | Title | Chapters | Levels | Status | Scope |
|---|---|---|---|---|---|
| 1 | Across the whole part | 20–22 | easy + medium | Waits for chapter 20, 21, 22 | Fanon, Said, Spivak, Bhabha, Ngũgĩ, Ashcroft, Griffiths and Tiffin, Guha, Chatterjee, Chakrabarty, Ahmad, Du Bois, Négritude, Gates, Black Arts and Critical Race Theory (registry words only) |
| 2 | Postcolonial Theory | 20 | easy + medium | Waits for chapter 20 | Fanon, Said, Spivak, Bhabha, Ngũgĩ, Ashcroft, Griffiths and Tiffin (registry words only) |
| 3 | Subaltern Studies and Indian Postcolonial Thought | 21 | medium + hard | Waits for chapter 21 | Guha, Chatterjee, Chakrabarty and Ahmad (registry words only) |
| 4 | Race and Africana Theory | 22 | medium + hard | Waits for chapter 22 | Du Bois, Négritude, Gates, Black Arts and Critical Race Theory (registry words only) |

### Part 8 — Postmodern and contemporary (`postmodern-and-contemporary`)

| Set | Title | Chapters | Levels | Status | Scope |
|---|---|---|---|---|---|
| 1 | Across the whole part | 23–28 | easy + medium | Waits for chapter 23, 24, 25, 26, 27, 28 | Lyotard, Baudrillard, Jameson, Hutcheon, Haraway, Hayles, Caruth, LaCapra, Hirsch, Venuti, Bassnett, Moretti, Casanova and Damrosch (registry words only) |
| 2 | Modernity to Postmodernism | 23 | easy + medium | Waits for chapter 23 | Lyotard, Baudrillard, Jameson and Hutcheon (registry words only) |
| 3 | Ecocriticism and Environmental Humanities | 24 | medium + hard | Waits for chapter 24 | the chapter title only; the registry names no thinker (rewrite from the article) |
| 4 | Posthumanism, Animal Studies and Cyberculture | 25 | medium + hard | Waits for chapter 25 | Haraway and Hayles (registry words only) |
| 5 | Trauma and Memory Studies | 26 | medium + hard | Waits for chapter 26 | Caruth, LaCapra and Hirsch (registry words only) |
| 6 | Translation Studies and World Literature | 27 | medium + hard | Waits for chapter 27 | Venuti, Bassnett, Moretti, Casanova and Damrosch (registry words only) |
| 7 | Newer Directions: Disability Studies, Affect Theory, Digital Humanities | 28 | medium + hard | Waits for chapter 28 | the chapter title only; the registry names no thinker (rewrite from the article) |

Totals: 34 sets, 10 ready and 24 waiting; 3400 questions in all (1000 ready now).

## 5. Tagging — what the questions will carry, and what is missing
Every paid upload needs a real `topicId` for every question (the database trigger), and a free file needs one too (the build gate, rule 12).
Rule 11: **invent no topics; the owner supplies or approves them.** Checked against `supabase/data/taxonomy-master-reference.csv`
on 2026-11-27:
- **The front matter of the 10 live articles is all valid** (every topic id they list is in the master).
- **But the master is thin for the live chapters.** **21 thinkers named in them have no `writer` node:** Husserl, Heidegger, Gadamer,
  Ricoeur, Schleiermacher, Dilthey, Ingarden, E. D. Hirsch (Phenomenology and Hermeneutics); Louise Rosenblatt, Norman Holland (Reader-Response);
  Bakhtin, Voloshinov, Medvedev (Bakhtin); Charles Sanders Peirce, Umberto Eco (Semiotics); Tynianov, Mukařovský (Formalism);
  Mieke Bal, Gerald Prince, Seymour Chatman (Narratology); Richard Hoggart (Introduction). There is also no node for
  Phenomenology, Hermeneutics, Semiotics, Dialogism or their key terms (the Bakhtin and Phenomenology articles list only the area node
  `literary-criticism-and-theory` in their own front matter). Nodes that **do** exist: Saussure, Lévi-Strauss, Barthes,
  Todorov, Greimas, Genette, Shklovsky, Jakobson, Propp, Eichenbaum, Ransom, Brooks, Wimsatt and Beardsley, Iser, Jauss, Fish, Foucault,
  Kristeva, Lacan, plus concepts such as structuralism, narratology, defamiliarization, literariness, fabula and syuzhet, the horizon of
  expectations and interpretive communities.
- **The 18 chapters with no article** have the same pattern. Found by name search (2026-11-27): most of Marxist, Psychoanalytic, Myth,
  Feminist I and II, Postcolonial and Postmodernism are in the master; **not found:** Brecht, Montrose, Dollimore, Sinfield, Melanie
  Klein, Frazer, bell hooks, Mohanty, Crenshaw, Gayle Rubin, Ashcroft, Guha, Chakrabarty, Aijaz Ahmad, Gates, Black Arts, Critical Race
  Theory, Haraway, Hayles, Caruth, LaCapra, Hirsch, Venuti, Bassnett, Moretti, Casanova, Damrosch, and anything for Posthumanism, Trauma,
  Translation Studies, Disability Studies and Affect Theory. **This is a first pass by name and must be redone when each article is written.**
- **Same-name rule (rule 12):** "Hirsch" is in two chapters: E. D. Hirsch in the Phenomenology article, and a "Hirsch" on the Trauma
  chapter's registry line whose first name the registry does not give (ask the owner; do not assume it is the same person). Likewise
  Judith Butler is in the master and Samuel Butler is a different node. Match by full name, never by surname.
  (A name search for "Moretti" also finds only Spenser's *Amoretti*, which is a different thing.)
- **`periodId`:** the American and Indian English sets used one `period` node per hub, and for Indian English the owner ruled "if there is
  no node, build it". Literary Theory has no such nodes. A `periodId` is optional on a paid paper and a theory part is not an era, so the
  simplest course is **no `periodId`** and a specific `topicId`; the alternative is eight new `period` nodes, one per part, so that
  theory attempts show in the dashboard's "by period" view.
- **Dashboard:** as for the American and Indian English series, theory answers would stay out of the British level pool unless the owner
  asks otherwise.

## 6. Free or paid
- **The registry does not have to say.** A planned slot with no `access` label can be filled either way, as the American and Indian English
  slots can: **free** through `/admin/upload-mcq/` (a public file, public for good, rule 25) or **paid** through `/admin/upload-paper/`
  (a database row; a new destination **Literary Theory — MCQ set** must be added, as for the other series). The owner chooses at upload time.
- **The choice is still best made now**, because a file that went live as free is public in git history for ever (rule 15), and the
  generator's files must go to the right page. So the plan should record the intended layer per set.
- **A suggestion, not a decision:** make **Set 1 of each part free** (8 sets, a taster of each part and a way into the pass) and the rest
  paid. The ready sets are the natural first batch.

## 7. Decisions owed by the owner (nothing starts until these are answered)
1. **Scope:** is the series the 8-part Literary Theory section only (this plan), or should Cultural Studies, Indian Poetics and Key Terms
   follow the same way later? (Recommendation: Literary Theory only now; the others later, as separate series.)
2. **Grouping:** is one set per chapter, with a whole-part Set 1, right? Or fewer, bigger sets (section 3)?
3. **Chapters with no article yet:** wait for each article before making its set (recommended, because every question needs its `src`
   in the site's own notes), or plan and make sets for them from outside sources (not the site's practice).
4. **New Criticism:** the Formalism article also covers New Criticism (Ransom, Brooks, Wimsatt and Beardsley), but the chapter is named
   "Russian Formalism and the Prague Circle" and rule 3 still lists "does New Criticism get its own chapter" as open. This plan **includes**
   the article's New Criticism in Part 1 Set 3 and says so. If New Criticism later gets its own chapter, its questions move to a set of its own.
5. **Tags:** approve a batch of new `writer` (21) and school or concept nodes for the live chapters, or accept the fallback (the nearest
   existing node, often the area node)? Fallback tags make the dashboard's "by topic" view coarse for Bakhtin, Phenomenology, Semiotics
   and Narratology. (Recommendation: approve the 21 writers and the four school nodes before the first set is made; one migration, as for the Indian English period nodes.)
6. **`periodId`:** none (recommended), or eight new part nodes?
7. **Free or paid, per set** (section 6), and whether the level pattern (Set 1 and 2 easy + medium, later sets medium + hard) is right.
8. **Names:** hub names such as "Literary Theory: Form, language and structure", the section heading on `/quizzes/mcq/`, and the registry
   `tradition` value.

## 8. What happens after the plan is approved (Claude, one time)
1. **Tags:** the node migration the owner approved (rule 11): `supabase/migrations/`, `taxonomy-master-reference.csv`, the tagger skill's
   copy, then `python3 tools/build_skill_zip.py`.
2. **Registry:** a fourth series in `_data/mcqSpec.json` (8 entries, `"tradition": "theory"`, the 34 sets with title, topics, levels, count and the scope line, in the same shape as the American ages), with `article` pointing to the part's page.
3. **Pages and code:** `SERIES_WORDS` in `_data/mcqAges.js` and `SERIES` in `_data/freeMcqSlots.js`; a **Literary Theory By Part** section on `/quizzes/mcq/` (8 cards, reusing the 8 part pictures in `assets/literary-theory/`, so no new artwork); the 8 slugs in `SOON_HUBS` in `assets/mcq.js`; the destination **Literary Theory — MCQ set** in `_data/paperDestinations.js` (`usesRegistryPlan`, `ages` = the 8 parts); the series left out of the British dashboard pool and the UGC NET skill zip (`tools/build-syllabus.js` and `tools/build_skill_zip.py` already skip any `tradition` that is not British). The `/admin/upload-paper/` and `/admin/upload-mcq/` pages then list the slots by themselves.
4. **Questions:** made set by set from the chapter article (the owner's MCQ generator skill or another AI, then `validate_mcq.py --strict`), starting with the 10 ready sets; a set's scope line is rewritten from the article when its chapter is published.
5. **Test and merge** on their own branch (rule 17): Playwright with mocked Supabase, 375px and desktop; `main` only when the owner says so (rule 5).

**Suggested order:** answer section 7, then the tag migration, then the registry and pages, then Part 1 and Part 2 sets (9 sets, all articles live), then Part 3 Set 2; the other 24 sets as their chapters are written.

## 9. Re-running the checks
```bash
node tools/theory-mcq-plan.js --check   # every name in every scope line is in its article or the registry
node tools/theory-mcq-plan.js --md      # the tables in section 4
node tools/theory-mcq-plan.js --gaps    # writers in the ready chapters with no taxonomy node
```
The plan data lives in `tools/theory-mcq-plan.js` (not published; `tools/` is ignored by the build). Change a set there, re-run `--md`, and
paste the tables into section 4.
