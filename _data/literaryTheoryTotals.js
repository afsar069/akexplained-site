// Literary Theory ke kul aankde, taaki page par koi number haath se na likha jaye
// (rule 2 / CLAUDE.md: count hamesha data se aata hai, kabhi type nahi hota).
// Nunjucks me list jodne ka seedha filter nahi hai, isliye ye alag file.
const parts = require("./literaryTheory.js");

module.exports = {
  parts: parts.length,
  chapters: parts.reduce(function (n, p) { return n + p.count; }, 0),
  live: parts.reduce(function (n, p) { return n + p.liveCount; }, 0)
};
