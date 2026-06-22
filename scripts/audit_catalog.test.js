#!/usr/bin/env node
const assert = require("assert/strict");
const {
    formatAuditResult,
    runAuditCommand,
} = require("./audit_catalog.js");
const catalog = require("./plate-catalog.js");
const { auditCatalog } = require("./plate-catalog-audit.js");

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
    "pics/alpha/selected.jpg",
    "pics/misc/selected.jpg",
];
const selectedThumbnailPaths = [
    "pics/thumbs/alpha/selected.jpg",
    "pics/thumbs/misc/selected.jpg",
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
        fullSizePaths: ["pics/misc/selected.jpg"],
        thumbnailPaths: selectedThumbnailPaths,
    }),
    {
        passed: false,
        errors: [
            "alpha/alpha-selected missing Selected Asset full-size file: pics/alpha/selected.jpg",
        ],
        notices: [],
    }
);

assert.deepEqual(
    auditCatalog({
        sourceCategories: fixtureCategories,
        fullSizePaths: selectedFullSizePaths,
        thumbnailPaths: ["pics/thumbs/misc/selected.jpg"],
    }),
    {
        passed: false,
        errors: [
            "alpha/alpha-selected missing Selected Asset thumbnail file: pics/thumbs/alpha/selected.jpg",
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
            "pics/alpha/selected.jpg": { mtimeMs: 3000 },
            "pics/thumbs/alpha/selected.jpg": { mtimeMs: 1000 },
            "pics/misc/selected.jpg": { mtimeMs: 1000 },
            "pics/thumbs/misc/selected.jpg": { mtimeMs: 1000 },
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
            "pics/alpha/no_thumb.jpg",
            ...selectedFullSizePaths,
            "pics/alpha/alternate.jpg",
        ],
        thumbnailPaths: [
            ...selectedThumbnailPaths,
            "pics/thumbs/alpha/alternate.jpg",
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
                        fullSizePath: "pics/alpha/alternate.jpg",
                        thumbnailPath: "pics/thumbs/alpha/alternate.jpg",
                        hasMatchingThumbnail: true,
                    },
                    {
                        asset: "alpha/no_thumb.jpg",
                        fullSizePath: "pics/alpha/no_thumb.jpg",
                        thumbnailPath: "pics/thumbs/alpha/no_thumb.jpg",
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
                "pics/alpha/alternate.jpg",
                ...selectedFullSizePaths,
            ],
            thumbnailPaths: [
                ...selectedThumbnailPaths,
                "pics/thumbs/alpha/alternate.jpg",
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
                            fullSizePath: "pics/alpha/alternate.jpg",
                            thumbnailPath: "pics/thumbs/alpha/alternate.jpg",
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
                        fullSizePath: "pics/colleges/esc.jpg",
                        thumbnailPath: "pics/thumbs/colleges/esc.jpg",
                        hasMatchingThumbnail: true,
                    },
                    {
                        fullSizePath: "pics/colleges/orphan.jpg",
                        thumbnailPath: "pics/thumbs/colleges/orphan.jpg",
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
            "- pics/colleges/esc.jpg (matching thumbnail: pics/thumbs/colleges/esc.jpg)",
            "- pics/colleges/orphan.jpg (no matching thumbnail: pics/thumbs/colleges/orphan.jpg)",
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
