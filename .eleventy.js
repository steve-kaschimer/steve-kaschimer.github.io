const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {

  // Add RSS plugin
  eleventyConfig.addPlugin(pluginRss);

  // Copy static files
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/downloads");

  // Wrap tables in a horizontally-scrollable, keyboard-focusable div (WCAG
  // 2.1.1) - same rationale as the <pre> tabindex handling in code-copy.js.
  // Wrapping (rather than e.g. display:block on <table>) keeps native table
  // semantics intact for assistive tech. No role="region" here on purpose,
  // for the same landmark-pollution reason documented in code-copy.js.
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.renderer.rules.table_open = () =>
      '<div class="table-wrapper" tabindex="0" aria-label="Scrollable table">\n<table>\n';
    mdLib.renderer.rules.table_close = () => '</table>\n</div>\n';
  });

  // Add date filter
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Find a page in a collection by its output URL (used by sitemap.njk to
  // pull an accurate <lastmod> for the static top-level pages)
  eleventyConfig.addFilter("findByUrl", (collection, url) => {
    return collection.find(page => page.url === url);
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

  // Collect tags with counts
  eleventyConfig.addCollection("tagListWithCounts", function(collectionApi) {
    const tagCount = {};
    const now = new Date();
    const posts = collectionApi.getFilteredByGlob("src/posts/*.md")
      .filter(post => post.date <= now);

    posts.forEach(post => {
      if ("tags" in post.data) {
        let tags = post.data.tags;
        // Handle both array and string tags
        if (typeof tags === "string") {
          tags = [tags];
        }
        for (const tag of tags) {
          // Exclude special tags like "posts"
          if (tag && tag !== "posts" && tag !== "all") {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          }
        }
      }
    });

    // Return array of objects with tag and count
    return Object.keys(tagCount)
      .sort()
      .map(tag => ({
        tag: tag,
        count: tagCount[tag]
      }));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk"
  };
};
