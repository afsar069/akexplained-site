// Har live set ek item: { age, set } — set ka test page aur review page isi se bante hain.
module.exports = function () {
  const out = [];
  require("./mcqAges.js")().forEach((age) => age.liveSets.forEach((set) => out.push({ age, set })));
  return out;
};
