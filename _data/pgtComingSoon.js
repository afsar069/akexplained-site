// Coming-soon pages: sab resource, siwaye un ke jinka apna asli page hai (mcqs, mock-tests, syllabus-download, pyqs).
module.exports = require("./pgtResources.json").filter(resource => !["mcqs", "mock-tests", "syllabus-download", "pyqs"].includes(resource.slug));
