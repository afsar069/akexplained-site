// The PYQ papers grouped by year, newest year first (feeds the hub's year groups).
// Inside a year the papers are split into one section per paper (Paper I, II, III), and inside a section
// they run in the order they were held: January first, December last (the reader works through them in time order).
const PAPER_ORDER = ["I", "II", "III"];

module.exports = function () {
  const years = [];
  require("./netPyqPapers.js")().forEach(function (paper) {
    let group = years.find(function (g) { return g.year === paper.year; });
    if (!group) { group = { year: paper.year, papers: [], sections: [] }; years.push(group); }
    group.papers.push(paper);
  });
  years.forEach(function (group) {
    const names = PAPER_ORDER.filter(function (p) {
      return group.papers.some(function (x) { return x.paper === p; });
    });
    group.papers.forEach(function (x) { if (names.indexOf(x.paper) < 0) names.push(x.paper); });
    group.sections = names.map(function (name) {
      const papers = group.papers.filter(function (x) { return x.paper === name; })
        .sort(function (a, b) { return a.month - b.month || a.slug.localeCompare(b.slug); });
      return {
        paper: name,
        papers: papers,
        questions: papers.reduce(function (n, x) { return n + x.count; }, 0),
      };
    });
  });
  return years;
};
