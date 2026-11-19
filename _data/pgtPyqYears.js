// The UP PGT PYQ papers grouped by year, OLDEST year first (same order as the NET PYQs).
module.exports = function () {
  const years = [];
  require("./pgtPyqPapers.js")().forEach(function (paper) {
    let group = years.find(function (g) { return g.year === paper.year; });
    if (!group) { group = { year: paper.year, papers: [] }; years.push(group); }
    group.papers.push(paper);
  });
  return years;
};
