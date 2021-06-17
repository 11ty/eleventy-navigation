const EleventyNavigation = require("./eleventy-navigation");

// export the configuration function for plugin
module.exports = function(eleventyConfig) {
	eleventyConfig.addFilter("eleventyNavigation", EleventyNavigation.findNavigationEntries);
	eleventyConfig.addFilter("eleventyNavigationBreadcrumb", EleventyNavigation.findBreadcrumbEntries);
	eleventyConfig.addFilter("eleventyNavigationToHtml", function(pages, options) {
		return EleventyNavigation.toHtml.call(eleventyConfig, pages, options);
	});
	eleventyConfig.addFilter("eleventyNavigationToMarkdown", function(pages, options) {
		return EleventyNavigation.toHtml.call(eleventyConfig, pages, options);
	});
};

module.exports.navigation = {
	find: EleventyNavigation.findNavigationEntries,
	findBreadcrumbs: EleventyNavigation.findBreadcrumbEntries,
	getDependencyGraph: EleventyNavigation.getDependencyGraph,
};