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
// `slug` = us chapter ka article kahan rahega: /notes/<slug>/. Jab tak article
// nahi aata, card "Coming soon" dikhata hai. Article jodne par `live: true`
// kar dena; card khud link ban jayega. Slug tab tak badla ja sakta hai.
//
// PICTURE: do jagah tasveer lag sakti hai — har part ke card par
// (/literary-criticism/) aur har chapter ke card par (part ka page). `image`
// khaali ho to card par numbered panel dikhta hai. Tasveer lagane ke liye:
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
    image: "form-language-and-structure",
    alt: "Painted interpretation of a book opening into a diagram of linked signs and shapes.",
    chapters: [
      {
        title: "Introduction to Literary Theory",
        people: "",
        slug: "literary-theory-introduction",
        live: true,
        image: "literary-theory-introduction",
        alt: "Painted interpretation of coloured lenses revealing different patterns on the pages of a book."
      },
      {
        title: "Russian Formalism and the Prague Circle",
        people: "Shklovsky · Jakobson · Propp · Tynianov · Mukařovský",
        slug: "russian-formalism-new-criticism",
        live: true,
        image: "literary-theory-russian-formalism",
        alt: "Painted interpretation of an ordinary teapot redrawn in sharp geometric shapes."
      },
      {
        title: "Saussure and Structural Linguistics",
        people: "",
        slug: "literary-theory-saussure",
        live: true,
        image: "literary-theory-saussure",
        alt: "Painted interpretation of a sound wave paired with the image of a tree."
      },
      {
        title: "Structuralism",
        people: "Lévi-Strauss · Barthes · Todorov · Greimas",
        slug: "structuralism",
        live: true,
        image: "literary-theory-structuralism",
        alt: "Painted interpretation of different story symbols arranged in a shared pattern."
      },
      {
        title: "Narratology",
        people: "Genette · Bal · Prince · Chatman",
        slug: "literary-theory-narratology",
        image: "literary-theory-narratology",
        alt: "Painted interpretation of a ribbon linking three scenes from a traveller's story."
      },
      {
        title: "Semiotics",
        people: "Peirce · Eco · Barthes",
        slug: "literary-theory-semiotics",
        image: "literary-theory-semiotics",
        alt: "Painted interpretation of a bird symbol, bird tracks and a trail sign."
      },
      {
        title: "Bakhtin and Dialogism",
        people: "",
        slug: "literary-theory-bakhtin",
        image: "literary-theory-bakhtin",
        alt: "Painted interpretation of different voices meeting in ribbons above an open book."
      }
    ]
  },
  {
    slug: "reader-and-meaning",
    name: "Reader and meaning",
    summary:
      "Theory turns to the person holding the book, and asks how understanding itself happens.",
    image: "reader-and-meaning",
    alt: "Painted interpretation of a reader imagining different landscapes from an open book.",
    chapters: [
      {
        title: "Phenomenology and Hermeneutics",
        people: "Husserl · Heidegger · Gadamer · Ricoeur",
        slug: "literary-theory-phenomenology-hermeneutics",
        image: "literary-theory-phenomenology-hermeneutics",
        alt: "Painted interpretation of a reader surrounded by curving pages."
      },
      {
        title: "Reader-Response and Reception Theory",
        people: "Iser · Jauss · Fish · Rosenblatt · Holland",
        slug: "literary-theory-reader-response",
        image: "literary-theory-reader-response",
        alt: "Painted interpretation of two readers imagining a coastline and a city from the same book."
      }
    ]
  },
  {
    slug: "beyond-structure",
    name: "Beyond structure",
    summary:
      "The same thinkers who built the structures begin to take them apart, and meaning stops standing still.",
    image: "beyond-structure",
    alt: "Painted interpretation of printed pages breaking apart and reappearing in fragments.",
    chapters: [
      {
        title: "Post-structuralism",
        people: "later Barthes · Foucault · Kristeva · Lacan",
        slug: "literary-theory-post-structuralism",
        image: "literary-theory-post-structuralism",
        alt: "Painted interpretation of a red paper ribbon branching out from a geometric grid."
      },
      {
        title: "Deconstruction",
        people: "Derrida · de Man · J. Hillis Miller",
        slug: "literary-theory-deconstruction",
        image: "literary-theory-deconstruction",
        alt: "Painted interpretation of a balance holding printed pages and casting a shadow."
      }
    ]
  },
  {
    slug: "society-history-and-culture",
    name: "Society, history and culture",
    summary:
      "Reading literature as the work of a class, a market and a moment in history.",
    image: "society-history-and-culture",
    alt: "Painted interpretation of pages and records set against a city of factory workers.",
    chapters: [
      {
        title: "Marxist Literary Theory",
        people: "Lukács · Brecht · Gramsci · Althusser · Williams · Eagleton · Jameson",
        slug: "literary-theory-marxist",
        image: "literary-theory-marxist",
        alt: "Painted interpretation of a book in front of factory workers and an overseer's gallery."
      },
      {
        title: "New Historicism and Cultural Materialism",
        people: "Greenblatt · Montrose · Dollimore · Sinfield",
        slug: "literary-theory-new-historicism",
        image: "literary-theory-new-historicism",
        alt: "Painted interpretation of a theatre scene with old records and a coin in front."
      }
    ]
  },
  {
    slug: "mind-and-myth",
    name: "Mind and myth",
    summary:
      "What literature owes to the unconscious, and the old story patterns that keep returning in new books.",
    image: "mind-and-myth",
    alt: "Painted interpretation of a maze and a night sky inside a person's silhouette.",
    chapters: [
      {
        title: "Psychoanalytic Criticism",
        people: "Freud · Jung · Lacan · Klein · Bloom",
        slug: "literary-theory-psychoanalytic",
        image: "literary-theory-psychoanalytic",
        alt: "Painted interpretation of a door and a key inside the submerged part of an iceberg."
      },
      {
        title: "Myth and Archetypal Criticism",
        people: "Frazer · Jung · Frye · Campbell",
        slug: "literary-theory-myth-archetypal",
        image: "literary-theory-myth-archetypal",
        alt: "Painted interpretation of a traveller with a lantern at the entrance to a winding path."
      }
    ]
  },
  {
    slug: "gender-and-sexuality",
    name: "Gender and sexuality",
    summary:
      "From asking where the women writers went to asking what gender itself is, and who was left out of the first answers.",
    image: "gender-and-sexuality",
    alt: "Painted interpretation of writers and readers sharing their views around a table.",
    chapters: [
      {
        title: "Feminist Theory I: from early feminism to Anglo-American feminist criticism",
        people: "Woolf · Beauvoir · Millett · Showalter · Gilbert and Gubar",
        slug: "literary-theory-feminism-anglo-american",
        image: "literary-theory-feminism-anglo-american",
        alt: "Painted interpretation of a woman writing at a desk and another browsing books."
      },
      {
        title: "Feminist Theory II: French Feminism",
        people: "Cixous · Irigaray · Kristeva",
        slug: "literary-theory-french-feminism",
        image: "literary-theory-french-feminism",
        alt: "Painted interpretation of a pen sending ribbons of coloured ink across a notebook."
      },
      {
        title: "Black, Third-World and Intersectional Feminism",
        people: "hooks · Walker · Mohanty · Crenshaw",
        slug: "literary-theory-intersectional-feminism",
        image: "literary-theory-intersectional-feminism",
        alt: "Painted interpretation of three women bringing different pieces of patterned cloth together."
      },
      {
        title: "Gender and Queer Theory",
        people: "Rubin · Butler · Sedgwick · Foucault",
        slug: "literary-theory-gender-queer",
        image: "literary-theory-gender-queer",
        alt: "Painted interpretation of people exploring different styles of dress in a costume workshop."
      }
    ]
  },
  {
    // slug purana hi rakha (URL na tute); naam 2026-11-25 ko owner ke kehne par badla.
    slug: "race-empire-and-nation",
    name: "Empire, race and postcolonial thought",
    summary:
      "Empire, the writing it produced and the writing that answered back — and how a nation and a race get imagined.",
    image: "race-empire-and-nation",
    alt: "Painted interpretation of a hand writing over an old map beside a sailing ship.",
    chapters: [
      {
        title: "Postcolonial Theory",
        people: "Fanon · Said · Spivak · Bhabha · Ngũgĩ · Ashcroft, Griffiths and Tiffin",
        slug: "literary-theory-postcolonial",
        image: "literary-theory-postcolonial",
        alt: "Painted interpretation of a printmaker lifting a page beside a colonial coat of arms."
      },
      {
        title: "Subaltern Studies and Indian Postcolonial Thought",
        people: "Guha · Chatterjee · Chakrabarty · Ahmad",
        slug: "literary-theory-subaltern-studies",
        image: "literary-theory-subaltern-studies",
        alt: "Painted interpretation of people sharing their stories with a note-taker in a courtyard."
      },
      {
        title: "Race and Africana Theory",
        people: "Du Bois · Négritude · Gates · Black Arts · Critical Race Theory",
        slug: "literary-theory-race-africana",
        image: "literary-theory-race-africana",
        alt: "Painted interpretation of a Black writer working with printed pages beside a city window."
      }
    ]
  },
  {
    slug: "postmodern-and-contemporary",
    name: "Postmodern and contemporary",
    summary:
      "The theory of our own time: after the grand stories, and out past the human being and the single language.",
    image: "postmodern-and-contemporary",
    alt: "Painted collage of a fragmented book, digital pixels, city buildings and a green plant.",
    chapters: [
      {
        title: "Modernity to Postmodernism",
        people: "Lyotard · Baudrillard · Jameson · Hutcheon",
        slug: "literary-theory-postmodernism",
        image: "literary-theory-postmodernism",
        alt: "Painted interpretation of a modernist building beside a collage of city lights and signs."
      },
      {
        title: "Ecocriticism and Environmental Humanities",
        people: "",
        slug: "literary-theory-ecocriticism",
        image: "literary-theory-ecocriticism",
        alt: "Painted interpretation of a river crossing an open book between a woodland and an industrial bank."
      },
      {
        title: "Posthumanism, Animal Studies and Cyberculture",
        people: "Haraway · Hayles",
        slug: "literary-theory-posthumanism",
        image: "literary-theory-posthumanism",
        alt: "Painted interpretation of a human hand and a bird linked by glowing circuits."
      },
      {
        title: "Trauma and Memory Studies",
        people: "Caruth · LaCapra · Hirsch",
        slug: "literary-theory-trauma-memory",
        image: "literary-theory-trauma-memory",
        alt: "Painted interpretation of hands putting the pieces of a faded family photograph together."
      },
      {
        title: "Translation Studies and World Literature",
        people: "Venuti · Bassnett · Moretti · Casanova · Damrosch",
        slug: "literary-theory-translation-world-literature",
        image: "literary-theory-translation-world-literature",
        alt: "Painted interpretation of a book passed above a globe and an arc of folded paper birds."
      },
      {
        title: "Newer Directions: Disability Studies, Affect Theory, Digital Humanities",
        people: "",
        slug: "literary-theory-newer-directions",
        image: "literary-theory-newer-directions",
        alt: "Painted interpretation of fingers reading Braille beside a grid of digital documents."
      }
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
    // Kitne chapter likhe ja chuke hain.
    liveCount: p.chapters.filter(function (c) { return c.live; }).length,
    // Tasveer di hai to uske do rasta, warna null (card numbered panel dikhayega).
    picture: pic(p.image, p.alt),
    prev: prev ? { name: prev.name, href: BASE + prev.slug + "/", number: i } : null,
    next: next ? { name: next.name, href: BASE + next.slug + "/", number: i + 2 } : null
  });
});
