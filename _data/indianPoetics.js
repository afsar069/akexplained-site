// Indian Poetics series (owner, 2026-11-25: "find out Indian poetics chapters and subchapters
// according to the NET syllabus and add it there"). Cultural Studies / Literary Theory jaisa hi
// dhancha: parts, har part ke chapters, har chapter ke subchapters (`sub`), aur ek hi registry se
// hub ke cards, part pages aur sitemap.
//
// NET KYA KEHTA HAI (verify, 2026-11-25): UGC NET Bureau ka asli English syllabus (code 30)
// sirf unit ke title deta hai. Unit VIII "Literary Criticism" ke neeche "Indian poetics" ka
// naam hi nahi hai. Sirf ek coaching site (limitlessliterature.com) apni list me likhti hai:
// "Indian aesthetics: rasa, dhvani, alankara, vakrokti, auchitya and their theorists". Isliye
// "NET syllabus ke according" ka koi official breakdown nahi hai.
//
// ASLI AADHAR (authentic): UGC ke ePG Pathshala (INFLIBNET) ka English course
// "Indian Literary Criticism and Theory" (34 modules) aur dusra course "Indian aesthetics and fine
// arts" (Kavyaprakasha / Sahityadarpana, Rasasutra ki vyakhyayein, Dasharupaka). Chapter aur
// subchapter unhi modules ke apne sections se hain. Yahan sirf NET se jude classical / Sanskrit
// poetics wale chapter hain; medieval aur modern modules docs/indian-poetics-scope.md me "mile
// par jode nahi" ki list me hain. Har chapter ka source wahin likha hai.
//
// Hamare master taxonomy me Indian Poetics ke nodes pehle se hain (owner-approved): bharata-muni,
// natyashastra, rasa, bhamaha, dandin, vamana, anandavardhana, dhvani, abhinavagupta, kuntaka,
// vakrokti, kshemendra, aucitya, mammata, vishwanatha, bhartrhari, sphota, alankara ...
//
// `people` me sirf wahi naam / kitaabein hain jo in sources me aate hain (rule 2).
// `sub` = chapter ke andar ke subchapters; card par chhoti list ban kar dikhte hain. Simple English.
// `n` yahan typed nahi hota: upar se neeche 1, 2, 3 ... khud banta hai.
// `slug` = article ka pata /notes/<slug>/. Abhi koi article nahi, isliye sab `live: false`
// (Coming soon). Article aane par us chapter ko `live: true` karo.
// PICTURE: `assets/indian-poetics/<naam>.webp` (480 x 300, 200 KB se kam) + `<naam>-240.webp`
// (240 x 150), phir `image` aur `alt`.

