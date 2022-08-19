const DepGraph = require("dependency-graph").DepGraph;

function findNavigationEntries(nodes = [], key = "") {
	let pages = [];
	for(let entry of nodes) {
		if(entry.data && entry.data.eleventyNavigation) {
			let nav = entry.data.eleventyNavigation;
			if(!key && !nav.parent || nav.parent === key) {
				pages.push(Object.assign({}, nav, {
					url: nav.url || entry.data.page.url,
					pluginType: "eleventy-navigation"
				}, key ? { parentKey: key } : {}));
			}
		}
	}

	return pages.sort(function(a, b) {
		return (a.order || 0) - (b.order || 0);
	}).map(function(entry) {
		if(!entry.title) {
			entry.title = entry.key;
		}
		if(entry.key) {
			entry.children = findNavigationEntries(nodes, entry.key);
		}
		return entry;
	});
}

function findDependencies(pages, depGraph, parentKey) {
	for( let page of pages ) {
		depGraph.addNode(page.key, page);
		if(parentKey) {
			depGraph.addDependency(page.key, parentKey);
		}
		if(page.children) {
			findDependencies(page.children, depGraph, page.key);
		}
	}
}

function getDependencyGraph(nodes) {
	let pages = findNavigationEntries(nodes);
	let graph = new DepGraph();
	findDependencies(pages, graph);
	return graph;
}

function findBreadcrumbEntries(nodes, activeKey, options = {}) {
	let graph = getDependencyGraph(nodes);
	if (options.allowMissing && !graph.hasNode(activeKey)) {
		// Fail gracefully if the key isn't in the graph
		return [];
	}
	let deps = graph.dependenciesOf(activeKey);
	if(options.includeSelf) {
		deps.push(activeKey);
	}

	return activeKey ? deps.map(key => {
		let data = Object.assign({}, graph.getNodeData(key));
		delete data.children;
		data._isBreadcrumb = true;
		return data;
	}) : [];
}

function getUrlFilter(eleventyConfig) {
	// eleventyConfig.pathPrefix was first available in Eleventy 2.0.0-canary.15
	// And in Eleventy 2.0.0-canary.15 we recommend the a built-in transform for pathPrefix
	if(eleventyConfig.pathPrefix !== undefined) {
		return function(url) {
			return url;
		};
	}

	if("getFilter" in eleventyConfig) {
		// v0.10.0 and above
		return eleventyConfig.getFilter("url");
	} else if("nunjucksFilters" in eleventyConfig) {
		// backwards compat, hardcoded key
		return eleventyConfig.nunjucksFilters.url;
	} else {
		// Theoretically we could just move on here with a `url => url` but then `pathPrefix`
		// would not work and it wouldn’t be obvious why—so let’s fail loudly to avoid that.
		throw new Error("Could not find a `url` filter for the eleventy-navigation plugin in eleventyNavigationToHtml filter.");
	}
}

function navigationToHtml(pages, options = {}) {
	options = Object.assign({
		listElement: "ul",
		listItemElement: "li",
		listClass: "",
		listItemClass: "",
		listItemHasChildrenClass: "",
		activeKey: "",
		activeListItemClass: "",
		anchorClass: "",
		activeAnchorClass: "",
		showExcerpt: false,
		isChildList: false
	}, options);

	let isChildList = !!options.isChildList;
	options.isChildList = true;

	let urlFilter = getUrlFilter(this)

	if(pages.length && pages[0].pluginType !== "eleventy-navigation") {
		throw new Error("Incorrect argument passed to eleventyNavigationToHtml filter. You must call `eleventyNavigation` or `eleventyNavigationBreadcrumb` first, like: `collection.all | eleventyNavigation | eleventyNavigationToHtml | safe`");
	}

	return pages.length ? `<${options.listElement}${!isChildList && options.listClass ? ` class="${options.listClass}"` : ''}>${pages.map(entry => {
		let liClass = [];
		let aClass = [];
		if(options.listItemClass) {
			liClass.push(options.listItemClass);
		}
		if(options.anchorClass) {
			aClass.push(options.anchorClass);
		}
		if(options.activeKey === entry.key) {
			if(options.activeListItemClass) {
				liClass.push(options.activeListItemClass);
			}
			if(options.activeAnchorClass) {
				aClass.push(options.activeAnchorClass);
			}
		}
		if(options.listItemHasChildrenClass && entry.children && entry.children.length) {
			liClass.push(options.listItemHasChildrenClass);
		}

		return `<${options.listItemElement}${liClass.length ? ` class="${liClass.join(" ")}"` : ''}><a href="${urlFilter(entry.url)}"${aClass.length ? ` class="${aClass.join(" ")}"` : ''}>${entry.title}</a>${options.showExcerpt && entry.excerpt ? `: ${entry.excerpt}` : ""}${entry.children ? navigationToHtml.call(this, entry.children, options) : ""}</${options.listItemElement}>`;
	}).join("\n")}</${options.listElement}>` : "";
}

function navigationToMarkdown(pages, options = {}) {
	options = Object.assign({
		showExcerpt: false,
		childDepth: 0
	}, options);

	let childDepth = 1 + options.childDepth;
	options.childDepth++;

	let urlFilter = getUrlFilter(this);

	if(pages.length && pages[0].pluginType !== "eleventy-navigation") {
		throw new Error("Incorrect argument passed to eleventyNavigationToMarkdown filter. You must call `eleventyNavigation` or `eleventyNavigationBreadcrumb` first, like: `collection.all | eleventyNavigation | eleventyNavigationToMarkdown | safe`");
	}

	let indent = (new Array(childDepth)).join("  ") || "";
	return pages.length ? `${pages.map(entry => {
		return `${indent}* [${entry.title}](${urlFilter(entry.url)})${options.showExcerpt && entry.excerpt ? `: ${entry.excerpt}` : ""}\n${entry.children ? navigationToMarkdown.call(this, entry.children, options) : ""}`;
	}).join("")}` : "";
}

module.exports = {
	getDependencyGraph,
	findNavigationEntries,
	findBreadcrumbEntries,
	toHtml: navigationToHtml,
	toMarkdown: navigationToMarkdown
};