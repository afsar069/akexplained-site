// Literary Theory series (owner, 2026-11-25). Aath parts, har part ke andar chapters.
//
// Yahi ek jagah hai jahan se sab banta hai: /literary-criticism/ ke aath cards,
// har part ka page (/literary-criticism/literary-theory/<slug>/) aur sitemap lines.
// Naya chapter ya naya part isi file me jodna hai, page me nahi.
//
// Har chapter ka `n` owner ke apne plan ka number hai (2 se 32). Ye numbers page par
// dikhte hain, isliye inhe badla nahi jata.
//
// `slug` = us chapter ka article kahan rahega: /notes/<slug>/. Article abhi likha nahi
// gaya, isliye har chapter `live: false` hai aur card link nahi banta — sirf
// "Coming soon" dikhata hai. Jis din article aa jaye, us chapter ko `live: true`
// kar dena; card khud link ban jayega. Slug tab tak badla ja sakta hai.

const parts = [
  {
    slug: "form-language-and-structure",
    name: "Form, language and structure",
    summary:
      "The schools that look inside the text first — at its form, its language and the system of rules that lets it mean anything at all.",
    chapters: [
      { n: 2, title: "Russian Formalism and the Prague Circle", people: "Shklovsky · Jakobson · Propp · Tynianov · Mukařovský", slug: "literary-theory-russian-formalism" },
      { n: 3, title: "Saussure and Structural Linguistics", people: "", slug: "literary-theory-saussure" },
      { n: 4, title: "Structuralism", people: "Lévi-Strauss · Barthes · Todorov · Greimas", slug: "literary-theory-structuralism" },
      { n: 5, title: "Narratology", people: "Genette · Bal · Prince · Chatman", slug: "literary-theory-narratology" },
      { n: 6, title: "Semiotics", people: "Peirce · Eco · Barthes", slug: "literary-theory-semiotics" },
      { n: 7, title: "Bakhtin and Dialogism", people: "", slug: "literary-theory-bakhtin" }
    ]
  },
  {
    slug: "reader-and-meaning",
    name: "Reader and meaning",
    summary:
      "Theory turns to the person holding the book, and asks how understanding itself happens.",
    chapters: [
      { n: 8, title: "Phenomenology and Hermeneutics", people: "Husserl · Heidegger · Gadamer · Ricoeur", slug: "literary-theory-phenomenology-hermeneutics" },
      { n: 9, title: "Reader-Response and Reception Theory", people: "Iser · Jauss · Fish · Rosenblatt · Holland", slug: "literary-theory-reader-response" }
    ]
  },
  {
    slug: "beyond-structure",
    name: "Beyond structure",
    summary:
      "The same thinkers who built the structures begin to take them apart, and meaning stops standing still.",
    chapters: [
      { n: 10, title: "Post-structuralism", people: "later Barthes · Foucault · Kristeva · Lacan", slug: "literary-theory-post-structuralism" },
      { n: 11, title: "Deconstruction", people: "Derrida · de Man · J. Hillis Miller", slug: "literary-theory-deconstruction" }
    ]
  },
  {
    slug: "society-history-and-culture",
    name: "Society, history and culture",
    summary:
      "Reading literature as the work of a class, a market and a moment in history, and reading everyday culture by the same light.",
    chapters: [
      { n: 12, title: "Marxist Literary Theory", people: "Lukács · Brecht · Gramsci · Althusser · Williams · Eagleton · Jameson", slug: "literary-theory-marxist" },
      { n: 13, title: "The Frankfurt School and Critical Theory", people: "Adorno · Horkheimer · Marcuse · Benjamin · Habermas", slug: "literary-theory-frankfurt-school" },
      { n: 14, title: "New Historicism and Cultural Materialism", people: "Greenblatt · Montrose · Dollimore · Sinfield", slug: "literary-theory-new-historicism" },
      { n: 15, title: "Cultural Studies: the Birmingham School", people: "Hoggart · Williams · Hall · Thompson", slug: "literary-theory-cultural-studies" },
      { n: 16, title: "Popular Culture, Media and Consumer Society", people: "Barthes's <i>Mythologies</i> · McLuhan · Fiske", slug: "literary-theory-popular-culture" }
    ]
  },
  {
    slug: "mind-and-myth",
    name: "Mind and myth",
    summary:
      "What literature owes to the unconscious, and the old story patterns that keep returning in new books.",
    chapters: [
      { n: 17, title: "Psychoanalytic Criticism", people: "Freud · Jung · Lacan · Klein · Bloom", slug: "literary-theory-psychoanalytic" },
      { n: 18, title: "Myth and Archetypal Criticism", people: "Frazer · Jung · Frye · Campbell", slug: "literary-theory-myth-archetypal" }
    ]
  },
  {
    slug: "gender-and-sexuality",
    name: "Gender and sexuality",
    summary:
      "From asking where the women writers went to asking what gender itself is, and who was left out of the first answers.",
    chapters: [
      { n: 19, title: "Feminist Theory I: from early feminism to Anglo-American feminist criticism", people: "Woolf · Beauvoir · Millett · Showalter · Gilbert and Gubar", slug: "literary-theory-feminism-anglo-american" },
      { n: 20, title: "Feminist Theory II: French Feminism", people: "Cixous · Irigaray · Kristeva", slug: "literary-theory-french-feminism" },
      { n: 21, title: "Black, Third-World and Intersectional Feminism", people: "hooks · Walker · Mohanty · Crenshaw", slug: "literary-theory-intersectional-feminism" },
      { n: 22, title: "Gender and Queer Theory", people: "Rubin · Butler · Sedgwick · Foucault", slug: "literary-theory-gender-queer" }
    ]
  },
  {
    slug: "race-empire-and-nation",
    name: "Race, empire and nation",
    summary:
      "Empire, the writing it produced and the writing that answered back — and how a nation, a race and a diaspora get imagined.",
    chapters: [
      { n: 23, title: "Postcolonial Theory", people: "Fanon · Said · Spivak · Bhabha · Ngũgĩ · Ashcroft, Griffiths and Tiffin", slug: "literary-theory-postcolonial" },
      { n: 24, title: "Subaltern Studies and Indian Postcolonial Thought", people: "Guha · Chatterjee · Chakrabarty · Ahmad", slug: "literary-theory-subaltern-studies" },
      { n: 25, title: "Race and Africana Theory", people: "Du Bois · Négritude · Gates · Black Arts · Critical Race Theory", slug: "literary-theory-race-africana" },
      { n: 26, title: "Nation, Diaspora and Globalisation", people: "Anderson · Gilroy · Appadurai · Brah", slug: "literary-theory-nation-diaspora" }
    ]
  },
  {
    slug: "postmodern-and-contemporary",
    name: "Postmodern and contemporary",
    summary:
      "The theory of our own time: after the grand stories, and out past the human being and the single language.",
    chapters: [
      { n: 27, title: "Modernity to Postmodernism", people: "Lyotard · Baudrillard · Jameson · Hutcheon", slug: "literary-theory-postmodernism" },
      { n: 28, title: "Ecocriticism and Environmental Humanities", people: "", slug: "literary-theory-ecocriticism" },
      { n: 29, title: "Posthumanism, Animal Studies and Cyberculture", people: "Haraway · Hayles", slug: "literary-theory-posthumanism" },
      { n: 30, title: "Trauma and Memory Studies", people: "Caruth · LaCapra · Hirsch", slug: "literary-theory-trauma-memory" },
      { n: 31, title: "Translation Studies and World Literature", people: "Venuti · Bassnett · Moretti · Casanova · Damrosch", slug: "literary-theory-translation-world-literature" },
      { n: 32, title: "Newer Directions: Disability Studies, Affect Theory, Digital Humanities", people: "", slug: "literary-theory-newer-directions" }
    ]
  }
];

const BASE = "/literary-criticism/literary-theory/";

module.exports = parts.map(function (p, i) {
  const prev = parts[i - 1];
  const next = parts[i + 1];
  return Object.assign({}, p, {
    number: i + 1,
    href: BASE + p.slug + "/",
    count: p.chapters.length,
    // Kitne chapter likhe ja chuke hain — abhi sab 0, sab "Coming soon".
    liveCount: p.chapters.filter(function (c) { return c.live; }).length,
    prev: prev ? { name: prev.name, href: BASE + prev.slug + "/", number: i } : null,
    next: next ? { name: next.name, href: BASE + next.slug + "/", number: i + 2 } : null
  });
});