const parts = [
  {
    slug: "drama-rasa-and-the-schools",
    name: "Drama, rasa and the schools",
    summary:
      "Bharata's treatise on drama, the oldest text of the tradition that has come down to us, the ten types of Sanskrit play, and the theory of rasa and how later thinkers read it.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Introduction to Indian Poetics",
        people: "",
        slug: "indian-poetics-introduction",
        sub: [
          "Sanskrit poetics",
          "The eight schools: Alamkara, Rasa, Riti, Guna, Dhvani, Vakrokti, Anumana and Aucitya",
          "Tamil poetics",
          "Persian, bhasha and modern Indian thought"
        ]
      },
      {
        title: "Bharata and the Natyashastra",
        people: "Bharata · Abhinavagupta's <i>Abhinavabharati</i>",
        slug: "indian-poetics-natyashastra",
        sub: [
          "The Natyashastra: date, chapters and commentaries",
          "The origin of drama (Natyotpatti)",
          "The theatre (Natyamandapa)",
          "Abhinaya: the art of expression",
          "Itivritta: plot and its development"
        ]
      },
      {
        title: "The Ten Types of Sanskrit Drama",
        people: "Bharata · Dhananjaya's <i>Dasharupaka</i>",
        slug: "indian-poetics-ten-types-of-drama",
        sub: [
          "The ten types: Nataka, Prakarana, Bhana, Prahasana, Dima, Vyayoga, Samavakara, Anka, Ihamriga and Vithi",
          "Nataka, the principal type",
          "The theme, hero, number of acts and chief sentiment of each type",
          "Dhananjaya's Dasharupaka"
        ]
      },
      {
        title: "Rasa: Bharata's Theory",
        people: "Bharata",
        slug: "indian-poetics-rasa",
        sub: [
          "Vibhava, anubhava and vyabhicharibhava",
          "Sthayibhava and the eight rasas",
          "The sub-divisions of the rasas",
          "Four main rasas and four that depend on them",
          "Shanta, the ninth rasa"
        ]
      },
      {
        title: "Interpretations of the Rasa Sutra",
        people: "Bhatta Lollata · Sri Shankuka · Bhatta Nayaka · Abhinavagupta",
        slug: "indian-poetics-rasa-sutra",
        sub: [
          "Bhatta Lollata: utpattivada (production)",
          "Sri Shankuka: anumitivada (inference)",
          "Bhatta Nayaka: bhuktivada (enjoyment)",
          "Abhinavagupta: abhivyaktivada (suggestion and revelation)"
        ]
      }
    ]
  },
  {
    slug: "alankara-guna-and-riti",
    name: "Alankara, guna and riti",
    summary:
      "The early schools that looked for what makes poetry beautiful in figures of speech, in qualities of style and in the manner of writing.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Bhamaha and the Kavyalankara",
        people: "Bhamaha · Udbhata",
        slug: "indian-poetics-bhamaha",
        sub: [
          "The structure of the Kavyalankara",
          "Rasa in Bhamaha",
          "Guna and riti in Bhamaha",
          "Dosa (defects) in Bhamaha",
          "Udbhata's commentary on Bhamaha",
          "Criticism of Bhamaha's theory"
        ]
      },
      {
        title: "Dandin and the Kavyadarsha",
        people: "Dandin",
        slug: "indian-poetics-dandin",
        sub: [
          "The purposes and sources of poetry",
          "The definition and kinds of kavya, including the mahakavya",
          "Marga (Vaidarbha and Gauda) and the ten gunas",
          "Alankara, including figures of sound and riddles",
          "Dosa (defects)"
        ]
      },
      {
        title: "Vamana and the Riti School",
        people: "Vamana",
        slug: "indian-poetics-vamana",
        sub: [
          "Vamana's contribution",
          "Riti as the soul of poetry",
          "Vaidarbhi, Gaudi and Panchali",
          "The ten gunas",
          "Why the riti school did not last"
        ]
      },
      {
        title: "Rajashekhara and the Kavyamimamsa",
        people: "Rajashekhara",
        slug: "indian-poetics-rajashekhara",
        sub: [
          "A short life of Rajashekhara",
          "The Kavyamimamsa",
          "The Kavyapurusha (the Poet-Person) and the critics"
        ]
      }
    ]
  },
  {
    slug: "dhvani-vakrokti-and-auchitya",
    name: "Dhvani, vakrokti and auchitya",
    summary:
      "The schools that asked what makes poetry poetry: suggestion, oblique expression and propriety, and how Abhinavagupta joined rasa and dhvani.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Anandavardhana and the Dhvanyaloka",
        people: "Anandavardhana",
        slug: "indian-poetics-anandavardhana",
        sub: [
          "The four udyotas of the Dhvanyaloka",
          "Dhvani as the soul of poetry",
          "Suggested meaning: vastu, alankara and rasa",
          "The two kinds of dhvani: avivakshitavachya and vivakshitanyaparavachya",
          "Answering those who deny dhvani",
          "Kinds of poetry"
        ]
      },
      {
        title: "Abhinavagupta and the Abhinavabharati",
        people: "Abhinavagupta",
        slug: "indian-poetics-abhinavagupta",
        sub: [
          "The Locana, his commentary on the Dhvanyaloka",
          "Abhinavagupta's contribution to rasa theory: the ninth rasa",
          "How rasa is realised, and the sahridaya (the sensitive reader)",
          "Obstacles to the realisation of rasa",
          "Guna and riti in Abhinavagupta",
          "How he differs from other critics"
        ]
      },
      {
        title: "Kuntaka and the Vakroktijivita",
        people: "Kuntaka",
        slug: "indian-poetics-kuntaka",
        sub: [
          "The history of vakrokti",
          "What is vakrokti?",
          "Kuntaka's idea of sahitya",
          "Marga (riti) and guna",
          "The six kinds of vakrata, from sound to the whole composition"
        ]
      },
      {
        title: "Kshemendra and the Auchityavicharacharcha",
        people: "Kshemendra",
        slug: "indian-poetics-kshemendra",
        sub: [
          "What earlier critics said about propriety",
          "Kshemendra's life and works",
          "The Auchityavicharacharcha"
        ]
      }
    ]
  },
  {
    slug: "later-systems-and-other-traditions",
    name: "Later systems and other traditions",
    summary:
      "The two great summaries of Sanskrit poetics, Bhartrhari's philosophy of language, and the Tamil poetics of the Tolkappiyam.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Mammata and the Kavyaprakasha",
        people: "Mammata",
        slug: "indian-poetics-mammata",
        sub: [
          "The purpose of poetry",
          "The causes of poetry: pratibha, vyutpatti and abhyasa",
          "The definition of kavya",
          "Kinds of poetry by the place of suggestion",
          "Word and meaning: abhidha, lakshana and vyanjana",
          "Dosa, guna and alankara",
          "Rasa and its four interpretations"
        ]
      },
      {
        title: "Vishwanatha and the Sahityadarpana",
        people: "Vishwanatha Kaviraja",
        slug: "indian-poetics-vishwanatha",
        sub: [
          "The author and his title Kaviraja",
          "The text and its ten chapters",
          "\"A sentence with rasa as its soul is kavya\"",
          "Poetry and drama in one treatise",
          "Criticism of the Sahityadarpana"
        ]
      },
      {
        title: "Bhartrhari and the Vakyapadiya",
        people: "Bhartrhari",
        slug: "indian-poetics-bhartrhari",
        sub: [
          "Shabdabrahman",
          "The theory of sphota",
          "The three kandas: Brahma, Vakya and Prakirnaka"
        ]
      },
      {
        title: "Tolkappiyam and Tamil Poetics",
        people: "Tolkappiyar",
        slug: "indian-poetics-tolkappiyam",
        sub: [
          "The Tolkappiyam and Sangam literature",
          "Akam and Puram",
          "The four aims of Sangam poetry: righteousness, worldly success, pleasure and release"
        ]
      }
    ]
  }
];

const BASE = "/literary-criticism/indian-poetics/";

// Part card aur chapter card, dono ki tasveer isi se banti hai.
function pic(image, alt) {
  if (!image) return null;
  return {
    src: "/assets/indian-poetics/" + image + ".webp",
    small: "/assets/indian-poetics/" + image + "-240.webp",
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
    chapters: p.chapters.map(function (c) {
      counter += 1;
      return Object.assign({}, c, { n: counter, picture: pic(c.image, c.alt) });
    }),
    liveCount: p.chapters.filter(function (c) { return c.live; }).length,
    picture: pic(p.image, p.alt),
    prev: prev ? { name: prev.name, href: BASE + prev.slug + "/", number: i } : null,
    next: next ? { name: next.name, href: BASE + next.slug + "/", number: i + 2 } : null
  });
});
