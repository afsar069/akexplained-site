/* Every login day slot (freeMax+1 .. total): the fixed range the day + review pages are
   pre-built for. Self-serve publish (rule 17): each page checks the live catalog when it opens. */
module.exports = require("./pgtMcqDays").filter(day => day.managed);
