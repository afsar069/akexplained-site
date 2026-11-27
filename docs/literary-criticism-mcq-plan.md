# Literary Criticism MCQs — the plan, version 2 (DRAFT, 2026-11-27)

> **Status: a draft that follows the owner's answers of 2026-11-27. Nothing is built yet** (no registry entry, page, upload slot or question file).
> The one thing already done is the **21 thinker nodes** the owner approved: they are in the master taxonomy and live in the database (section 6).
> This file replaces version 1 (`docs/literary-theory-mcq-plan.md`, 34 sets for Literary Theory only). The plan is a living file:
> **when a chapter's article is published, its sets are planned by the same rule and added here.**

## 1. The owner's answers, and where the plan applies each

| Owner's answer (2026-11-27) | What the plan does |
|---|---|
| "ham sbko cover karenge, indian poetics or key terms bhi" | The series covers **every section** of the Literary Criticism hub: History of Literary Criticism, Literary Theory, Cultural Studies, Indian Poetics, Key Terms & Concepts. (History is my reading of "sbko"; it is the section with the most articles live, so it is planned now.) |
| "chapter ka sirf ek hi set ho, zaruri nahi ... jab chapter ache se cover ho jae, utne set ... minimum 3" | **A chapter has as many sets as it takes, never fewer than 3.** "Covered well" is a check, not a promise: every sub-heading of the chapter's article must sit in exactly one set (section 2). For History, one article is one chapter. |
| "jinka chapter ka article nahi hai unka baad me banana hai, but note karke rakho, jese hi article aaye vese hi plan karo" | **Chapters with no article are not planned.** They are listed as waiting (section 5). |
| "new criticism or formalism ko alag alag karo, jyada nahi, bas differences dikhane hain" | New Criticism is **not mixed into** the Formalism sets. One small set (25 questions at each of two levels) shows how the two differ. |
| "i approve 21 nodes" | Done: section 6. |
| "theek hai" | Taken as: **no `periodId`** on theory questions (the recommendation in version 1). |
| "han first free rahega baki paid" | **Set 1 of every hub is free; every other set is paid.** |
| "hub ya section ka naam bhi vahi rehne chahiye, mcqs page par hi section by section" | A hub and a section keep **the names they have on the Literary Criticism pages**, and appear as sections on `/quizzes/mcq/` itself (section 3). |

## 2. How the plan is made, and what is checked

- **The source is the site's own article**, as for the American and Indian English plans: nothing from outside. The units are the article's
  sub-headings (the `###` lines): 14 to 27 in each of the 18 articles that are live. The key-terms list and the "Critics and works" table of
  an article are shared sources that any set of that chapter may use.
- **The rule for the number of sets:** about one set for every six sub-headings (a set is 100 questions, 50 at each of two levels, from roughly
  1,800 to 2,400 words), **at least 3 per chapter**, never fewer than 3 or more than 9 sub-headings in a set. The owner may change the
  divisor. Where a division by six would leave a thin set (Renaissance), the chapter has fewer, larger sets instead.
- **Levels:** the first set of a chapter is easy + medium; every later set is medium + hard (the pattern of the American and Indian English series).
- **`node tools/criticism-mcq-plan.js --check`** proves it: every chapter has at least 3 sets; **every sub-heading of every article is in exactly
  one set** (none left out, none counted twice); every set covers 3 to 9 sub-headings; every name in a whole-part set is in its articles. On
  2026-11-27 it passes for **18 chapters and 60 chapter sets**, and it fails (tested) when a sub-heading is left out, a chapter has only 2 sets,
  or a name is not in the articles.
- **Where a thinker is in several chapters** (Barthes, Foucault, Kristeva, Lacan...), a question belongs to the set of the chapter whose article
  develops the point, and its `src` is that article.

## 3. The shape of the series on the site

- **`/quizzes/mcq/` gets five new sections**, one per section of the Literary Criticism hub, with **the same names**: *History of Literary
  Criticism*, *Literary Theory*, *Cultural Studies*, *Indian Poetics*, *Key Terms & Concepts*. They sit under *British Literature By Age*, *American
  Literature By Age* and *Indian English Literature By Age*, as cards, section by section. (A section whose chapters are all waiting shows no cards,
  or Coming soon cards, as the owner prefers; to be settled when the page is built.)
