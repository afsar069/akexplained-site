#!/usr/bin/env node
/* Literary Theory MCQ plan (DRAFT, 2026-11-27) — the plan as data, plus the check that backs it.
   -------------------------------------------------------------------------------------------
   Nothing here is published. It is the owner's draft: `docs/literary-theory-mcq-plan.md` is the
   readable version, and its set table is printed by `--md` from THIS file so the two cannot differ.

   Rule the plan rests on (same as for the American and Indian English sets, CLAUDE.md rule 3):
   every writer, work and term in a set's scope must be in that chapter's own article. Nothing from
   outside. `--check` proves it, name by name:
     - a READY set (all its chapters have a live article under notes/): each name must appear in
       those articles' text;
     - a WAITING set (some chapter has no article yet): the scope is only what the registry itself
       says (`people` line and chapter title in _data/literaryTheory.js). Each name must appear there.
       When the article is written, the scope is rewritten from it.

   Usage:
     node tools/theory-mcq-plan.js --check     verify every name; exit 1 if any is missing
     node tools/theory-mcq-plan.js --md        print the plan tables (markdown)
     node tools/theory-mcq-plan.js --gaps      list writers in the READY chapters with no taxonomy node
*/
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

/* The registry, with each chapter's number counted the way the site counts it (part by part, from 1). */
const lt = require(path.join(root, "_data", "literaryTheory.js"));
const parts = Array.isArray(lt) ? lt : lt.parts || lt;
const chapters = [];
parts.forEach((p, pi) => (p.chapters || []).forEach((c) => chapters.push({ n: chapters.length + 1, part: pi + 1, partSlug: p.slug, ...c })));
const byN = (n) => chapters.find((c) => c.n === n);
const articleOf = (c) => {
  const f = path.join(root, "notes", c.slug, "index.md");
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
};
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/* levels: S1 and S2 of a part are easy + medium, every later set is medium + hard (the pattern of the
   American and Indian English sets: early sets easier, later ones harder). 50 questions at each level. */
const EM = ["easy", "medium"], MH = ["medium", "hard"];
const P = {
  1: { slug: "form-language-and-structure", name: "Form, language and structure" },
  2: { slug: "reader-and-meaning", name: "Reader and meaning" },
  3: { slug: "beyond-structure", name: "Beyond structure" },
  4: { slug: "society-history-and-culture", name: "Society, history and culture" },
  5: { slug: "mind-and-myth", name: "Mind and myth" },
  6: { slug: "gender-and-sexuality", name: "Gender and sexuality" },
  7: { slug: "race-empire-and-nation", name: "Empire, race and postcolonial thought" },
  8: { slug: "postmodern-and-contemporary", name: "Postmodern and contemporary" },
};

/* One entry per set: part, number, title, the chapters it covers, levels, the scope line, and `names`,
   the words the check looks for. For a waiting set the scope is deliberately short (registry words only). */
