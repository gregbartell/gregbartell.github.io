const selectedAssetPathRules = require("./selected-asset-paths.js");

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

function pathFromFileObservation(fileObservation) {
    if (typeof fileObservation === "string") return fileObservation;
    if (fileObservation && typeof fileObservation.path === "string") {
        return fileObservation.path;
    }
    return null;
}

function pathList(fileObservations) {
    if (!Array.isArray(fileObservations)) {
        throw new Error("file observations must be an array");
    }

    return fileObservations
        .map(pathFromFileObservation)
        .filter((path) => path !== null);
}

function localImageProjections({
    selectedAssets,
    fullSizePaths,
    thumbnailPaths = [],
} = {}) {
    if (!Array.isArray(selectedAssets)) {
        throw new Error("selectedAssets must be an array");
    }
    if (!Array.isArray(fullSizePaths)) {
        throw new Error("fullSizePaths must be an array");
    }
    if (!Array.isArray(thumbnailPaths)) {
        throw new Error("thumbnailPaths must be an array");
    }

    const selectedFullSizePaths = new Set(
        selectedAssetRequirements(selectedAssets).map(
            (requirement) => requirement.fullSizePath
        )
    );
    const localThumbnailPaths = new Set(pathList(thumbnailPaths));

    return pathList(fullSizePaths)
        .filter((path) => !selectedFullSizePaths.has(path))
        .map((path) => {
            const asset = assetFromFullSizePath(path);
            const expectedThumbnailPath =
                selectedAssetPaths(asset).thumbnailPath;

            return Object.freeze({
                asset,
                fullSizePath: path,
                thumbnailPath: expectedThumbnailPath,
                hasMatchingThumbnail:
                    expectedThumbnailPath !== null &&
                    localThumbnailPaths.has(expectedThumbnailPath),
            });
        });
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
    localImageProjections,
    assetFromFullSizePath,
    isJpegPath,
    isRepositoryFullSizeJpegPath,
    isRepositoryThumbnailJpegPath,
    pathList,
    thumbnailNeedsRefresh,
});
