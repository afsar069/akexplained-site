// UP PGT login slots (6..60): the fixed range the login test + review pages are pre-built for.
// Self-serve publish (rule 17): each page checks the live catalog when it is opened.
module.exports = require("./pgtMockTests").filter(test => test.access === "login");
