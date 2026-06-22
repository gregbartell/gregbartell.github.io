#!/usr/bin/env node
const assert = require("assert/strict");
const catalog = require("./plate-catalog.js");
const catalogValidation = require("./plate-catalog-validation.js");

assert.deepEqual(Object.keys(globalThis.PlateCatalog), [
    "displayCategories",
    "displayChecklistSections",
]);

const fixtureCategories = [
    {
        id: "fixture",
        title: "Fixture",
        sticker: { style: "blue", mark: "FIX" },
        plates: [
            {
                id: "selected",
                title: "Selected Plate",
                photoStatus: catalog.photoStatuses.SATISFIED,
                asset: "fixture/selected.jpg",
            },
            {
                id: "missing",
                title: "Missing Plate",
                photoStatus: catalog.photoStatuses.MISSING,
                asset: null,
            },
            {
                id: "needs-upgrade",
                title: "Needs Upgrade Plate",
                photoStatus: catalog.photoStatuses.NEEDS_UPGRADE,
                asset: "fixture/needs-upgrade.jpg",
            },
        ],
    },
];

const selectedPlate = fixtureCategories[0].plates[0];
const missingPlate = fixtureCategories[0].plates[1];
const needsUpgradePlate = fixtureCategories[0].plates[2];
const validCatalogFixture = [
    {
        id: "alpha",
        title: "Alpha",
        sticker: { style: "blue", mark: "ALP" },
        plates: [
            {
                id: "alpha-missing",
                title: "Alpha Missing",
                photoStatus: catalog.photoStatuses.MISSING,
                asset: null,
            },
            {
                id: "alpha-selected",
                title: "Alpha Selected",
                photoStatus: catalog.photoStatuses.SATISFIED,
                asset: "alpha/selected.jpg",
            },
        ],
    },
    {
        id: "misc",
        title: "Miscellaneous",
        sticker: { style: "black", mark: "MSC" },
        plates: [
            {
                id: "misc-emblem",
                title: "Misc Emblem",
                photoStatus: catalog.photoStatuses.SATISFIED,
                imageKind: catalog.imageKinds.EMBLEM,
                selectedAssetAltText: "Misc Emblem selected art",
                asset: "misc/emblem.jpg",
            },
        ],
    },
];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function assertHasError(errors, expected) {
    assert.ok(
        errors.includes(expected),
        `Expected error:\n${expected}\nActual errors:\n${errors.join("\n")}`
    );
}

function assertProjectionDataProperty(projections, key) {
    const descriptor = Object.getOwnPropertyDescriptor(projections, key);

    assert.equal(descriptor.enumerable, true);
    assert.equal(Object.prototype.hasOwnProperty.call(descriptor, "value"), true);
    assert.equal(descriptor.get, undefined);
    assert.equal(Array.isArray(descriptor.value), true);
}

assert.deepEqual(Object.keys(catalog), [
    "categories",
    "photoStatuses",
    "imageKinds",
    "stickerStyles",
    "catalogProjections",
    "localImageProjections",
]);

const fixtureProjections = catalog.catalogProjections(fixtureCategories);

assert.deepEqual(Object.keys(fixtureProjections), [
    "selectedAssets",
    "photoStatusPresentations",
    "displayCategories",
    "displayChecklistSections",
]);
assert.equal("photoStatusChecklistSections" in fixtureProjections, false);

Object.keys(fixtureProjections).forEach((key) =>
    assertProjectionDataProperty(fixtureProjections, key)
);

assert.deepEqual(
    fixtureProjections.selectedAssets,
    [
        {
            catalogRef: "fixture/selected",
            category: {
                id: "fixture",
                title: "Fixture",
            },
            variant: {
                id: "selected",
                title: "Selected Plate",
            },
            asset: "fixture/selected.jpg",
            fullSizePath: "pics/fixture/selected.jpg",
            thumbnailPath: "pics/thumbs/fixture/selected.jpg",
            altText: "Selected Plate plate",
            imageKind: catalog.imageKinds.PLATE,
        },
        {
            catalogRef: "fixture/needs-upgrade",
            category: {
                id: "fixture",
                title: "Fixture",
            },
            variant: {
                id: "needs-upgrade",
                title: "Needs Upgrade Plate",
            },
            asset: "fixture/needs-upgrade.jpg",
            fullSizePath: "pics/fixture/needs-upgrade.jpg",
            thumbnailPath: "pics/thumbs/fixture/needs-upgrade.jpg",
            altText: "Needs Upgrade Plate plate",
            imageKind: catalog.imageKinds.PLATE,
        },
    ]
);

assert.deepEqual(
    catalogValidation.selectedAssetEntries(fixtureCategories),
    fixtureProjections.selectedAssets
);

