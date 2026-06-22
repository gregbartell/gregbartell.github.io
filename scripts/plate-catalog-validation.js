const catalog = require("./plate-catalog.js");

const CATALOG_COLLATOR = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});
const CATEGORY_ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const VARIANT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyText(value) {
    return typeof value === "string" && value.trim() !== "";
}

function requirePolicyText(errors, value, label) {
    if (!isNonEmptyText(value)) {
        errors.push(`${label} must be non-empty text`);
    }
}

function isSortedText(values) {
    for (let index = 1; index < values.length; index += 1) {
        if (CATALOG_COLLATOR.compare(values[index - 1], values[index]) > 0) {
            return false;
        }
    }
    return true;
}

function duplicateValues(values) {
    const seen = new Set();
    const duplicates = new Set();

    values.filter(isNonEmptyText).forEach((value) => {
        if (seen.has(value)) duplicates.add(value);
        seen.add(value);
    });

    return [...duplicates];
}

function categoryLabel(category, index) {
    if (isNonEmptyText(category?.id)) return `Category ${category.id}`;
    return `Category at index ${index}`;
}

function catalogRef(category, plate) {
    const categoryId = isNonEmptyText(category?.id)
        ? category.id
        : "(unknown-category)";
    const plateId = isNonEmptyText(plate?.id)
        ? plate.id
        : "(unknown-variant)";

    return `${categoryId}/${plateId}`;
}

function selectedAssetEntries(sourceCategories = catalog.categories) {
    return catalog
        .getPlateEntries(sourceCategories)
        .map(({ category, plate }) => ({
            category,
            plate,
            selectedAsset: catalog.selectedAssetFor(plate),
        }))
        .filter(({ selectedAsset }) => selectedAsset !== null);
}

function selectedAssetRequirements(sourceCategories = catalog.categories) {
    return selectedAssetEntries(sourceCategories).map(
        ({ category, plate, selectedAsset }) =>
            Object.freeze({
                catalogRef: catalogRef(category, plate),
                fullSizePath: selectedAsset.fullSizePath,
                thumbnailPath: selectedAsset.thumbnailPath,
            })
    );
}

function selectedAssetFilePaths(sourceCategories = catalog.categories) {
    const entries = selectedAssetEntries(sourceCategories);
    return {
        fullSizePaths: entries.map(
            ({ selectedAsset }) => selectedAsset.fullSizePath
        ),
        thumbnailPaths: entries.map(
            ({ selectedAsset }) => selectedAsset.thumbnailPath
        ),
    };
}

function assetFromFullSizePath(fullSizePath) {
    const prefix = `${catalog.fullSizeImageRoot}/`;
    if (typeof fullSizePath !== "string") return null;
    if (!fullSizePath.startsWith(prefix)) return null;
    if (fullSizePath.startsWith(`${catalog.thumbnailImageRoot}/`)) return null;
    return fullSizePath.slice(prefix.length);
}

function unselectedLocalImages({
    sourceCategories = catalog.categories,
    fullSizePaths,
    thumbnailPaths = [],
} = {}) {
    if (!Array.isArray(fullSizePaths)) {
        throw new Error("fullSizePaths must be an array");
    }
    if (!Array.isArray(thumbnailPaths)) {
        throw new Error("thumbnailPaths must be an array");
    }

    const selectedFullSizePaths = new Set(
        selectedAssetFilePaths(sourceCategories).fullSizePaths
    );
    const localThumbnailPaths = new Set(thumbnailPaths);

    return fullSizePaths
        .filter((fullSizePath) => !selectedFullSizePaths.has(fullSizePath))
        .map((fullSizePath) => {
            const asset = assetFromFullSizePath(fullSizePath);
            const expectedThumbnailPath = catalog.thumbnailPath(asset);

            return Object.freeze({
                asset,
                fullSizePath,
                thumbnailPath: expectedThumbnailPath,
                hasMatchingThumbnail:
                    expectedThumbnailPath !== null &&
                    localThumbnailPaths.has(expectedThumbnailPath),
            });
        });
}

