// Key Terms & Concepts series (owner, 2026-11-25: "Key Terms & Concepts wala section bhi isi format me
// banao"). Literary Theory / Cultural Studies / Indian Poetics jaisa hi dhancha: parts, har part ke
// chapters, har chapter ke subchapters (`sub`), aur ek hi registry se hub ke cards, part pages aur sitemap.
//
// NET KYA KEHTA HAI (verify, 2026-11-25): UGC NET Bureau ka asli English syllabus (code 30) sirf unit ke
// title deta hai; usme koi "key terms" ki list nahi hai. Isliye is series ka official NET breakdown
// nahi hai (docs/key-terms-scope.md).
//
// ASLI AADHAR: har subchapter ek term hai, aur har term ka naam owner ke approved master taxonomy se
// hai (supabase/data/taxonomy-master-reference.csv): "Literary Terms and Devices" ke 198 terms aur
// "Literary Criticism and Theory" ke 76 concept nodes, kul 271 (ek "Archetype" dono jagah hai, ek hi
// baar rakha). Koi term bahar se nahi joda gaya, aur taxonomy ka koi term chhoota nahi (script se
// match kiya gaya). Rule 11: "Invent no topics - the owner supplies them."
//
// EDITORIAL HISSA (owner badal sakta hai): parts aur chapters ke naam aur terms ka kaun sa
// chapter me jana, ye grouping hamari hai (taxonomy ke 8 groups aur 76 criticism concepts ko padhne
// me asaan clusters me bandha). Taxonomy ka ek hi "Decorum", "The Sublime" aur "Archetype" criticism
// wale chapters me hai, figures wale me nahi doharaya.
//
// `people` me sirf wahi naam hain jo inhi terms ke taxonomy ke parent-group ya hamare doosre series
// (Literary Theory, Indian Poetics) me pehle se likhe hain; baaki khali (rule 2).
// `sub` = chapter ke andar ke terms; card par chhoti list ban kar dikhte hain. Simple English.
// `n` yahan typed nahi hota: upar se neeche 1, 2, 3 ... khud banta hai.
// `slug` = article ka pata /notes/<slug>/. Abhi koi article nahi, isliye sab `live: false`
// (Coming soon). Article aane par us chapter ko `live: true` karo.
// PICTURE: `assets/key-terms/<naam>.webp` (480 x 300, 200 KB se kam) + `<naam>-240.webp`
// (240 x 150), phir `image` aur `alt`.

