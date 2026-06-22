#!/usr/bin/env node
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const catalog = require("../../src/data/plate-catalog.js");
const catalogValidation = require("../../src/catalog-checks/plate-catalog-validation.js");
const selectedAssetPaths = require("../../src/data/selected-asset-paths.js");
const selectedAssetFileRules = require("../../src/catalog-checks/selected-asset-file-rules.js");

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
                variantKind: catalog.variantKinds.EMBLEM,
                selectedAssetAltText: "Misc Emblem selected art",
                asset: "misc/emblem.jpg",
            },
        ],
    },
];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function withCatalogValidationFixture(fakeCatalog, callback) {
    const catalogPath = require.resolve("../../src/data/plate-catalog.js");
    const validationPath = require.resolve(
        "../../src/catalog-checks/plate-catalog-validation.js"
    );
    const originalCatalogModule = require.cache[catalogPath];
    const originalValidationModule = require.cache[validationPath];

    delete require.cache[validationPath];
    require.cache[catalogPath] = {
        id: catalogPath,
        filename: catalogPath,
        loaded: true,
        exports: fakeCatalog,
    };

    try {
        return callback(
            require("../../src/catalog-checks/plate-catalog-validation.js")
        );
    } finally {
        if (originalCatalogModule) {
            require.cache[catalogPath] = originalCatalogModule;
        } else {
            delete require.cache[catalogPath];
        }

        if (originalValidationModule) {
            require.cache[validationPath] = originalValidationModule;
        } else {
            delete require.cache[validationPath];
        }
    }
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

function runBrowserScript(scriptPath, context) {
    vm.runInNewContext(
        fs.readFileSync(path.join(__dirname, scriptPath), "utf8"),
        context,
        { filename: scriptPath }
    );
}

assert.deepEqual(Object.keys(catalog), [
    "categories",
    "photoStatuses",
    "variantKinds",
    "stickerStyles",
    "catalogProjections",
    "localImageProjections",
]);

assert.deepEqual(
    selectedAssetPaths.selectedAssetPaths("fixture/selected.jpg"),
    {
        fullSizePath: "assets/plates/full/fixture/selected.jpg",
        thumbnailPath: "assets/plates/thumbs/fixture/selected.jpg",
    }
);
assert.equal(
    selectedAssetFileRules.isRepositoryFullSizeJpegPath(
        "assets/plates/full/fixture/selected.jpg"
    ),
    true
);
assert.equal(
    selectedAssetFileRules.isRepositoryFullSizeJpegPath(
        "assets/plates/thumbs/fixture/selected.jpg"
    ),
    false
);
assert.equal(
    selectedAssetFileRules.isRepositoryThumbnailJpegPath(
        "assets/plates/thumbs/fixture/selected.jpeg"
    ),
    true
);
assert.equal(
    selectedAssetFileRules.thumbnailNeedsRefresh({
        fullSizeMetadata: { mtimeMs: 3000 },
        thumbnailMetadata: { mtimeMs: 1000 },
    }),
    true
);
assert.equal(
    selectedAssetFileRules.thumbnailNeedsRefresh({
        fullSizeMetadata: { mtimeMs: 1000 },
        thumbnailMetadata: { mtimeMs: 3000 },
    }),
    false
);
assert.equal(
    selectedAssetFileRules.thumbnailNeedsRefresh({
        fullSizeMetadata: { mtimeMs: 1000 },
        thumbnailMetadata: null,
    }),
    true
);

{
    const browserContext = { console };
    browserContext.window = browserContext;
    browserContext.globalThis = browserContext;

    runBrowserScript("../../src/data/selected-asset-paths.js", browserContext);
    runBrowserScript("../../src/data/plate-catalog.js", browserContext);

    assert.equal(browserContext.SelectedAssetFileRules, undefined);
    assert.deepEqual(Object.keys(browserContext.PlateCatalog), [
        "displayCategories",
        "displayChecklistSections",
    ]);
    assert.equal(
        browserContext.PlateCatalog.displayCategories()[0].variants[0].image
            .thumbnailSrc,
        "assets/plates/thumbs/collector_vehicles/collector_vehicle.jpg"
    );
}

const fixtureProjections = catalog.catalogProjections(fixtureCategories);
const selectedAssetProjectionsDescriptor = Object.getOwnPropertyDescriptor(
    catalog,
    "selectedAssetProjections"
);
const selectedAssetCompatibilityDiagnosticsDescriptor =
    Object.getOwnPropertyDescriptor(
        catalog,
        "photoStatusSelectedAssetCompatibilityDiagnosticsFor"
    );

assert.deepEqual(Object.keys(fixtureProjections), [
    "selectedAssets",
    "photoStatusPresentations",
    "displayCategories",
    "displayChecklistSections",
]);
assert.equal("photoStatusChecklistSections" in fixtureProjections, false);
assert.equal(selectedAssetProjectionsDescriptor.enumerable, false);
assert.equal(typeof selectedAssetProjectionsDescriptor.value, "function");
assert.equal(selectedAssetCompatibilityDiagnosticsDescriptor.enumerable, false);
assert.equal(
    typeof selectedAssetCompatibilityDiagnosticsDescriptor.value,
    "function"
);

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
            fullSizePath: "assets/plates/full/fixture/selected.jpg",
            thumbnailPath: "assets/plates/thumbs/fixture/selected.jpg",
            altText: "Selected Plate plate",
            variantKind: catalog.variantKinds.PLATE,
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
            fullSizePath: "assets/plates/full/fixture/needs-upgrade.jpg",
            thumbnailPath: "assets/plates/thumbs/fixture/needs-upgrade.jpg",
            altText: "Needs Upgrade Plate plate",
            variantKind: catalog.variantKinds.PLATE,
        },
    ]
);

