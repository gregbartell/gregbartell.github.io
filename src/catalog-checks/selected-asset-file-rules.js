const selectedAssetPathRules = require("../data/selected-asset-paths.js");

const {
    fullSizeImageRoot,
    thumbnailImageRoot,
} = selectedAssetPathRules;
const JPEG_EXTENSION_PATTERN = /\.(?:jpe?g)$/i;

function isJpegPath(path) {
    return typeof path === "string" && JPEG_EXTENSION_PATTERN.test(path);
}

module.exports = Object.freeze({
    fullSizeImageRoot,
    thumbnailImageRoot,
    isJpegPath,
});
