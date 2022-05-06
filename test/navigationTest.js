const test = require("ava");
const EleventyNavigation = require("../eleventy-navigation");

test("Empty navigation", t => {
	t.deepEqual(EleventyNavigation.findNavigationEntries(), []);
});

test("One root page navigation", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		}
	]);
	t.is(obj[0].key, "root1");
	t.is(obj[0].pluginType, "eleventy-navigation");

	// Warning, title must be preserved per the public API
	t.is(obj[0].title, "root1");
	// Warning, url must be preserved per the public API
	t.is(obj[0].url, "root1.html");

	t.is(obj[0].children.length, 0);
});

test("One root page navigation with separate title", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1",
					title: "Another title"
				},
				page: {
					url: "root1.html"
				}
			}
		}
	]);
	t.is(obj[0].key, "root1");
	t.is(obj[0].pluginType, "eleventy-navigation");
	t.is(obj[0].title, "Another title");
	t.is(obj[0].children.length, 0);
});

test("One root, one child page navigation", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1"
				},
				page: {
					url: "child1.html"
				}
			}
		}
	]);
	t.is(obj[0].key, "root1");
	t.is(obj[0].children.length, 1);
	t.is(obj[0].children[0].parent, "root1");
	t.is(obj[0].children[0].key, "child1");
});

test("Three layers deep navigation", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1"
				},
				page: {
					url: "child1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "child1",
					key: "grandchild1"
				},
				page: {
					url: "grandchild1.html"
				}
			}
		}
	]);
	t.is(obj[0].key, "root1");
	t.is(obj[0].children.length, 1);
	t.is(obj[0].children[0].parent, "root1");
	t.is(obj[0].children[0].key, "child1");
	t.is(obj[0].children[0].children[0].parent, "child1");
	t.is(obj[0].children[0].children[0].key, "grandchild1");
});

test("One root, three child navigation (order)", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1",
					order: 3
				},
				page: {
					url: "child1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child2",
					order: 1
				},
				page: {
					url: "child2.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child3",
					order: 2
				},
				page: {
					url: "child3.html"
				}
			}
		}
	]);
	t.is(obj[0].key, "root1");
	t.is(obj[0].children.length, 3);
	t.is(obj[0].children[0].key, "child2");
	t.is(obj[0].children[1].key, "child3");
	t.is(obj[0].children[2].key, "child1");
});

test("One root, three child navigation (implied order)", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1",
					order: 3
				},
				page: {
					url: "child1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child2"
				},
				page: {
					url: "child2.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child3",
					order: -1
				},
				page: {
					url: "child3.html"
				}
			}
		}
	]);
	t.is(obj[0].key, "root1");
	t.is(obj[0].children.length, 3);
	t.is(obj[0].children[0].key, "child3");
	t.is(obj[0].children[1].key, "child2");
	t.is(obj[0].children[2].key, "child1");
});

test("Show throw an error without a config", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		}
	]);

	t.throws(() => {
		EleventyNavigation.toHtml(obj);
	});
});

let fakeConfig = {
	nunjucksFilters: {
		url: url => url
	}
};

test("Checking active class on output HTML", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1"
				},
				page: {
					url: "child1.html"
				}
			}
		}
	]);

	let html = EleventyNavigation.toHtml.call(fakeConfig, obj);
	t.true(html.indexOf(`<li><a href="child1.html">child1</a></li>`) > -1);

	let activeHtmlItem = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		activeKey: "child1",
		activeListItemClass: "this-is-the-active-item"
	});
	t.true(activeHtmlItem.indexOf(`<li class="this-is-the-active-item"><a href="child1.html">child1</a></li>`) > -1);
  
	let activeHtmlAnchor = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		activeKey: "child1",
		activeAnchorClass: "this-is-the-active-anchor"
	});
	t.true(activeHtmlAnchor.indexOf(`<li><a href="child1.html" class="this-is-the-active-anchor">child1</a></li>`) > -1);

	let activeHtmlItemAndAnchor = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		activeKey: "child1",
		activeListItemClass: "this-is-the-active-item",
		activeAnchorClass: "this-is-the-active-anchor"
	});
	t.true(activeHtmlItemAndAnchor.indexOf(`<li class="this-is-the-active-item"><a href="child1.html" class="this-is-the-active-anchor">child1</a></li>`) > -1);
});

test("Checking has children class on output HTML", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1"
				},
				page: {
					url: "child1.html"
				}
			}
		}
	]);

	let activeHtml = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		listItemHasChildrenClass: "item-has-children"
	});
	t.true(activeHtml.indexOf(`<li class="item-has-children"><a href="root1.html">root1</a>`) > -1);
	t.true(activeHtml.indexOf(`<li><a href="child1.html">child1</a></li>`) > -1);
});

test("URL override", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1",
					url: "https://www.zachleat.com/"
				},
				page: {
					url: "root1.html"
				}
			}
		}
	]);

	t.is(obj[0].url, "https://www.zachleat.com/");
});

test("Breadcrumbs", t => {
	let obj = EleventyNavigation.findBreadcrumbEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1"
				},
				page: {
					url: "child1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "child1",
					key: "grandchild1"
				},
				page: {
					url: "grandchild1.html"
				}
			}
		}
	], "grandchild1");

	t.is(obj.length, 2);
	t.is(obj[0].key, "root1");
	t.is(obj[1].key, "child1");
});

test("Breadcrumbs (include self)", t => {
	let obj = EleventyNavigation.findBreadcrumbEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1"
				},
				page: {
					url: "child1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "child1",
					key: "grandchild1"
				},
				page: {
					url: "grandchild1.html"
				}
			}
		}
	], "grandchild1", {
		includeSelf: true
	});

	t.is(obj.length, 3);
	t.is(obj[0].key, "root1");
	t.is(obj[1].key, "child1");
	t.is(obj[2].key, "grandchild1");
});

test("Breadcrumbs (options.allowMissing)", t => {
	const entries = EleventyNavigation.findBreadcrumbEntries(
		[],
		"orphan",
		{allowMissing: true}
	);
	t.is(entries.length, 0);
});

test("Output markdown", t => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1"
				},
				page: {
					url: "child1.html"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "child1",
					key: "grandchild1"
				},
				page: {
					url: "grandchild1.html"
				}
			}
		}
	]);

	let html = EleventyNavigation.toMarkdown.call(fakeConfig, obj);
	t.is(html, `* [root1](root1.html)
  * [child1](child1.html)
    * [grandchild1](grandchild1.html)
`);
});