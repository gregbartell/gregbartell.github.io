(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
        return;
    }
    if (root) {
        root.SelectedAssetPaths = api;
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    const FULL_SIZE_IMAGE_ROOT = "assets/plates/full";
    const THUMBNAIL_IMAGE_ROOT = "assets/plates/thumbs";

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

    return Object.freeze({
        fullSizeImageRoot: FULL_SIZE_IMAGE_ROOT,
        thumbnailImageRoot: THUMBNAIL_IMAGE_ROOT,
        selectedAssetPaths,
    });
});
