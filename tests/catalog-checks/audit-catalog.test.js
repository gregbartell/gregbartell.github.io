#!/usr/bin/env node
const assert = require("assert/strict");
const {
    formatAuditResult,
    runAuditCommand,
} = require("../../tools/audit-catalog.js");
const catalog = require("../../src/data/plate-catalog.js");
const { auditCatalog } = require("../../src/catalog-checks/plate-catalog-audit.js");

const fixtureCategories = [
    {
        id: "alpha",
        title: "Alpha",
        sticker: { style: "blue", mark: "ALP" },
        plates: [
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
                id: "misc-selected",
                title: "Misc Selected",
                photoStatus: catalog.photoStatuses.SATISFIED,
                asset: "misc/selected.jpg",
            },
        ],
    },
];

const selectedFullSizePaths = [
    "assets/plates/full/alpha/selected.jpg",
    "assets/plates/full/misc/selected.jpg",
];
const selectedThumbnailPaths = [
    "assets/plates/thumbs/alpha/selected.jpg",
    "assets/plates/thumbs/misc/selected.jpg",
];

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

assert.deepEqual(
    auditCatalog({
        sourceCategories: fixtureCategories,
        fullSizePaths: selectedFullSizePaths,
        thumbnailPaths: selectedThumbnailPaths,
    }),
    {
        passed: true,
        errors: [],
        notices: [],
    }
);

assert.deepEqual(
    auditCatalog({
        sourceCategories: fixtureCategories,
        fullSizePaths: ["assets/plates/full/misc/selected.jpg"],
        thumbnailPaths: selectedThumbnailPaths,
    }),
    {
        passed: false,
        errors: [
            "alpha/alpha-selected missing Selected Asset full-size file: assets/plates/full/alpha/selected.jpg",
        ],
        notices: [],
    }
);

assert.deepEqual(
    auditCatalog({
        sourceCategories: fixtureCategories,
        fullSizePaths: selectedFullSizePaths,
        thumbnailPaths: ["assets/plates/thumbs/misc/selected.jpg"],
    }),
    {
        passed: false,
        errors: [
            "alpha/alpha-selected missing Selected Asset thumbnail file: assets/plates/thumbs/alpha/selected.jpg",
        ],
        notices: [],
    }
);

assert.deepEqual(
    auditCatalog({
        sourceCategories: fixtureCategories,
        fullSizePaths: selectedFullSizePaths,
        thumbnailPaths: selectedThumbnailPaths,
        fileMetadataByPath: {
            "assets/plates/full/alpha/selected.jpg": { mtimeMs: 3000 },
            "assets/plates/thumbs/alpha/selected.jpg": { mtimeMs: 1000 },
            "assets/plates/full/misc/selected.jpg": { mtimeMs: 1000 },
            "assets/plates/thumbs/misc/selected.jpg": { mtimeMs: 1000 },
        },
    }),
    {
        passed: true,
        errors: [],
        notices: [],
    }
);

{
    const invalidCategories = JSON.parse(JSON.stringify(fixtureCategories));
    invalidCategories[0].plates[0].photoStatus = "archived";

    assert.deepEqual(
        auditCatalog({
            sourceCategories: invalidCategories,
            fullSizePaths: selectedFullSizePaths,
            thumbnailPaths: selectedThumbnailPaths,
        }),
        {
            passed: false,
            errors: [
                "alpha/alpha-selected has invalid Photo Status: archived",
            ],
            notices: [],
        }
    );
}

