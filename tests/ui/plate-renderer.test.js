#!/usr/bin/env node
const assert = require("assert/strict");

delete globalThis.PlateCatalogRenderer;
require("../../src/ui/plate-renderer.js");

const renderer = globalThis.PlateCatalogRenderer;

assert.equal(typeof renderer.renderCatalog, "function");
assert.equal(typeof renderer.renderChecklist, "function");
assert.equal(typeof renderer.bindSelectedAssetPreview, "function");

function createElement(tagName) {
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
    };
    element.classList = {
        add(...classes) {
            element.className = [element.className, ...classes]
                .filter(Boolean)
                .join(" ");
        },
    };
    return element;
}

globalThis.document = { createElement };

const root = createElement("div");
renderer.renderCatalog(root, [
    {
        title: "Fixture",
        sticker: { style: "blue", mark: "FIX", foot: "WASHINGTON" },
        variants: [
            {
                title: "Selected Plate",
                photoStatus: "satisfied",
                image: {
                    thumbnailSrc:
                        "assets/plates/thumbs/fixture/selected.jpg",
                    fullSizeSrc: "assets/plates/full/fixture/selected.jpg",
                    altText: "Selected Plate plate",
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
const selectedImage = selectedCard.children[1];
const previewControl = selectedCard.children[2];

assert.match(selectedCard.className, /\bplate-card--interactive\b/);
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

const listeners = new Map();
root.addEventListener = (type, listener) => listeners.set(type, listener);
root.contains = (element) => element === selectedCard;
root.dispatch = (type, target) => listeners.get(type)?.({ target });

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

root.dispatch("click", selectedCard);

assert.equal(document.activeElement, previewControl);
assert.deepEqual(requests, [
    {
        thumbnailSrc: "assets/plates/thumbs/fixture/selected.jpg",
        fullSizeSrc: "assets/plates/full/fixture/selected.jpg",
        altText: "Selected Plate plate",
    },
]);

root.dispatch("click", missingCard);
assert.equal(requests.length, 1);

console.log("Plate renderer tests passed.");
