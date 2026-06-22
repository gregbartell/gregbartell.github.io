const catalogValidation = require("./plate-catalog-validation.js");

const COLLATOR = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});

function sortedPaths(paths) {
    return [...paths].sort((left, right) => COLLATOR.compare(left, right));
}

function auditCatalog({
    sourceCategories,
    fullSizePaths = [],
    thumbnailPaths = [],
    validation = catalogValidation,
} = {}) {
    const errors = [];
    const notices = [];

    auditCatalogInvariants({ errors, sourceCategories, validation });
    auditSelectedAssetFiles({
        errors,
        fullSizePaths,
        thumbnailPaths,
        sourceCategories,
        validation,
    });
    auditUnselectedLocalImages({
        errors,
        notices,
        fullSizePaths,
        thumbnailPaths,
        sourceCategories,
        validation,
    });

    return {
        passed: errors.length === 0,
        errors,
        notices,
    };
}

function auditCatalogInvariants({ errors, sourceCategories, validation }) {
    if (typeof validation.validateCatalog !== "function") {
        errors.push("catalogValidation.validateCatalog must be a function");
        return;
    }

    let validationErrors;
    try {
        validationErrors = validation.validateCatalog(sourceCategories);
    } catch (error) {
        errors.push(`catalogValidation.validateCatalog threw: ${error.message}`);
        return;
    }

    if (!Array.isArray(validationErrors)) {
        errors.push("catalogValidation.validateCatalog must return an array");
        return;
    }

    validationErrors.forEach((error) => errors.push(error));
}

function auditSelectedAssetFiles({
    errors,
    fullSizePaths,
    thumbnailPaths,
    sourceCategories,
    validation,
}) {
    if (typeof validation.selectedAssetRequirements !== "function") {
        errors.push("catalogValidation.selectedAssetRequirements must be a function");
        return;
    }
    if (!Array.isArray(fullSizePaths)) {
        errors.push("fullSizePaths must be an array");
        return;
    }
    if (!Array.isArray(thumbnailPaths)) {
        errors.push("thumbnailPaths must be an array");
        return;
    }

    let requirements;
    try {
        requirements = validation.selectedAssetRequirements(sourceCategories);
    } catch (error) {
        errors.push(
            `catalogValidation.selectedAssetRequirements threw: ${error.message}`
        );
        return;
    }

    if (!Array.isArray(requirements)) {
        errors.push("catalogValidation.selectedAssetRequirements must return an array");
        return;
    }

    const localFullSizePaths = new Set(fullSizePaths);
    const localThumbnailPaths = new Set(thumbnailPaths);

    requirements.forEach((requirement) => {
        if (!requirement || typeof requirement.catalogRef !== "string") {
            errors.push(
                "catalogValidation.selectedAssetRequirements returned an invalid item"
            );
            return;
        }

        if (!localFullSizePaths.has(requirement.fullSizePath)) {
            errors.push(
                `${requirement.catalogRef} missing Selected Asset full-size file: ${requirement.fullSizePath}`
            );
        }
        if (!localThumbnailPaths.has(requirement.thumbnailPath)) {
            errors.push(
                `${requirement.catalogRef} missing Selected Asset thumbnail file: ${requirement.thumbnailPath}`
            );
        }
    });
}

function auditUnselectedLocalImages({
    errors,
    notices,
    fullSizePaths,
    thumbnailPaths,
    sourceCategories,
    validation,
}) {
    if (typeof validation.unselectedLocalImages !== "function") {
        errors.push("catalogValidation.unselectedLocalImages must be a function");
        return;
    }
    if (!Array.isArray(fullSizePaths) || !Array.isArray(thumbnailPaths)) {
        return;
    }

    let unselectedImages;
    try {
        unselectedImages = validation.unselectedLocalImages({
            sourceCategories,
            fullSizePaths: sortedPaths(fullSizePaths),
            thumbnailPaths: sortedPaths(thumbnailPaths),
        });
    } catch (error) {
        errors.push(`catalogValidation.unselectedLocalImages threw: ${error.message}`);
        return;
    }

    if (!Array.isArray(unselectedImages)) {
        errors.push("catalogValidation.unselectedLocalImages must return an array");
        return;
    }

    if (unselectedImages.length === 0) return;

    notices.push({
        type: "unselected-local-images",
        images: unselectedImages,
    });
}

module.exports = {
    auditCatalog,
};
