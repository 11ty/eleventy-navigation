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

function findBreadcrumbEntries(nodes, activeKey) {
	let graph = getDependencyGraph(nodes);

	return activeKey ? graph.dependenciesOf(activeKey).map(key => {
		let data = Object.assign({}, graph.getNodeData(key));
		delete data.children;
		data._isBreadcrumb = true;
		return data;
	}) : [];
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

	let urlFilter;
	if("getFilter" in this) {
		// v0.10.0 and above
		urlFilter = this.getFilter("url");
	} else if("nunjucksFilters" in this) {
		// backwards compat, hardcoded key
		urlFilter = this.nunjucksFilters.url;
	} else {
		// Theoretically we could just move on here with a `url => url` but then `pathPrefix`
		// would not work and it wouldn’t be obvious why—so let’s fail loudly to avoid that.
		throw new Error("Could not find a `url` filter for the eleventy-navigation plugin in eleventyNavigationToHtml filter.");
	}

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

module.exports = {
	getDependencyGraph,
	findNavigationEntries,
	findBreadcrumbEntries,
	toHtml: navigationToHtml
};