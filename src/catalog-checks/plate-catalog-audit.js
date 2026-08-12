const catalogValidation = require("./plate-catalog-validation.js");

function auditCatalog({
    sourceCategories,
    fullSizePaths = [],
    thumbnailPaths = [],
} = {}) {
    const errors = [];

    auditCatalogInvariants({ errors, sourceCategories });
    auditSelectedAssetFiles({
        errors,
        fullSizePaths,
        thumbnailPaths,
        sourceCategories,
    });

    return {
        passed: errors.length === 0,
        errors,
    };
}

function auditCatalogInvariants({ errors, sourceCategories }) {
    let validationErrors;
    try {
        validationErrors = catalogValidation.validateCatalog(sourceCategories);
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
}) {
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
        requirements =
            catalogValidation.selectedAssetRequirements(sourceCategories);
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

module.exports = {
    auditCatalog,
};
