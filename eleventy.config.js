module.exports = function (eleventyConfig) {
  // 404 page ko jaisa hai waisa hi rakho
  eleventyConfig.ignores.add("404.html");

  // Yeh files/folders bina chhede copy ho jayenge
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
    templateFormats: ["html", "md", "njk"]
  };
};
