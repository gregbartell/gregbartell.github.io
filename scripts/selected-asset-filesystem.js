(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
        return;
    }
    if (root) {
        root.SelectedAssetFilesystem = api;
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    const FULL_SIZE_IMAGE_ROOT = "pics";
    const THUMBNAIL_IMAGE_ROOT = "pics/thumbs";
    const JPEG_EXTENSION_PATTERN = /\.(?:jpe?g)$/i;
    const FRESHNESS_TOLERANCE_MS = 1000;

    function isNonEmptyText(value) {
        return typeof value === "string" && value.trim() !== "";
    }

    function fullSizePath(asset) {
        return isNonEmptyText(asset) ? `${FULL_SIZE_IMAGE_ROOT}/${asset}` : null;
    }

    function thumbnailPath(asset) {
        return isNonEmptyText(asset) ? `${THUMBNAIL_IMAGE_ROOT}/${asset}` : null;
    }

    function selectedAssetPaths(asset) {
        return Object.freeze({
            fullSizePath: fullSizePath(asset),
            thumbnailPath: thumbnailPath(asset),
        });
    }

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

    function assetFromFullSizePath(path) {
        const prefix = `${FULL_SIZE_IMAGE_ROOT}/`;
        if (typeof path !== "string") return null;
        if (!path.startsWith(prefix)) return null;
        if (path.startsWith(`${THUMBNAIL_IMAGE_ROOT}/`)) return null;
        return path.slice(prefix.length);
    }

    function isJpegPath(path) {
        return typeof path === "string" && JPEG_EXTENSION_PATTERN.test(path);
    }

    function isRepositoryFullSizeJpegPath(path) {
        return (
            typeof path === "string" &&
            path.startsWith(`${FULL_SIZE_IMAGE_ROOT}/`) &&
            !path.startsWith(`${THUMBNAIL_IMAGE_ROOT}/`) &&
            isJpegPath(path)
        );
    }

    function isRepositoryThumbnailJpegPath(path) {
        return (
            typeof path === "string" &&
            path.startsWith(`${THUMBNAIL_IMAGE_ROOT}/`) &&
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

    function metadataFromFileObservation(fileObservation) {
        if (!fileObservation || typeof fileObservation !== "object") return null;
        if (typeof fileObservation.mtimeMs !== "number") return null;

        return Object.freeze({
            mtimeMs: fileObservation.mtimeMs,
        });
    }

    function fileMetadataByPath(fileObservations) {
        if (!Array.isArray(fileObservations)) {
            throw new Error("file observations must be an array");
        }

        return fileObservations.reduce((metadata, fileObservation) => {
            const path = pathFromFileObservation(fileObservation);
            const fileMetadata = metadataFromFileObservation(fileObservation);
            if (path && fileMetadata) metadata[path] = fileMetadata;
            return metadata;
        }, {});
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
                const expectedThumbnailPath = thumbnailPath(asset);

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

    function thumbnailIsStale({
        fullSizePath,
        thumbnailPath,
        metadataByPath,
    }) {
        if (!metadataByPath || typeof metadataByPath !== "object") return false;

        const fullSizeMetadata = metadataByPath[fullSizePath];
        const thumbnailMetadata = metadataByPath[thumbnailPath];
        if (
            typeof fullSizeMetadata?.mtimeMs !== "number" ||
            typeof thumbnailMetadata?.mtimeMs !== "number"
        ) {
            return false;
        }

        return (
            fullSizeMetadata.mtimeMs - thumbnailMetadata.mtimeMs >
            FRESHNESS_TOLERANCE_MS
        );
    }

    function thumbnailFreshnessDiagnostics({
        requirements,
        metadataByPath,
    } = {}) {
        if (!Array.isArray(requirements)) {
            throw new Error("requirements must be an array");
        }

        return requirements
            .filter((requirement) =>
                thumbnailIsStale({
                    fullSizePath: requirement.fullSizePath,
                    thumbnailPath: requirement.thumbnailPath,
                    metadataByPath,
                })
            )
            .map(
                (requirement) =>
                    `${requirement.catalogRef} stale Selected Asset thumbnail file: ${requirement.thumbnailPath} older than ${requirement.fullSizePath}`
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

    return Object.freeze({
        fullSizeImageRoot: FULL_SIZE_IMAGE_ROOT,
        thumbnailImageRoot: THUMBNAIL_IMAGE_ROOT,
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
        fileMetadataByPath,
        thumbnailFreshnessDiagnostics,
        thumbnailNeedsRefresh,
    });
});
