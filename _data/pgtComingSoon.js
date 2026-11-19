// Coming-soon pages: sab resource, siwaye un ke jinka apna asli page hai (mcqs, mock-tests, syllabus-download).
module.exports = require("./pgtResources.json").filter(resource => !["mcqs", "mock-tests", "syllabus-download"].includes(resource.slug));