assert.deepEqual(
    catalogValidation.selectedAssetEntries(fixtureCategories),
    fixtureProjections.selectedAssets
);
assert.deepEqual(
    catalog.selectedAssetProjections(fixtureCategories),
    fixtureProjections.selectedAssets
);

{
    const projectionCategories = [
        {
            id: "source",
            title: "Source",
            plates: [
                {
                    id: "source-variant",
                    title: "Source Variant",
                    asset: "source/raw.jpg",
                },
            ],
        },
    ];
    const projectionSelectedAssets = [
        {
            catalogRef: "projection/selected",
            category: {
                id: "projection",
                title: "Projection",
            },
            variant: {
                id: "selected",
                title: "Selected",
            },
            asset: "projection/selected.jpg",
            fullSizePath: "assets/plates/full/projection/selected.jpg",
            thumbnailPath: "assets/plates/thumbs/projection/selected.jpg",
            altText: "Projection selected emblem",
            variantKind: catalog.variantKinds.EMBLEM,
        },
    ];
    let projectionCalls = 0;

    withCatalogValidationFixture(
        {
            categories: [],
            catalogProjections() {
                throw new Error("wide projection helper should not run");
            },
            selectedAssetProjections(sourceCategories) {
                projectionCalls += 1;
                assert.equal(sourceCategories, projectionCategories);

                return projectionSelectedAssets;
            },
        },
        (validation) => {
            assert.deepEqual(
                validation.selectedAssetEntries(projectionCategories),
                projectionSelectedAssets
            );
            assert.deepEqual(
                validation.selectedAssetRequirements(projectionCategories),
                [
                    {
                        catalogRef: "projection/selected",
                        fullSizePath: "assets/plates/full/projection/selected.jpg",
                        thumbnailPath: "assets/plates/thumbs/projection/selected.jpg",
                    },
                ]
            );
            assert.deepEqual(
                validation.selectedAssetFilePaths(projectionCategories),
                {
                    fullSizePaths: ["assets/plates/full/projection/selected.jpg"],
                    thumbnailPaths: ["assets/plates/thumbs/projection/selected.jpg"],
                }
            );
        }
    );

    assert.equal(projectionCalls, 3);
}

