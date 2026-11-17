/* UP PGT English MCQ days — how big the series is, in ONE place.
   ---------------------------------------------------------------------------------------------
   `total`   : how many day slots /exams/pgt/up-pgt/mcqs/ shows. To add more days later, raise
               this one number: the hub grid, the pre-built day pages and the number the upload
               page accepts all follow it by themselves.
   `freeMax` : days 1..freeMax are FREE public question files (assets/questions/...). They are
               never catalog-checked and never touched by the self-serve code.
   `prefix`  : the set id a day gets when it is uploaded at /admin/upload-paper/
               (prefix + day number, e.g. up-pgt-mcq-day-13). Days 11 and 12 were loaded earlier
               under their own ids; _data/pgtMcqLoginDays.js keeps those, and everything reads the
               id from the registry, so both kinds work side by side.
   `groupOf` : how many days one "Days 01–10" group holds on the hub. */
module.exports = {
  total: 60,
  freeMax: 10,
  groupOf: 10,
  prefix: "up-pgt-mcq-day-",
  base: "/exams/pgt/up-pgt/mcqs/"
};
