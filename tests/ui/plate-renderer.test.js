#!/usr/bin/env node
const assert = require("assert/strict");

delete globalThis.PlateCatalogRenderer;
require("../../src/ui/plate-renderer.js");

const renderer = globalThis.PlateCatalogRenderer;

assert.equal(typeof renderer.renderCatalog, "function");
assert.equal(typeof renderer.renderCategoryNavigation, "function");
assert.equal(typeof renderer.renderChecklist, "function");
assert.equal(typeof renderer.bindSelectedAssetPreview, "function");
assert.equal(typeof renderer.renderSelectedAssetPreview, "function");

function createElement(tagName) {
    const listeners = new Map();
    const element = {
        tagName: tagName.toUpperCase(),
        attributes: new Map(),
        children: [],
        dataset: {},
        className: "",
        append(...children) {
            children.forEach((child) => {
                if (typeof child === "object") child.parentElement = element;
            });
            element.children.push(...children);
        },
        replaceChildren(...children) {
            element.children = [];
            element.append(...children);
        },
        setAttribute(name, value) {
            element.attributes.set(name, String(value));
        },
        getAttribute(name) {
            return element.attributes.get(name) ?? null;
        },
        addEventListener(type, listener) {
            listeners.set(type, listener);
        },
        dispatch(type, event) {
            listeners.get(type)?.(event);
        },
    };
    element.classList = {
        add(...classes) {
            element.className = [element.className, ...classes]
                .filter(Boolean)
                .join(" ");
        },
        contains(className) {
            return element.className.split(/\s+/).includes(className);
        },
    };
    return element;
}

const documentListeners = new Map();
let categoryHeading = null;
const fakeWindow = {
    location: { hash: "" },
    addEventListener() {},
    requestAnimationFrame(callback) {
        callback();
    },
};
const fakeDocument = {
    activeElement: null,
    createElement,
    getElementById(id) {
        return categoryHeading?.id === id ? categoryHeading : null;
    },
    addEventListener(type, listener) {
        documentListeners.set(type, listener);
    },
    dispatch(type, event) {
        documentListeners.get(type)?.(event);
    },
};
globalThis.document = fakeDocument;
globalThis.window = fakeWindow;

const root = createElement("div");
renderer.renderCatalog(root, [
    {
        title: "Fixture",
        fragmentId: "fix",
        sticker: { style: "blue", mark: "FIX", foot: "WASHINGTON" },
        variants: [
            {
                title: "Selected Plate",
                photoStatus: "needs-upgrade",
                image: {
                    thumbnailSrc:
                        "assets/plates/thumbs/fixture/selected.jpg",
                    fullSizeSrc: "assets/plates/full/fixture/selected.jpg",
                    altText: "Selected Plate plate",
                },
                badge: {
                    text: "LOW QUALITY",
                    ariaLabel: "Low quality photo",
                },
            },
            {
                title: "Missing Plate",
                photoStatus: "missing",
                missingPlaceholder: {
                    ariaLabel: "Missing Plate plate — photo pending",
                    stripDetail: "No photo on file",
                    plateTitle: "Missing Plate",
                    categoryTitle: "Fixture",
                    statusText: "Pending",
                    stampText: "Pending",
                },
            },
        ],
    },
]);

const grid = root.children[0].children[1];
const [selectedCard, missingCard] = grid.children;
const selectedAsset = selectedCard.children[1];
const selectedImage = selectedAsset.children[0];
const selectedBadge = selectedAsset.children[1];
const previewControl = selectedCard.children[2];

assert.match(selectedCard.className, /\bplate-card--interactive\b/);
assert.equal(selectedAsset.className, "plate-card__selected-asset");
assert.equal(selectedBadge.className, "photo-status-badge");
assert.equal(selectedBadge.getAttribute("aria-label"), "Low quality photo");
assert.equal(previewControl.tagName, "BUTTON");
assert.equal(previewControl.type, "button");
assert.equal(
    previewControl.getAttribute("aria-label"),
    "Preview Selected Plate"
);
assert.equal(selectedImage.getAttribute("role"), null);
assert.equal(selectedImage.getAttribute("tabindex"), null);
assert.equal(selectedImage.alt, "Selected Plate plate");
assert.equal(selectedImage.loading, "lazy");
assert.doesNotMatch(missingCard.className, /\bplate-card--interactive\b/);
assert.equal(missingCard.children.length, 2);

