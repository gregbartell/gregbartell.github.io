#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const catalogValidation = require("../src/catalog-checks/plate-catalog-validation.js");
const selectedAssetFileRules = require("../src/catalog-checks/selected-asset-file-rules.js");

const repoRoot = path.resolve(__dirname, "..");

function localJpegPaths(rootRelativePath) {
    const paths = [];

    function walk(directory) {
        fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
            const absolutePath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(absolutePath);
            } else if (
                entry.isFile() &&
                selectedAssetFileRules.isJpegPath(entry.name)
            ) {
                paths.push(
                    path.relative(repoRoot, absolutePath).split(path.sep).join("/")
                );
            }
        });
    }

    const rootPath = path.join(repoRoot, rootRelativePath);
    if (fs.existsSync(rootPath)) walk(rootPath);
    return paths;
}

const fullSizePaths = new Set(
    localJpegPaths(selectedAssetFileRules.fullSizeImageRoot)
);
const thumbnailPaths = new Set(
    localJpegPaths(selectedAssetFileRules.thumbnailImageRoot)
);
const errors = catalogValidation.validateCatalog();

catalogValidation.selectedAssetRequirements().forEach((requirement) => {
    if (!fullSizePaths.has(requirement.fullSizePath)) {
        errors.push(
            `${requirement.catalogRef} missing Selected Asset full-size file: ${requirement.fullSizePath}`
        );
    }
    if (!thumbnailPaths.has(requirement.thumbnailPath)) {
        errors.push(
            `${requirement.catalogRef} missing Selected Asset thumbnail file: ${requirement.thumbnailPath}`
        );
    }
});

if (errors.length === 0) {
    console.log("Catalog audit passed.");
} else {
    console.error("Catalog audit failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
}
