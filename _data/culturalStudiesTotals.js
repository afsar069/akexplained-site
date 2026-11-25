// Cultural Studies ke kul aankde (Literary Theory ke totals jaisa): koi number page par
// haath se nahi likha jata (rule 2).
const parts = require("./culturalStudies.js");

module.exports = {
  parts: parts.length,
  chapters: parts.reduce(function (n, p) { return n + p.count; }, 0),
  live: parts.reduce(function (n, p) { return n + p.liveCount; }, 0)
};
