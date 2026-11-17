const availableDays = [
  ...require("./pgtMcqLiveDays"),
  ...require("./pgtMcqLoginDays"),
];
const liveDays = new Map(availableDays.map(day => [day.number, day]));

module.exports = Array.from({ length: 60 }, (_, index) => {
  const number = index + 1;
  return {
    number,
    label: String(number).padStart(2, "0"),
    ...(liveDays.get(number) || {}),
  };
});