assert.deepEqual(
    auditCatalog({
        sourceCategories: fixtureCategories,
        fullSizePaths: [
            "assets/plates/full/alpha/no_thumb.jpg",
            ...selectedFullSizePaths,
            "assets/plates/full/alpha/alternate.jpg",
        ],
        thumbnailPaths: [
            ...selectedThumbnailPaths,
            "assets/plates/thumbs/alpha/alternate.jpg",
        ],
    }),
    {
        passed: true,
        errors: [],
        notices: [
            {
                type: "unselected-local-images",
                images: [
                    {
                        asset: "alpha/alternate.jpg",
                        fullSizePath: "assets/plates/full/alpha/alternate.jpg",
                        thumbnailPath: "assets/plates/thumbs/alpha/alternate.jpg",
                        hasMatchingThumbnail: true,
                    },
                    {
                        asset: "alpha/no_thumb.jpg",
                        fullSizePath: "assets/plates/full/alpha/no_thumb.jpg",
                        thumbnailPath: "assets/plates/thumbs/alpha/no_thumb.jpg",
                        hasMatchingThumbnail: false,
                    },
                ],
            },
        ],
    }
);

assert.deepEqual(
    auditCatalog({
        sourceCategories: [null],
        fullSizePaths: [],
        thumbnailPaths: [],
    }),
    {
        passed: false,
        errors: [
            "Category at index 0 must be an object",
            "Catalog Order: Miscellaneous must be the last Category",
        ],
        notices: [],
    }
);

{
    const malformedVariantCategories = clone(fixtureCategories);
    malformedVariantCategories[0].plates.unshift(null);

    assert.deepEqual(
        auditCatalog({
            sourceCategories: malformedVariantCategories,
            fullSizePaths: [
                "assets/plates/full/alpha/alternate.jpg",
                ...selectedFullSizePaths,
            ],
            thumbnailPaths: [
                ...selectedThumbnailPaths,
                "assets/plates/thumbs/alpha/alternate.jpg",
            ],
        }),
        {
            passed: false,
            errors: ["Category alpha Variant at index 0 must be an object"],
            notices: [
                {
                    type: "unselected-local-images",
                    images: [
                        {
                            asset: "alpha/alternate.jpg",
                            fullSizePath: "assets/plates/full/alpha/alternate.jpg",
                            thumbnailPath: "assets/plates/thumbs/alpha/alternate.jpg",
                            hasMatchingThumbnail: true,
                        },
                    ],
                },
            ],
        }
    );
}

assert.deepEqual(
    formatAuditResult({
        passed: true,
        errors: [],
        notices: [
            {
                type: "unselected-local-images",
                images: [
                    {
                        fullSizePath: "assets/plates/full/colleges/esc.jpg",
                        thumbnailPath: "assets/plates/thumbs/colleges/esc.jpg",
                        hasMatchingThumbnail: true,
                    },
                    {
                        fullSizePath: "assets/plates/full/colleges/orphan.jpg",
                        thumbnailPath: "assets/plates/thumbs/colleges/orphan.jpg",
                        hasMatchingThumbnail: false,
                    },
                ],
            },
        ],
    }),
    {
        exitCode: 0,
        stdout: [
            "Catalog audit passed.",
            "Unselected local images (informational, not catalog failures):",
            "- assets/plates/full/colleges/esc.jpg (matching thumbnail: assets/plates/thumbs/colleges/esc.jpg)",
            "- assets/plates/full/colleges/orphan.jpg (no matching thumbnail: assets/plates/thumbs/colleges/orphan.jpg)",
        ],
        stderr: [],
    }
);

{
    const stdout = [];
    const stderr = [];
    let exitCode = null;

    const returnedExitCode = runAuditCommand({
        result: {
            passed: false,
            errors: ["fixture missing Selected Asset thumbnail file"],
            notices: [],
        },
        stdout: (line) => stdout.push(line),
        stderr: (line) => stderr.push(line),
        exit: (code) => {
            exitCode = code;
        },
    });

    assert.equal(returnedExitCode, 1);
    assert.equal(exitCode, 1);
    assert.deepEqual(stdout, []);
    assert.deepEqual(stderr, [
        "Catalog audit failed:",
        "- fixture missing Selected Asset thumbnail file",
    ]);
}

console.log("Catalog audit tests passed.");