function validatePhotoStatusDetails(errors) {
    const photoStatuses = Object.values(catalog.photoStatuses);
    const validPhotoStatuses = new Set(photoStatuses);

    if (!isPlainObject(catalog.photoStatusDetails)) {
        errors.push("Photo Status policy details must be an object");
        return;
    }

    photoStatuses.forEach((status) => {
        if (!hasOwn(catalog.photoStatusDetails, status)) {
            errors.push(`Photo Status policy missing status: ${status}`);
        }
    });

    Object.entries(catalog.photoStatusDetails).forEach(([status, details]) => {
        const prefix = `Photo Status policy for ${status}`;

        if (!validPhotoStatuses.has(status)) {
            errors.push(`Photo Status policy has unknown status: ${status}`);
        }
        if (!isPlainObject(details)) {
            errors.push(`${prefix} must be an object`);
            return;
        }
        if (details.status !== status) {
            errors.push(`${prefix} must set status to ${status}`);
        }

        if (details.cardBadge !== null) {
            if (!isPlainObject(details.cardBadge)) {
                errors.push(`${prefix} badge must be null or an object`);
            } else {
                requirePolicyText(
                    errors,
                    details.cardBadge.text,
                    `${prefix} badge text`
                );
                requirePolicyText(
                    errors,
                    details.cardBadge.ariaLabel,
                    `${prefix} badge aria label`
                );
            }
        }

        if (details.checklist !== null) {
            if (!isPlainObject(details.checklist)) {
                errors.push(`${prefix} checklist must be null or an object`);
            } else {
                requirePolicyText(
                    errors,
                    details.checklist.title,
                    `${prefix} checklist title`
                );
                requirePolicyText(
                    errors,
                    details.checklist.emptyMessage,
                    `${prefix} checklist empty message`
                );
            }
        }

        if (details.placeholder !== null) {
            if (!isPlainObject(details.placeholder)) {
                errors.push(
                    `${prefix} missing-photo placeholder must be null or an object`
                );
            } else {
                [
                    "ariaSuffix",
                    "stripDetail",
                    "statusValue",
                    "stampText",
                ].forEach((property) => {
                    requirePolicyText(
                        errors,
                        details.placeholder[property],
                        `${prefix} missing-photo placeholder ${property}`
                    );
                });
            }
        }
    });
}

function validatePhotoStatusPresentation(errors, sourceCategories) {
    catalog.getPlateEntries(sourceCategories).forEach(({ category, plate }) => {
        const prefix = `${category.id}/${plate.id}`;
        let presentation;

        try {
            presentation = catalog.photoStatusPresentationFor(plate, category);
        } catch (error) {
            errors.push(
                `${prefix} Photo Status presentation failed: ${error.message}`
            );
            return;
        }

        if (presentation.status !== catalog.photoStatusFor(plate)) {
            errors.push(`${prefix} Photo Status presentation status drifted`);
        }

        if (presentation.badge !== null) {
            if (!isPlainObject(presentation.badge)) {
                errors.push(`${prefix} Photo Status badge must be null or object`);
            } else {
                requirePolicyText(
                    errors,
                    presentation.badge.text,
                    `${prefix} Photo Status badge text`
                );
                requirePolicyText(
                    errors,
                    presentation.badge.ariaLabel,
                    `${prefix} Photo Status badge aria label`
                );
            }
        }

        if (presentation.missingPlaceholder !== null) {
            if (!isPlainObject(presentation.missingPlaceholder)) {
                errors.push(
                    `${prefix} missing-photo placeholder must be null or object`
                );
            } else {
                [
                    "ariaLabel",
                    "stripDetail",
                    "plateTitle",
                    "categoryTitle",
                    "statusText",
                    "stampText",
                ].forEach((property) => {
                    requirePolicyText(
                        errors,
                        presentation.missingPlaceholder[property],
                        `${prefix} missing-photo placeholder ${property}`
                    );
                });
            }
        }
    });
}

