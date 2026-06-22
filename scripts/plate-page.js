(function () {
    const catalog = window.PlateCatalog;
    const renderer = window.PlateCatalogRenderer;

    if (!catalog) {
        throw new Error("PlateCatalog is required before plate-page.js");
    }
    if (!renderer) {
        throw new Error("PlateCatalogRenderer is required before plate-page.js");
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

        const statusSectionsEl = document.getElementById("statusSections");

        let lastFocused = null;
        let currentImageRequestId = 0;

        function openModal(modal) {
            lastFocused = document.activeElement;
            modal.style.display = "flex";
            modal.querySelector(".close")?.focus();
        }

        function closeModal(modal) {
            modal.style.display = "none";
            lastFocused?.focus();
        }

        document.querySelectorAll(".plate-image").forEach((img) => {
            const open = () => {
                const myId = ++currentImageRequestId;
                const thumbSrc = img.src;
                const fullSrc = img.dataset.fullSrc;

                enlargedImg.src = thumbSrc;
                enlargedImg.alt = img.alt;
                openModal(imageModal);

                if (fullSrc && fullSrc !== thumbSrc) {
                    const full = new Image();
                    full.onload = () => {
                        if (myId === currentImageRequestId) {
                            enlargedImg.src = fullSrc;
                        }
                    };
                    full.src = fullSrc;
                }
            };

            img.addEventListener("click", open);
            img.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open();
                }
            });
        });

        imageCloseBtn.addEventListener("click", () => closeModal(imageModal));
        statusCloseBtn.addEventListener("click", () => closeModal(statusModal));

        statusBtn.addEventListener("click", () => {
            renderer.renderChecklist(
                statusSectionsEl,
                catalog.displayChecklistSections()
            );
            openModal(statusModal);
        });

        imageModal.addEventListener("click", (event) => {
            if (event.target === imageModal) closeModal(imageModal);
        });
        statusModal.addEventListener("click", (event) => {
            if (event.target === statusModal) closeModal(statusModal);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            if (imageModal.style.display === "flex") closeModal(imageModal);
            else if (statusModal.style.display === "flex") closeModal(statusModal);
        });
    }
})();
