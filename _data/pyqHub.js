// The exam cards on /quizzes/pyq/ (the PYQ front door). Code comment, Hinglish allowed.
// Naya exam jodna ho: neeche ek entry add karo. Jab uske papers ban jayein to `href` do aur `live: true` karo
// (card tab link ban jata hai). Jab tak `live` false hai card sirf "Coming soon" dikhata hai, koi link nahi (404 nahi).
// UGC NET ka count aur saal seedha netPyqPapers se aate hain, isliye naya NET paper judte hi card badal jata hai.
module.exports = function () {
  const net = require("./netPyqPapers.js")();
  const years = Array.from(new Set(net.map(function (p) { return p.year; }))).sort(function (a, b) { return b - a; });
  const n = net.length;
  // A login paper (rule 18) makes "No login" untrue for the whole list, so the card says so in plain words.
  const anyLogin = net.some(function (p) { return p.access === "login"; });
  return [
    {
      slug: "net",
      title: "UGC NET English",
      icon: "book-open",
      blurb: "Real UGC-NET English papers as an online test, with a clock and a full review.",
      meta: n + " paper" + (n === 1 ? "" : "s") + " · " + years.join(", ") + (anyLogin ? " · Free · Some need a login" : " · Free · No login"),
      href: "/exams/net/english-pyqs/",
      live: true
    },
    {
      slug: "pgt",
      title: "PGT English",
      icon: "layers",
      blurb: "Previous-year papers for PGT English will be added here.",
      live: false
    },
    {
      slug: "tgt",
      title: "TGT English",
      icon: "file-text",
      blurb: "Previous-year papers for TGT English will be added here.",
      live: false
    }
  ];
};
