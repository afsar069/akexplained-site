module.exports = require("./pgtResources.json").filter(resource => !["mcqs", "mock-tests"].includes(resource.slug));
