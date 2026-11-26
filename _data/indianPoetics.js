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
// poetics wale chapter pehle jude; 2026-11-25 ko owner ne kaha "yes, jodlen hai", to ePG ke
// medieval aur modern modules (Part 5 se 7) aur Sanskrit dramatists ka chapter bhi jude. Har chapter
// ka source docs/indian-poetics-scope.md me likha hai.
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

// Chapter ka card khulna uske article ki file se tay hota hai (tools/article-live.js).
// Article publish hote hi card khud link ban jata hai — koi `live: true` haath se nahi likhna.
const { resolveChapter } = require("../tools/article-live.js");

const parts = [
  {
    slug: "drama-rasa-and-the-schools",
    name: "Drama, rasa and the schools",
    summary:
      "Bharata's treatise on drama, the oldest text of the tradition that has come down to us, the ten types of Sanskrit play, the great Sanskrit dramatists, and the theory of rasa and how later thinkers read it.",
    image: "drama-rasa-and-the-schools",
    alt: "Painted interpretation of an Indian theatre performer expressing an emotion with a hand gesture.",
    chapters: [
      {
        title: "Introduction to Indian Poetics",
        people: "",
        slug: "indian-poetics-introduction",
        image: "indian-poetics-introduction",
        alt: "Painted interpretation of a fan of palm leaves, a ring of coloured petals and a small lamp.",
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
        image: "indian-poetics-natyashastra",
        alt: "Painted interpretation of a theatre performer making a hand gesture beside a sketch of the stage.",
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
        image: "indian-poetics-ten-types-of-drama",
        alt: "Painted interpretation of miniature stage designs spread across an open folio.",
        sub: [
          "The ten types: Nataka, Prakarana, Bhana, Prahasana, Dima, Vyayoga, Samavakara, Anka, Ihamriga and Vithi",
          "Nataka, the principal type",
          "The theme, hero, number of acts and chief sentiment of each type",
          "Dhananjaya's Dasharupaka"
        ]
      },
      {
        title: "Sanskrit Dramatists: Bhasa, Kalidasa and Bhavabhuti",
        people: "Bhasa · Kalidasa · Bhavabhuti",
        slug: "indian-poetics-sanskrit-dramatists",
        image: "indian-poetics-sanskrit-dramatists",
        alt: "Painted interpretation of a woman and a deer in a forest scene framed by a theatre curtain.",
        sub: [
          "Bhasa and his plays",
          "Kalidasa and the Abhijnanasakuntalam",
          "Bhavabhuti and the Uttararamacharita",
          "Other Sanskrit dramatists"
        ]
      },
      {
        title: "Rasa: Bharata's Theory",
        people: "Bharata",
        slug: "indian-poetics-rasa",
        image: "indian-poetics-rasa",
        alt: "Painted interpretation of three faces showing joy, sorrow and surprise.",
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
        image: "indian-poetics-rasa-sutra",
        alt: "Painted interpretation of four people discussing an illustrated theatre manuscript.",
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
    image: "alankara-guna-and-riti",
    alt: "Painted interpretation of gold vines curling out of the lines of a palm-leaf poem.",
    chapters: [
      {
        title: "Bhamaha and the Kavyalankara",
        people: "Bhamaha · Udbhata",
        slug: "indian-poetics-bhamaha",
        image: "indian-poetics-bhamaha",
        alt: "Painted interpretation of gold leaves and a jewel decorating a palm-leaf poem.",
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
        image: "indian-poetics-dandin",
        alt: "Painted interpretation of a bronze mirror reflecting patterned lines of verse.",
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
        image: "indian-poetics-vamana",
        alt: "Painted interpretation of three different brushstrokes leading to a fan of palm leaves.",
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
        image: "indian-poetics-rajashekhara",
        alt: "Painted interpretation of a human figure made of patterned leaves rising from a manuscript.",
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
    image: "dhvani-vakrokti-and-auchitya",
    alt: "Painted interpretation of a bronze bell and widening ripples beside a palm-leaf manuscript.",
    chapters: [
      {
        title: "Anandavardhana and the Dhvanyaloka",
        people: "Anandavardhana",
        slug: "indian-poetics-anandavardhana",
        image: "indian-poetics-anandavardhana",
        alt: "Painted interpretation of a peacock shape formed by the shadows of leaves on a page.",
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
        image: "indian-poetics-abhinavagupta",
        alt: "Painted interpretation of a spectator watching a softly lit dance performance.",
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
        image: "indian-poetics-kuntaka",
        alt: "Painted interpretation of a red ink line curling into a flowering vine above straight lines of verse.",
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
        image: "indian-poetics-kshemendra",
        alt: "Painted interpretation of a miniature painter adding a moon to a night scene.",
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
    image: "later-systems-and-other-traditions",
    alt: "Painted interpretation of two palm-leaf manuscripts laid side by side beside a lamp.",
    chapters: [
      {
        title: "Mammata and the Kavyaprakasha",
        people: "Mammata",
        slug: "indian-poetics-mammata",
        image: "indian-poetics-mammata",
        alt: "Painted interpretation of three coloured threads tied around a bundle of manuscripts beside a lamp.",
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
        image: "indian-poetics-vishwanatha",
        alt: "Painted interpretation of a round mirror reflecting a stage performer above an open palm-leaf manuscript.",
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
        image: "indian-poetics-bhartrhari",
        alt: "Painted interpretation of scattered gold brush marks coming together as a lotus.",
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
        image: "indian-poetics-tolkappiyam",
        alt: "Painted interpretation of a palm-leaf manuscript with a quiet meeting and a distant procession.",
        sub: [
          "The Tolkappiyam and Sangam literature",
          "Akam and Puram",
          "The four aims of Sangam poetry: righteousness, worldly success, pleasure and release"
        ]
      }
    ]
  },
  {
    slug: "medieval-indian-thought",
    name: "Medieval Indian thought",
    summary:
      "Bhakti, Persian and Hindi thinking about poetry, from Jnanesvara to Keshavadasa, and Al-Badaoni on writing history.",
    image: "medieval-indian-thought",
    alt: "Painted interpretation of a Bhakti singer and a scribe with a manuscript in a courtyard.",
    chapters: [
      {
        title: "Jnanesvara and Indian Poetics",
        people: "Jnanesvara",
        slug: "indian-poetics-jnanesvara",
        image: "indian-poetics-jnanesvara",
        alt: "Painted interpretation of a scribe writing by a river in the early morning.",
        sub: [
          "Life and time of Jnanesvara",
          "Major works: Jnanesvari, Amritanubhava, Changadeva-Pasashthi, Haripatha and the abhangas",
          "His philosophy: the world as the expression of divine love and joy",
          "Bhakti, and how his view differs from other thinkers'",
          "Jnanesvara's contribution"
        ]
      },
      {
        title: "Bhakti Rasa",
        people: "Rupa Goswami",
        slug: "indian-poetics-bhakti-rasa",
        image: "indian-poetics-bhakti-rasa",
        alt: "Painted interpretation of singers keeping time with cymbals and a hand drum around a lamp.",
        sub: [
          "The bhakti movement and Indian literature",
          "Six characteristics of bhakti poetry (after Andrew Schelling)",
          "Rupa Goswami and bhakti rasa"
        ]
      },
      {
        title: "Amir Khusrau and Indian Poetics",
        people: "Amir Khusrau",
        slug: "indian-poetics-amir-khusrau",
        image: "indian-poetics-amir-khusrau",
        alt: "Painted interpretation of an open folio beside a lute and hand drum in an arched room.",
        sub: [
          "Poetry and music in Persian and Hindi",
          "The Nuh Siphir and its significance",
          "His other works: poems, masnavis and historical writings"
        ]
      },
      {
        title: "Keshavadasa and the Rasikpriya",
        people: "Keshavadasa",
        slug: "indian-poetics-keshavadasa",
        image: "indian-poetics-keshavadasa",
        alt: "Painted interpretation of three women in different moods framed by painted arches.",
        sub: [
          "The periods of Hindi literature: Adikaal, Bhaktikaal, Ritikaal and Adhunik kaal",
          "Keshavadasa and his major works",
          "The Rasikpriya and the states of the heroine",
          "The Kavipriya"
        ]
      },
      {
        title: "Al-Badaoni and Literary Historiography",
        people: "Al-Badaoni",
        slug: "indian-poetics-al-badaoni",
        image: "indian-poetics-al-badaoni",
        alt: "Painted interpretation of a scholar comparing two chronicles in an archive.",
        sub: [
          "Al-Badaoni and his work",
          "Badaoni's idea of history",
          "Tarikh and Al-Badaoni"
        ]
      }
    ]
  },
  {
    slug: "modern-indian-aesthetics",
    name: "Modern Indian aesthetics",
    summary:
      "Poets, novelists and thinkers, from Ghalib to Suresh Joshi, who reshaped Indian ideas of beauty, art and criticism.",
    image: "modern-indian-aesthetics",
    alt: "Painted interpretation of a writer's desk with an open manuscript, ink and printed books.",
    chapters: [
      {
        title: "Ghalib and His Poetic Thought",
        people: "Ghalib",
        slug: "indian-poetics-ghalib",
        image: "indian-poetics-ghalib",
        alt: "Painted interpretation of a letter, a verse manuscript and an inkwell overlooking city rooftops.",
        sub: [
          "Ghalib and Urdu literature",
          "Ghalib and the ghazal",
          "Ghalib and religion",
          "Ghalib's letters",
          "Ghalib as a modern poet"
        ]
      },
      {
        title: "Bankimchandra Chattopadhyay's Aesthetics",
        people: "Bankimchandra Chattopadhyay",
        slug: "indian-poetics-bankimchandra",
        image: "indian-poetics-bankimchandra",
        alt: "Painted interpretation of a hand printing press and a bound novel beside a window overlooking a river.",
        sub: [
          "Bengal in Bankim's time",
          "Knowledge, colony and civilisation",
          "The aesthetics of nationalism",
          "The aesthetics of the historical novel",
          "His thought on translation",
          "Bankim and literary criticism",
          "Bankim's concept of beauty"
        ]
      },
      {
        title: "Rabindranath Tagore and Indian Aesthetics",
        people: "Tagore",
        slug: "indian-poetics-tagore",
        image: "indian-poetics-tagore",
        alt: "Painted interpretation of an art class looking at a painting under a tree.",
        sub: [
          "Life and works of Tagore",
          "Art and aesthetics",
          "Tagore's writings on art and aesthetics",
          "Tagore on beauty"
        ]
      },
      {
        title: "Sri Aurobindo and Indian Aesthetics",
        people: "Sri Aurobindo",
        slug: "indian-poetics-aurobindo",
        image: "indian-poetics-aurobindo",
        alt: "Painted interpretation of gold ripples rising from the lines of an open poem.",
        sub: [
          "A short life and the literary works",
          "Aurobindo's poetic thought",
          "The concept of mantra",
          "Rhythm and movement",
          "Style and substance",
          "The essence and the ideal spirit of poetry"
        ]
      },
      {
        title: "Ananda Coomaraswamy and Indian Poetics",
        people: "Ananda Coomaraswamy",
        slug: "indian-poetics-coomaraswamy",
        image: "indian-poetics-coomaraswamy",
        alt: "Painted interpretation of an artisan carving a floral design into stone.",
        sub: [
          "Major influences",
          "Coomaraswamy's conception of art",
          "His conception of the artist",
          "His conception of beauty",
          "Traditional aesthetics"
        ]
      },
      {
        title: "Jainendra Kumar and Indian Poetics",
        people: "Jainendra Kumar",
        slug: "indian-poetics-jainendra-kumar",
        image: "indian-poetics-jainendra-kumar",
        alt: "Painted interpretation of a woman holding a letter and looking out of a window.",
        sub: [
          "A background of Hindi literature: vir-gathas, bhakti, riti and the modern period",
          "Jainendra Kumar: an introduction",
          "His novels: Sunita, Tyagpatra and Kalyani"
        ]
      },
      {
        title: "Suresh Joshi and Indian Poetics",
        people: "Suresh Joshi",
        slug: "indian-poetics-suresh-joshi",
        image: "indian-poetics-suresh-joshi",
        alt: "Painted interpretation of hands comparing pages beneath a sheet that reveals a pattern.",
        sub: [
          "A history of Gujarati literature",
          "Early life and works",
          "Joshi as a critic",
          "His theory of interpretation",
          "Aesthetic enjoyment and interpretation"
        ]
      }
    ]
  },
  {
    slug: "nativism-the-margins-and-the-contemporary",
    name: "Nativism, the margins and the contemporary",
    summary:
      "Challenges to the old canon: nativism, the Hungry Generation, folk and tribal art and Dalit aesthetics, and what Indian poetics means today.",
    image: "nativism-the-margins-and-the-contemporary",
    alt: "Painted interpretation of a poet reading to listeners beside a folk art mural.",
    chapters: [
      {
        title: "Bhalchandra Nemade and Nativism",
        people: "Bhalchandra Nemade",
        slug: "indian-poetics-nemade",
        image: "indian-poetics-nemade",
        alt: "Painted interpretation of a storyteller speaking to two listeners beside an open notebook.",
        sub: [
          "What is nativism? The birth of the concept",
          "Nemade's nativism: native styles and orality",
          "Modernity, globalisation and nativism",
          "Nemade's works: the Marathi novel and Arun Kolatkar's bilingual poetry",
          "A critique of nativism"
        ]
      },
      {
        title: "The Hungry Generation and Poetics",
        people: "",
        slug: "indian-poetics-hungry-generation",
        image: "indian-poetics-hungry-generation",
        alt: "Painted interpretation of young poets preparing a broadsheet at a small printing press.",
        sub: [
          "Bengali poetry from 1920 to 1950",
          "Modernity and adhunikata",
          "The history of the Hungry Generation",
          "The aims and impact of the Hungryalist movement",
          "The prevailing canons and the Hungryalist canons"
        ]
      },
      {
        title: "Folk and Tribal Aesthetics",
        people: "",
        slug: "indian-poetics-folk-and-tribal",
        image: "indian-poetics-folk-and-tribal",
        alt: "Painted interpretation of an artist painting a patterned bird and a tree.",
        sub: [
          "The folk culture of India",
          "Tribal literature",
          "Folk and tribal art: Kalamkari, Patachitra, Madhubani, Gond and Tanjore",
          "The art of storytelling",
          "Difficulties in folk and tribal aesthetics"
        ]
      },
      {
        title: "Dalit Aesthetics",
        people: "",
        slug: "indian-poetics-dalit-aesthetics",
        image: "indian-poetics-dalit-aesthetics",
        alt: "Painted interpretation of a writer reading from an open book at a community gathering.",
        sub: [
          "Dalit literature",
          "Satyam, shivam and sundaram: truth, goodness and beauty",
          "What is Dalit aesthetics?"
        ]
      },
      {
        title: "Contemporary Indian Poetics",
        people: "C. D. Narasimhaiah · K. R. Srinivasa Iyengar · M. K. Naik · M. Hiriyanna · K. C. Pandey · Krishna Rayan",
        slug: "indian-poetics-contemporary",
        image: "indian-poetics-contemporary",
        alt: "Painted interpretation of palm leaves, printed pages and a tablet linked by coloured strands.",
        sub: [
          "Some critics and their concepts",
          "Traditional Indian poetics in contemporary times",
          "The problems",
          "The response"
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
  const chapters = p.chapters.map(function (c) {
    counter += 1;
    // `live` aur `slug` dono article se aate hain: article us pate par na ho par wahi title
    // kisi aur pate par ho, to card us asli pate par jud jata hai (tools/article-live.js).
    const at = resolveChapter("indianPoetics.js", c);
    return Object.assign({}, c, {
      n: counter,
      live: at.live,
      slug: at.slug,
      picture: pic(c.image, c.alt)
    });
  });
  return Object.assign({}, p, {
    number: i + 1,
    href: BASE + p.slug + "/",
    count: p.chapters.length,
    chapters: chapters,
    liveCount: chapters.filter(function (c) { return c.live; }).length,
    picture: pic(p.image, p.alt),
    prev: prev ? { name: prev.name, href: BASE + prev.slug + "/", number: i } : null,
    next: next ? { name: next.name, href: BASE + next.slug + "/", number: i + 2 } : null
  });
});
