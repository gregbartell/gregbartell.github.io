#!/usr/bin/env node
const assert = require("assert/strict");
const { createModalLifecycle } = require("../../src/ui/modal-lifecycle.js");

function fakeDocument() {
    const listeners = {};
    return {
        activeElement: null,
        addEventListener(type, listener) {
            listeners[type] = listeners[type] || [];
            listeners[type].push(listener);
        },
        dispatchEvent(event) {
            (listeners[event.type] || []).forEach((listener) => listener(event));
        },
    };
}

function fakeElement(documentRef) {
    const listeners = {};
    return {
        style: {},
        addEventListener(type, listener) {
            listeners[type] = listeners[type] || [];
            listeners[type].push(listener);
        },
        dispatchEvent(event) {
            (listeners[event.type] || []).forEach((listener) => listener(event));
        },
        focus() {
            documentRef.activeElement = this;
        },
    };
}

function openFixture() {
    const documentRef = fakeDocument();
    const opener = fakeElement(documentRef);
    const modal = fakeElement(documentRef);
    const closeButton = fakeElement(documentRef);
    documentRef.activeElement = opener;

    const lifecycle = createModalLifecycle({ document: documentRef });
    const dialog = lifecycle.register({ modal, closeButton });
    dialog.open();

    return { documentRef, opener, modal, closeButton, dialog };
}

{
    const { documentRef, opener, modal, closeButton, dialog } = openFixture();

    assert.equal(modal.style.display, "flex");
    assert.equal(documentRef.activeElement, closeButton);

    dialog.close();

    assert.equal(modal.style.display, "none");
    assert.equal(documentRef.activeElement, opener);
}

{
    const { documentRef, opener, modal, closeButton } = openFixture();

    closeButton.dispatchEvent({ type: "click", target: closeButton });

    assert.equal(modal.style.display, "none");
    assert.equal(documentRef.activeElement, opener);
}

{
    const { documentRef, opener, modal } = openFixture();
    const content = fakeElement(documentRef);

    modal.dispatchEvent({ type: "click", target: content });

    assert.equal(modal.style.display, "flex");

    modal.dispatchEvent({ type: "click", target: modal });

    assert.equal(modal.style.display, "none");
    assert.equal(documentRef.activeElement, opener);
}

{
    const { documentRef, opener, modal } = openFixture();

    documentRef.dispatchEvent({ type: "keydown", key: "Escape" });

    assert.equal(modal.style.display, "none");
    assert.equal(documentRef.activeElement, opener);
}

{
    const documentRef = fakeDocument();
    const opener = fakeElement(documentRef);
    const firstModal = fakeElement(documentRef);
    const firstClose = fakeElement(documentRef);
    const secondModal = fakeElement(documentRef);
    const secondClose = fakeElement(documentRef);
    documentRef.activeElement = opener;

    const lifecycle = createModalLifecycle({ document: documentRef });
    const firstDialog = lifecycle.register({
        modal: firstModal,
        closeButton: firstClose,
    });
    const secondDialog = lifecycle.register({
        modal: secondModal,
        closeButton: secondClose,
    });

    firstDialog.open();
    secondDialog.open();
    documentRef.dispatchEvent({ type: "keydown", key: "Escape" });

    assert.equal(firstModal.style.display, "flex");
    assert.equal(secondModal.style.display, "none");
    assert.equal(documentRef.activeElement, firstClose);

    documentRef.dispatchEvent({ type: "keydown", key: "Escape" });

    assert.equal(firstModal.style.display, "none");
    assert.equal(documentRef.activeElement, opener);
}

console.log("Modal lifecycle tests passed.");