const sets = [
  // ---- Part 1 (chapters 1-7, all articles live) ----
  { part: 1, n: 1, title: "Across the whole part", ch: [1, 2, 3, 4, 5, 6, 7], levels: EM,
    scope: "Shklovsky, Jakobson, Propp, Saussure, Lévi-Strauss, Barthes, Genette, Peirce, Umberto Eco and Bakhtin",
    names: ["Shklovsky", "Jakobson", "Propp", "Saussure", "Lévi-Strauss", "Barthes", "Genette", "Peirce", "Umberto Eco", "Bakhtin"] },
  { part: 1, n: 2, title: "Introduction to Literary Theory", ch: [1], levels: EM,
    scope: "theory and criticism, close reading, liberal humanism, the rise of Theory, and one landmark work from each school: Shklovsky's \"Art as Technique\", Brooks's The Well Wrought Urn, Derrida's Of Grammatology, Freud's The Interpretation of Dreams, Williams's Marxism and Literature, Showalter's A Literature of Their Own, Butler's Gender Trouble, Fish's Is There a Text in This Class?, Said's Orientalism and Lyotard's The Postmodern Condition",
    names: ["close reading", "liberal humanism", "Art as Technique", "The Well Wrought Urn", "Of Grammatology", "The Interpretation of Dreams", "Marxism and Literature", "A Literature of Their Own", "Gender Trouble", "Is There a Text in This Class", "Orientalism", "The Postmodern Condition"] },
  { part: 1, n: 3, title: "Russian Formalism and the Prague Circle", ch: [2], levels: MH,
    scope: "Shklovsky's \"Art as Technique\" and Theory of Prose, defamiliarization, Jakobson's six functions of language, Eichenbaum, Tynianov's \"On Literary Evolution\", Propp's Morphology of the Folktale and its 31 functions, the Prague Linguistic Circle, Mukařovský and foregrounding; the article's section on New Criticism (Ransom, Brooks, Wimsatt and Beardsley) is included (see the open question in the plan)",
    names: ["Art as Technique", "Theory of Prose", "defamiliarization", "six functions", "Eichenbaum", "On Literary Evolution", "Morphology of the Folktale", "31 functions", "Prague Linguistic Circle", "Mukařovský", "foregrounding", "New Criticism", "Ransom", "Wimsatt", "Beardsley"] },
  { part: 1, n: 4, title: "Saussure and Structuralism", ch: [3, 4], levels: MH,
    scope: "Saussure's Course in General Linguistics (Bally, Sechehaye, Baskin), langue and parole, the sign, synchrony and diachrony; Lévi-Strauss and the mytheme, Barthes's Mythologies and S/Z, Todorov's Grammar of the Decameron, Greimas's actantial model and semiotic square",
    names: ["Course in General Linguistics", "Bally", "Sechehaye", "Baskin", "langue", "parole", "synchrony", "diachrony", "mytheme", "Mythologies", "S/Z", "Grammar of the Decameron", "actantial", "semiotic square"] },
  { part: 1, n: 5, title: "Narratology and Semiotics", ch: [5, 6], levels: MH,
    scope: "Genette, Mieke Bal, Gerald Prince and Chatman, fabula and syuzhet, anachrony, focalization, kernels and satellites; Peirce's icon, index and symbol, Umberto Eco, Barthes's anchorage and relay",
    names: ["Genette", "Mieke Bal", "Gerald Prince", "Chatman", "fabula", "syuzhet", "anachrony", "focalization", "kernel", "satellite", "Peirce", "icon", "index", "symbol", "Umberto Eco", "anchorage", "relay"] },
  { part: 1, n: 6, title: "Bakhtin and Dialogism", ch: [7], levels: MH,
    scope: "dialogism, polyphony, heteroglossia, the chronotope, carnival, grotesque realism, speech genres, Voloshinov, Medvedev and Kristeva",
    names: ["dialogism", "polyphony", "heteroglossia", "chronotope", "carnival", "grotesque realism", "speech genre", "Voloshinov", "Medvedev", "Kristeva"] },

  // ---- Part 2 (chapters 8-9, both live) ----
  { part: 2, n: 1, title: "Across the whole part", ch: [8, 9], levels: EM,
    scope: "Husserl, Heidegger, Gadamer, Ricoeur, Iser, Jauss, Fish, Rosenblatt and Holland",
    names: ["Husserl", "Heidegger", "Gadamer", "Ricoeur", "Iser", "Jauss", "Fish", "Rosenblatt", "Holland"] },
  { part: 2, n: 2, title: "Phenomenology and Hermeneutics", ch: [8], levels: EM,
    scope: "intentionality, epoché, the lifeworld, Dasein, the hermeneutic circle, Gadamer's fusion of horizons, Ricoeur's narrative identity, Schleiermacher, Dilthey, Ingarden and E. D. Hirsch",
    names: ["intentionality", "epoché", "lifeworld", "Dasein", "hermeneutic circle", "fusion of horizons", "narrative identity", "Schleiermacher", "Dilthey", "Ingarden", "Hirsch"] },
  { part: 2, n: 3, title: "Reader-Response and Reception Theory", ch: [9], levels: MH,
    scope: "Iser's implied reader and blanks, Jauss's horizon of expectations, Fish's interpretive communities and affective stylistics, Rosenblatt's transaction with its efferent and aesthetic stances, Holland's identity theme",
    names: ["implied reader", "blanks", "horizon of expectations", "interpretive communit", "affective stylistics", "transaction", "efferent", "aesthetic stance", "identity theme"] },

  // ---- Part 3 (chapter 10 live, chapter 11 not yet) ----
  { part: 3, n: 1, title: "Across the whole part", ch: [10, 11], levels: EM,
    scope: "later Barthes, Foucault, Kristeva, Lacan, Derrida, de Man and J. Hillis Miller",
    names: ["Barthes", "Foucault", "Kristeva", "Lacan", "Derrida", "de Man", "J. Hillis Miller"] },
  { part: 3, n: 2, title: "Post-structuralism", ch: [10], levels: EM,
    scope: "Barthes's \"The Death of the Author\" and S/Z (readerly and writerly texts), Foucault's discourse, episteme, archaeology and genealogy, power-knowledge and the author-function, Kristeva's intertextuality, Lacan's mirror stage and the imaginary, symbolic and real",
    names: ["Death of the Author", "S/Z", "readerly", "writerly", "Foucault", "discourse", "episteme", "archaeology", "genealogy", "power-knowledge", "author-function", "intertextuality", "mirror stage", "imaginary", "symbolic"] },
  { part: 3, n: 3, title: "Deconstruction", ch: [11], levels: MH,
    scope: "Derrida, de Man and J. Hillis Miller (registry words only; rewrite from the article)",
    names: ["Derrida", "de Man", "J. Hillis Miller", "Deconstruction"] },

  // ---- Part 4 (chapters 12-13, no articles yet) ----
  { part: 4, n: 1, title: "Across the whole part", ch: [12, 13], levels: EM,
    scope: "Lukács, Brecht, Gramsci, Althusser, Williams, Eagleton, Jameson, Greenblatt, Montrose, Dollimore and Sinfield (registry words only)",
    names: ["Lukács", "Brecht", "Gramsci", "Althusser", "Williams", "Eagleton", "Jameson", "Greenblatt", "Montrose", "Dollimore", "Sinfield"] },
  { part: 4, n: 2, title: "Marxist Literary Theory", ch: [12], levels: EM,
    scope: "Lukács, Brecht, Gramsci, Althusser, Williams, Eagleton and Jameson (registry words only)",
    names: ["Lukács", "Brecht", "Gramsci", "Althusser", "Williams", "Eagleton", "Jameson"] },
  { part: 4, n: 3, title: "New Historicism and Cultural Materialism", ch: [13], levels: MH,
    scope: "Greenblatt, Montrose, Dollimore and Sinfield (registry words only)",
    names: ["Greenblatt", "Montrose", "Dollimore", "Sinfield"] },

  // ---- Part 5 (chapters 14-15) ----
  { part: 5, n: 1, title: "Across the whole part", ch: [14, 15], levels: EM,
    scope: "Freud, Jung, Lacan, Klein, Bloom, Frazer, Frye and Campbell (registry words only)",
    names: ["Freud", "Jung", "Lacan", "Klein", "Bloom", "Frazer", "Frye", "Campbell"] },
  { part: 5, n: 2, title: "Psychoanalytic Criticism", ch: [14], levels: EM,
    scope: "Freud, Jung, Lacan, Klein and Bloom (registry words only)",
    names: ["Freud", "Jung", "Lacan", "Klein", "Bloom"] },
  { part: 5, n: 3, title: "Myth and Archetypal Criticism", ch: [15], levels: MH,
    scope: "Frazer, Jung, Frye and Campbell (registry words only)",
    names: ["Frazer", "Jung", "Frye", "Campbell"] },

  // ---- Part 6 (chapters 16-19) ----
  { part: 6, n: 1, title: "Across the whole part", ch: [16, 17, 18, 19], levels: EM,
    scope: "Woolf, Beauvoir, Millett, Showalter, Gilbert and Gubar, Cixous, Irigaray, Kristeva, hooks, Walker, Mohanty, Crenshaw, Rubin, Butler, Sedgwick and Foucault (registry words only)",
    names: ["Woolf", "Beauvoir", "Millett", "Showalter", "Gilbert and Gubar", "Cixous", "Irigaray", "Kristeva", "hooks", "Walker", "Mohanty", "Crenshaw", "Rubin", "Butler", "Sedgwick", "Foucault"] },
  { part: 6, n: 2, title: "Feminist Theory I: early feminism and Anglo-American feminist criticism", ch: [16], levels: EM,
    scope: "Woolf, Beauvoir, Millett, Showalter, Gilbert and Gubar (registry words only)",
    names: ["Woolf", "Beauvoir", "Millett", "Showalter", "Gilbert and Gubar"] },
  { part: 6, n: 3, title: "Feminist Theory II: French Feminism", ch: [17], levels: MH,
    scope: "Cixous, Irigaray and Kristeva (registry words only)",
    names: ["Cixous", "Irigaray", "Kristeva"] },
  { part: 6, n: 4, title: "Black, Third-World and Intersectional Feminism", ch: [18], levels: MH,
    scope: "hooks, Walker, Mohanty and Crenshaw (registry words only)",
    names: ["hooks", "Walker", "Mohanty", "Crenshaw"] },
  { part: 6, n: 5, title: "Gender and Queer Theory", ch: [19], levels: MH,
    scope: "Rubin, Butler, Sedgwick and Foucault (registry words only)",
    names: ["Rubin", "Butler", "Sedgwick", "Foucault"] },

  // ---- Part 7 (chapters 20-22) ----
  { part: 7, n: 1, title: "Across the whole part", ch: [20, 21, 22], levels: EM,
    scope: "Fanon, Said, Spivak, Bhabha, Ngũgĩ, Ashcroft, Griffiths and Tiffin, Guha, Chatterjee, Chakrabarty, Ahmad, Du Bois, Négritude, Gates, Black Arts and Critical Race Theory (registry words only)",
    names: ["Fanon", "Said", "Spivak", "Bhabha", "Ngũgĩ", "Ashcroft, Griffiths and Tiffin", "Guha", "Chatterjee", "Chakrabarty", "Ahmad", "Du Bois", "Négritude", "Gates", "Black Arts", "Critical Race Theory"] },
  { part: 7, n: 2, title: "Postcolonial Theory", ch: [20], levels: EM,
    scope: "Fanon, Said, Spivak, Bhabha, Ngũgĩ, Ashcroft, Griffiths and Tiffin (registry words only)",
    names: ["Fanon", "Said", "Spivak", "Bhabha", "Ngũgĩ", "Ashcroft, Griffiths and Tiffin"] },
  { part: 7, n: 3, title: "Subaltern Studies and Indian Postcolonial Thought", ch: [21], levels: MH,
    scope: "Guha, Chatterjee, Chakrabarty and Ahmad (registry words only)",
    names: ["Guha", "Chatterjee", "Chakrabarty", "Ahmad"] },
  { part: 7, n: 4, title: "Race and Africana Theory", ch: [22], levels: MH,
    scope: "Du Bois, Négritude, Gates, Black Arts and Critical Race Theory (registry words only)",
    names: ["Du Bois", "Négritude", "Gates", "Black Arts", "Critical Race Theory"] },

  // ---- Part 8 (chapters 23-28) ----
  { part: 8, n: 1, title: "Across the whole part", ch: [23, 24, 25, 26, 27, 28], levels: EM,
    scope: "Lyotard, Baudrillard, Jameson, Hutcheon, Haraway, Hayles, Caruth, LaCapra, Hirsch, Venuti, Bassnett, Moretti, Casanova and Damrosch (registry words only)",
    names: ["Lyotard", "Baudrillard", "Jameson", "Hutcheon", "Haraway", "Hayles", "Caruth", "LaCapra", "Hirsch", "Venuti", "Bassnett", "Moretti", "Casanova", "Damrosch"] },
  { part: 8, n: 2, title: "Modernity to Postmodernism", ch: [23], levels: EM,
    scope: "Lyotard, Baudrillard, Jameson and Hutcheon (registry words only)",
    names: ["Lyotard", "Baudrillard", "Jameson", "Hutcheon"] },
  { part: 8, n: 3, title: "Ecocriticism and Environmental Humanities", ch: [24], levels: MH,
    scope: "the chapter title only; the registry names no thinker (rewrite from the article)",
    names: ["Ecocriticism", "Environmental Humanities"] },
  { part: 8, n: 4, title: "Posthumanism, Animal Studies and Cyberculture", ch: [25], levels: MH,
    scope: "Haraway and Hayles (registry words only)",
    names: ["Haraway", "Hayles", "Posthumanism", "Animal Studies", "Cyberculture"] },
  { part: 8, n: 5, title: "Trauma and Memory Studies", ch: [26], levels: MH,
    scope: "Caruth, LaCapra and Hirsch (registry words only)",
    names: ["Caruth", "LaCapra", "Hirsch"] },
  { part: 8, n: 6, title: "Translation Studies and World Literature", ch: [27], levels: MH,
    scope: "Venuti, Bassnett, Moretti, Casanova and Damrosch (registry words only)",
    names: ["Venuti", "Bassnett", "Moretti", "Casanova", "Damrosch"] },
  { part: 8, n: 7, title: "Newer Directions: Disability Studies, Affect Theory, Digital Humanities", ch: [28], levels: MH,
    scope: "the chapter title only; the registry names no thinker (rewrite from the article)",
    names: ["Disability Studies", "Affect Theory", "Digital Humanities"] },
];

