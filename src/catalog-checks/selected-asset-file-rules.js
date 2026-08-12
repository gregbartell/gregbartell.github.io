const selectedAssetPathRules = require("../data/selected-asset-paths.js");

const {
    assetFromFullSizePath,
    fullSizeImageRoot,
    selectedAssetPaths,
    thumbnailImageRoot,
} = selectedAssetPathRules;
const JPEG_EXTENSION_PATTERN = /\.(?:jpe?g)$/i;
const FRESHNESS_TOLERANCE_MS = 1000;

function selectedAssetRequirement(selectedAsset) {
    const paths = selectedAssetPaths(selectedAsset?.asset);

    return Object.freeze({
        catalogRef: selectedAsset?.catalogRef,
        fullSizePath: paths.fullSizePath,
        thumbnailPath: paths.thumbnailPath,
    });
}

function selectedAssetRequirements(selectedAssets) {
    if (!Array.isArray(selectedAssets)) {
        throw new Error("selectedAssets must be an array");
    }

    return selectedAssets.map(selectedAssetRequirement);
}

function selectedAssetFilePaths(selectedAssets) {
    const requirements = selectedAssetRequirements(selectedAssets);

    return Object.freeze({
        fullSizePaths: requirements.map(
            (requirement) => requirement.fullSizePath
        ),
        thumbnailPaths: requirements.map(
            (requirement) => requirement.thumbnailPath
        ),
    });
}

function isJpegPath(path) {
    return typeof path === "string" && JPEG_EXTENSION_PATTERN.test(path);
}

function isRepositoryFullSizeJpegPath(path) {
    return (
        typeof path === "string" &&
        path.startsWith(`${fullSizeImageRoot}/`) &&
        !path.startsWith(`${thumbnailImageRoot}/`) &&
        isJpegPath(path)
    );
}

function isRepositoryThumbnailJpegPath(path) {
    return (
        typeof path === "string" &&
        path.startsWith(`${thumbnailImageRoot}/`) &&
        isJpegPath(path)
    );
}

function thumbnailNeedsRefresh({ fullSizeMetadata, thumbnailMetadata }) {
    if (!thumbnailMetadata) return true;
    if (
        typeof fullSizeMetadata?.mtimeMs !== "number" ||
        typeof thumbnailMetadata.mtimeMs !== "number"
    ) {
        return false;
    }

    return (
        fullSizeMetadata.mtimeMs - thumbnailMetadata.mtimeMs >
        FRESHNESS_TOLERANCE_MS
    );
}

module.exports = Object.freeze({
    fullSizeImageRoot,
    thumbnailImageRoot,
    freshnessToleranceMs: FRESHNESS_TOLERANCE_MS,
    selectedAssetPaths,
    selectedAssetRequirements,
    selectedAssetFilePaths,
    assetFromFullSizePath,
    isJpegPath,
    isRepositoryFullSizeJpegPath,
    isRepositoryThumbnailJpegPath,
    thumbnailNeedsRefresh,
});
