module.exports = Array.from({ length: 60 }, (_, index) => {
  const number = index + 1;
  return {
    number,
    label: String(number).padStart(2, "0"),
    ...(number === 1 ? { title: "Figure of Speech", questionCount: 50, access: "free" } : {}),
  };
});
