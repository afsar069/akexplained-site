// Cultural Studies series (owner, 2026-11-25: "NET syllabus ke according chalenge, jitna
// literary theory me hota hai utna theory me rehne do, jo cultural studies me hona chahiye
// wo cultural studies me le jaao; format wahi jo abhi banaya hai").
//
// Ye Literary Theory (`_data/literaryTheory.js`) ka bilkul wahi dhancha hai: parts, har part
// ke chapters, aur ek hi registry se hub ke cards, part pages aur sitemap lines.
//
// SCOPE yahan se aaya: hamare NET syllabus page (exams/net/syllabus) ki Unit VII
// "Cultural Studies" — "The Birmingham school, ideology and hegemony, popular culture,
// media, subculture, gender, identity, diaspora and globalisation, including Williams,
// Hoggart, Hall, Gramsci and Bourdieu." Unit IX "Literary Theory post World War II"
// (structuralism ... Marxism, feminism, New Historicism, postcolonialism, queer theory,
// ecocriticism) Literary Theory me hi rahi.
//
// Chaar chapter Literary Theory se yahan aaye hain (Frankfurt School 2026-11-25 ko owner ke kehne par jud gaya) (title, thinkers aur "people" wahi jo
// owner ke the): Birmingham School, Popular Culture / Media, Nation / Diaspora /
// Globalisation. Chaar naye hain, sirf Unit VII ke shabdon se: Ideology and Hegemony,
// Bourdieu, Subculture, Gender and Identity.
//
// 2026-11-25 (owner: "Introduction jod do, aur web search karke dekho aur kya kya aata hai
// cultural studies me, jo mile wo add karo"; phir "chapter 10 add karna hai"): ek Introduction
// aur chaar chapter jude (Williams, Media and Audiences, Race and Ethnicity; Subculture me
// Hebdige). Sources docs/cultural-studies-scope.md me hain.
//
// VERIFIED (2026-11-25, jab owner ne sites allow ki): UGC NET Bureau ka asli English syllabus
// (code 30, ugcnetonline.in se) sirf unit ke TITLE deta hai: "Unit VII: Cultural Studies",
// uske neeche koi topic nahi. Isliye Unit VII ke topics kisi official document me nahi hain;
// hamare NET syllabus page ka text "study-guide notes" hai (wahan likha bhi hai). Chapters ka
// aadhar hai: EBSCO ka Birmingham School overview, limitlessliterature.com ki Unit VII list aur
// uske 33 purane NET sawal, aur search ke university syllabi. mu.ac.in abhi bhi nahi khula.
//
// `people` me sirf wahi naam / kitaabein hain jo owner ne diye ya search ke sources me mili
// (rule 2). Aur naam owner se poochh kar hi jude.
//
// `n` yahan typed nahi hota: upar se neeche 1, 2, 3 ... khud banta hai.
//
// `slug` = article ka pata /notes/<slug>/. Abhi koi article nahi, isliye sab `live: false`
// (Coming soon, link nahi). Article aane par us chapter ko `live: true` karo. Slug tab tak
// badla ja sakta hai.
//
// PICTURE: Literary Theory jaisi hi, par files `assets/cultural-studies/` me:
//   `<naam>.webp` 480 x 300 (200 KB se kam) aur `<naam>-240.webp` 240 x 150, phir us part
//   ya chapter par `image: "<naam>"` aur `alt: "<jo tasveer me dikh raha hai>"`.

// Chapter ka card khulna uske article ki file se tay hota hai (tools/article-live.js).
// Article publish hote hi card khud link ban jata hai — koi `live: true` haath se nahi likhna.
const { resolveChapter } = require("../tools/article-live.js");

const parts = [
  {
    slug: "culture-class-and-ideology",
    name: "Culture, class and ideology",
    summary:
      "Culture seen as a whole way of life, as a field where ideas and power meet, and as a sign of class and taste.",
    image: "culture-class-and-ideology",
    alt: "Painted interpretation of a street market and an art gallery with a newspaper between them.",
    chapters: [
      { title: "Introduction to Cultural Studies", people: "", slug: "cultural-studies-introduction" },
      { title: "Raymond Williams: Meanings of Culture and Structure of Feeling", people: "<i>Culture and Society</i> · <i>The Long Revolution</i> · <i>Keywords</i> · <i>Marxism and Literature</i>", slug: "cultural-studies-raymond-williams" },
      { title: "Cultural Studies: the Birmingham School", people: "Hoggart · Williams · Hall · Thompson", slug: "cultural-studies-birmingham-school" },
      { title: "Ideology and Hegemony", people: "Gramsci", slug: "cultural-studies-ideology-hegemony" },
      { title: "Bourdieu: Class, Taste and Cultural Capital", people: "", slug: "cultural-studies-bourdieu" }
    ]
  },
  {
    slug: "popular-culture-media-and-subculture",
    name: "Popular culture, media and subculture",
    summary:
      "Mass and popular culture as the subject: the culture industry, what people watch, read and wear, and the media that carry it.",
    image: "popular-culture-media-and-subculture",
    alt: "Painted interpretation of a young person making a fanzine beside a television and records.",
    chapters: [
      { title: "The Frankfurt School and Critical Theory", people: "Adorno · Horkheimer · Marcuse · Benjamin · Habermas", slug: "cultural-studies-frankfurt-school" },
      { title: "Popular Culture, Media and Consumer Society", people: "Barthes's <i>Mythologies</i> · McLuhan · Fiske", slug: "cultural-studies-popular-culture-media" },
      { title: "Media and Audiences: Encoding and Decoding", people: "Hall", slug: "cultural-studies-media-audiences" },
      { title: "Subculture", people: "Hebdige's <i>Subculture</i>", slug: "cultural-studies-subculture" }
    ]
  },
  {
    slug: "identity-diaspora-and-globalisation",
    name: "Identity, diaspora and globalisation",
    summary:
      "How gender, race and nation shape who people are and how they show it, and how identity moves across borders in a global world.",
    image: "identity-diaspora-and-globalisation",
    alt: "Painted interpretation of travellers with luggage beneath a world map of connected routes.",
    chapters: [
      { title: "Gender and Identity", people: "", slug: "cultural-studies-gender-identity" },
      { title: "Race, Ethnicity and Culture", people: "Hall's <i>Policing the Crisis</i> · <i>The Empire Strikes Back</i>", slug: "cultural-studies-race-ethnicity" },
      { title: "Nation, Diaspora and Globalisation", people: "Anderson · Gilroy · Appadurai · Brah", slug: "cultural-studies-nation-diaspora-globalisation" }
    ]
  }
];

const BASE = "/literary-criticism/cultural-studies/";

// Part card aur chapter card, dono ki tasveer isi se banti hai.
function pic(image, alt) {
  if (!image) return null;
  return {
    src: "/assets/cultural-studies/" + image + ".webp",
    small: "/assets/cultural-studies/" + image + "-240.webp",
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
    const at = resolveChapter("culturalStudies.js", c);
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
