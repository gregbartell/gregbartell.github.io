#!/usr/bin/env node
const assert = require("assert/strict");
const catalog = require("./plate-catalog.js");

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

assert.deepEqual(catalog.selectedAssetFor(selectedPlate), {
    asset: "fixture/selected.jpg",
    fullSizePath: "pics/fixture/selected.jpg",
    thumbnailPath: "pics/thumbs/fixture/selected.jpg",
    altText: "Selected Plate plate",
    imageKind: catalog.imageKinds.PLATE,
});

assert.equal(catalog.selectedAssetFor(missingPlate), null);

assert.deepEqual(catalog.photoStatusPresentationFor(selectedPlate), {
    status: catalog.photoStatuses.SATISFIED,
    badge: null,
    missingPlaceholder: null,
});

assert.deepEqual(
    catalog.photoStatusPresentationFor(missingPlate, fixtureCategories[0]),
    {
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
    }
);

assert.deepEqual(catalog.photoStatusPresentationFor(needsUpgradePlate), {
    status: catalog.photoStatuses.NEEDS_UPGRADE,
    badge: {
        text: "LOW QUALITY",
        ariaLabel: "Low quality photo",
    },
    missingPlaceholder: null,
});

assert.deepEqual(catalog.checklistSections(fixtureCategories), [
    {
        status: catalog.photoStatuses.MISSING,
        title: "Left to Find",
        emptyMessage: "Collection is complete! \u{1F389}",
        groups: [
            {
                category: fixtureCategories[0],
                plates: [missingPlate],
            },
        ],
    },
    {
        status: catalog.photoStatuses.NEEDS_UPGRADE,
        title: "Needs Better Photo",
        emptyMessage: "No upgrades needed. \u{1F44D}",
        groups: [
            {
                category: fixtureCategories[0],
                plates: [needsUpgradePlate],
            },
        ],
    },
]);

assert.deepEqual(catalog.displayCategories(fixtureCategories), [
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

assert.deepEqual(catalog.displayChecklistSections(fixtureCategories), [
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

assert.deepEqual(catalog.validatePhotoStatusPolicy(fixtureCategories), []);

assert.deepEqual(catalog.selectedAssetFilePaths(fixtureCategories), {
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
    catalog.unselectedLocalImages({
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