- **A card is a hub, named as on the Literary Criticism page:** the eight History hubs are the eight cards there (*Introduction to Literary Criticism*,
  *Classical Criticism*, *Renaissance Criticism*, *Neoclassical Criticism*, *Romantic Criticism*, *Victorian Criticism*, *Early Twentieth Century*,
  *Mid Twentieth Century*); the Literary Theory hubs are its eight parts (*Form, language and structure*, *Reader and meaning*, *Beyond structure*,
  *Society, history and culture*, *Mind and myth*, *Gender and sexuality*, *Empire, race and postcolonial thought*, *Postmodern and contemporary*).
  The hub card can reuse each card's picture (the History and Literary Theory part pictures already exist), so no new artwork is needed.
- **A hub lists its sets grouped under chapter names.** A Literary Theory part is a long list (Part 1 has 25 sets), so the grouping matters.
- **Set numbers** are frozen once used (rule 12). A Literary Theory part's **Set 1 is the whole-part review** (easy + medium, free); it is planned only
  when every chapter of the part has an article, so for Parts 3 to 8 Set 1 is **reserved** (Coming soon) until then. The chapter sets follow in the order
  they were planned. A History hub has no whole-part set: its first set is Set 1. Ids: `<hub id>-set-N`, where the hub id is `history-<card slug>` or
  `theory-<part slug>` (and later `cultural-studies-...`, `indian-poetics-...`, `key-terms-...`); a question id is `<setId>-<e|m|h>-NN`.
- **Layer:** Set 1 of every hub is free (a public file, through `/admin/upload-mcq/`, public for good); every other set is paid (a database row, through
  `/admin/upload-paper/`). The registry does not have to say which: a planned slot can be filled either way, as the American and Indian English slots are.
- **Tags:** every question has a real `topicId` (a thinker, work or concept already in the master); **no `periodId`**.
- **Dashboard:** as for the American and Indian English series, these answers stay out of the British level pool unless the owner asks otherwise.

## 4. The sets that can be made now
**Ready** = the chapter's article is live, so its questions can be made now. **Free** = Set 1 of the hub. The tables below are printed by
`node tools/criticism-mcq-plan.js --md`; "Covers" lists the sub-headings of the article that the set draws on.

## History of Literary Criticism

### 1. Introduction to Literary Criticism (`history-introduction`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | Introduction to Literary Criticism | What criticism is, and what critics do | easy + medium | **free** | 7 sub-headings: The word and its meaning; Criticism is more than fault-finding; Defining and classifying; Analysing; Interpreting; Evaluating; How the five tasks work together |
| 2 | Introduction to Literary Criticism | Kinds of criticism | medium + hard | paid | 5 sub-headings: Theoretical and practical criticism; Impressionistic and judicial criticism; Prescriptive and descriptive criticism; Why the labels overlap; Four ways of looking at a work |
| 3 | Introduction to Literary Criticism | A map of the whole history | medium + hard | paid | 8 sub-headings: The classical foundations; Renaissance criticism (1500-1660); Neoclassical criticism (1660-1780); Romantic criticism (1780-1837); Victorian criticism (1837-1901); Early twentieth century (1900-1930); Mid twentieth century (1930-1960); How the periods connect |
| 4 | Introduction to Literary Criticism | Why criticism matters | medium + hard | paid | 4 sub-headings: What critics have changed; What criticism gives the reader; Critics who were also writers; How to read this series |


### 2. Classical Criticism (`history-classical`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | Classical Criticism | The world of classical criticism, and Plato | easy + medium | **free** | 7 sub-headings: Poetry as a public art; From Greece to Rome; A first map; The charge in the Republic; Third from the truth; Poetry as inspiration: the Ion; The ancient quarrel, and an open door |
| 2 | Classical Criticism | Aristotle's Poetics I: imitation, tragedy and plot | medium + hard | paid | 4 sub-headings: Imitation is natural; The definition of tragedy; The six parts and the plot; A plot that holds together |
| 3 | Classical Criticism | Aristotle's Poetics II: the tragic hero, catharsis, poetry and history | medium + hard | paid | 4 sub-headings: The tragic hero and the idea of error; Catharsis; Poetry and history; What Aristotle did not say |
| 4 | Classical Criticism | Horace: the Art of Poetry | medium + hard | paid | 4 sub-headings: Unity and decorum; To profit or to delight; Practical advice for writers; Horace in translation |
| 5 | Classical Criticism | Longinus: On the Sublime, and how classical criticism shaped what came after | medium + hard | paid | 8 sub-headings: An author without a name; What is the sublime?; The five sources; Greatness of soul; After Longinus; Ideas that stayed; The long road to English; How to read the classical critics |