const parts = [
  {
    slug: "figures-of-speech",
    name: "Figures of speech",
    summary:
      "Ways of using words beyond their plain meaning: comparison, substitution, exaggeration, contrast, symbol and irony.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Comparing One Thing to Another",
        people: "",
        slug: "key-terms-comparison",
        sub: [
          "Simile",
          "Metaphor",
          "Extended Metaphor",
          "Vehicle and Tenor",
          "Conceit",
          "Personification",
          "Pathetic Fallacy",
          "Transferred Epithet"
        ]
      },
      {
        title: "Substitution and Address",
        people: "",
        slug: "key-terms-substitution",
        sub: [
          "Metonymy",
          "Synecdoche",
          "Apostrophe",
          "Periphrasis",
          "Euphemism"
        ]
      },
      {
        title: "Exaggeration, Understatement and Contrast",
        people: "",
        slug: "key-terms-exaggeration-contrast",
        sub: [
          "Hyperbole",
          "Litotes",
          "Meiosis",
          "Oxymoron",
          "Paradox",
          "Antithesis",
          "Zeugma",
          "Hyperbaton"
        ]
      },
      {
        title: "Symbol, Allegory and Hidden Meaning",
        people: "",
        slug: "key-terms-symbol-allegory",
        sub: [
          "Symbol",
          "Allegory",
          "Allusion",
          "Ambiguity",
          "Synaesthesia"
        ]
      },
      {
        title: "Irony and Wit",
        people: "",
        slug: "key-terms-irony-wit",
        sub: [
          "Irony",
          "Verbal Irony",
          "Situational Irony",
          "Dramatic Irony",
          "Sarcasm",
          "Innuendo",
          "Pun"
        ]
      }
    ]
  },
  {
    slug: "sound-metre-and-rhyme",
    name: "Sound, metre and rhyme",
    summary:
      "How a poem sounds and moves: sound devices, repetition, metre and feet, lines, rhyme and stanzas.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Sound Devices",
        people: "",
        slug: "key-terms-sound-devices",
        sub: [
          "Alliteration",
          "Assonance",
          "Consonance",
          "Sibilance",
          "Onomatopoeia",
          "Cacophony",
          "Euphony"
        ]
      },
      {
        title: "Repetition and Balance",
        people: "",
        slug: "key-terms-repetition",
        sub: [
          "Anaphora",
          "Epistrophe",
          "Chiasmus",
          "Refrain"
        ]
      },
      {
        title: "Metre and the Foot",
        people: "",
        slug: "key-terms-metre-and-feet",
        sub: [
          "Metre",
          "Foot",
          "Scansion",
          "Iamb",
          "Trochee",
          "Spondee",
          "Dactyl",
          "Anapest",
          "Pyrrhic"
        ]
      },
      {
        title: "Lines and Verse Types",
        people: "",
        slug: "key-terms-lines-and-verse",
        sub: [
          "Iambic Pentameter",
          "Blank Verse",
          "Free Verse",
          "Heroic Couplet",
          "Alexandrine",
          "Tetrameter",
          "Hexameter",
          "Caesura",
          "Enjambment",
          "End-stopped Line"
        ]
      },
      {
        title: "Rhyme",
        people: "",
        slug: "key-terms-rhyme",
        sub: [
          "Rhyme",
          "Rhyme Scheme",
          "Internal Rhyme",
          "Half Rhyme (Slant Rhyme)",
          "Eye Rhyme",
          "Feminine Rhyme",
          "Masculine Rhyme"
        ]
      },
      {
        title: "Stanzas",
        people: "",
        slug: "key-terms-stanzas",
        sub: [
          "Stanza",
          "Couplet",
          "Tercet",
          "Quatrain",
          "Ottava Rima",
          "Terza Rima",
          "Rhyme Royal",
          "Spenserian Stanza"
        ]
      }
    ]
  },
  {
    slug: "poetic-forms",
    name: "Poetic forms",
    summary:
      "The named shapes of poetry, from the sonnet and the ode to the epic, the ballad and the haiku.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "The Sonnet and Its Kinds",
        people: "",
        slug: "key-terms-sonnet",
        sub: [
          "Sonnet",
          "Petrarchan Sonnet",
          "Shakespearean Sonnet",
          "Spenserian Sonnet"
        ]
      },
      {
        title: "Songs and Laments: Lyric, Ode, Elegy and Ballad",
        people: "",
        slug: "key-terms-lyric-ode-elegy",
        sub: [
          "Lyric",
          "Ode",
          "Elegy",
          "Dirge",
          "Ballad",
          "Aubade"
        ]
      },
      {
        title: "Epic and Pastoral",
        people: "",
        slug: "key-terms-epic-pastoral",
        sub: [
          "Epic",
          "Mock-epic",
          "Pastoral",
          "Eclogue",
          "Idyll"
        ]
      },
      {
        title: "Fixed and Short Forms",
        people: "",
        slug: "key-terms-fixed-forms",
        sub: [
          "Villanelle",
          "Sestina",
          "Haiku",
          "Limerick",
          "Epigram",
          "Ghazal"
        ]
      },
      {
        title: "Other Poetic Forms",
        people: "",
        slug: "key-terms-other-forms",
        sub: [
          "Acrostic",
          "Concrete Poetry",
          "Dramatic Monologue",
          "Blazon"
        ]
      }
    ]
  },
  {
    slug: "genres-and-modes",
    name: "Genres and modes",
    summary:
      "The kinds of literature: the forms of drama, the kinds of fiction, imaginative modes and life writing.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Drama: Tragedy, Comedy and Their Kinds",
        people: "",
        slug: "key-terms-drama-kinds",
        sub: [
          "Tragedy",
          "Comedy",
          "Tragicomedy",
          "Farce",
          "Melodrama",
          "Comedy of Humours",
          "Absurdist Drama"
        ]
      },
      {
        title: "Fiction: The Novel and Its Kinds",
        people: "",
        slug: "key-terms-fiction-kinds",
        sub: [
          "Novel",
          "Novella",
          "Short Story",
          "Romance",
          "Bildungsroman",
          "Kunstlerroman",
          "Picaresque Novel",
          "Gothic Fiction"
        ]
      },
      {
        title: "Satire, Myth and Imaginative Modes",
        people: "",
        slug: "key-terms-imaginative-modes",
        sub: [
          "Satire",
          "Fable",
          "Parable",
          "Myth",
          "Legend",
          "Utopian Literature",
          "Dystopian Literature",
          "Science Fiction",
          "Magic Realism",
          "Metafiction",
          "Detective Fiction"
        ]
      },
      {
        title: "Life Writing and Prose",
        people: "",
        slug: "key-terms-life-writing",
        sub: [
          "Autobiography",
          "Biography",
          "Memoir",
          "Essay",
          "Travelogue"
        ]
      }
    ]
  },
  {
    slug: "drama-and-narrative",
    name: "Drama and narrative",
    summary:
      "The terms for how a play is built and how a story is told: plot, character, stage conventions, narrators and techniques.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "The Shape of a Play",
        people: "",
        slug: "key-terms-shape-of-a-play",
        sub: [
          "Exposition",
          "Climax",
          "Denouement",
          "Catastrophe",
          "Three-act Structure",
          "Prologue",
          "Epilogue"
        ]
      },
      {
        title: "Characters in Drama",
        people: "",
        slug: "key-terms-drama-characters",
        sub: [
          "Protagonist",
          "Antagonist",
          "Tragic Hero",
          "Tragic Flaw",
          "Foil",
          "Comic Relief",
          "Recognition Scene"
        ]
      },
      {
        title: "Stage Conventions",
        people: "",
        slug: "key-terms-stage-conventions",
        sub: [
          "Soliloquy",
          "Aside",
          "Chorus",
          "Deus ex Machina",
          "Poetic Justice",
          "Alienation Effect (Verfremdungseffekt)",
          "Well-made Play",
          "The Fourth Wall"
        ]
      },
      {
        title: "Plot, Character and Theme in Fiction",
        people: "",
        slug: "key-terms-plot-character-theme",
        sub: [
          "Plot",
          "Subplot",
          "Character",
          "Flat and Round Characters",
          "Theme",
          "Motif",
          "Leitmotif",
          "Setting",
          "Closure"
        ]
      },
      {
        title: "Narrator and Point of View",
        people: "",
        slug: "key-terms-narrator-point-of-view",
        sub: [
          "Point of View",
          "First-person Narration",
          "Third-person Narration",
          "Omniscient Narrator",
          "Unreliable Narrator",
          "Narrative Voice"
        ]
      },
      {
        title: "Narrative Techniques",
        people: "",
        slug: "key-terms-narrative-techniques",
        sub: [
          "Free Indirect Discourse",
          "Interior Monologue",
          "Flashback",
          "Foreshadowing",
          "In Medias Res",
          "Frame Narrative",
          "Verisimilitude"
        ]
      }
    ]
  },
  {
    slug: "rhetoric-and-general-terms",
    name: "Rhetoric and general terms",
    summary:
      "Terms of persuasion, imitation and taste, and the basic words of criticism: canon, genre, trope and palimpsest.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Rhetoric, Wit and Attack",
        people: "",
        slug: "key-terms-rhetoric-wit",
        sub: [
          "Rhetoric",
          "Ethos, Pathos and Logos",
          "Wit",
          "Invective",
          "Lampoon"
        ]
      },
      {
        title: "Parody and Imitation",
        people: "",
        slug: "key-terms-parody-imitation",
        sub: [
          "Bathos",
          "Burlesque",
          "Parody",
          "Pastiche"
        ]
      },
      {
        title: "Aesthetic Categories and Attitudes",
        people: "",
        slug: "key-terms-aesthetic-categories",
        sub: [
          "The Grotesque",
          "The Picturesque",
          "Sentimentalism",
          "Didacticism"
        ]
      },
      {
        title: "Basic Ideas of Criticism",
        people: "",
        slug: "key-terms-basic-ideas",
        sub: [
          "The Literary Canon",
          "Genre",
          "Trope",
          "Palimpsest"
        ]
      }
    ]
  },
  {
    slug: "terms-of-criticism",
    name: "Terms of criticism",
    summary:
      "The key terms of classical, Indian and formalist criticism, from mimesis and catharsis to close reading.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Classical Criticism: Aristotle, Horace and Longinus",
        people: "Aristotle · Horace · Longinus",
        slug: "key-terms-classical",
        sub: [
          "Mimesis",
          "Catharsis",
          "Hamartia",
          "Peripeteia",
          "Anagnorisis",
          "The Three Unities",
          "Hubris",
          "Dulce et Utile",
          "Decorum",
          "The Sublime"
        ]
      },
      {
        title: "Terms of Indian Poetics",
        people: "Bharata Muni · Vamana · Anandavardhana · Abhinavagupta · Kuntaka · Kshemendra · Bhartrhari",
        slug: "key-terms-indian-poetics",
        sub: [
          "Rasa",
          "The Nine Rasas (Navarasa)",
          "Bhava",
          "Riti",
          "Dhvani",
          "Rasa-Dhvani",
          "Shanta Rasa",
          "Vakrokti",
          "Aucitya",
          "Sphota",
          "Alankara"
        ]
      },
      {
        title: "Formalism and New Criticism",
        people: "Shklovsky · Jakobson · Cleanth Brooks · Wimsatt and Beardsley",
        slug: "key-terms-formalism-new-criticism",
        sub: [
          "Defamiliarization (Ostranenie)",
          "The Poetic Function of Language",
          "Fabula and Syuzhet",
          "Literariness",
          "The Heresy of Paraphrase",
          "The Intentional Fallacy",
          "The Affective Fallacy",
          "Close Reading"
        ]
      }
    ]
  },
  {
    slug: "terms-of-modern-theory",
    name: "Terms of modern theory",
    summary:
      "The key terms of structuralism, post-structuralism, psychoanalysis, Marxism, feminism, reader-response, new historicism and postcolonial theory.",
    image: "",
    alt: "",
    chapters: [
      {
        title: "Structuralism and Narratology",
        people: "Saussure · Lévi-Strauss · Genette · Greimas",
        slug: "key-terms-structuralism",
        sub: [
          "Sign, Signifier and Signified",
          "Langue and Parole",
          "Synchrony and Diachrony",
          "Mytheme",
          "Narratology",
          "The Actantial Model",
          "Binary Opposition"
        ]
      },
      {
        title: "Post-structuralism and Deconstruction",
        people: "Derrida · Kristeva",
        slug: "key-terms-post-structuralism",
        sub: [
          "Deconstruction",
          "Differance",
          "Logocentrism",
          "Trace",
          "Aporia",
          "Intertextuality",
          "The Semiotic and the Symbolic"
        ]
      },
      {
        title: "Psychoanalysis and Myth",
        people: "Freud · Jung · Lacan · Joseph Campbell",
        slug: "key-terms-psychoanalysis-myth",
        sub: [
          "The Unconscious",
          "The Oedipus Complex",
          "Id, Ego and Superego",
          "The Collective Unconscious",
          "The Mirror Stage",
          "The Imaginary, Symbolic and Real",
          "Archetype",
          "The Monomyth (Hero's Journey)"
        ]
      },
      {
        title: "Marxism, Culture and Ideology",
        people: "Marx · Gramsci · Althusser · Benjamin · Williams · Hall",
        slug: "key-terms-marxism-culture",
        sub: [
          "Base and Superstructure",
          "Hegemony",
          "Ideology and Interpellation",
          "Aura",
          "Structures of Feeling",
          "Cultural Materialism",
          "Encoding and Decoding"
        ]
      },
      {
        title: "Gender Theory",
        people: "Showalter · Cixous · Butler",
        slug: "key-terms-gender",
        sub: [
          "Gynocriticism",
          "Ecriture Feminine",
          "Gender Performativity",
          "Heteronormativity"
        ]
      },
      {
        title: "Readers, History and Discourse",
        people: "Iser · Jauss · Fish · Greenblatt · Foucault",
        slug: "key-terms-readers-history",
        sub: [
          "The Implied Reader",
          "Horizon of Expectations",
          "Interpretive Communities",
          "Self-Fashioning",
          "Discourse",
          "Power/Knowledge",
          "Episteme"
        ]
      },
      {
        title: "Postcolonial and Postmodern Terms",
        people: "Spivak · Bhabha · Lyotard · Baudrillard · Hutcheon",
        slug: "key-terms-postcolonial-postmodern",
        sub: [
          "The Other",
          "The Subaltern",
          "Hybridity",
          "Mimicry and Ambivalence",
          "The Metanarrative",
          "Hyperreality",
          "Historiographic Metafiction"
        ]
      }
    ]
  }
];

const BASE = "/literary-criticism/key-terms/";

// Part card aur chapter card, dono ki tasveer isi se banti hai.
function pic(image, alt) {
  if (!image) return null;
  return {
    src: "/assets/key-terms/" + image + ".webp",
    small: "/assets/key-terms/" + image + "-240.webp",
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
