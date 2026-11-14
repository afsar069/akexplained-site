// The PYQ papers grouped by year, newest year first (feeds the hub's year groups).
module.exports = function () {
  const years = [];
  require("./netPyqPapers.js")().forEach(function (paper) {
    let group = years.find(function (g) { return g.year === paper.year; });
    if (!group) { group = { year: paper.year, papers: [] }; years.push(group); }
    group.papers.push(paper);
  });
  return years;
};
