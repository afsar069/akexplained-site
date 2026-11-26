// Har planned chapter ka naam aur uska pata — /admin/upload-article/ ke liye (owner, 2026-11-26).
//
// Kyun: pehli hi publish par ye hua — article `/notes/phenomenology-hermeneutics/` par chadha,
// par Literary Theory ki registry me us chapter ka pata `literary-theory-phenomenology-hermeneutics`
// likha tha. Dono alag hone se article to live ho gaya, par uska card "Coming soon" hi kehta raha,
// aur kisi ko pata nahi chalta. Ab upload page khud bata deta hai: ye pata plan se milta hai ya nahi,
// aur na mile to plan wala pata kya hai.
//
// Yahan sirf naam aur pata hai — koi content nahi. Page is JSON ko padh kar sirf dikhata hai.

const literaryTheory = require("./literaryTheory.js");
const culturalStudies = require("./culturalStudies.js");
const indianPoetics = require("./indianPoetics.js");

const SERIES = [
  ["Literary Theory", literaryTheory],
  ["Cultural Studies", culturalStudies],
  ["Indian Poetics", indianPoetics],
];

// Do naam ek hi cheez hain ya nahi, ye dekhne ke liye unhe ek saade roop me le aao.
function plain(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

module.exports = function () {
  const chapters = [];
  for (const [series, parts] of SERIES) {
    for (const part of parts) {
      for (const c of part.chapters || []) {
        if (!c.slug) continue;
        chapters.push({
          series: series,
          part: part.name,
          n: c.n,
          title: c.title,
          slug: c.slug,
          key: plain(c.title),
          live: Boolean(c.live),
        });
      }
    }
  }
  return { chapters: chapters, json: JSON.stringify({ chapters: chapters }) };
};
