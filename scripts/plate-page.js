(function () {
    const catalog = window.PlateCatalog;
    const renderer = window.PlateCatalogRenderer;
    const modalLifecycle = window.PlateModalLifecycle;

    if (!catalog) {
        throw new Error("PlateCatalog is required before plate-page.js");
    }
    if (!renderer) {
        throw new Error("PlateCatalogRenderer is required before plate-page.js");
    }
    if (!modalLifecycle) {
        throw new Error("PlateModalLifecycle is required before plate-page.js");
    }

    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }
        fn();
    }

    onReady(() => {
        renderCatalog();
        wirePageBehavior();
    });

    function renderCatalog() {
        const root = document.getElementById("catalog-root");
        if (!root) return;

        renderer.renderCatalog(root, catalog.displayCategories());
    }

    function wirePageBehavior() {
        const imageModal = document.getElementById("imageModal");
        const enlargedImg = document.getElementById("enlargedImg");
        const imageCloseBtn = document.getElementById("imageClose");

        const statusModal = document.getElementById("statusModal");
        const statusBtn = document.getElementById("check-status-btn");
        const statusCloseBtn = document.getElementById("statusClose");

        const catalogRoot = document.getElementById("catalog-root");
        const statusSectionsEl = document.getElementById("statusSections");

        let currentImageRequestId = 0;
        const lifecycle = modalLifecycle.createModalLifecycle({ document });
        const imageDialog = lifecycle.register({
            modal: imageModal,
            closeButton: imageCloseBtn,
        });
        const statusDialog = lifecycle.register({
            modal: statusModal,
            closeButton: statusCloseBtn,
        });

        function openSelectedAssetPreview(previewRequest) {
            const myId = ++currentImageRequestId;
            const thumbSrc = previewRequest.thumbnailSrc;
            const fullSrc = previewRequest.fullSizeSrc;

            enlargedImg.src = thumbSrc;
            enlargedImg.alt = previewRequest.altText;
            imageDialog.open();

            if (fullSrc && fullSrc !== thumbSrc) {
                const full = new Image();
                full.onload = () => {
                    if (myId === currentImageRequestId) {
                        enlargedImg.src = fullSrc;
                    }
                };
                full.src = fullSrc;
            }
        }

        renderer.bindSelectedAssetPreview(catalogRoot, openSelectedAssetPreview);

        statusBtn.addEventListener("click", () => {
            renderer.renderChecklist(
                statusSectionsEl,
                catalog.displayChecklistSections()
            );
            statusDialog.open();
        });
    }
})();
