const fs = require("fs");
const path = require("path");

// base.njk se asli (naya) header aur footer ek baar padh lo
const base = fs.readFileSync(path.join(__dirname, "_includes", "base.njk"), "utf8");
const NEW_HEADER = base.slice(
  base.indexOf('<header class="site-header">'),
  base.indexOf("</header>") + "</header>".length
);
const NEW_FOOTER = base.slice(
  base.indexOf('<footer class="site-footer">'),
  base.indexOf("</footer>") + "</footer>".length
);

module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("404.html");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  // Purane pages ka header/footer nikaal kar base.njk wala naya laga do
  eleventyConfig.addTransform("syncChrome", function (content) {
    if (!(this.page && this.page.outputPath && this.page.outputPath.endsWith(".html"))) return content;
    if (!content.includes('<header class="site-header">')) return content; // yeh page pehle se base.njk use karta hai

    let out = content;

    const hStart = out.indexOf('<header class="site-header">');
    const hEnd = out.indexOf("</header>");
    if (hStart !== -1 && hEnd !== -1) {
      out = out.slice(0, hStart) + NEW_HEADER + out.slice(hEnd + "</header>".length);
    }

    const fStart = out.indexOf('<footer class="site-footer">');
    const fEnd = out.indexOf("</footer>", fStart);
    if (fStart !== -1 && fEnd !== -1) {
      out = out.slice(0, fStart) + NEW_FOOTER + out.slice(fEnd + "</footer>".length);
    }

    return out;
  });

  return {
    dir: { input: ".", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
    templateFormats: ["html", "md", "njk"],
  };
};
