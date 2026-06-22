#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const selectedAssetFilesystem = require("../src/catalog-checks/selected-asset-filesystem.js");

const repoRoot = path.resolve(__dirname, "..");
const collator = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});

function toRepoRelative(absolutePath) {
    return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

function thumbnailMetadata(thumbnailPath) {
    const absoluteThumbnailPath = path.join(repoRoot, thumbnailPath);
    if (!fs.existsSync(absoluteThumbnailPath)) return null;

    return {
        mtimeMs: fs.statSync(absoluteThumbnailPath).mtimeMs,
    };
}

function thumbnailAction({ existingThumbnailMetadata, needsRefresh }) {
    if (!existingThumbnailMetadata) return "generate";
    if (needsRefresh) return "refresh";
    return "skip";
}

function thumbnailJobForSource(absoluteSourcePath) {
    const sourcePath = toRepoRelative(absoluteSourcePath);
    if (!selectedAssetFilesystem.isRepositoryFullSizeJpegPath(sourcePath)) {
        return null;
    }

    const sourceMetadata = {
        mtimeMs: fs.statSync(absoluteSourcePath).mtimeMs,
    };
    const thumbnailPath = selectedAssetFilesystem.selectedAssetPaths(
        selectedAssetFilesystem.assetFromFullSizePath(sourcePath)
    ).thumbnailPath;
    const existingThumbnailMetadata = thumbnailMetadata(thumbnailPath);
    const needsRefresh = selectedAssetFilesystem.thumbnailNeedsRefresh({
        fullSizeMetadata: sourceMetadata,
        thumbnailMetadata: existingThumbnailMetadata,
    });

    return {
        sourcePath,
        thumbnailPath,
        action: thumbnailAction({
            existingThumbnailMetadata,
            needsRefresh,
        }),
    };
}

function repositoryThumbnailJobs() {
    const rootPath = path.join(
        repoRoot,
        selectedAssetFilesystem.fullSizeImageRoot
    );
    const jobs = [];

    function walk(directory) {
        fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
            const absolutePath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(absolutePath);
                return;
            }

            if (!entry.isFile()) return;

            const job = thumbnailJobForSource(absolutePath);
            if (job) jobs.push(job);
        });
    }

    if (fs.existsSync(rootPath)) walk(rootPath);

    return jobs.sort((left, right) =>
        collator.compare(left.sourcePath, right.sourcePath)
    );
}

function runThumbnailPlanCommand({ stdout = console.log } = {}) {
    stdout(JSON.stringify(repositoryThumbnailJobs(), null, 2));
}

if (require.main === module) {
    runThumbnailPlanCommand();
}

module.exports = {
    repositoryThumbnailJobs,
    runThumbnailPlanCommand,
};
