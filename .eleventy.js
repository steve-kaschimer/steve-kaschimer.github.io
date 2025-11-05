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

  // Collect all unique tags from posts
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagSet = new Set();
    collectionApi.getAll().forEach(item => {
      if ("tags" in item.data) {
        let tags = item.data.tags;
        // Handle both array and string tags
        if (typeof tags === "string") {
          tags = [tags];
        }
        for (const tag of tags) {
          // Exclude special tags like "posts"
          if (tag && tag !== "posts" && tag !== "all") {
            tagSet.add(tag);
          }
        }
      }
    });
    // Return sorted array of tags
    return [...tagSet].sort();
  });

  // Collect tags with counts
  eleventyConfig.addCollection("tagListWithCounts", function(collectionApi) {
    const tagCount = {};
    const posts = collectionApi.getFilteredByGlob("src/posts/*.md");
    
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
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
