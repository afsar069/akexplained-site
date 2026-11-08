const days = require("./pgtMcqDays");

module.exports = Array.from({ length: 6 }, (_, index) => {
  const start = index * 10 + 1;
  const end = start + 9;
  return {
    startLabel: String(start).padStart(2, "0"),
    endLabel: String(end).padStart(2, "0"),
    days: days.slice(start - 1, end),
  };
});