function validatePhotoStatusChecklist(errors, sourceCategories) {
    let sections;
    const checklistStatusSet = new Set(catalog.checklistPhotoStatuses);

    Object.entries(catalog.photoStatusDetails).forEach(([status, details]) => {
        if (details?.checklist && !checklistStatusSet.has(status)) {
            errors.push(
                `Photo Status policy for ${status} has checklist display but is not included in checklist sections`
            );
        }
    });

    try {
        sections = catalog.checklistSections(sourceCategories);
    } catch (error) {
        errors.push(`Photo Status checklist failed: ${error.message}`);
        return;
    }

    if (!Array.isArray(sections)) {
        errors.push("Photo Status checklist sections must be an array");
        return;
    }

    sections.forEach((section, index) => {
        const prefix = `Photo Status checklist section ${index}`;
        const details = catalog.photoStatusDetails[section.status];

        if (!details || !details.checklist) {
            errors.push(`${prefix} uses a non-checklist status`);
            return;
        }

        if (section.title !== details.checklist.title) {
            errors.push(`${prefix} title must come from Photo Status policy`);
        }
        if (section.emptyMessage !== details.checklist.emptyMessage) {
            errors.push(`${prefix} empty message must come from Photo Status policy`);
        }
        if (!Array.isArray(section.groups)) {
            errors.push(`${prefix} groups must be an array`);
        }
    });
}

function validatePhotoStatusPolicy(sourceCategories = catalog.categories) {
    const errors = [];

    validatePhotoStatusDetails(errors);
    validatePhotoStatusPresentation(errors, sourceCategories);
    validatePhotoStatusChecklist(errors, sourceCategories);

    return errors;
}

function validateCategoryFacts(errors, sourceCategories) {
    duplicateValues(sourceCategories.map((category) => category?.id)).forEach(
        (id) => {
            errors.push(`duplicate Category id: ${id}`);
        }
    );

    sourceCategories.forEach((category, index) => {
        if (!isPlainObject(category)) {
            errors.push(`Category at index ${index} must be an object`);
            return;
        }

        const label = categoryLabel(category, index);
        if (!CATEGORY_ID_PATTERN.test(category.id || "")) {
            errors.push(`${label} has invalid id: ${category.id}`);
        }
        if (!isNonEmptyText(category.title)) {
            errors.push(`${label} must have a title`);
        }

        if (!isPlainObject(category.sticker)) {
            errors.push(`${label} must have sticker facts`);
        } else {
            if (!catalog.stickerStyles.includes(category.sticker.style)) {
                errors.push(
                    `${label} has invalid sticker style: ${category.sticker.style}`
                );
            }
            if (!isNonEmptyText(category.sticker.mark)) {
                errors.push(`${label} must have a sticker mark`);
            }
            if (
                hasOwn(category.sticker, "foot") &&
                !isNonEmptyText(category.sticker.foot)
            ) {
                errors.push(`${label} has an empty sticker foot override`);
            }
        }

        if (!Array.isArray(category.plates) || category.plates.length === 0) {
            errors.push(`${label} must have at least one Variant`);
        }
    });
}

function validateCatalogOrder(errors, sourceCategories) {
    const categoryTitles = sourceCategories.map((category) => category?.title);
    const lastCategoryTitle = categoryTitles[categoryTitles.length - 1];

    if (lastCategoryTitle !== "Miscellaneous") {
        errors.push("Catalog Order: Miscellaneous must be the last Category");
    }

    const orderedTitles = categoryTitles.slice(0, -1);
    if (orderedTitles.every(isNonEmptyText) && !isSortedText(orderedTitles)) {
        errors.push(
            "Catalog Order: Categories before Miscellaneous must be alphabetical by title"
        );
    }
}

function validPlateEntries(sourceCategories) {
    return sourceCategories.flatMap((category) => {
        if (!isPlainObject(category) || !Array.isArray(category.plates)) {
            return [];
        }

        return category.plates.map((plate, index) => ({
            category,
            plate,
            index,
        }));
    });
}

function validateVariantOrder(errors, category) {
    if (!isPlainObject(category) || !Array.isArray(category.plates)) return;

    const titles = category.plates.map((plate) => plate?.title);
    if (titles.every(isNonEmptyText) && !isSortedText(titles)) {
        errors.push(
            `Catalog Order: Variants in ${category.title} must be alphabetical by title`
        );
    }
}

