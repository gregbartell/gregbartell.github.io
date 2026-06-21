#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const catalog = require("./plate-catalog.js");

const repoRoot = path.resolve(__dirname, "..");
const collator = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});

const validPhotoStatuses = new Set(Object.values(catalog.photoStatuses));
const validImageKinds = new Set(Object.values(catalog.imageKinds));
const validStickerStyles = new Set(catalog.stickerStyles);

const categoryIdPattern = /^[a-z][a-z0-9_]*$/;
const plateIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];

function fail(message) {
    errors.push(message);
}

function exists(relativePath) {
    return fs.existsSync(path.join(repoRoot, relativePath));
}

function isSorted(values) {
    for (let index = 1; index < values.length; index += 1) {
        if (collator.compare(values[index - 1], values[index]) > 0) {
            return false;
        }
    }
    return true;
}

function duplicateIds(items) {
    const seen = new Set();
    const duplicates = new Set();

    items.forEach((item) => {
        if (seen.has(item.id)) duplicates.add(item.id);
        seen.add(item.id);
    });

    return [...duplicates];
}

function auditCategories() {
    if (!Array.isArray(catalog.categories) || catalog.categories.length === 0) {
        fail("catalog.categories must be a non-empty array");
        return;
    }

    duplicateIds(catalog.categories).forEach((id) => {
        fail(`duplicate category id: ${id}`);
    });

    catalog.categories.forEach((category) => {
        if (!categoryIdPattern.test(category.id || "")) {
            fail(`invalid category id: ${category.id}`);
        }
        if (!category.title) {
            fail(`category ${category.id} must have a title`);
        }
        if (!category.sticker) {
            fail(`category ${category.id} must have sticker facts`);
            return;
        }
        if (!validStickerStyles.has(category.sticker.style)) {
            fail(
                `category ${category.id} has invalid sticker style: ${category.sticker.style}`
            );
        }
        if (!category.sticker.mark) {
            fail(`category ${category.id} must have a sticker mark`);
        }
        if (
            Object.prototype.hasOwnProperty.call(category.sticker, "foot") &&
            !category.sticker.foot
        ) {
            fail(`category ${category.id} has an empty sticker foot override`);
        }
        if (!Array.isArray(category.plates) || category.plates.length === 0) {
            fail(`category ${category.id} must have at least one plate`);
        }
    });

    const categoryTitles = catalog.categories.map((category) => category.title);
    if (categoryTitles[categoryTitles.length - 1] !== "Miscellaneous") {
        fail("Miscellaneous must be the last category");
    }

    const orderedTitles = categoryTitles.slice(0, -1);
    if (!isSorted(orderedTitles)) {
        fail("categories before Miscellaneous must be alphabetical by title");
    }
}

function auditPlates() {
    const entries = catalog.getPlateEntries();
    duplicateIds(entries.map(({ plate }) => plate)).forEach((id) => {
        fail(`duplicate plate id: ${id}`);
    });

    catalog.categories.forEach((category) => {
        const titles = category.plates.map((plate) => plate.title);
        if (!isSorted(titles)) {
            fail(`plates in ${category.title} must be alphabetical by title`);
        }

        category.plates.forEach((plate) => {
            const prefix = `${category.id}/${plate.id}`;

            if (!plateIdPattern.test(plate.id || "")) {
                fail(`${prefix} has invalid plate id`);
            }
            if (!plate.title) {
                fail(`${prefix} must have a title`);
            }
            if (!validPhotoStatuses.has(plate.photoStatus)) {
                fail(`${prefix} has invalid photoStatus: ${plate.photoStatus}`);
            }
            if (!validImageKinds.has(catalog.imageKindFor(plate))) {
                fail(`${prefix} has invalid imageKind: ${plate.imageKind}`);
            }
            if (Object.prototype.hasOwnProperty.call(plate, "alt")) {
                fail(`${prefix} must derive alt text instead of storing it`);
            }

            if (plate.photoStatus === catalog.photoStatuses.MISSING) {
                if (plate.asset !== null) {
                    fail(`${prefix} must use asset: null when missing`);
                }
                return;
            }

            if (!plate.asset) {
                fail(`${prefix} must have an asset when not missing`);
                return;
            }

            const fullPath = catalog.fullImagePath(plate.asset);
            const thumbPath = catalog.thumbnailPath(plate.asset);
            if (!exists(fullPath)) {
                fail(`${prefix} missing full-size asset: ${fullPath}`);
            }
            if (!exists(thumbPath)) {
                fail(`${prefix} missing thumbnail asset: ${thumbPath}`);
            }
        });
    });
}

auditCategories();
auditPlates();

if (errors.length > 0) {
    console.error("Catalog audit failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log("Catalog audit passed.");
