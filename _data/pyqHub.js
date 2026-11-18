// The exam cards on /quizzes/pyq/ (the PYQ front door). Code comment, Hinglish allowed.
// Naya exam jodna ho: neeche ek entry add karo. Jab uske papers ban jayein to `href` do aur `live: true` karo
// (card tab link ban jata hai). Jab tak `live` false hai card sirf "Coming soon" dikhata hai, koi link nahi (404 nahi).
// UGC NET ka count aur saal seedha netPyqPapers se aate hain, isliye naya NET paper judte hi card badal jata hai.
module.exports = function () {
  const net = require("./netPyqPapers.js")();
  const years = net.map(function (p) { return p.year; });
  const minY = Math.min.apply(null, years), maxY = Math.max.apply(null, years);
  const span = minY === maxY ? String(minY) : minY + "–" + maxY;   // "2012–2025" when there are many years
  const n = net.length;
  // How many need a login, so the card says it plainly (the free 2012 papers are open to all).
  const loginN = net.filter(function (p) { return p.access === "login"; }).length;
  const paid = require("./paidLayer.js").live;            // rule 22: launch switch
  const gate = paid ? "the All Access pass" : "a free login";
  const access = loginN === 0 ? "Free, no login"
    : loginN >= net.length - loginN ? "Some free, most need " + gate
    : "Free, some need " + gate;
  return [
    {
      slug: "net",
      title: "UGC NET English",
      icon: "book-open",
      blurb: "Real UGC-NET English papers as an online test, with a clock and a full review.",
      meta: n + " paper" + (n === 1 ? "" : "s") + " · " + span + " · " + access,
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
