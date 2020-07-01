const EleventyNavigation = require("./eleventy-navigation");

// export the configuration function for plugin
module.exports = function(eleventyConfig) {
	eleventyConfig.addNunjucksFilter("eleventyNavigation", EleventyNavigation.findNavigationEntries);
	eleventyConfig.addNunjucksFilter("eleventyNavigationBreadcrumb", EleventyNavigation.findBreadcrumbEntries);
	eleventyConfig.addNunjucksFilter("eleventyNavigationToHtml", function(pages, options) {
		return EleventyNavigation.toHtml.call(eleventyConfig, pages, options);
	});
};

module.exports.navigation = {
	find: EleventyNavigation.findNavigationEntries,
	findBreadcrumbs: EleventyNavigation.findBreadcrumbEntries,
	getDependencyGraph: EleventyNavigation.getDependencyGraph,
};