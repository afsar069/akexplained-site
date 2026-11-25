// Literary Theory series (owner, 2026-11-25). Aath parts, har part ke andar chapters.
//
// Yahi ek jagah hai jahan se sab banta hai: /literary-criticism/ ke aath cards,
// har part ka page (/literary-criticism/literary-theory/<slug>/) aur sitemap lines.
// Naya chapter ya naya part isi file me jodna hai, page me nahi.
//
// Chapter ka number (`n`) ab yahan likha nahi jata: ye part-dar-part, upar se neeche
// 1, 2, 3 ... ginkar khud banta hai, taaki koi chapter hatne ya jaane par number me gap
// na pade. Chapter 1 = Introduction (owner ne 2026-11-25 ko tay kiya).
//
// 2026-11-25 (owner: "NET syllabus ke according chalenge"): NET Unit VII "Cultural Studies"
// ke chapters (Birmingham School, Popular Culture and Media, Nation / Diaspora /
// Globalisation) yahan se nikal kar `_data/culturalStudies.js` me chale gaye.
// 2026-11-25 (owner: "Frankfurt School chapter Cultural Studies me le jao"): The Frankfurt School and
// Critical Theory bhi wahin chala gaya (past NET sawal use Cultural Studies me ginte hain). Unit IX
// "Literary Theory post World War II" ki cheezein yahin rahin.
//
// `slug` = us chapter ka article kahan rahega: /notes/<slug>/. Article abhi likha nahi
// gaya, isliye har chapter `live: false` hai aur card link nahi banta — sirf
// "Coming soon" dikhata hai. Jis din article aa jaye, us chapter ko `live: true`
// kar dena; card khud link ban jayega. Slug tab tak badla ja sakta hai.
//
// PICTURE: do jagah tasveer lag sakti hai — har part ke card par
// (/literary-criticism/) aur har chapter ke card par (part ka page). Abhi ek bhi
// asli painting nahi hai, isliye `image` khaali hai aur card par ek saaf numbered
// panel dikhta hai. Tasveer lagane ke liye (site ka apna standard, CLAUDE.md):
//   1. `assets/literary-theory/<naam>.webp`  — 480 x 300, 200 KB se kam
//   2. `assets/literary-theory/<naam>-240.webp` — 240 x 150, wahi tasveer chhoti
//   3. us part ya us chapter me `image: "<naam>"` aur
//      `alt: "<jo tasveer me dikh raha hai>"`
// Bas itna; card khud tasveer dikhane lagega. Part ke liye `<naam>` uska slug hai;
// chapter ke liye koi bhi saaf naam (chapter ka slug sabse seedha hai). `alt` wahi
// likho jo tasveer me hai (rule 2), aur generated painting ko "painted
// interpretation" kehna hai.

