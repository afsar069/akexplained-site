const series = require("./pgtMcqSeries");
const days = require("./pgtMcqDays");
const size = series.groupOf;

module.exports = Array.from({ length: Math.ceil(days.length / size) }, (_, index) => {
  const start = index * size + 1;
  const end = Math.min(start + size - 1, days.length);
  return {
    startLabel: String(start).padStart(2, "0"),
    endLabel: String(end).padStart(2, "0"),
    days: days.slice(start - 1, end),
  };
});
