#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { auditCatalog } = require("./plate-catalog-audit.js");

const repoRoot = path.resolve(__dirname, "..");
const collator = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
});

function toRepoRelative(absolutePath) {
    return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

function localJpegPaths(rootRelativePath, shouldInclude = () => true) {
    const rootPath = path.join(repoRoot, rootRelativePath);
    const paths = [];

    function walk(directory) {
        fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
            const absolutePath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(absolutePath);
                return;
            }

            if (!entry.isFile() || !/\.(?:jpe?g)$/i.test(entry.name)) {
                return;
            }

            const relativePath = toRepoRelative(absolutePath);
            if (shouldInclude(relativePath)) {
                paths.push(relativePath);
            }
        });
    }

    if (fs.existsSync(rootPath)) walk(rootPath);
    return paths.sort((left, right) => collator.compare(left, right));
}

function repositoryImagePaths() {
    return {
        fullSizePaths: localJpegPaths(
            "pics",
            (relativePath) => !relativePath.startsWith("pics/thumbs/")
        ),
        thumbnailPaths: localJpegPaths("pics/thumbs"),
    };
}

function auditRepositoryCatalog() {
    return auditCatalog(repositoryImagePaths());
}

function formatNoticeLines(notice) {
    if (notice.type !== "unselected-local-images" || notice.images.length === 0) {
        return [];
    }

    return [
        "Unselected local images (informational, not catalog failures):",
        ...notice.images.map((image) => {
            const thumbnailStatus = image.hasMatchingThumbnail
                ? `matching thumbnail: ${image.thumbnailPath}`
                : `no matching thumbnail: ${image.thumbnailPath}`;
            return `- ${image.fullSizePath} (${thumbnailStatus})`;
        }),
    ];
}

function formatAuditResult(result) {
    const stdout = [];
    const stderr = [];

    if (result.passed) {
        stdout.push("Catalog audit passed.");
    } else {
        stderr.push("Catalog audit failed:");
        result.errors.forEach((error) => stderr.push(`- ${error}`));
    }

    result.notices.flatMap(formatNoticeLines).forEach((line) => {
        stdout.push(line);
    });

    return {
        exitCode: result.passed ? 0 : 1,
        stdout,
        stderr,
    };
}

function writeLines(lines, writeLine) {
    lines.forEach((line) => writeLine(line));
}

function runAuditCommand({
    result = auditRepositoryCatalog(),
    stdout = console.log,
    stderr = console.error,
    exit = process.exit,
} = {}) {
    const output = formatAuditResult(result);

    writeLines(output.stderr, stderr);
    writeLines(output.stdout, stdout);

    if (output.exitCode !== 0) {
        exit(output.exitCode);
    }

    return output.exitCode;
}

if (require.main === module) {
    runAuditCommand();
}

module.exports = {
    auditRepositoryCatalog,
    formatAuditResult,
    localJpegPaths,
    repositoryImagePaths,
    runAuditCommand,
};
