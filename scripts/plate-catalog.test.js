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
        ],
    },
];

const selectedPlate = fixtureCategories[0].plates[0];

assert.deepEqual(catalog.selectedAssetFor(selectedPlate), {
    asset: "fixture/selected.jpg",
    fullSizePath: "pics/fixture/selected.jpg",
    thumbnailPath: "pics/thumbs/fixture/selected.jpg",
    altText: "Selected Plate plate",
    imageKind: catalog.imageKinds.PLATE,
});

assert.equal(catalog.selectedAssetFor(fixtureCategories[0].plates[1]), null);

assert.deepEqual(catalog.selectedAssetFilePaths(fixtureCategories), {
    fullSizePaths: ["pics/fixture/selected.jpg"],
    thumbnailPaths: ["pics/thumbs/fixture/selected.jpg"],
});

assert.deepEqual(
    catalog.unselectedLocalImages({
        sourceCategories: fixtureCategories,
        fullSizePaths: [
            "pics/fixture/selected.jpg",
            "pics/fixture/unselected.jpg",
        ],
        thumbnailPaths: [
            "pics/thumbs/fixture/selected.jpg",
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
