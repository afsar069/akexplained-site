// Jin resources ka page ban chuka hai (live: true), unke liye coming-soon page nahi banta.
module.exports = require("./statePscResources.json").filter(resource => !resource.live);
