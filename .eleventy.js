const EleventyNavigation = require("./eleventy-navigation");

module.exports = function(eleventyConfig) {
	eleventyConfig.addNunjucksFilter("eleventyNavigation", EleventyNavigation.findNavigationEntries);
	eleventyConfig.addNunjucksFilter("eleventyNavigationBreadcrumb", EleventyNavigation.findBreadcrumbEntries);
	eleventyConfig.addNunjucksFilter("eleventyNavigationToHtml", function(pages, options) {
		return EleventyNavigation.toHtml.call(eleventyConfig, pages, options);
	});
};