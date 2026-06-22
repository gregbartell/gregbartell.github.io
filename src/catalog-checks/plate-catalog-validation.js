const catalog = require("../data/plate-catalog.js");
const selectedAssetFileRules = require("./selected-asset-file-rules.js");

const CATALOG_ORDER_COLLATOR = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});
const CATEGORY_ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const VARIANT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MISCELLANEOUS_CATEGORY_TITLE = "Miscellaneous";
const CATALOG_ORDER_ERRORS = Object.freeze({
    miscellaneousLast: "Catalog Order: Miscellaneous must be the last Category",
    categoriesAlphabetical:
        "Catalog Order: Categories before Miscellaneous must be alphabetical by title",
});

function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyText(value) {
    return typeof value === "string" && value.trim() !== "";
}

function catalogOrderTitlesAreAlphabetical(values) {
    for (let index = 1; index < values.length; index += 1) {
        if (
            catalogOrderPolicy.compareTitles(values[index - 1], values[index]) > 0
        ) {
            return false;
        }
    }
    return true;
}

function catalogOrderDiagnosticsForCategories(
    sourceCategories = catalog.categories
) {
    const errors = [];
    const categoryTitles = sourceCategories.map((category) => category?.title);
    const lastCategoryTitle = categoryTitles[categoryTitles.length - 1];

    if (lastCategoryTitle !== MISCELLANEOUS_CATEGORY_TITLE) {
        errors.push(CATALOG_ORDER_ERRORS.miscellaneousLast);
    }

    const orderedTitles = categoryTitles.slice(0, -1);
    if (
        orderedTitles.every(isNonEmptyText) &&
        !catalogOrderTitlesAreAlphabetical(orderedTitles)
    ) {
        errors.push(CATALOG_ORDER_ERRORS.categoriesAlphabetical);
    }

    return errors;
}

function catalogOrderDiagnosticsForVariants(category) {
    const errors = [];

    if (!isPlainObject(category) || !Array.isArray(category.plates)) {
        return errors;
    }

    const titles = category.plates.map((plate) => plate?.title);
    if (
        titles.every(isNonEmptyText) &&
        !catalogOrderTitlesAreAlphabetical(titles)
    ) {
        errors.push(
            `Catalog Order: Variants in ${category.title} must be alphabetical by title`
        );
    }

    return errors;
}

const catalogOrderPolicy = Object.freeze({
    compareTitles(left, right) {
        return CATALOG_ORDER_COLLATOR.compare(left, right);
    },
    diagnosticsForCategories: catalogOrderDiagnosticsForCategories,
    diagnosticsForVariants: catalogOrderDiagnosticsForVariants,
});

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

function projectableCatalogCategories(sourceCategories = catalog.categories) {
    if (!Array.isArray(sourceCategories)) return [];

    const projectableCategories = [];
    let skippedMalformedEntry = false;

    sourceCategories.forEach((category) => {
        if (!isPlainObject(category) || !Array.isArray(category.plates)) {
            skippedMalformedEntry = true;
            return;
        }

        const projectablePlates = category.plates.filter(isPlainObject);
        if (projectablePlates.length !== category.plates.length) {
            skippedMalformedEntry = true;
            projectableCategories.push({
                ...category,
                plates: projectablePlates,
            });
            return;
        }

        projectableCategories.push(category);
    });

    return skippedMalformedEntry ? projectableCategories : sourceCategories;
}

function selectedAssetEntries(sourceCategories = catalog.categories) {
    return catalog.selectedAssetProjections(
        projectableCatalogCategories(sourceCategories)
    );
}

function selectedAssetRequirements(sourceCategories = catalog.categories) {
    return selectedAssetFileRules.selectedAssetRequirements(
        selectedAssetEntries(sourceCategories)
    );
}

function selectedAssetFilePaths(sourceCategories = catalog.categories) {
    return selectedAssetFileRules.selectedAssetFilePaths(
        selectedAssetEntries(sourceCategories)
    );
}

