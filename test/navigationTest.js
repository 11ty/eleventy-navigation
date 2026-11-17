const test = require("node:test");
const assert = require("node:assert/strict");
const EleventyNavigation = require("../eleventy-navigation");

test("Empty navigation", () => {
	assert.deepEqual(EleventyNavigation.findNavigationEntries(), []);
});

test("One root page navigation", () => {
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
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[0].pluginType, "eleventy-navigation");

	// Warning, title must be preserved per the public API
	assert.equal(obj[0].title, "root1");
	// Warning, url must be preserved per the public API
	assert.equal(obj[0].url, "root1.html");

	assert.equal(obj[0].children.length, 0);
});

test("One root page navigation with separate title", () => {
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
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[0].pluginType, "eleventy-navigation");
	assert.equal(obj[0].title, "Another title");
	assert.equal(obj[0].children.length, 0);
});

test("One root, one child page navigation", () => {
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
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[0].children.length, 1);
	assert.equal(obj[0].children[0].parent, "root1");
	assert.equal(obj[0].children[0].key, "child1");
});

test("Three layers deep navigation", () => {
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
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[0].children.length, 1);
	assert.equal(obj[0].children[0].parent, "root1");
	assert.equal(obj[0].children[0].key, "child1");
	assert.equal(obj[0].children[0].children[0].parent, "child1");
	assert.equal(obj[0].children[0].children[0].key, "grandchild1");
});

test("One root, three child navigation (order)", () => {
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
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child4"
				},
				page: {
					url: "child4.html"
				}
			}
		}
	]);
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[0].children.length, 4);
	assert.equal(obj[0].children.map(e => e.key).join(","), "child2,child3,child1,child4");
});

test("One root, three child navigation, one with 0 (order)", () => {
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
					order: 0
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
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child4"
				},
				page: {
					url: "child4.html"
				}
			}
		}
	]);
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[0].children.length, 4);
	assert.equal(obj[0].children.map(e => e.key).join(","), "child2,child3,child1,child4");
});

test("One root, three child navigation (implied order)", () => {
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
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[0].children.length, 3);
	assert.equal(obj[0].children.map(e => e.key).join(","), "child3,child1,child2");
});

test("Show throw an error without a config", () => {
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

	assert.throws(() => {
		EleventyNavigation.toHtml(obj);
	});
});

let fakeConfig = {
	nunjucksFilters: {
		url: url => url
	}
};

let fakeNavigationEntries = [
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
];

let fakeNavigationEntriesEmptyUrl = [
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
				url: false
			}
		}
	}
];

test("Checking active class on output HTML", () => {
	let obj = EleventyNavigation.findNavigationEntries(fakeNavigationEntries);

	let html = EleventyNavigation.toHtml.call(fakeConfig, obj);
	assert.equal(html, `<ul><li><a href="root1.html">root1</a><ul><li><a href="child1.html">child1</a></li></ul></li></ul>`);

	let activeHtmlItem = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		activeKey: "child1",
		activeListItemClass: "this-is-the-active-item"
	});
	assert.equal(activeHtmlItem, `<ul><li><a href="root1.html">root1</a><ul><li class="this-is-the-active-item"><a href="child1.html">child1</a></li></ul></li></ul>`);

	let activeHtmlAnchor = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		activeKey: "child1",
		activeAnchorClass: "this-is-the-active-anchor"
	});
	assert.equal(activeHtmlAnchor, `<ul><li><a href="root1.html">root1</a><ul><li><a href="child1.html" class="this-is-the-active-anchor">child1</a></li></ul></li></ul>`);

	let activeHtmlItemAndAnchor = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		activeKey: "child1",
		activeListItemClass: "this-is-the-active-item",
		activeAnchorClass: "this-is-the-active-anchor"
	});
	assert.equal(activeHtmlItemAndAnchor, `<ul><li><a href="root1.html">root1</a><ul><li class="this-is-the-active-item"><a href="child1.html" class="this-is-the-active-anchor">child1</a></li></ul></li></ul>`);
});

test("Checking aria-current option on output HTML", () => {
	let obj = EleventyNavigation.findNavigationEntries(fakeNavigationEntries);

	let html = EleventyNavigation.toHtml.call(fakeConfig, obj);
	assert.ok(html.indexOf(`<li><a href="child1.html">child1</a></li>`) > -1);

	let activeHtmlAnchor = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		activeKey: "child1",
		useAriaCurrentAttr: true
	});
	assert.ok(activeHtmlAnchor.indexOf(`<li><a href="child1.html" aria-current="page">child1</a></li>`) > -1);
});

