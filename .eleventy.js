module.exports = function(eleventyConfig) {
  // Copy static files
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/styles/output.css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Add date filter
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Sort posts by date (newest first) and filter out future posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    const now = new Date();
    return collectionApi.getFilteredByGlob("src/posts/*.md")
      .filter(post => {
        // Only include posts with dates on or before today
        return post.date <= now;
      })
      .sort((a, b) => {
        // Sort by date, newest first
        return b.date - a.date;
      });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
