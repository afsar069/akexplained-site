module.exports = Array.from({ length: 60 }, (_, index) => {
  const number = index + 1;
  return {
    number,
    label: String(number).padStart(2, "0"),
    live: number <= 9,
    access: number >= 6 && number <= 9 ? "login" : "free",
  };
});
