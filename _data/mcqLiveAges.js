// Jin ages ke kam se kam ek set live hai — unke build/ aur custom/ pages bante hain.
module.exports = function () {
  return require("./mcqAges.js")().filter((a) => a.hasLive);
};
