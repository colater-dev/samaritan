import { DateTime } from "luxon";

export default function (eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Date filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "LLLL d, yyyy"
    );
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
  });

  // Blog collection sorted by date
  eleventyConfig.addCollection("blog", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  // Reading time filter
  eleventyConfig.addFilter("readingTime", (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  });

  // Excerpt filter
  eleventyConfig.addFilter("excerpt", (content) => {
    const stripped = content.replace(/<[^>]*>/g, "");
    return stripped.substring(0, 160).trim() + "...";
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