assert.deepEqual(fixtureProjections.photoStatusPresentations, [
    {
        catalogRef: "fixture/selected",
        category: {
            id: "fixture",
            title: "Fixture",
        },
        variant: {
            id: "selected",
            title: "Selected Plate",
        },
        status: catalog.photoStatuses.SATISFIED,
        badge: null,
        missingPlaceholder: null,
    },
    {
        catalogRef: "fixture/missing",
        category: {
            id: "fixture",
            title: "Fixture",
        },
        variant: {
            id: "missing",
            title: "Missing Plate",
        },
        status: catalog.photoStatuses.MISSING,
        badge: null,
        missingPlaceholder: {
            ariaLabel: "Missing Plate plate \u2014 photo pending",
            stripDetail: "No photo on file",
            plateTitle: "Missing Plate",
            categoryTitle: "Fixture",
            statusText: "Pending",
            stampText: "Pending",
        },
    },
    {
        catalogRef: "fixture/needs-upgrade",
        category: {
            id: "fixture",
            title: "Fixture",
        },
        variant: {
            id: "needs-upgrade",
            title: "Needs Upgrade Plate",
        },
        status: catalog.photoStatuses.NEEDS_UPGRADE,
        badge: {
            text: "LOW QUALITY",
            ariaLabel: "Low quality photo",
        },
        missingPlaceholder: null,
    },
]);

assert.deepEqual(catalog.photoStatusPolicyErrors(), []);

assert.deepEqual(catalog.photoStatusChecklistPolicies(), [
    {
        status: catalog.photoStatuses.MISSING,
        title: "Left to Find",
        emptyMessage: "Collection is complete! \u{1F389}",
    },
    {
        status: catalog.photoStatuses.NEEDS_UPGRADE,
        title: "Needs Better Photo",
        emptyMessage: "No upgrades needed. \u{1F44D}",
    },
]);

assert.deepEqual(fixtureProjections.displayChecklistSections, [
    {
        status: catalog.photoStatuses.MISSING,
        title: "Left to Find",
        emptyMessage: "Collection is complete! \u{1F389}",
        count: 1,
        groups: [
            {
                category: {
                    id: "fixture",
                    title: "Fixture",
                },
                variants: [
                    {
                        id: "missing",
                        title: "Missing Plate",
                    },
                ],
            },
        ],
    },
    {
        status: catalog.photoStatuses.NEEDS_UPGRADE,
        title: "Needs Better Photo",
        emptyMessage: "No upgrades needed. \u{1F44D}",
        count: 1,
        groups: [
            {
                category: {
                    id: "fixture",
                    title: "Fixture",
                },
                variants: [
                    {
                        id: "needs-upgrade",
                        title: "Needs Upgrade Plate",
                    },
                ],
            },
        ],
    },
]);

assert.deepEqual(fixtureProjections.displayCategories, [
    {
        id: "fixture",
        title: "Fixture",
        sticker: {
            style: "blue",
            mark: "FIX",
            foot: "WASHINGTON",
        },
        variants: [
            {
                id: "selected",
                title: "Selected Plate",
                photoStatus: catalog.photoStatuses.SATISFIED,
                image: {
                    thumbnailSrc: "pics/thumbs/fixture/selected.jpg",
                    fullSizeSrc: "pics/fixture/selected.jpg",
                    altText: "Selected Plate plate",
                },
                missingPlaceholder: null,
                badge: null,
            },
            {
                id: "missing",
                title: "Missing Plate",
                photoStatus: catalog.photoStatuses.MISSING,
                image: null,
                missingPlaceholder: {
                    ariaLabel: "Missing Plate plate \u2014 photo pending",
                    stripDetail: "No photo on file",
                    plateTitle: "Missing Plate",
                    categoryTitle: "Fixture",
                    statusText: "Pending",
                    stampText: "Pending",
                },
                badge: null,
            },
            {
                id: "needs-upgrade",
                title: "Needs Upgrade Plate",
                photoStatus: catalog.photoStatuses.NEEDS_UPGRADE,
                image: {
                    thumbnailSrc: "pics/thumbs/fixture/needs-upgrade.jpg",
                    fullSizeSrc: "pics/fixture/needs-upgrade.jpg",
                    altText: "Needs Upgrade Plate plate",
                },
                missingPlaceholder: null,
                badge: {
                    text: "LOW QUALITY",
                    ariaLabel: "Low quality photo",
                },
            },
        ],
    },
]);

assert.deepEqual(catalogValidation.validatePhotoStatusPolicy(fixtureCategories), []);

assert.deepEqual(catalogValidation.validateCatalog(validCatalogFixture), []);

assert.deepEqual(
    catalog.catalogProjections(validCatalogFixture).selectedAssets.map(
        (selectedAsset) => ({
            catalogRef: selectedAsset.catalogRef,
            altText: selectedAsset.altText,
        })
    ),
    [
        {
            catalogRef: "alpha/alpha-selected",
            altText: "Alpha Selected plate",
        },
        {
            catalogRef: "misc/misc-emblem",
            altText: "Misc Emblem selected art",
        },
    ]
);

