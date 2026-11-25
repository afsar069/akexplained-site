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
    image: "figures-of-speech",
    alt: "Painted interpretation of a golden lion taking shape from ink above an open page.",
    chapters: [
      {
        title: "Comparing One Thing to Another",
        people: "",
        slug: "key-terms-comparison",
        image: "key-terms-comparison",
        alt: "Painted interpretation of a sunflower and the sun echoing one another over an open folio.",
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
        image: "key-terms-substitution",
        alt: "Painted interpretation of a seal and rolled message beside the outline of a face.",
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
        image: "key-terms-exaggeration-contrast",
        alt: "Painted interpretation of a large apple and a tiny apple on a balance scale.",
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
        image: "key-terms-symbol-allegory",
        alt: "Painted interpretation of a keyhole-shaped lantern casting the image of a path.",
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
        image: "key-terms-irony-wit",
        alt: "Painted interpretation of a jester holding a smiling mask up to a frowning face.",
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
    image: "sound-metre-and-rhyme",
    alt: "Painted interpretation of sound ripples crossing a pattern of verse lines beside a metronome.",
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
    image: "poetic-forms",
    alt: "Painted interpretation of three manuscripts with different arrangements of verse lines.",
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
    image: "genres-and-modes",
    alt: "Painted interpretation of comedy and tragedy masks beside a novel and a diary.",
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
    image: "drama-and-narrative",
    alt: "Painted interpretation of an actor on stage and scenes sketched in a script in the foreground.",
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
    image: "rhetoric-and-general-terms",
    alt: "Painted interpretation of a speaker addressing an audience from a wooden lectern.",
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
    image: "terms-of-criticism",
    alt: "Painted interpretation of a Greek vase, a palm-leaf manuscript and a marked-up book.",
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
    image: "terms-of-modern-theory",
    alt: "Painted interpretation of a diagram, a human profile and a city rising from an open book.",
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

const fs = require("fs");
const path = require("path");

const BASE = "/literary-criticism/key-terms/";
const ASSETS = "/assets/key-terms/";

// Figures of Speech term thumbnails, kept by name so article URL overrides do not affect them.
const termArtwork = {
  "Simile": { image: "term-simile", alt: "Painted interpretation of a dancer and a feather curving in the same way." },
  "Metaphor": { image: "term-metaphor", alt: "Painted interpretation of a heart carved from stone resting on an open book." },
  "Extended Metaphor": { image: "term-extended-metaphor", alt: "Painted interpretation of a path continuing across two pages, past mountains and a bridge." },
  "Vehicle and Tenor": { image: "term-vehicle-and-tenor", alt: "Painted interpretation of a runner and a cheetah joined by a brushstroke." },
  "Conceit": { image: "term-conceit", alt: "Painted interpretation of a drawing compass spanning two small buildings." },
  "Personification": { image: "term-personification", alt: "Painted interpretation of the wind taking the shape of a face as it blows a leaf." },
  "Pathetic Fallacy": { image: "term-pathetic-fallacy", alt: "Painted interpretation of a sorrowful figure beside a rain-streaked window." },
  "Transferred Epithet": { image: "term-transferred-epithet", alt: "Painted interpretation of a tired traveller resting beside a winding road." },
  "Metonymy": { image: "term-metonymy", alt: "Painted interpretation of a royal crown on a cushion with a court behind it." },
  "Synecdoche": { image: "term-synecdoche", alt: "Painted interpretation of sailors' hands pulling a rope on a ship." },
  "Apostrophe": { image: "term-apostrophe", alt: "Painted interpretation of a poet turning to speak to the moon." },
  "Periphrasis": { image: "term-periphrasis", alt: "Painted interpretation of a gold crown of rays rising from an open scroll." },
  "Euphemism": { image: "term-euphemism", alt: "Painted interpretation of soft cloth laid over a jagged stone." },
  "Hyperbole": { image: "term-hyperbole", alt: "Painted interpretation of an enormous teacup beside a tiny person." },
  "Litotes": { image: "term-litotes", alt: "Painted interpretation of a thumbs-up beside a frowning face crossed out in red." },
  "Meiosis": { image: "term-meiosis", alt: "Painted interpretation of a person with a tiny umbrella in a large storm." },
  "Oxymoron": { image: "term-oxymoron", alt: "Painted interpretation of a snowflake inside a flame." },
  "Paradox": { image: "term-paradox", alt: "Painted interpretation of a climber on a staircase that loops back on itself." },
  "Antithesis": { image: "term-antithesis", alt: "Painted interpretation of a tree with leafy branches in sunlight and bare branches in moonlight." },
  "Zeugma": { image: "term-zeugma", alt: "Painted interpretation of one key reaching toward both a door and a heart." },
  "Hyperbaton": { image: "term-hyperbaton", alt: "Painted interpretation of a hand lifting an ink-marked tile from a row." },
  "Symbol": { image: "term-symbol", alt: "Painted interpretation of a white dove carrying an olive sprig." },
  "Allegory": { image: "term-allegory", alt: "Painted interpretation of a traveller at a fork between a bright hill and a dark gate." },
  "Allusion": { image: "term-allusion", alt: "Painted interpretation of a wooden Trojan horse rising from the pages of a book." },
  "Ambiguity": { image: "term-ambiguity", alt: "Painted interpretation of a shape that can look like a vase or two faces." },
  "Synaesthesia": { image: "term-synaesthesia", alt: "Painted interpretation of coloured ribbons of sound flowing from a violin." },
  "Irony": { image: "term-irony", alt: "Painted interpretation of an umbrella raining on the person beneath it." },
  "Verbal Irony": { image: "term-verbal-irony", alt: "Painted interpretation of a smiling person in rain whose speech bubble shows the sun." },
  "Situational Irony": { image: "term-situational-irony", alt: "Painted interpretation of a locksmith with a bunch of keys standing outside a locked shop." },
  "Dramatic Irony": { image: "term-dramatic-irony", alt: "Painted interpretation of a figure hiding behind a curtain while an actor looks away." },
  "Sarcasm": { image: "term-sarcasm", alt: "Painted interpretation of a stern person clapping beside a flattened cake." },
  "Innuendo": { image: "term-innuendo", alt: "Painted interpretation of two people sharing a whisper behind a fan." },
  "Pun": { image: "term-pun", alt: "Painted interpretation of a flying bat beside a wooden cricket bat." },
};

// Part card aur chapter card, dono ki tasveer isi se banti hai.
function pic(image, alt) {
  if (!image) return null;
  return {
    src: ASSETS + image + ".webp",
    small: ASSETS + image + "-240.webp",
    alt: alt || ""
  };
}

// TERM BUTTONS (owner, 2026-11-25: "ye jo list hai, unke buton bana do, ek patti jo puri idhar se udhar,
// uske beech naam, click karne se seedha article khulega"). Chapter card ke andar har term ek poori-chaudai
// wali patti hai. Har term ka apna article hota hai: /notes/term-<naam>/ (Pages CMS me folder ka naam
// `term-<naam>`, jaise term-simile). Jab tak article nahi, patti link nahi hoti (404 nahi chahiye).
//
// ARTICLE AANE PAR: us term ka naam yahan `liveTerms` me likho (bilkul waisa jaisa upar sub list me hai).
// Build tab tak nahi chalega jab tak notes/term-<naam>/index.md maujood na ho, ya naam galat ho.
const liveTerms = [
  // "Simile",
];
// Kisi term ka article kisi aur naam se likha ho to yahan override: { "Simile": "term-simile-and-metaphor" }
const termSlugOverrides = {};

function termSlug(name) {
  return termSlugOverrides[name] || "term-" + name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const seenSlugs = {};
const seenNames = {};
parts.forEach(function (p) {
  p.chapters.forEach(function (c) {
    (c.sub || []).forEach(function (t) {
      const slug = termSlug(t);
      if (seenSlugs[slug]) throw new Error("keyTerms.js: two terms make the article address '" + slug + "': " + seenSlugs[slug] + " and " + t);
      seenSlugs[slug] = t;
      seenNames[t] = slug;
    });
  });
});
liveTerms.forEach(function (name) {
  if (!seenNames[name]) throw new Error("keyTerms.js: liveTerms has '" + name + "', which is not a term in the lists");
  const file = path.join(__dirname, "..", "notes", seenNames[name], "index.md");
  if (!fs.existsSync(file)) throw new Error("keyTerms.js: '" + name + "' is in liveTerms but notes/" + seenNames[name] + "/index.md does not exist");
});

let counter = 0;

module.exports = parts.map(function (p, i) {
  const prev = parts[i - 1];
  const next = parts[i + 1];
  const chapters = p.chapters.map(function (c) {
    counter += 1;
    const terms = (c.sub || []).map(function (name) {
      const slug = termSlug(name);
      const artwork = termArtwork[name];
      return {
        name: name,
        slug: slug,
        href: "/notes/" + slug + "/",
        live: liveTerms.indexOf(name) !== -1,
        picture: artwork ? { src: ASSETS + artwork.image + ".webp", alt: artwork.alt } : null
      };
    });
    return Object.assign({}, c, {
      n: counter,
      picture: pic(c.image, c.alt),
      sub: terms,
      strips: true,
      termsLive: terms.filter(function (t) { return t.live; }).length
    });
  });
  return Object.assign({}, p, {
    number: i + 1,
    href: BASE + p.slug + "/",
    count: p.chapters.length,
    chapters: chapters,
    // Is series me khulne wali cheez term ka article hai (chapter ka card sirf dibba hai).
    liveCount: chapters.reduce(function (n, c) { return n + c.termsLive; }, 0),
    picture: pic(p.image, p.alt),
    prev: prev ? { name: prev.name, href: BASE + prev.slug + "/", number: i } : null,
    next: next ? { name: next.name, href: BASE + next.slug + "/", number: i + 2 } : null
  });
});