test("Checking has children class on output HTML", () => {
	let obj = EleventyNavigation.findNavigationEntries(fakeNavigationEntries);

	let activeHtml = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		listItemHasChildrenClass: "item-has-children"
	});
	assert.ok(activeHtml.indexOf(`<li class="item-has-children"><a href="root1.html">root1</a>`) > -1);
	assert.ok(activeHtml.indexOf(`<li><a href="child1.html">child1</a></li>`) > -1);
});

test("URL override", () => {
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

	assert.equal(obj[0].url, "https://www.zachleat.com/");
});

test("Breadcrumbs", () => {
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

	assert.equal(obj.length, 2);
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[1].key, "child1");
});

test("Breadcrumbs (include self)", () => {
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

	assert.equal(obj.length, 3);
	assert.equal(obj[0].key, "root1");
	assert.equal(obj[1].key, "child1");
	assert.equal(obj[2].key, "grandchild1");
});

test("Breadcrumbs (options.allowMissing)", () => {
	const entries = EleventyNavigation.findBreadcrumbEntries(
		[],
		"orphan",
		{allowMissing: true}
	);
	assert.equal(entries.length, 0);
});

test("Output markdown", () => {
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
	assert.equal(html, `* [root1](root1.html)
  * [child1](child1.html)
    * [grandchild1](grandchild1.html)
`);
});

test("Navigation entry contains page data", () => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				},
				page: {
					url: "root1.html"
				},
				tags: [
					"robot",
					"lesbian"
				],
				collections: {}
			}
		}
	]);

	// Page data like tags should be included in the obj
	assert.deepEqual(obj[0].data.tags, ["robot", "lesbian"]);
});

test("Missing url", () => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1",
				}
			}
		}
	]);

	assert.equal(EleventyNavigation.toHtml.call(fakeConfig, obj), `<ul><li><a>root1</a></li></ul>`);
});

test("Multiple roots", () => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1",
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					key: "root2"
				},
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root2",
					key: "child3",
				}
			}
		}
	]);

	assert.deepEqual(obj.map(e => e.key), ["root1", "root2"]);
	assert.deepEqual(obj[0].children.map(e => e.key), ["child1"]);
	assert.deepEqual(obj[1].children.map(e => e.key), ["child3"]);
});

test("Multiple roots, multiple keys", () => {
	let obj = EleventyNavigation.findNavigationEntries([
		{
			data: {
				eleventyNavigation: {
					key: "root1"
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root1",
					key: "child1",
				}
			}
		},
		{
			data: {
				eleventyNavigation: {
					key: "root2"
				},
			}
		},
		{
			data: {
				eleventyNavigation: {
					parent: "root2",
					key: "child3",
				}
			}
		}
	], "root1,root2");

	assert.deepEqual(obj.map(e => e.key), ["child1", "child3"]);
	assert.deepEqual(obj[0].children.map(e => e.key), []);
	assert.deepEqual(obj[1].children.map(e => e.key), []);
});

test("Breadcrumb include self", () => {
	let nodes = [
		{
			data: {
				eleventyNavigation: {
					key: "root1",
				}
			}
		}
	];
	let obj = EleventyNavigation.findBreadcrumbEntries(nodes, "root1", { includeSelf: true });

	assert.equal(EleventyNavigation.toHtml(obj), `<ul><li><a>root1</a></li></ul>`);
});

test("Breadcrumb include self (Liquid.js #35)", () => {
	let nodes = [
		{
			data: {
				eleventyNavigation: {
					key: "root1",
				}
			}
		}
	];
	let obj = EleventyNavigation.findBreadcrumbEntries(nodes, "root1", [ "includeSelf", true ]);

	assert.equal(EleventyNavigation.toHtml(obj), `<ul><li><a>root1</a></li></ul>`);
});

test("Use top level details", () => {
	let obj = EleventyNavigation.findNavigationEntries(fakeNavigationEntries);

	let html = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		useTopLevelDetails: true
	});
	assert.equal(html, `<ul><li><a href="root1.html">root1</a><details><summary>root1</summary><ul><li><a href="child1.html">child1</a></li></ul></details></li></ul>`);
});

test("Use top level details with empty url", () => {
	let obj = EleventyNavigation.findNavigationEntries(fakeNavigationEntriesEmptyUrl);

	let html = EleventyNavigation.toHtml.call(fakeConfig, obj, {
		useTopLevelDetails: true,
		anchorElementWithoutHref: "span",
	});
	assert.equal(html, `<ul><li><a href="root1.html">root1</a><details><summary>root1</summary><ul><li><span>child1</span></li></ul></details></li></ul>`);
});