function validateVariantFacts(errors, sourceCategories) {
    const validPhotoStatuses = new Set(Object.values(catalog.photoStatuses));
    const validImageKinds = new Set(Object.values(catalog.imageKinds));
    const entries = validPlateEntries(sourceCategories);

    duplicateValues(entries.map(({ plate }) => plate?.id)).forEach((id) => {
        errors.push(`duplicate Variant id: ${id}`);
    });

    sourceCategories.forEach((category) => validateVariantOrder(errors, category));

    entries.forEach(({ category, plate, index }) => {
        if (!isPlainObject(plate)) {
            errors.push(
                `${categoryLabel(category, 0)} Variant at index ${index} must be an object`
            );
            return;
        }

        const prefix = catalogRef(category, plate);

        if (!VARIANT_ID_PATTERN.test(plate.id || "")) {
            errors.push(`${prefix} has invalid Variant id`);
        }
        if (!isNonEmptyText(plate.title)) {
            errors.push(`${prefix} must have a title`);
        }
        if (!validPhotoStatuses.has(plate.photoStatus)) {
            errors.push(`${prefix} has invalid Photo Status: ${plate.photoStatus}`);
        }
        if (hasOwn(plate, "imageKind") && !validImageKinds.has(plate.imageKind)) {
            errors.push(`${prefix} has invalid Image Kind: ${plate.imageKind}`);
        }
        if (hasOwn(plate, "alt")) {
            errors.push(`${prefix} must derive alt text instead of storing it`);
        }

        if (plate.photoStatus === catalog.photoStatuses.MISSING) {
            if (plate.asset !== null) {
                errors.push(
                    `${prefix} must use asset: null when Photo Status is missing`
                );
            }
            return;
        }

        if (!isNonEmptyText(plate.asset)) {
            errors.push(
                `${prefix} must have a Selected Asset when Photo Status is not missing`
            );
            return;
        }

        const selectedAsset = catalog.selectedAssetFor(plate);
        if (!selectedAsset) {
            errors.push(`${prefix} Selected Asset policy returned no asset`);
            return;
        }

        requirePolicyText(
            errors,
            selectedAsset.fullSizePath,
            `${prefix} Selected Asset full-size path`
        );
        requirePolicyText(
            errors,
            selectedAsset.thumbnailPath,
            `${prefix} Selected Asset thumbnail path`
        );
        requirePolicyText(
            errors,
            selectedAsset.altText,
            `${prefix} Selected Asset alt text`
        );
        if (!validImageKinds.has(selectedAsset.imageKind)) {
            errors.push(
                `${prefix} Selected Asset has invalid Image Kind: ${selectedAsset.imageKind}`
            );
        }
    });
}

function validatePageFacingCatalog(errors, sourceCategories) {
    let display;
    let checklist;

    try {
        display = catalog.displayCategories(sourceCategories);
    } catch (error) {
        errors.push(`page-facing Plate Catalog data failed: ${error.message}`);
        return;
    }

    if (!Array.isArray(display)) {
        errors.push("page-facing Plate Catalog data must be an array");
    }

    try {
        checklist = catalog.displayChecklistSections(sourceCategories);
    } catch (error) {
        errors.push(`page-facing checklist data failed: ${error.message}`);
        return;
    }

    if (!Array.isArray(checklist)) {
        errors.push("page-facing checklist data must be an array");
    }
}

function validateCatalog(sourceCategories = catalog.categories) {
    const errors = [];

    if (!Array.isArray(sourceCategories) || sourceCategories.length === 0) {
        return ["Plate Catalog categories must be a non-empty array"];
    }

    validateCategoryFacts(errors, sourceCategories);
    validateCatalogOrder(errors, sourceCategories);
    validateVariantFacts(errors, sourceCategories);

    const categoriesWithPlates = sourceCategories.filter(
        (category) => isPlainObject(category) && Array.isArray(category.plates)
    );

    try {
        validatePhotoStatusPolicy(categoriesWithPlates).forEach((error) =>
            errors.push(error)
        );
    } catch (error) {
        errors.push(`Photo Status policy validation failed: ${error.message}`);
    }

    if (errors.length === 0) {
        validatePageFacingCatalog(errors, sourceCategories);
    }

    return errors;
}

module.exports = {
    selectedAssetEntries,
    selectedAssetRequirements,
    selectedAssetFilePaths,
    unselectedLocalImages,
    validatePhotoStatusPolicy,
    validateCatalog,
};