{
    const validPlate = {
        id: "selected",
        title: "Selected",
        asset: "source/selected.jpg",
    };
    const malformedProjectionCategories = [
        null,
        {
            id: "missing-plates",
            title: "Missing Plates",
        },
        {
            id: "source",
            title: "Source",
            plates: [null, validPlate],
        },
    ];
    const projectionSelectedAssets = [
        {
            catalogRef: "source/selected",
            category: {
                id: "source",
                title: "Source",
            },
            variant: {
                id: "selected",
                title: "Selected",
            },
            asset: "source/selected.jpg",
            fullSizePath: "assets/plates/full/source/selected.jpg",
            thumbnailPath: "assets/plates/thumbs/source/selected.jpg",
            altText: "Selected plate",
            variantKind: catalog.variantKinds.PLATE,
        },
    ];
    let projectionCategories;

    withCatalogValidationFixture(
        {
            categories: [],
            catalogProjections() {
                throw new Error("wide projection helper should not run");
            },
            selectedAssetProjections(sourceCategories) {
                projectionCategories = sourceCategories;

                return projectionSelectedAssets;
            },
        },
        (validation) => {
            assert.deepEqual(
                validation.selectedAssetEntries(malformedProjectionCategories),
                projectionSelectedAssets
            );
        }
    );

    assert.deepEqual(projectionCategories, [
        {
            id: "source",
            title: "Source",
            plates: [validPlate],
        },
    ]);
}

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

assert.deepEqual(
    catalog.photoStatusSelectedAssetCompatibilityDiagnosticsFor(
        catalog.photoStatuses.MISSING,
        {
            asset: "fixture/missing.jpg",
            hasSelectedAssetAltText: true,
        }
    ),
    [
        "must use asset: null when Photo Status is missing",
        "must not override Selected Asset alt text when Photo Status is missing",
    ]
);

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
                    thumbnailSrc: "assets/plates/thumbs/fixture/selected.jpg",
                    fullSizeSrc: "assets/plates/full/fixture/selected.jpg",
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
                    thumbnailSrc: "assets/plates/thumbs/fixture/needs-upgrade.jpg",
                    fullSizeSrc: "assets/plates/full/fixture/needs-upgrade.jpg",
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

assert.deepEqual(
    withCatalogValidationFixture(
        {
            photoStatusPolicyErrors: () => ["fixture Photo Status policy error"],
            photoStatusChecklistPolicies: () => {
                throw new Error("projection policy helper should not run");
            },
            catalogProjections: () => {
                throw new Error("projection helper should not run");
            },
        },
        (validation) => validation.validatePhotoStatusPolicy()
    ),
    ["fixture Photo Status policy error"]
);

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

