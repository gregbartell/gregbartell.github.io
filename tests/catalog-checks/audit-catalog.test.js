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

assert.deepEqual(
    auditCatalog({
        sourceCategories: fixtureCategories,
        fullSizePaths: selectedFullSizePaths,
        thumbnailPaths: selectedThumbnailPaths,
    }),
    {
        passed: true,
        errors: [],
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
        }
    );
}

const auditWithUnselectedImages = auditCatalog({
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
});

assert.deepEqual(auditWithUnselectedImages, {
    passed: true,
    errors: [],
});

assert.deepEqual(formatAuditResult(auditWithUnselectedImages), {
    exitCode: 0,
    stdout: ["Catalog audit passed."],
    stderr: [],
});

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
