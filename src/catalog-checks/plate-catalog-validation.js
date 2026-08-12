const catalog = require("../data/plate-catalog.js");
const selectedAssetPathRules = require("../data/selected-asset-paths.js");

const CATALOG_ORDER_COLLATOR = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});
const CATEGORY_ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const VARIANT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MISCELLANEOUS_CATEGORY_TITLE = "Miscellaneous";

function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyText(value) {
    return typeof value === "string" && value.trim() !== "";
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

function valuesAreInCatalogOrder(values) {
    return values.every(
        (value, index) =>
            index === 0 ||
            CATALOG_ORDER_COLLATOR.compare(values[index - 1], value) <= 0
    );
}

function categoryLabel(category, index) {
    return isNonEmptyText(category?.id)
        ? `Category ${category.id}`
        : `Category at index ${index}`;
}

function catalogRef(category, variant) {
    const categoryId = isNonEmptyText(category?.id)
        ? category.id
        : "(unknown-category)";
    const variantId = isNonEmptyText(variant?.id)
        ? variant.id
        : "(unknown-variant)";

    return `${categoryId}/${variantId}`;
}

function variantEntries(sourceCategories) {
    return sourceCategories.flatMap((category, categoryIndex) => {
        if (!isPlainObject(category) || !Array.isArray(category.plates)) {
            return [];
        }

        return category.plates.map((variant, index) => ({
            category,
            categoryIndex,
            variant,
            index,
        }));
    });
}

function validateCategoryOrder(errors, sourceCategories) {
    const categoryTitles = sourceCategories.map((category) => category?.title);

    if (categoryTitles.at(-1) !== MISCELLANEOUS_CATEGORY_TITLE) {
        errors.push("Catalog Order: Miscellaneous must be the last Category");
    }

    const orderedTitles = categoryTitles.slice(0, -1);
    if (
        orderedTitles.every(isNonEmptyText) &&
        !valuesAreInCatalogOrder(orderedTitles)
    ) {
        errors.push(
            "Catalog Order: Categories before Miscellaneous must be alphabetical by title"
        );
    }
}

function validateCategoryFacts(errors, sourceCategories) {
    duplicateValues(sourceCategories.map((category) => category?.id)).forEach(
        (id) => errors.push(`duplicate Category id: ${id}`)
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

function validateVariantOrder(errors, sourceCategories) {
    sourceCategories.forEach((category) => {
        if (!isPlainObject(category) || !Array.isArray(category.plates)) return;

        const titles = category.plates.map((variant) => variant?.title);
        if (titles.every(isNonEmptyText) && !valuesAreInCatalogOrder(titles)) {
            errors.push(
                `Catalog Order: Variants in ${category.title} must be alphabetical by title`
            );
        }
    });
}

function validateSelectedAssetFacts(errors, reference, variant) {
    if (variant.photoStatus === catalog.photoStatuses.MISSING) {
        if (variant.asset !== null) {
            errors.push(
                `${reference} must use asset: null when Photo Status is missing`
            );
        }
        if (hasOwn(variant, "selectedAssetAltText")) {
            errors.push(
                `${reference} must not override Selected Asset alt text when Photo Status is missing`
            );
        }
        return;
    }

    if (!isNonEmptyText(variant.asset)) {
        errors.push(
            `${reference} must have a Selected Asset when Photo Status is not missing`
        );
    }
}

function validateVariantFacts(errors, sourceCategories) {
    const entries = variantEntries(sourceCategories);
    const validPhotoStatuses = new Set(Object.values(catalog.photoStatuses));
    const validVariantKinds = new Set(Object.values(catalog.variantKinds));

    duplicateValues(entries.map(({ variant }) => variant?.id)).forEach((id) =>
        errors.push(`duplicate Variant id: ${id}`)
    );

    entries.forEach(({ category, categoryIndex, variant, index }) => {
        if (!isPlainObject(variant)) {
            errors.push(
                `${categoryLabel(category, categoryIndex)} Variant at index ${index} must be an object`
            );
            return;
        }

        const reference = catalogRef(category, variant);
        if (!VARIANT_ID_PATTERN.test(variant.id || "")) {
            errors.push(`${reference} has invalid Variant id`);
        }
        if (!isNonEmptyText(variant.title)) {
            errors.push(`${reference} must have a title`);
        }
        if (!validPhotoStatuses.has(variant.photoStatus)) {
            errors.push(
                `${reference} has invalid Photo Status: ${variant.photoStatus}`
            );
        }
        if (
            hasOwn(variant, "variantKind") &&
            !validVariantKinds.has(variant.variantKind)
        ) {
            errors.push(
                `${reference} has invalid Variant Kind: ${variant.variantKind}`
            );
        }
        if (hasOwn(variant, "alt")) {
            errors.push(
                `${reference} must use selectedAssetAltText for Selected Asset alt text exceptions`
            );
        }
        if (
            hasOwn(variant, "selectedAssetAltText") &&
            !isNonEmptyText(variant.selectedAssetAltText)
        ) {
            errors.push(
                `${reference} Selected Asset alt text override must be non-empty text`
            );
        }

        validateSelectedAssetFacts(errors, reference, variant);
    });
}

function validateCatalog() {
    const sourceCategories = catalog.categories;
    if (!Array.isArray(sourceCategories) || sourceCategories.length === 0) {
        return ["Plate Catalog categories must be a non-empty array"];
    }

    const errors = [];
    validateCategoryFacts(errors, sourceCategories);
    validateCategoryOrder(errors, sourceCategories);
    validateVariantOrder(errors, sourceCategories);
    validateVariantFacts(errors, sourceCategories);
    return errors;
}

function selectedAssetRequirements() {
    return variantEntries(catalog.categories)
        .filter(({ variant }) => isNonEmptyText(variant?.asset))
        .map(({ category, variant }) => {
            const paths = selectedAssetPathRules.selectedAssetPaths(
                variant.asset
            );

            return {
                catalogRef: catalogRef(category, variant),
                fullSizePath: paths.fullSizePath,
                thumbnailPath: paths.thumbnailPath,
            };
        });
}

module.exports = {
    selectedAssetRequirements,
    validateCatalog,
};