/* A set is READY when every chapter it covers has a live article; otherwise it WAITS for the missing ones. */
sets.forEach((s) => {
  s.id = P[s.part].slug + "-set-" + s.n;
  s.missing = s.ch.filter((n) => articleOf(byN(n)) === null);
  s.ready = s.missing.length === 0;
  s.count = 50;
});

function check() {
  let bad = 0;
  sets.forEach((s) => {
    const hay = norm(
      s.ready
        ? s.ch.map((n) => articleOf(byN(n))).join("\n")
        : s.ch.map((n) => (byN(n).people || "") + " " + byN(n).title).join(" ") + " " + s.ch.map((n) => articleOf(byN(n)) || "").join("\n")
    );
    const absent = s.names.filter((w) => !hay.includes(norm(w)));
    if (absent.length) { bad++; console.log("MISSING in " + s.id + ": " + absent.join(", ")); }
  });
  console.log(bad ? bad + " set(s) have names that are not in their source." : "OK: every name in all " + sets.length + " scope lines is in its chapter article (ready sets) or in the registry (waiting sets).");
  process.exitCode = bad ? 1 : 0;
}

function md() {
  const out = [];
  let ready = 0, wait = 0;
  for (let p = 1; p <= 8; p++) {
    const ps = sets.filter((s) => s.part === p);
    out.push("### Part " + p + " — " + P[p].name + " (`" + P[p].slug + "`)");
    out.push("");
    out.push("| Set | Title | Chapters | Levels | Status | Scope |");
    out.push("|---|---|---|---|---|---|");
    ps.forEach((s) => {
      s.ready ? ready++ : wait++;
      const ch = s.ch.length === 1 ? "" + s.ch[0] : s.ch[0] + "–" + s.ch[s.ch.length - 1];
      out.push("| " + s.n + " | " + s.title + " | " + ch + " | " + s.levels.join(" + ") + " | " +
        (s.ready ? "**Ready**" : "Waits for chapter " + s.missing.join(", ")) + " | " + s.scope + " |");
    });
    out.push("");
  }
  out.push("Totals: " + sets.length + " sets, " + ready + " ready and " + wait + " waiting; " + sets.length * 2 * 50 + " questions in all (" + ready * 100 + " ready now).");
  console.log(out.join("\n"));
}