function unselectedLocalImages({
    sourceCategories = catalog.categories,
    fullSizePaths,
    thumbnailPaths = [],
} = {}) {
    return catalog.localImageProjections({
        sourceCategories: projectableCatalogCategories(sourceCategories),
        fullSizePaths,
        thumbnailPaths,
    });
}

function validatePhotoStatusDetails(errors) {
    if (typeof catalog.photoStatusPolicyErrors !== "function") {
        errors.push("Photo Status policy validator must be a function");
        return;
    }

    let policyErrors;
    try {
        policyErrors = catalog.photoStatusPolicyErrors();
    } catch (error) {
        errors.push(`Photo Status policy validation failed: ${error.message}`);
        return;
    }

    if (!Array.isArray(policyErrors)) {
        errors.push("Photo Status policy validator must return an array");
        return;
    }

    policyErrors.forEach((error) => errors.push(error));
}

function validatePhotoStatusPolicy() {
    const errors = [];

    validatePhotoStatusDetails(errors);

    return errors;
}

function selectedAssetCompatibilityDiagnosticsFor(photoStatus, facts) {
    return catalog.photoStatusSelectedAssetCompatibilityDiagnosticsFor(
        photoStatus,
        facts
    );
}

function selectedAssetCompatibilityFacts(plate) {
    return {
        asset: plate.asset,
        hasSelectedAssetAltText: hasOwn(plate, "selectedAssetAltText"),
    };
}

function validateSelectedAssetCompatibility(errors, prefix, plate) {
    selectedAssetCompatibilityDiagnosticsFor(
        plate.photoStatus,
        selectedAssetCompatibilityFacts(plate)
    )
        .forEach((diagnostic) => errors.push(`${prefix} ${diagnostic}`));
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
    catalogOrderPolicy
        .diagnosticsForCategories(sourceCategories)
        .forEach((error) => errors.push(error));
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
    catalogOrderPolicy
        .diagnosticsForVariants(category)
        .forEach((error) => errors.push(error));
}

function validateVariantFacts(errors, sourceCategories) {
    const validPhotoStatuses = new Set(Object.values(catalog.photoStatuses));
    const validVariantKinds = new Set(Object.values(catalog.variantKinds));
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
        if (
            hasOwn(plate, "variantKind") &&
            !validVariantKinds.has(plate.variantKind)
        ) {
            errors.push(`${prefix} has invalid Variant Kind: ${plate.variantKind}`);
        }
        if (hasOwn(plate, "alt")) {
            errors.push(
                `${prefix} must use selectedAssetAltText for Selected Asset alt text exceptions`
            );
        }
        if (
            hasOwn(plate, "selectedAssetAltText") &&
            !isNonEmptyText(plate.selectedAssetAltText)
        ) {
            errors.push(
                `${prefix} Selected Asset alt text override must be non-empty text`
            );
        }

        validateSelectedAssetCompatibility(errors, prefix, plate);
    });
}

function validateCatalog(sourceCategories = catalog.categories) {
    const errors = [];

    if (!Array.isArray(sourceCategories) || sourceCategories.length === 0) {
        return ["Plate Catalog categories must be a non-empty array"];
    }

    validateCategoryFacts(errors, sourceCategories);
    validateCatalogOrder(errors, sourceCategories);
    validateVariantFacts(errors, sourceCategories);

    try {
        validatePhotoStatusPolicy().forEach((error) => errors.push(error));
    } catch (error) {
        errors.push(`Photo Status policy validation failed: ${error.message}`);
    }

    return errors;
}

module.exports = {
    catalogOrderPolicy,
    selectedAssetEntries,
    selectedAssetRequirements,
    selectedAssetFilePaths,
    unselectedLocalImages,
    validatePhotoStatusPolicy,
    validateCatalog,
};