const categories = [
    {
        title: "Tribal, WA",
        fragmentId: "trb-wa",
        sticker: { style: "black", mark: "TRB", foot: "WASHINGTON" },
        variants: [],
    },
];
const catalogRoot = createElement("div");
const navigationRoot = createElement("div");

renderer.renderCatalog(catalogRoot, categories);
renderer.renderCategoryNavigation(navigationRoot, categories);

const register = navigationRoot.children[0];
const summary = register.children[0];
const navigation = register.children[1];
const list = navigation.children[0];
const link = list.children[0].children[0];
categoryHeading = catalogRoot.children[0].children[0];

assert.equal(register.tagName, "DETAILS");
assert.equal(register.getAttribute("open"), null);
assert.equal(summary.textContent, "Categories");
assert.equal(navigation.getAttribute("aria-label"), "Plate Categories");
assert.deepEqual(
    [
        link.getAttribute("href"),
        link.children[1].textContent,
        link.children[0].className,
    ],
    ["#trb-wa", "Tribal, WA", "cat-sticker cat-sticker--black"]
);
assert.deepEqual([categoryHeading.id, categoryHeading.tabIndex], ["trb-wa", -1]);

list.contains = (candidate) => candidate === link;
link.closest = () => link;
categoryHeading.focus = (options) => {
    categoryHeading.focusOptions = options;
    fakeDocument.activeElement = categoryHeading;
};
register.open = true;
list.dispatch("click", { target: link });
assert.equal(register.open, false);
assert.equal(fakeDocument.activeElement, categoryHeading);
assert.deepEqual(categoryHeading.focusOptions, { preventScroll: true });

summary.focus = () => {
    fakeDocument.activeElement = summary;
};
register.open = true;
fakeDocument.activeElement = catalogRoot;
fakeDocument.dispatch("keydown", { key: "Escape", target: catalogRoot });
assert.equal(register.open, false);
assert.equal(fakeDocument.activeElement, summary);

root.contains = (element) => element === selectedCard;
selectedCard.closest = () => selectedCard;
selectedCard.querySelector = (selector) => {
    if (selector === ".plate-card__preview") return previewControl;
    if (selector === ".plate-image") return selectedImage;
    return null;
};
previewControl.focus = () => {
    document.activeElement = previewControl;
};
missingCard.closest = () => null;

const requests = [];
renderer.bindSelectedAssetPreview(root, (request) => {
    requests.push(request);
});
root.dispatch("click", { target: selectedCard });
assert.equal(document.activeElement, previewControl);
assert.deepEqual(requests, [
    {
        thumbnailSrc: "assets/plates/thumbs/fixture/selected.jpg",
        fullSizeSrc: "assets/plates/full/fixture/selected.jpg",
        altText: "Selected Plate plate",
        variantTitle: "Selected Plate",
        category: {
            title: "Fixture",
            stickerStyle: "blue",
        },
    },
]);

root.dispatch("click", { target: missingCard });
assert.equal(requests.length, 1);

{
    const preview = fakeDocument.createElement("figure");
    const selectedAsset = fakeDocument.createElement("img");
    selectedAsset.className = "image-preview__asset";
    const variantTitle = fakeDocument.createElement("h2");
    variantTitle.className = "image-preview__title";
    const category = fakeDocument.createElement("p");
    category.className = "image-preview__category cat-sticker--green";
    preview.append(selectedAsset, variantTitle, category);
    preview.querySelector = (selector) => {
        if (selector === ".image-preview__asset") return selectedAsset;
        if (selector === ".image-preview__title") return variantTitle;
        if (selector === ".image-preview__category") return category;
        return null;
    };

    const renderedAsset = renderer.renderSelectedAssetPreview(preview, {
        thumbnailSrc: "assets/plates/thumbs/fixture/selected.jpg",
        fullSizeSrc: "assets/plates/full/fixture/selected.jpg",
        altText: "Selected Plate plate",
        variantTitle: "Selected Plate",
        category: {
            title: "Fixture",
            stickerStyle: "blue",
        },
    });

    assert.equal(renderedAsset, selectedAsset);
    assert.equal(
        selectedAsset.src,
        "assets/plates/thumbs/fixture/selected.jpg"
    );
    assert.equal(selectedAsset.alt, "Selected Plate plate");
    assert.equal(variantTitle.textContent, "Selected Plate");
    assert.equal(category.textContent, "Fixture");
    assert.equal(
        category.className,
        "image-preview__category cat-sticker cat-sticker--blue"
    );
}

console.log("Plate renderer tests passed.");
