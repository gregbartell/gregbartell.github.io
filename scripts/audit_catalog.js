#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const catalogValidation = require("./plate-catalog-validation.js");

const repoRoot = path.resolve(__dirname, "..");
const collator = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});

const errors = [];
const notices = [];

function fail(message) {
    errors.push(message);
}

function notice(message) {
    notices.push(message);
}

function exists(relativePath) {
    return fs.existsSync(path.join(repoRoot, relativePath));
}

function toRepoRelative(absolutePath) {
    return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

function localJpegPaths(rootRelativePath, shouldInclude = () => true) {
    const rootPath = path.join(repoRoot, rootRelativePath);
    const paths = [];

    function walk(directory) {
        fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
            const absolutePath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(absolutePath);
                return;
            }

            if (!entry.isFile() || !/\.(?:jpe?g)$/i.test(entry.name)) {
                return;
            }

            const relativePath = toRepoRelative(absolutePath);
            if (shouldInclude(relativePath)) {
                paths.push(relativePath);
            }
        });
    }

    if (fs.existsSync(rootPath)) walk(rootPath);
    return paths.sort((left, right) => collator.compare(left, right));
}

function auditCatalogInvariants() {
    if (typeof catalogValidation.validateCatalog !== "function") {
        fail("catalogValidation.validateCatalog must be a function");
        return;
    }

    let validationErrors;
    try {
        validationErrors = catalogValidation.validateCatalog();
    } catch (error) {
        fail(`catalogValidation.validateCatalog threw: ${error.message}`);
        return;
    }

    if (!Array.isArray(validationErrors)) {
        fail("catalogValidation.validateCatalog must return an array");
        return;
    }

    validationErrors.forEach((error) => fail(error));
}

function auditSelectedAssetFiles() {
    if (typeof catalogValidation.selectedAssetRequirements !== "function") {
        fail("catalogValidation.selectedAssetRequirements must be a function");
        return;
    }

    let requirements;
    try {
        requirements = catalogValidation.selectedAssetRequirements();
    } catch (error) {
        fail(`catalogValidation.selectedAssetRequirements threw: ${error.message}`);
        return;
    }

    if (!Array.isArray(requirements)) {
        fail("catalogValidation.selectedAssetRequirements must return an array");
        return;
    }

    requirements.forEach((requirement) => {
        if (!requirement || typeof requirement.catalogRef !== "string") {
            fail("catalogValidation.selectedAssetRequirements returned an invalid item");
            return;
        }

        if (!exists(requirement.fullSizePath)) {
            fail(
                `${requirement.catalogRef} missing Selected Asset full-size file: ${requirement.fullSizePath}`
            );
        }
        if (!exists(requirement.thumbnailPath)) {
            fail(
                `${requirement.catalogRef} missing Selected Asset thumbnail file: ${requirement.thumbnailPath}`
            );
        }
    });
}

function auditUnselectedLocalImages() {
    const fullSizePaths = localJpegPaths(
        "pics",
        (relativePath) => !relativePath.startsWith("pics/thumbs/")
    );
    const thumbnailPaths = localJpegPaths("pics/thumbs");
    const unselectedImages = catalogValidation.unselectedLocalImages({
        fullSizePaths,
        thumbnailPaths,
    });

    if (unselectedImages.length === 0) return;

    notice("Unselected local images (informational, not catalog failures):");
    unselectedImages.forEach((image) => {
        const thumbnailStatus = image.hasMatchingThumbnail
            ? `matching thumbnail: ${image.thumbnailPath}`
            : `no matching thumbnail: ${image.thumbnailPath}`;
        notice(`- ${image.fullSizePath} (${thumbnailStatus})`);
    });
}

function printNotices() {
    notices.forEach((message) => console.log(message));
}

auditCatalogInvariants();
auditSelectedAssetFiles();
auditUnselectedLocalImages();

if (errors.length > 0) {
    console.error("Catalog audit failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    printNotices();
    process.exit(1);
}

console.log("Catalog audit passed.");
printNotices();