### 3. Renaissance Criticism (`history-renaissance`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | Renaissance Criticism | The world of Renaissance criticism, and the Puritan attack | easy + medium | **free** | 6 sub-headings: The rediscovery of the ancients; Why English critics had to speak up; A map of the age; Humanists and early handbooks; Stephen Gosson and The School of Abuse; Thomas Lodge's quick reply |
| 2 | Renaissance Criticism | Sir Philip Sidney: An Apology for Poetry | medium + hard | paid | 5 sub-headings: The poet as maker and prophet; The definition of poetry; Poetry above philosophy and history; Answering the four charges; English poetry and drama |
| 3 | Renaissance Criticism | Handbooks and the quarrel over rhyme, Ben Jonson, and the legacy | medium + hard | paid | 9 sub-headings: William Webbe and George Puttenham; The quarrel over rhyme: Campion and Daniel; Francis Bacon and the place of poetry; Craft, rules, and decorum; Comedy of humours and the stage; Jonson on Shakespeare; Ideas that stayed; From Renaissance to Neoclassicism; How to read the Renaissance critics |


### 4. Neoclassical Criticism (`history-neoclassical`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | Neoclassical Criticism | The world of neoclassical criticism, and John Dryden | easy + medium | **free** | 6 sub-headings: Reason, nature and the ancients; The rise of coffee-houses and periodicals; A map of the age; An Essay of Dramatic Poesy (1668); Defining a play and defending English drama; Dryden on Shakespeare, Jonson and Chaucer |
| 2 | Neoclassical Criticism | Alexander Pope and Joseph Addison | medium + hard | paid | 6 sub-headings: The three parts of the poem; Nature, rules and "True Wit"; Craft, sound and the generous critic; True wit, Paradise Lost and Chevy Chase; The Pleasures of the Imagination (1712); Why Addison matters |
| 3 | Neoclassical Criticism | Samuel Johnson, and how neoclassical criticism shaped what came after | medium + hard | paid | 6 sub-headings: The Preface to Shakespeare (1765); Breaking the three unities; Faults of Shakespeare and the Lives of the Poets; Ideas that stayed; The bridge to the Romantics; How to read the neoclassical critics |


### 5. Romantic Criticism (`history-romantic`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | Romantic Criticism | The world of Romantic criticism, and William Wordsworth | easy + medium | **free** | 6 sub-headings: From the mirror to the lamp; Revolutions and reactions; A map of the age; Ordinary life and plain language; Emotion recollected in tranquillity; What is a poet? |
| 2 | Romantic Criticism | Samuel Taylor Coleridge and Percy Bysshe Shelley | medium + hard | paid | 6 sub-headings: Primary imagination, secondary imagination and fancy; Poetic faith and the nature of a poem; Answering Wordsworth on poetic diction; Peacock's challenge: The Four Ages of Poetry; Reason, imagination and the fading coal; Moral empathy and "unacknowledged legislators" |
| 3 | Romantic Criticism | William Hazlitt, and how Romantic criticism shaped what came after | medium + hard | paid | 6 sub-headings: Poetry as passion and "gusto"; Shakespeare and sympathetic imagination; The Spirit of the Age (1825); Ideas that stayed; From the Romantics to the Victorians; How to read the Romantic critics |


### 6. Victorian Criticism (`history-victorian`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | Victorian Criticism | The world of Victorian criticism, and Matthew Arnold | easy + medium | **free** | 6 sub-headings: Moral duty versus art for art's sake; Science, industry and the crisis of faith; A map of the age; Disinterestedness and the function of criticism; Poetry as "a criticism of life"; The touchstone method and the three estimates |
| 2 | Victorian Criticism | John Ruskin and Walter Pater | medium + hard | paid | 4 sub-headings: Art as a moral force; The pathetic fallacy; Impressionistic criticism; The "hard, gem-like flame" and the condition of mus… |
| 3 | Victorian Criticism | Oscar Wilde, and how Victorian criticism shaped what came after | medium + hard | paid | 6 sub-headings: The Decay of Lying and the reversal of imitation; The Critic as Artist; The Preface to The Picture of Dorian Gray (1891); Ideas that stayed; From the Victorians to Modernism; How to read the Victorian critics |


### 7. Early Twentieth Century (`history-early-twentieth`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | Early Twentieth Century | The world of early twentieth-century criticism, and A. C. Bradley | easy + medium | **free** | 5 sub-headings: From the poet to the poem; English enters the university; A map of the age; Shakespearean Tragedy (1904); "Poetry for Poetry's Sake" (1901/1909) |
| 2 | Early Twentieth Century | The reaction to Bradley, T. S. Eliot, and I. A. Richards on language | medium + hard | paid | 5 sub-headings: The backlash against Bradley; "Tradition and the Individual Talent" (1919); The impersonal theory of poetry; Objective correlative and dissociation of sensibili…; Two uses of language and pseudo-statements |
| 3 | Early Twentieth Century | I. A. Richards' Practical Criticism, and the legacy | medium + hard | paid | 4 sub-headings: Practical Criticism (1929) and the Four Kinds of Me…; Ideas that stayed; The road to New Criticism and Theory; How to read these three critics |