assert.equal(
    catalog.catalogProjections().selectedAssets.find(
        (selectedAsset) =>
            selectedAsset.catalogRef ===
            "mil/veteran-military-service-award-emblems"
    ).altText,
    "Veteran/Military Service Award emblems"
);

assert.deepEqual(
    catalogValidation.catalogOrderPolicy.diagnosticsForCategories(
        validCatalogFixture
    ),
    []
);
assert.equal(
    catalogValidation.catalogOrderPolicy.compareTitles(
        "Category 2",
        "Category 10"
    ) < 0,
    true
);
assert.equal(
    catalogValidation.catalogOrderPolicy.compareTitles("alpha", "Alpha"),
    0
);

{
    const invalid = clone(validCatalogFixture);
    invalid.reverse();

    assertHasError(
        catalogValidation.catalogOrderPolicy.diagnosticsForCategories(invalid),
        "Catalog Order: Miscellaneous must be the last Category"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid.unshift({
        id: "beta",
        title: "Beta",
        sticker: { style: "red", mark: "BET" },
        plates: [
            {
                id: "beta-selected",
                title: "Beta Selected",
                photoStatus: catalog.photoStatuses.SATISFIED,
                asset: "beta/selected.jpg",
            },
        ],
    });

    assertHasError(
        catalogValidation.catalogOrderPolicy.diagnosticsForCategories(invalid),
        "Catalog Order: Categories before Miscellaneous must be alphabetical by title"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[0].plates.reverse();

    assertHasError(
        catalogValidation.catalogOrderPolicy.diagnosticsForVariants(invalid[0]),
        "Catalog Order: Variants in Alpha must be alphabetical by title"
    );
}

assert.deepEqual(catalogValidation.selectedAssetRequirements(validCatalogFixture), [
    {
        catalogRef: "alpha/alpha-selected",
        fullSizePath: "pics/alpha/selected.jpg",
        thumbnailPath: "pics/thumbs/alpha/selected.jpg",
    },
    {
        catalogRef: "misc/misc-emblem",
        fullSizePath: "pics/misc/emblem.jpg",
        thumbnailPath: "pics/thumbs/misc/emblem.jpg",
    },
]);

{
    const invalid = clone(validCatalogFixture);
    invalid.reverse();

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "Catalog Order: Miscellaneous must be the last Category"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid.unshift({
        id: "beta",
        title: "Beta",
        sticker: { style: "red", mark: "BET" },
        plates: [
            {
                id: "beta-selected",
                title: "Beta Selected",
                photoStatus: catalog.photoStatuses.SATISFIED,
                asset: "beta/selected.jpg",
            },
        ],
    });

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "Catalog Order: Categories before Miscellaneous must be alphabetical by title"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[0].plates.reverse();

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "Catalog Order: Variants in Alpha must be alphabetical by title"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[0].plates[1].photoStatus = "archived";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "alpha/alpha-selected has invalid Photo Status: archived"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[0].plates[1].imageKind = "decal";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "alpha/alpha-selected has invalid Image Kind: decal"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[1].plates[0].selectedAssetAltText = " ";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "misc/misc-emblem Selected Asset alt text override must be non-empty text"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[0].plates[1].asset = null;

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "alpha/alpha-selected must have a Selected Asset when Photo Status is not missing"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[1].plates[0].id = "alpha-selected";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "duplicate Variant id: alpha-selected"
    );
}

assert.deepEqual(catalogValidation.selectedAssetFilePaths(fixtureCategories), {
    fullSizePaths: [
        "pics/fixture/selected.jpg",
        "pics/fixture/needs-upgrade.jpg",
    ],
    thumbnailPaths: [
        "pics/thumbs/fixture/selected.jpg",
        "pics/thumbs/fixture/needs-upgrade.jpg",
    ],
});

assert.deepEqual(
    catalogValidation.unselectedLocalImages({
        sourceCategories: fixtureCategories,
        fullSizePaths: [
            "pics/fixture/selected.jpg",
            "pics/fixture/needs-upgrade.jpg",
            "pics/fixture/unselected.jpg",
        ],
        thumbnailPaths: [
            "pics/thumbs/fixture/selected.jpg",
            "pics/thumbs/fixture/needs-upgrade.jpg",
            "pics/thumbs/fixture/unselected.jpg",
        ],
    }),
    [
        {
            asset: "fixture/unselected.jpg",
            fullSizePath: "pics/fixture/unselected.jpg",
            thumbnailPath: "pics/thumbs/fixture/unselected.jpg",
            hasMatchingThumbnail: true,
        },
    ]
);

console.log("Plate catalog tests passed.");