function gaps() {
  const rows = fs.readFileSync(path.join(root, "supabase", "data", "taxonomy-master-reference.csv"), "utf8").split("\n").slice(1).filter(Boolean)
    .map((l) => { const m = l.match(/^([^,]+),("(?:[^"]|"")*"|[^,]*),([^,]*),/); return m ? { id: m[1], name: norm(m[2].replace(/^"|"$/g, "")), kind: m[3] } : null; }).filter(Boolean);
  const people = ["Husserl", "Heidegger", "Gadamer", "Ricoeur", "Schleiermacher", "Dilthey", "Ingarden", "E. D. Hirsch", "Louise Rosenblatt", "Norman Holland",
    "Bakhtin", "Voloshinov", "Medvedev", "Charles Sanders Peirce", "Umberto Eco", "Tynianov", "Mukařovský", "Mieke Bal", "Gerald Prince", "Seymour Chatman", "Richard Hoggart"];
  const miss = people.filter((w) => { const last = norm(w).split(" ").pop(); return !rows.some((r) => r.kind === "writer" && r.name.split(" ").pop() === last); });
  console.log("Writers named in the READY chapters with no `writer` node (surname match, 2026-11-27): " + miss.length + "\n  " + miss.join("\n  "));
}

const arg = process.argv[2];
if (arg === "--check") check(); else if (arg === "--md") md(); else if (arg === "--gaps") gaps();
else console.log("Use --check, --md or --gaps");
