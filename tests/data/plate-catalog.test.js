#!/usr/bin/env node
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const browser = { console };
browser.window = browser;
browser.globalThis = browser;

function runBrowserScript(scriptPath) {
    vm.runInNewContext(
        fs.readFileSync(path.join(__dirname, scriptPath), "utf8"),
        browser,
        { filename: scriptPath }
    );
}

runBrowserScript("../../src/data/selected-asset-paths.js");
runBrowserScript("../../src/data/plate-catalog.js");

assert.equal(typeof browser.PlateCatalog.displayCategories, "function");
assert.equal(typeof browser.PlateCatalog.displayChecklistSections, "function");

assert.deepEqual(
    JSON.parse(
        JSON.stringify(
            browser.PlateCatalog.displayCategories().map((category) => ({
                title: category.title,
                fragmentId: category.fragmentId,
            }))
        )
    ),
    [
        { title: "Collector Vehicles", fragmentId: "clv" },
        { title: "Colleges and Universities", fragmentId: "uni" },
        { title: "First Responders", fragmentId: "911" },
        { title: "Military and Veterans", fragmentId: "mil" },
        { title: "Organizations", fragmentId: "org" },
        { title: "Parks and Environment", fragmentId: "prk" },
        { title: "Special Interests", fragmentId: "int" },
        { title: "Sports", fragmentId: "spt" },
        { title: "Tribal, Self-Issued", fragmentId: "trb-self" },
        { title: "Tribal, WA", fragmentId: "trb-wa" },
        { title: "Miscellaneous", fragmentId: "msc" },
    ]
);

const fixtureCategories = [
    {
        id: "fixture",
        title: "Fixture",
        sticker: { style: "blue", mark: "FIX" },
        plates: [
            {
                id: "selected",
                title: "Selected Plate",
                photoStatus: "satisfied",
                asset: "fixture/selected.jpg",
                selectedAssetAltText: "Selected Plate on display",
            },
            {
                id: "missing",
                title: "Missing Plate",
                photoStatus: "missing",
                asset: null,
            },
            {
                id: "needs-upgrade",
                title: "Needs Upgrade Plate",
                photoStatus: "needs-upgrade",
                asset: "fixture/needs-upgrade.jpg",
            },
        ],
    },
];

const [displayCategory] = browser.PlateCatalog.displayCategories(
    fixtureCategories
);
const [selected, missing, needsUpgrade] = displayCategory.variants;

assert.equal(displayCategory.fragmentId, "fix");

assert.deepEqual(JSON.parse(JSON.stringify(selected.image)), {
    thumbnailSrc: "assets/plates/thumbs/fixture/selected.jpg",
    fullSizeSrc: "assets/plates/full/fixture/selected.jpg",
    altText: "Selected Plate on display",
});
assert.deepEqual(JSON.parse(JSON.stringify(missing.missingPlaceholder)), {
    ariaLabel: "Missing Plate plate \u2014 photo pending",
    stripDetail: "No photo on file",
    plateTitle: "Missing Plate",
    categoryTitle: "Fixture",
    statusText: "Pending",
    stampText: "Pending",
});
assert.deepEqual(JSON.parse(JSON.stringify(needsUpgrade.badge)), {
    text: "LOW QUALITY",
    ariaLabel: "Low quality photo",
});

const checklistSections = browser.PlateCatalog.displayChecklistSections(
    fixtureCategories
);

assert.deepEqual(
    JSON.parse(JSON.stringify(checklistSections)),
    [
        {
            status: "missing",
            title: "Left to Find",
            emptyMessage: "Collection is complete! \u{1F389}",
            count: 1,
            groups: [
                {
                    category: { id: "fixture", title: "Fixture" },
                    variants: [{ id: "missing", title: "Missing Plate" }],
                },
            ],
        },
        {
            status: "needs-upgrade",
            title: "Needs Better Photo",
            emptyMessage: "No upgrades needed. \u{1F44D}",
            count: 1,
            groups: [
                {
                    category: { id: "fixture", title: "Fixture" },
                    variants: [
                        {
                            id: "needs-upgrade",
                            title: "Needs Upgrade Plate",
                        },
                    ],
                },
            ],
        },
    ]
);

console.log("Plate catalog tests passed.");
