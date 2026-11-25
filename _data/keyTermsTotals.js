// Key Terms ke kul aankde (Theory / Cultural Studies jaisa): koi number page par haath se
// nahi likha jata (rule 2). `topics` = sab chapters ke subchapters ka jod.
const parts = require("./keyTerms.js");

module.exports = {
  parts: parts.length,
  chapters: parts.reduce(function (n, p) { return n + p.count; }, 0),
  topics: parts.reduce(function (n, p) {
    return n + p.chapters.reduce(function (m, c) { return m + (c.sub ? c.sub.length : 0); }, 0);
  }, 0),
  live: parts.reduce(function (n, p) { return n + p.liveCount; }, 0)
};