const parts = [
  {
    slug: "form-language-and-structure",
    name: "Form, language and structure",
    summary:
      "The schools that look inside the text first — at its form, its language and the system of rules that lets it mean anything at all.",
    image: "",
    alt: "",
    chapters: [
      { title: "Introduction to Literary Theory", people: "", slug: "literary-theory-introduction" },
      { title: "Russian Formalism and the Prague Circle", people: "Shklovsky · Jakobson · Propp · Tynianov · Mukařovský", slug: "literary-theory-russian-formalism" },
      { title: "Saussure and Structural Linguistics", people: "", slug: "literary-theory-saussure" },
      { title: "Structuralism", people: "Lévi-Strauss · Barthes · Todorov · Greimas", slug: "literary-theory-structuralism" },
      { title: "Narratology", people: "Genette · Bal · Prince · Chatman", slug: "literary-theory-narratology" },
      { title: "Semiotics", people: "Peirce · Eco · Barthes", slug: "literary-theory-semiotics" },
      { title: "Bakhtin and Dialogism", people: "", slug: "literary-theory-bakhtin" }
    ]
  },
  {
    slug: "reader-and-meaning",
    name: "Reader and meaning",
    summary:
      "Theory turns to the person holding the book, and asks how understanding itself happens.",
    image: "",
    alt: "",
    chapters: [
      { title: "Phenomenology and Hermeneutics", people: "Husserl · Heidegger · Gadamer · Ricoeur", slug: "literary-theory-phenomenology-hermeneutics" },
      { title: "Reader-Response and Reception Theory", people: "Iser · Jauss · Fish · Rosenblatt · Holland", slug: "literary-theory-reader-response" }
    ]
  },
  {
    slug: "beyond-structure",
    name: "Beyond structure",
    summary:
      "The same thinkers who built the structures begin to take them apart, and meaning stops standing still.",
    image: "",
    alt: "",
    chapters: [
      { title: "Post-structuralism", people: "later Barthes · Foucault · Kristeva · Lacan", slug: "literary-theory-post-structuralism" },
      { title: "Deconstruction", people: "Derrida · de Man · J. Hillis Miller", slug: "literary-theory-deconstruction" }
    ]
  },
  {
    slug: "society-history-and-culture",
    name: "Society, history and culture",
    summary:
      "Reading literature as the work of a class, a market and a moment in history.",
    image: "",
    alt: "",
    chapters: [
      { title: "Marxist Literary Theory", people: "Lukács · Brecht · Gramsci · Althusser · Williams · Eagleton · Jameson", slug: "literary-theory-marxist" },
      { title: "New Historicism and Cultural Materialism", people: "Greenblatt · Montrose · Dollimore · Sinfield", slug: "literary-theory-new-historicism" }
    ]
  },
  {
    slug: "mind-and-myth",
    name: "Mind and myth",
    summary:
      "What literature owes to the unconscious, and the old story patterns that keep returning in new books.",
    image: "",
    alt: "",
    chapters: [
      { title: "Psychoanalytic Criticism", people: "Freud · Jung · Lacan · Klein · Bloom", slug: "literary-theory-psychoanalytic" },
      { title: "Myth and Archetypal Criticism", people: "Frazer · Jung · Frye · Campbell", slug: "literary-theory-myth-archetypal" }
    ]
  },
  {
    slug: "gender-and-sexuality",
    name: "Gender and sexuality",
    summary:
      "From asking where the women writers went to asking what gender itself is, and who was left out of the first answers.",
    image: "",
    alt: "",
    chapters: [
      { title: "Feminist Theory I: from early feminism to Anglo-American feminist criticism", people: "Woolf · Beauvoir · Millett · Showalter · Gilbert and Gubar", slug: "literary-theory-feminism-anglo-american" },
      { title: "Feminist Theory II: French Feminism", people: "Cixous · Irigaray · Kristeva", slug: "literary-theory-french-feminism" },
      { title: "Black, Third-World and Intersectional Feminism", people: "hooks · Walker · Mohanty · Crenshaw", slug: "literary-theory-intersectional-feminism" },
      { title: "Gender and Queer Theory", people: "Rubin · Butler · Sedgwick · Foucault", slug: "literary-theory-gender-queer" }
    ]
  },
  {
    slug: "race-empire-and-nation",
    name: "Race, empire and nation",
    summary:
      "Empire, the writing it produced and the writing that answered back — and how a nation and a race get imagined.",
    image: "",
    alt: "",
    chapters: [
      { title: "Postcolonial Theory", people: "Fanon · Said · Spivak · Bhabha · Ngũgĩ · Ashcroft, Griffiths and Tiffin", slug: "literary-theory-postcolonial" },
      { title: "Subaltern Studies and Indian Postcolonial Thought", people: "Guha · Chatterjee · Chakrabarty · Ahmad", slug: "literary-theory-subaltern-studies" },
      { title: "Race and Africana Theory", people: "Du Bois · Négritude · Gates · Black Arts · Critical Race Theory", slug: "literary-theory-race-africana" }
    ]
  },
  {
    slug: "postmodern-and-contemporary",
    name: "Postmodern and contemporary",
    summary:
      "The theory of our own time: after the grand stories, and out past the human being and the single language.",
    image: "",
    alt: "",
    chapters: [
      { title: "Modernity to Postmodernism", people: "Lyotard · Baudrillard · Jameson · Hutcheon", slug: "literary-theory-postmodernism" },
      { title: "Ecocriticism and Environmental Humanities", people: "", slug: "literary-theory-ecocriticism" },
      { title: "Posthumanism, Animal Studies and Cyberculture", people: "Haraway · Hayles", slug: "literary-theory-posthumanism" },
      { title: "Trauma and Memory Studies", people: "Caruth · LaCapra · Hirsch", slug: "literary-theory-trauma-memory" },
      { title: "Translation Studies and World Literature", people: "Venuti · Bassnett · Moretti · Casanova · Damrosch", slug: "literary-theory-translation-world-literature" },
      { title: "Newer Directions: Disability Studies, Affect Theory, Digital Humanities", people: "", slug: "literary-theory-newer-directions" }
    ]
  }
];

const BASE = "/literary-criticism/literary-theory/";

// Ek hi jagah: part card aur chapter card, dono ki tasveer isi se banti hai.
function pic(image, alt) {
  if (!image) return null;
  return {
    src: "/assets/literary-theory/" + image + ".webp",
    small: "/assets/literary-theory/" + image + "-240.webp",
    alt: alt || ""
  };
}

let counter = 0;

module.exports = parts.map(function (p, i) {
  const prev = parts[i - 1];
  const next = parts[i + 1];
  return Object.assign({}, p, {
    number: i + 1,
    href: BASE + p.slug + "/",
    count: p.chapters.length,
    // Chapter cards: har chapter ka apna picture rasta (ya null -> numbered panel).
    chapters: p.chapters.map(function (c) {
      counter += 1;
      return Object.assign({}, c, { n: counter, picture: pic(c.image, c.alt) });
    }),
    // Kitne chapter likhe ja chuke hain — abhi sab 0, sab "Coming soon".
    liveCount: p.chapters.filter(function (c) { return c.live; }).length,
    // Tasveer di hai to uske do rasta, warna null (card numbered panel dikhayega).
    picture: pic(p.image, p.alt),
    prev: prev ? { name: prev.name, href: BASE + prev.slug + "/", number: i } : null,
    next: next ? { name: next.name, href: BASE + next.slug + "/", number: i + 2 } : null
  });
});
