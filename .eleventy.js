const EleventyNavigation = require("./eleventy-navigation");

module.exports = function(eleventyConfig) {
	eleventyConfig.addNunjucksFilter("eleventyNavigation", EleventyNavigation.findNavigationEntries);
	eleventyConfig.addNunjucksFilter("eleventyNavigationBreadcrumb", EleventyNavigation.findBreadcrumbEntries);
	eleventyConfig.addNunjucksFilter("eleventyNavigationToHtml", EleventyNavigation.toHtml);
};