#!/usr/bin/env node
const assert = require("assert/strict");

delete globalThis.PlateCatalogRenderer;
require("./plate-renderer.js");

const renderer = globalThis.PlateCatalogRenderer;

assert.equal(typeof renderer.renderCatalog, "function");
assert.equal(typeof renderer.renderChecklist, "function");
assert.equal(typeof renderer.bindSelectedAssetPreview, "function");

function fakeCatalogRoot() {
    const listeners = new Map();

    return {
        addEventListener(type, listener) {
            const typeListeners = listeners.get(type) || [];
            typeListeners.push(listener);
            listeners.set(type, typeListeners);
        },
        removeEventListener(type, listener) {
            listeners.set(
                type,
                (listeners.get(type) || []).filter(
                    (candidate) => candidate !== listener
                )
            );
        },
        contains(node) {
            return node.insideCatalogRoot === true;
        },
        dispatch(type, event) {
            (listeners.get(type) || []).forEach((listener) => listener(event));
        },
    };
}

function selectedAssetImage(overrides = {}) {
    return {
        insideCatalogRoot: true,
        src: "pics/thumbs/fixture/selected.jpg",
        alt: "Selected Plate plate",
        dataset: {
            fullSrc: "pics/fixture/selected.jpg",
        },
        closest() {
            return this;
        },
        ...overrides,
    };
}

function missingPhotoPlaceholder() {
    return {
        insideCatalogRoot: true,
        closest() {
            return null;
        },
    };
}

{
    const root = fakeCatalogRoot();
    const requests = [];
    renderer.bindSelectedAssetPreview(root, (request) => {
        requests.push(request);
    });

    root.dispatch("click", { target: selectedAssetImage() });

    assert.deepEqual(requests, [
        {
            thumbnailSrc: "pics/thumbs/fixture/selected.jpg",
            fullSizeSrc: "pics/fixture/selected.jpg",
            altText: "Selected Plate plate",
        },
    ]);
}

["Enter", " "].forEach((key) => {
    const root = fakeCatalogRoot();
    const requests = [];
    let preventedDefault = false;

    renderer.bindSelectedAssetPreview(root, (request) => {
        requests.push(request);
    });

    root.dispatch("keydown", {
        key,
        target: selectedAssetImage(),
        preventDefault() {
            preventedDefault = true;
        },
    });

    assert.deepEqual(requests, [
        {
            thumbnailSrc: "pics/thumbs/fixture/selected.jpg",
            fullSizeSrc: "pics/fixture/selected.jpg",
            altText: "Selected Plate plate",
        },
    ]);
    assert.equal(preventedDefault, true);
});

{
    const root = fakeCatalogRoot();
    const requests = [];
    renderer.bindSelectedAssetPreview(root, (request) => {
        requests.push(request);
    });

    root.dispatch("click", { target: missingPhotoPlaceholder() });

    assert.deepEqual(requests, []);
}

{
    const root = fakeCatalogRoot();
    const requests = [];
    let preventedDefault = false;
    renderer.bindSelectedAssetPreview(root, (request) => {
        requests.push(request);
    });

    root.dispatch("keydown", {
        key: "Tab",
        target: selectedAssetImage(),
        preventDefault() {
            preventedDefault = true;
        },
    });

    assert.deepEqual(requests, []);
    assert.equal(preventedDefault, false);
}

console.log("Plate renderer tests passed.");
