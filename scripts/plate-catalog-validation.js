const catalog = require("./plate-catalog.js");

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

function requirePolicyText(errors, value, label) {
    if (!isNonEmptyText(value)) {
        errors.push(`${label} must be non-empty text`);
    }
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

function selectedAssetEntries(sourceCategories = catalog.categories) {
    return catalog.catalogProjections(sourceCategories).selectedAssets;
}

function selectedAssetRequirements(sourceCategories = catalog.categories) {
    return selectedAssetEntries(sourceCategories).map(
        (selectedAsset) =>
            Object.freeze({
                catalogRef: selectedAsset.catalogRef,
                fullSizePath: selectedAsset.fullSizePath,
                thumbnailPath: selectedAsset.thumbnailPath,
            })
    );
}

function selectedAssetFilePaths(sourceCategories = catalog.categories) {
    const entries = selectedAssetEntries(sourceCategories);
    return {
        fullSizePaths: entries.map((selectedAsset) => selectedAsset.fullSizePath),
        thumbnailPaths: entries.map((selectedAsset) => selectedAsset.thumbnailPath),
    };
}

function unselectedLocalImages({
    sourceCategories = catalog.categories,
    fullSizePaths,
    thumbnailPaths = [],
} = {}) {
    return catalog.localImageProjections({
        sourceCategories,
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

function validatePhotoStatusPresentation(errors, sourceCategories) {
    let presentations;

    try {
        presentations =
            catalog.catalogProjections(sourceCategories).photoStatusPresentations;
    } catch (error) {
        errors.push(`Photo Status presentation failed: ${error.message}`);
        return;
    }

    if (!Array.isArray(presentations)) {
        errors.push("Photo Status presentations must be an array");
        return;
    }

    const validPhotoStatuses = new Set(Object.values(catalog.photoStatuses));

    presentations.forEach((presentation, index) => {
        const prefix = isNonEmptyText(presentation?.catalogRef)
            ? presentation.catalogRef
            : `Photo Status presentation ${index}`;

        if (!isPlainObject(presentation)) {
            errors.push(`${prefix} must be an object`);
            return;
        }

        if (!validPhotoStatuses.has(presentation.status)) {
            errors.push(
                `${prefix} Photo Status presentation has invalid status: ${presentation.status}`
            );
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
    let checklistPolicies;

    try {
        checklistPolicies = catalog.photoStatusChecklistPolicies();
    } catch (error) {
        errors.push(`Photo Status checklist policy failed: ${error.message}`);
        return;
    }

    if (!Array.isArray(checklistPolicies)) {
        errors.push("Photo Status checklist policy must be an array");
        return;
    }

    const checklistPolicyByStatus = new Map();
    checklistPolicies.forEach((policy, index) => {
        const prefix = `Photo Status checklist policy ${index}`;

        if (!isPlainObject(policy)) {
            errors.push(`${prefix} must be an object`);
            return;
        }

        requirePolicyText(errors, policy.status, `${prefix} status`);
        requirePolicyText(errors, policy.title, `${prefix} title`);
        requirePolicyText(
            errors,
            policy.emptyMessage,
            `${prefix} empty message`
        );

        if (isNonEmptyText(policy.status)) {
            checklistPolicyByStatus.set(policy.status, policy);
        }
    });

    try {
        sections =
            catalog.catalogProjections(sourceCategories)
                .photoStatusChecklistSections;
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
        const checklistPolicy = checklistPolicyByStatus.get(section.status);

        if (!checklistPolicy) {
            errors.push(`${prefix} uses a non-checklist status`);
            return;
        }

        if (section.title !== checklistPolicy.title) {
            errors.push(`${prefix} title must come from Photo Status policy`);
        }
        if (section.emptyMessage !== checklistPolicy.emptyMessage) {
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
    const validImageKinds = new Set(Object.values(catalog.imageKinds));
    const entries = validPlateEntries(sourceCategories);
    const categoriesWithPlates = sourceCategories.filter(
        (category) => isPlainObject(category) && Array.isArray(category.plates)
    );
    const selectedAssetByRef = new Map(
        selectedAssetEntries(categoriesWithPlates).map((selectedAsset) => [
            selectedAsset.catalogRef,
            selectedAsset,
        ])
    );

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

        if (plate.photoStatus === catalog.photoStatuses.MISSING) {
            if (plate.asset !== null) {
                errors.push(
                    `${prefix} must use asset: null when Photo Status is missing`
                );
            }
            if (hasOwn(plate, "selectedAssetAltText")) {
                errors.push(
                    `${prefix} must not override Selected Asset alt text when Photo Status is missing`
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

        const selectedAsset = selectedAssetByRef.get(prefix);
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
    let projections;

    try {
        projections = catalog.catalogProjections(sourceCategories);
    } catch (error) {
        errors.push(`page-facing Plate Catalog data failed: ${error.message}`);
        return;
    }

    let display;
    try {
        display = projections.displayCategories;
    } catch (error) {
        errors.push(`page-facing Plate Catalog data failed: ${error.message}`);
        return;
    }

    if (!Array.isArray(display)) {
        errors.push("page-facing Plate Catalog data must be an array");
    }

    let checklist;
    try {
        checklist = projections.displayChecklistSections;
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
    catalogOrderPolicy,
    selectedAssetEntries,
    selectedAssetRequirements,
    selectedAssetFilePaths,
    unselectedLocalImages,
    validatePhotoStatusPolicy,
    validateCatalog,
};