assert.deepEqual(
    catalogValidation.selectedAssetEntries(validCatalogFixture).map(
        (selectedAsset) => ({
            catalogRef: selectedAsset.catalogRef,
            altText: selectedAsset.altText,
            variantKind: selectedAsset.variantKind,
        })
    ),
    [
        {
            catalogRef: "alpha/alpha-selected",
            altText: "Alpha Selected plate",
            variantKind: catalog.variantKinds.PLATE,
        },
        {
            catalogRef: "misc/misc-emblem",
            altText: "Misc Emblem selected art",
            variantKind: catalog.variantKinds.EMBLEM,
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
        fullSizePath: "assets/plates/full/alpha/selected.jpg",
        thumbnailPath: "assets/plates/thumbs/alpha/selected.jpg",
    },
    {
        catalogRef: "misc/misc-emblem",
        fullSizePath: "assets/plates/full/misc/emblem.jpg",
        thumbnailPath: "assets/plates/thumbs/misc/emblem.jpg",
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
    invalid[0].id = "Alpha";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "Category Alpha has invalid id: Alpha"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[0].plates[1].id = "alpha_selected";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "alpha/alpha_selected has invalid Variant id"
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
    invalid[0].plates[1].variantKind = "decal";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "alpha/alpha-selected has invalid Variant Kind: decal"
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
    invalid[0].plates[0].asset = "alpha/missing.jpg";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "alpha/alpha-missing must use asset: null when Photo Status is missing"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[0].plates[0].selectedAssetAltText = "Alpha Missing selected art";

    assertHasError(
        catalogValidation.validateCatalog(invalid),
        "alpha/alpha-missing must not override Selected Asset alt text when Photo Status is missing"
    );
}

{
    const invalid = clone(validCatalogFixture);
    invalid[0].plates[0].asset = "alpha/missing.jpg";
    invalid[0].plates[0].selectedAssetAltText = "Alpha Missing selected art";
    const errors = catalogValidation.validateCatalog(invalid);

    assertHasError(
        errors,
        "alpha/alpha-missing must use asset: null when Photo Status is missing"
    );
    assertHasError(
        errors,
        "alpha/alpha-missing must not override Selected Asset alt text when Photo Status is missing"
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
        "assets/plates/full/fixture/selected.jpg",
        "assets/plates/full/fixture/needs-upgrade.jpg",
    ],
    thumbnailPaths: [
        "assets/plates/thumbs/fixture/selected.jpg",
        "assets/plates/thumbs/fixture/needs-upgrade.jpg",
    ],
});

assert.deepEqual(
    catalogValidation.unselectedLocalImages({
        sourceCategories: fixtureCategories,
        fullSizePaths: [
            "assets/plates/full/fixture/selected.jpg",
            "assets/plates/full/fixture/needs-upgrade.jpg",
            "assets/plates/full/fixture/unselected.jpg",
        ],
        thumbnailPaths: [
            "assets/plates/thumbs/fixture/selected.jpg",
            "assets/plates/thumbs/fixture/needs-upgrade.jpg",
            "assets/plates/thumbs/fixture/unselected.jpg",
        ],
    }),
    [
        {
            asset: "fixture/unselected.jpg",
            fullSizePath: "assets/plates/full/fixture/unselected.jpg",
            thumbnailPath: "assets/plates/thumbs/fixture/unselected.jpg",
            hasMatchingThumbnail: true,
        },
    ]
);

{
    const malformedLocalImageCategories = [
        null,
        {
            id: "missing-variants",
            title: "Missing Variants",
            sticker: { style: "blue", mark: "MIS" },
        },
        {
            id: "fixture",
            title: "Fixture",
            sticker: { style: "blue", mark: "FIX" },
            plates: [null, selectedPlate, needsUpgradePlate],
        },
    ];
    const errors = catalogValidation.validateCatalog(
        malformedLocalImageCategories
    );

    assertHasError(errors, "Category at index 0 must be an object");
    assertHasError(
        errors,
        "Category missing-variants must have at least one Variant"
    );
    assertHasError(
        errors,
        "Category fixture Variant at index 0 must be an object"
    );
    assert.deepEqual(
        catalogValidation.unselectedLocalImages({
            sourceCategories: malformedLocalImageCategories,
            fullSizePaths: [
                "assets/plates/full/fixture/selected.jpg",
                "assets/plates/full/fixture/needs-upgrade.jpg",
                "assets/plates/full/fixture/unselected.jpg",
            ],
            thumbnailPaths: [
                "assets/plates/thumbs/fixture/selected.jpg",
                "assets/plates/thumbs/fixture/needs-upgrade.jpg",
                "assets/plates/thumbs/fixture/unselected.jpg",
            ],
        }),
        [
            {
                asset: "fixture/unselected.jpg",
                fullSizePath: "assets/plates/full/fixture/unselected.jpg",
                thumbnailPath: "assets/plates/thumbs/fixture/unselected.jpg",
                hasMatchingThumbnail: true,
            },
        ]
    );
}

console.log("Plate catalog tests passed.");