### 8. Mid Twentieth Century (`history-mid-twentieth`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | Mid Twentieth Century | The world of mid twentieth-century criticism, and William Empson | easy + medium | **free** | 5 sub-headings: The triumph of close reading; Two paths: text alone or culture and myth; A map of the age; Seven Types of Ambiguity (1930); Why Empson stands apart |
| 2 | Mid Twentieth Century | F. R. Leavis and the New Critics | medium + hard | paid | 5 sub-headings: Scrutiny, "life" and moral seriousness; The Great Tradition (1948); The "Two Cultures" clash; The autonomous text and the two fallacies; Paradox, irony, tension and the heresy of paraphrase |
| 3 | Mid Twentieth Century | Northrop Frye, and how mid twentieth-century criticism shaped what came after | medium + hard | paid | 5 sub-headings: Criticism as a science and the order of words; The four mythoi and the five fictional modes; Ideas that stayed; From New Criticism and Frye to Structuralism and Th…; How to read these critics |


## Literary Theory

### 1. Form, language and structure (`theory-form-language-and-structure`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | whole part | Across the whole part | easy + medium | **free** | **Ready.** A review across all chapters of the part: Shklovsky, Jakobson, Propp, Saussure, Lévi-Strauss, Barthes, Genette, Peirce, Umberto Eco, Bakhtin |
| 2 | Introduction to Literary Theory | What literary theory is, and what came before it | easy + medium | paid | 7 sub-headings: A working definition; Where the word comes from; Literary criticism and literary theory; A newer and wider meaning of theory; An old habit with a new name; How English became a university subject; Liberal humanism: the quiet agreement |
| 3 | Introduction to Literary Theory | The rise of Theory, and the ideas many theories share | medium + hard | paid | 6 sub-headings: Why the old agreement came under pressure; A timeline of Theory; The quarrels over Theory; Five recurring ideas; The subject, the text and discourse; Not one theory but many |
| 4 | Introduction to Literary Theory | How theory works, the case against it, and the landmark works of each school | medium + hard | paid | 4 sub-headings: One story, many questions; Reading a theory with care; The case against Theory; After the age of grand theory |
| 5 | Russian Formalism and the Prague Circle | Where Russian Formalism came from; literariness and defamiliarization | easy + medium | paid | 5 sub-headings: A new kind of literary study; Two centres of the movement; Art in a changing society; Literariness and the literary device; Defamiliarization and habitual perception |
| 6 | Russian Formalism and the Prague Circle | Practical language, fabula and syuzhet, the dominant; Shklovsky and Jakobson | medium + hard | paid | 5 sub-headings: Practical language and the poetic function; Fabula and syuzhet; Literary change and the dominant; Viktor Shklovsky (1893-1984); Roman Jakobson (1896-1982) |
| 7 | Russian Formalism and the Prague Circle | Eichenbaum, Tynianov, Propp and the Prague Circle | medium + hard | paid | 4 sub-headings: Boris Eichenbaum (1886-1959); Yuri Tynianov (1894-1943); Vladimir Propp (1895-1970); The Prague Linguistic Circle and Jan Mukařovský (18… |
| 8 | Russian Formalism and the Prague Circle | Reading with Russian Formalism, its limits and its legacy | medium + hard | paid | 5 sub-headings: The crossing seen again; Tolstoy's horse; The case against Russian Formalism; What lasted and what came next; How to read these thinkers |
| 9 | Russian Formalism and the Prague Circle (compared) | New Criticism and how it differs from Russian Formalism (25 per level) | medium + hard | paid | From Formalism: “A comparison with New Criticism”. Also from the History article on mid twentieth-century criticism: “The autonomous text and the two fallacies” and “Paradox, irony, tension and the heresy of paraphrase”. |
| 10 | Saussure and Structural Linguistics | Where structural linguistics came from; langue, parole and the sign | easy + medium | paid | 7 sub-headings: The nineteenth-century study of language; A different kind of question; A shared system rather than a private invention; Langue and parole; The linguistic sign; The arbitrary nature of the sign; The linear nature of the signifier |
| 11 | Saussure and Structural Linguistics | Value, synchrony and syntagmatic relations; Saussure's Course and semiology | medium + hard | paid | 6 sub-headings: Difference, signification and linguistic value; Synchrony and diachrony; Syntagmatic and associative relations; Saussure and the Course; Semiology and the study of culture; From language to literature |
| 12 | Saussure and Structural Linguistics | Reading with structural linguistics, its limits and what remained | medium + hard | paid | 5 sub-headings: Back to the vegetable market; A reading of a literary text; The case against structural linguistics; What remained important; How to read these thinkers |
| 13 | Structuralism | Where structuralism came from; difference, binary opposition, signs and codes | easy + medium | paid | 6 sub-headings: From language to cultural systems; From formalism to structuralism; The growth of French structuralism; The system behind the individual example; Difference and binary opposition; Signs, codes and cultural meanings |
| 14 | Structuralism | Narrative grammar and roles; Lévi-Strauss, Barthes, Todorov and Greimas | medium + hard | paid | 6 sub-headings: Narrative grammar and transformation; Roles rather than individual characters; Claude Lévi-Strauss: the structure of myths; Roland Barthes: from myth to the plural text; Tzvetan Todorov: the grammar of stories; A. J. Greimas: meaning and the actantial model |
| 15 | Structuralism | Reading with structuralism, its limits and its legacy | medium + hard | paid | 5 sub-headings: Returning to the village story; A literary example: Shakespeare's The Tempest; The case against structuralism; What structuralism left behind; How to read these thinkers |
| 16 | Narratology | Where narratology came from; story and discourse, order, duration and frequency | easy + medium | paid | 6 sub-headings: From the study of plot to the study of narrative; The structuralist background; Story, discourse and the act of telling; Narrative order; Narrative duration; Narrative frequency |
| 17 | Narratology | Voice and focalization; Genette, Bal, Prince and Chatman | medium + hard | paid | 6 sub-headings: Voice and narrative levels; Focalization and the distribution of knowledge; Gérard Genette and Narrative Discourse; Mieke Bal and the three levels of narrative; Gerald Prince and the reader within the narrative; Seymour Chatman and the structure of fiction and fi… |
| 18 | Narratology | Reading with narratology, its limits and its legacy | medium + hard | paid | 5 sub-headings: Meera's missed train; Pip in Great Expectations; The case against narratology; From classical to postclassical narratology; How to read these thinkers |
| 19 | Semiotics | Where semiotics came from; the sign, icon, index, symbol, semiosis and codes | easy + medium | paid | 5 sub-headings: Two routes to the study of signs; The two-part sign and the three-part sign; Icon, index and symbol; Semiosis and the growth of meaning; Codes, signification and communication |
| 20 | Semiotics | Denotation, connotation and myth; Peirce, Eco and Barthes | medium + hard | paid | 4 sub-headings: Denotation, connotation and myth; Charles Sanders Peirce: signs and reasoning; Umberto Eco: the code and the active reader; Roland Barthes: from ordinary images to cultural cr… |
| 21 | Semiotics | Reading with semiotics, its limits and its legacy | medium + hard | paid | 5 sub-headings: Returning to the tea shop; The handkerchief in Shakespeare's Othello; The case against unrestricted semiotic readings; What lasted and what came next; How to read these thinkers |
| 22 | Bakhtin and Dialogism | Where dialogism came from; the utterance, dialogism and polyphony | easy + medium | paid | 6 sub-headings: A thinker in a changing Russia; The Bakhtin Circle and the study of language; From literary form to living voices; The utterance and its listeners; Dialogism and monologism; Polyphony: a novel with independent voices |
| 23 | Bakhtin and Dialogism | Heteroglossia, double-voiced discourse, the chronotope and carnival | medium + hard | paid | 4 sub-headings: Heteroglossia and the social life of words; Double-voiced discourse; The chronotope and the meeting of worlds; Carnival and the temporary reversal of authority |
| 24 | Bakhtin and Dialogism | Bakhtin's major works | medium + hard | paid | 4 sub-headings: Dostoevsky and the discovery of polyphony; The Dialogic Imagination and the novel; Rabelais and popular laughter; Speech Genres and Other Late Essays |
| 25 | Bakhtin and Dialogism | Reading with dialogism, its limits and its legacy | medium + hard | paid | 5 sub-headings: Back at the tea stall; A literary example: Don Quixote; The case against dialogism; From dialogue to intertextuality and cultural studi…; How to read these thinkers |


### 2. Reader and meaning (`theory-reader-and-meaning`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | whole part | Across the whole part | easy + medium | **free** | **Ready.** A review across all chapters of the part: Husserl, Heidegger, Gadamer, Ricoeur, Iser, Jauss, Fish, Rosenblatt, Holland |
| 2 | Phenomenology and Hermeneutics | Where phenomenology came from; intentionality, the epoché and being-in-the-world | easy + medium | paid | 5 sub-headings: Before the twentieth century; A new starting point in experience; Intentionality: consciousness is directed; The epoché and the phenomenological reduction; Being-in-the-world: Heidegger's turn |
| 3 | Phenomenology and Hermeneutics | The hermeneutic circle, from speech to text; Husserl, Heidegger, Gadamer and Ricoeur | medium + hard | paid | 6 sub-headings: The hermeneutic circle; From a spoken word to a written text; Edmund Husserl (1859-1938); Martin Heidegger (1889-1976); Hans-Georg Gadamer (1900-2002); Paul Ricoeur (1913-2005) |
| 4 | Phenomenology and Hermeneutics | Reading with phenomenology and hermeneutics, its limits and what lasted | medium + hard | paid | 5 sub-headings: Returning to the letter; A literary example: Mrs Dalloway; The case against phenomenology and hermeneutics; What lasted and what came next; How to read these thinkers |
| 5 | Reader-Response and Reception Theory | Where reader-response came from; the reader, the implied reader and the horizon of expectations | easy + medium | paid | 6 sub-headings: From the finished object to the experience of readi…; Two paths towards the reader; The Constance School; The reader and the literary work; Gaps, anticipation and the implied reader; The horizon of expectations |
| 6 | Reader-Response and Reception Theory | Communities of readers and transaction; Rosenblatt, Holland, Jauss and Iser | medium + hard | paid | 6 sub-headings: Communities of readers; Transaction and personal identity; Louise Rosenblatt: reading as an event; Norman Holland: reading and the self; Hans Robert Jauss: literature has a history of read…; Wolfgang Iser: the act of reading |
| 7 | Reader-Response and Reception Theory | Fish, reading with reader-response, its limits and what lasted | medium + hard | paid | 6 sub-headings: Stanley Fish: from the reading process to communiti…; Returning to the railway platform; A literary example: Great Expectations; The case against unrestricted interpretation; What lasted and what came next; How to read these thinkers |


### 3. Beyond structure (`theory-beyond-structure`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | whole part | Across the whole part | easy + medium | **free** | **Reserved.** Planned when every chapter of the part has an article. |
| 2 | Post-structuralism | Where post-structuralism came from; the limits of final meaning, discourse and power-knowledge | easy + medium | paid | 5 sub-headings: From the study of language to the limits of structu…; A change in the intellectual climate; Meaning and the limits of a final reading; Discourse and the production of knowledge; Power, knowledge and the making of subjects |
| 3 | Post-structuralism | Intertextuality and the divided subject; Barthes, Foucault, Kristeva and Lacan | medium + hard | paid | 6 sub-headings: Other texts within a text; A subject divided by language; Roland Barthes (1915-1980): from the author to the …; Michel Foucault (1926-1984): from the author to the…; Julia Kristeva (born 1941): the text in motion; Jacques Lacan (1901-1981): the subject and the Other |
| 4 | Post-structuralism | Reading with post-structuralism, its limits and what lasted | medium + hard | paid | 5 sub-headings: Back to the college magazine; Reading Shakespeare's Hamlet; The case against post-structuralism; What lasted and what came next; How to read these thinkers |

*Chapters waiting for their article, not planned yet (1):* 11. Deconstruction.

### 4. Society, history and culture (`theory-society-history-and-culture`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | whole part | Across the whole part | easy + medium | **free** | **Reserved.** Planned when every chapter of the part has an article. |

*Chapters waiting for their article, not planned yet (2):* 12. Marxist Literary Theory; 13. New Historicism and Cultural Materialism.

### 5. Mind and myth (`theory-mind-and-myth`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | whole part | Across the whole part | easy + medium | **free** | **Reserved.** Planned when every chapter of the part has an article. |

*Chapters waiting for their article, not planned yet (2):* 14. Psychoanalytic Criticism; 15. Myth and Archetypal Criticism.

### 6. Gender and sexuality (`theory-gender-and-sexuality`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | whole part | Across the whole part | easy + medium | **free** | **Reserved.** Planned when every chapter of the part has an article. |

*Chapters waiting for their article, not planned yet (4):* 16. Feminist Theory I: from early feminism to Anglo-American feminist criticism; 17. Feminist Theory II: French Feminism; 18. Black, Third-World and Intersectional Feminism; 19. Gender and Queer Theory.

### 7. Empire, race and postcolonial thought (`theory-race-empire-and-nation`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | whole part | Across the whole part | easy + medium | **free** | **Reserved.** Planned when every chapter of the part has an article. |

*Chapters waiting for their article, not planned yet (3):* 20. Postcolonial Theory; 21. Subaltern Studies and Indian Postcolonial Thought; 22. Race and Africana Theory.

### 8. Postmodern and contemporary (`theory-postmodern-and-contemporary`)

| Set | Chapter | Title | Levels | Layer | Covers |
|---|---|---|---|---|---|
| 1 | whole part | Across the whole part | easy + medium | **free** | **Reserved.** Planned when every chapter of the part has an article. |

*Chapters waiting for their article, not planned yet (6):* 23. Modernity to Postmodernism; 24. Ecocriticism and Environmental Humanities; 25. Posthumanism, Animal Studies and Cyberculture; 26. Trauma and Memory Studies; 27. Translation Studies and World Literature; 28. Newer Directions: Disability Studies, Affect Theory, Digital Humanities.

## Cultural Studies

**Waiting: no article is live yet, so no set is planned.** 3 hubs, 12 chapters. When an article is published its sets are planned by the same rule. At the owner's minimum of 3 sets per chapter this series will need at least 36 sets.

| Hub (named as on the Literary Criticism page) | Chapters waiting |
|---|---|
| Culture, class and ideology | 5 |
| Popular culture, media and subculture | 4 |
| Identity, diaspora and globalisation | 3 |

## Indian Poetics

**Waiting: no article is live yet, so no set is planned.** 7 hubs, 35 chapters. When an article is published its sets are planned by the same rule. At the owner's minimum of 3 sets per chapter this series will need at least 105 sets.

| Hub (named as on the Literary Criticism page) | Chapters waiting |
|---|---|
| Drama, rasa and the schools | 6 |
| Alankara, guna and riti | 4 |
| Dhvani, vakrokti and auchitya | 4 |
| Later systems and other traditions | 4 |
| Medieval Indian thought | 5 |
| Modern Indian aesthetics | 7 |
| Nativism, the margins and the contemporary | 5 |

## Key Terms & Concepts

**Waiting: no article is live yet, so no set is planned.** 8 hubs, 40 chapters, 271 terms (each term has its own article). When an article is published its sets are planned by the same rule. At the owner's minimum of 3 sets per chapter this series will need at least 120 sets (counting a chapter of terms as one chapter).

| Hub (named as on the Literary Criticism page) | Chapters waiting |
|---|---|
| Figures of speech | 5 |
| Sound, metre and rhyme | 6 |
| Poetic forms | 5 |
| Genres and modes | 4 |
| Drama and narrative | 6 |
| Rhetoric and general terms | 4 |
| Terms of criticism | 3 |
| Terms of modern theory | 7 |

**Totals (ready now):** 62 sets, 6200 questions at the standard 50 per level (the New Criticism set is smaller); 10 of the sets are free, the rest paid.

## 5. Waiting: chapters with no article yet (not planned)
The sets of these chapters are planned **the day their article is published**, by the rule in section 2 (at least 3 sets each). Totals are read from the registries.
- **Literary Theory:** 18 of the 28 chapters (Deconstruction, Marxist Literary Theory, New Historicism and Cultural Materialism, Psychoanalytic Criticism, Myth and
  Archetypal Criticism, the four feminist and gender chapters, the three postcolonial and race chapters, and the six postmodern and contemporary chapters; the lists
  are under each hub above). Each part's **Set 1 (the free whole-part review)** also waits until every chapter of that part has an article.
- **Cultural Studies:** 3 hubs, 12 chapters, none live. At least 36 sets (and 3 whole-part reviews if the owner wants them as for Literary Theory).
- **Indian Poetics:** 7 hubs, 35 chapters with 158 subchapters, none live. At least 105 sets.
- **Key Terms & Concepts:** 8 hubs, 40 chapters, 271 terms, and **no term article is live yet** (each term has its own article, `notes/term-<name>/`).
  At least 120 sets if a chapter of terms is one chapter; how a chapter of 6 to 10 short term articles is split into sets is decided when the first ones arrive.
- **The scale, so it is stated once:** 62 sets are ready now (6,200 questions). The minimum still to come under the owner's rule is about **340 more
  sets (about 34,000 questions)**. Nothing forces the order; each hub opens as its first article does.

## 6. Tags: the 21 thinkers are in (done 2026-11-27)
The owner approved the 21 nodes ("i approve 21 nodes"). They are now `writer` nodes in the master taxonomy and **live in the database** (1717 to 1738 rows;
migration `20261127120000_add_theory_thinker_nodes.sql`; tested twice on a scratch Postgres, 0 orphans, applied and read back):
Husserl, Heidegger, Gadamer, Ricoeur, Schleiermacher, Dilthey, Ingarden, E. D. Hirsch, Bakhtin, Voloshinov, Medvedev, Peirce, Eco, Mukařovský, Bal,
Prince, Chatman and Hoggart (directly under the area, as A. C. Bradley and the Leavises are), Rosenblatt and Holland (under *Reader-Response Criticism*),
and Tynianov (under *Russian Formalism*). `node tools/criticism-mcq-plan.js --gaps` confirms all 21 are in.
- **Not added, because the owner did not approve them:** any school, concept or period node (Phenomenology, Hermeneutics, Semiotics, Dialogism and
  the like). A question on those takes the writer's node, or the area node when no writer fits.
- **For the waiting chapters** the version 1 name search found thinkers with no node (Brecht, Montrose, Dollimore, Sinfield, Klein, Frazer, bell hooks, Mohanty,
  Crenshaw, Rubin, Ashcroft, Guha, Chakrabarty, Ahmad, Gates, Haraway, Hayles, Caruth, LaCapra, Venuti, Bassnett, Moretti, Casanova, Damrosch and others).
  **That list is only a first pass by name; it is redone from each chapter's article when it is planned, and the owner approves the nodes then.**
- **Same-name rule (rule 12):** "Hirsch" is in two chapters (E. D. Hirsch in the Phenomenology article; a "Hirsch" on the Trauma chapter's registry line whose first name
  the registry does not give). Match by full name, never by surname.

## 7. Points to confirm (I made a choice; say if it is wrong)
1. **"sbko" includes the History of Literary Criticism** (8 hubs, 27 sets). If the owner meant only the four series named, drop that section.
2. **"First free" = Set 1 of every hub.** For a Literary Theory part that is not complete (Parts 3 to 8), Set 1 is the whole-part review and is reserved, so
   **there is no free set there yet**. The alternative: make the first chapter's first set the free one in those parts.
3. **"Minimum 3" = per chapter** (for History, per article). If it meant 3 per hub, the plan would be much smaller.
4. **The New Criticism set has 25 questions at each level**, because it rests on three sub-headings (one in the Formalism article, two in the mid-century History article).
   It overlaps those History sets a little, within the allowed limit of ten shared questions.
5. **Four school nodes** (Phenomenology, Hermeneutics, Semiotics, Dialogism) were not approved and are not added.

## 8. What happens when the owner says "build it" (Claude, in steps)
1. **Registry:** the series in `_data/mcqSpec.json` with a new `tradition` value for each section (`history`, `theory`, later `cultural-studies`, `indian-poetics`, `key-terms`),
   the ready sets with title, levels, count and the "covers" words. 2. **Pages and code:** the hub template groups sets under chapter names; `SERIES_WORDS` in
   `_data/mcqAges.js`; `SERIES` in `_data/freeMcqSlots.js`; the five sections on `/quizzes/mcq/`; the hub slugs in `assets/mcq.js` `SOON_HUBS`; the upload destinations
   (**History of Literary Criticism, Literary Theory** and later the others) in `_data/paperDestinations.js`; the series left out of the British dashboard pool and the UGC NET skill zip.
3. **Questions:** made set by set from the article (the owner's MCQ generator skill or another AI, then `validate_mcq.py --strict`); Set 1 of each hub first, since it is free and
   opens the hub. 4. **Test and merge** on its own branch (rule 17): Playwright with mocked Supabase, 375px and desktop; `main` only when the owner says so (rule 5).
The `/admin/upload-mcq/` page then lists the free slots by itself, and `/admin/upload-paper/` the paid ones.

## 9. Re-running the checks
```bash
node tools/criticism-mcq-plan.js --check   # the rule, sub-heading by sub-heading
node tools/criticism-mcq-plan.js --md      # the tables in section 4 and the waiting lists
node tools/criticism-mcq-plan.js --units <article-slug>   # numbered sub-headings of one article
node tools/criticism-mcq-plan.js --gaps    # the 21 approved nodes are in the master
```
The plan data is in `tools/criticism-mcq-plan.js` (not published; `tools/` is ignored by the build). To plan a new chapter: run `--units <slug>`, add its sets to `CH`, run `--check`, then `--md` and paste the tables into section 4.
