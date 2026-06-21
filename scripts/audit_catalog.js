#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const catalog = require("./plate-catalog.js");

const repoRoot = path.resolve(__dirname, "..");
const collator = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});

const photoStatuses = Object.values(catalog.photoStatuses);
const validPhotoStatuses = new Set(photoStatuses);
const validImageKinds = new Set(Object.values(catalog.imageKinds));
const validStickerStyles = new Set(catalog.stickerStyles);

const categoryIdPattern = /^[a-z][a-z0-9_]*$/;
const plateIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];

function fail(message) {
    errors.push(message);
}

function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
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

function requireText(value, label) {
    if (typeof value !== "string" || value.trim() === "") {
        fail(`${label} must be non-empty text`);
    }
}

function auditPhotoStatusDetails() {
    if (
        !catalog.photoStatusDetails ||
        typeof catalog.photoStatusDetails !== "object" ||
        Array.isArray(catalog.photoStatusDetails)
    ) {
        fail("catalog.photoStatusDetails must be an object");
        return;
    }

    photoStatuses.forEach((status) => {
        if (!hasOwn(catalog.photoStatusDetails, status)) {
            fail(`photoStatusDetails missing status: ${status}`);
        }
    });

    Object.entries(catalog.photoStatusDetails).forEach(([status, details]) => {
        if (!validPhotoStatuses.has(status)) {
            fail(`photoStatusDetails has unknown status: ${status}`);
        }
        if (!details || typeof details !== "object") {
            fail(`photoStatusDetails.${status} must be an object`);
            return;
        }
        if (details.status !== status) {
            fail(`photoStatusDetails.${status} must set status to ${status}`);
        }

        if (details.cardBadge !== null) {
            if (!details.cardBadge || typeof details.cardBadge !== "object") {
                fail(`photoStatusDetails.${status}.cardBadge must be null or object`);
            } else {
                requireText(
                    details.cardBadge.text,
                    `photoStatusDetails.${status}.cardBadge.text`
                );
                requireText(
                    details.cardBadge.ariaLabel,
                    `photoStatusDetails.${status}.cardBadge.ariaLabel`
                );
            }
        }

        if (details.checklist !== null) {
            if (!details.checklist || typeof details.checklist !== "object") {
                fail(`photoStatusDetails.${status}.checklist must be null or object`);
            } else {
                requireText(
                    details.checklist.title,
                    `photoStatusDetails.${status}.checklist.title`
                );
                requireText(
                    details.checklist.emptyMessage,
                    `photoStatusDetails.${status}.checklist.emptyMessage`
                );
            }
        }

        if (details.placeholder !== null) {
            if (!details.placeholder || typeof details.placeholder !== "object") {
                fail(`photoStatusDetails.${status}.placeholder must be null or object`);
            } else {
                [
                    "ariaSuffix",
                    "stripDetail",
                    "statusValue",
                    "stampText",
                ].forEach((property) => {
                    requireText(
                        details.placeholder[property],
                        `photoStatusDetails.${status}.placeholder.${property}`
                    );
                });
            }
        }
    });

    if (typeof catalog.photoStatusDetailsForStatus !== "function") {
        fail("catalog.photoStatusDetailsForStatus must be a function");
    } else {
        photoStatuses.forEach((status) => {
            try {
                const details = catalog.photoStatusDetailsForStatus(status);
                if (details !== catalog.photoStatusDetails[status]) {
                    fail(
                        `photoStatusDetailsForStatus(${status}) must return the status details object`
                    );
                }
            } catch (error) {
                fail(`photoStatusDetailsForStatus(${status}) threw: ${error.message}`);
            }
        });
    }

    if (typeof catalog.checklistSections !== "function") {
        fail("catalog.checklistSections must be a function");
        return;
    }

    const sections = catalog.checklistSections();
    if (!Array.isArray(sections)) {
        fail("catalog.checklistSections() must return an array");
        return;
    }

    sections.forEach((section, index) => {
        const prefix = `checklistSections[${index}]`;
        if (!validPhotoStatuses.has(section.status)) {
            fail(`${prefix} has unknown status: ${section.status}`);
            return;
        }

        const details = catalog.photoStatusDetails[section.status];
        if (!details.checklist) {
            fail(`${prefix} uses non-checklist status: ${section.status}`);
            return;
        }
        if (section.title !== details.checklist.title) {
            fail(`${prefix}.title must come from photoStatusDetails`);
        }
        if (section.emptyMessage !== details.checklist.emptyMessage) {
            fail(`${prefix}.emptyMessage must come from photoStatusDetails`);
        }
        if (!Array.isArray(section.groups)) {
            fail(`${prefix}.groups must be an array`);
        }
    });
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
            if (hasOwn(plate, "alt")) {
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
auditPhotoStatusDetails();
auditPlates();

if (errors.length > 0) {
    console.error("Catalog audit failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log("Catalog audit passed.");
