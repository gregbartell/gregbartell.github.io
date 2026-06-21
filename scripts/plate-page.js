(function () {
    const catalog = window.PlateCatalog;

    if (!catalog) {
        throw new Error("PlateCatalog is required before plate-page.js");
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

        root.replaceChildren(
            ...catalog.categories.map((category) => renderCategory(category))
        );
    }

    function renderCategory(category) {
        const section = document.createElement("section");
        section.className = "category-section";

        const heading = document.createElement("h2");
        heading.append(renderSticker(category), ` ${category.title}`);

        const grid = document.createElement("div");
        grid.className = "plate-grid";
        grid.replaceChildren(
            ...category.plates.map((plate) => renderPlateCard(plate, category))
        );

        section.append(heading, grid);
        return section;
    }

    function renderSticker(category) {
        const sticker = document.createElement("span");
        sticker.className = [
            "cat-sticker",
            `cat-sticker--${category.sticker.style}`,
        ].join(" ");

        const mark = document.createElement("span");
        mark.className = "cat-sticker__mark";
        mark.textContent = category.sticker.mark;

        const foot = document.createElement("span");
        foot.className = "cat-sticker__foot";
        foot.textContent = category.sticker.foot || catalog.defaultStickerFoot;

        sticker.append(mark, foot);
        return sticker;
    }

    function renderPlateCard(plate, category) {
        const card = document.createElement("div");
        card.className = "plate-card";

        const status = catalog.photoStatusFor(plate);
        const statusDetails = catalog.photoStatusDetailsFor(plate);
        card.dataset.photoStatus = status;

        const title = document.createElement("h3");
        title.textContent = plate.title;
        card.append(title);

        if (statusDetails.placeholder) {
            card.append(
                renderMissingPlaceholder(
                    plate,
                    category,
                    statusDetails.placeholder
                )
            );
        } else {
            card.append(renderPlateImage(plate));
        }

        if (statusDetails.cardBadge) {
            card.append(renderPhotoStatusBadge(statusDetails.cardBadge));
        }

        return card;
    }

    function renderPlateImage(plate) {
        const img = document.createElement("img");
        img.src = catalog.thumbnailPath(plate.asset);
        img.alt = catalog.imageAlt(plate);
        img.className = "plate-image";
        img.loading = "lazy";
        img.decoding = "async";
        img.setAttribute("role", "button");
        img.setAttribute("tabindex", "0");
        img.dataset.fullSrc = catalog.fullImagePath(plate.asset);
        return img;
    }

    function renderPhotoStatusBadge(cardBadge) {
        const badge = document.createElement("span");
        badge.className = "photo-status-badge";
        badge.textContent = cardBadge.text;
        if (cardBadge.ariaLabel) {
            badge.setAttribute("aria-label", cardBadge.ariaLabel);
        }
        return badge;
    }

    function renderMissingPlaceholder(plate, category, placeholderDetails) {
        const placeholder = document.createElement("div");
        placeholder.className = "plate-empty";
        placeholder.setAttribute("role", "img");
        placeholder.setAttribute(
            "aria-label",
            `${catalog.imageAlt(plate)} — ${placeholderDetails.ariaSuffix}`
        );

        const strip = document.createElement("div");
        strip.className = "plate-empty__strip";
        strip.append(
            textSpan("Plate Index"),
            textSpan(placeholderDetails.stripDetail)
        );

        const body = document.createElement("div");
        body.className = "plate-empty__body";
        body.append(
            renderPlaceholderRow("Plate", plate.title, "plate-empty__name"),
            renderPlaceholderRow(
                "Category",
                category.title,
                "plate-empty__category"
            ),
            renderPlaceholderRow("Status", placeholderDetails.statusValue)
        );

        const rubber = document.createElement("div");
        rubber.className = "plate-empty__rubber";
        rubber.textContent = placeholderDetails.stampText;

        placeholder.append(strip, body, rubber);
        return placeholder;
    }

    function renderPlaceholderRow(labelText, valueText, valueClass) {
        const row = document.createElement("div");
        row.className = "plate-empty__row";

        const label = document.createElement("span");
        label.textContent = labelText;

        const value = document.createElement("span");
        if (valueClass) value.className = valueClass;
        value.textContent = valueText;

        row.append(label, value);
        return row;
    }

    function textSpan(text) {
        const span = document.createElement("span");
        span.textContent = text;
        return span;
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
            populateStatusSections(statusSectionsEl);
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

    function populateStatusSections(statusSectionsEl) {
        statusSectionsEl.replaceChildren(
            ...catalog.checklistSections().map((statusSection) =>
                renderChecklistSection(statusSection)
            )
        );
    }

    function renderChecklistSection(statusSection) {
        const column = document.createElement("div");
        column.className = "status-column";
        column.dataset.photoStatus = statusSection.status;

        const countBadge = document.createElement("span");
        countBadge.className = "status-badge";

        const title = document.createElement("span");
        title.textContent = statusSection.title;

        const heading = document.createElement("h3");
        heading.append(title, countBadge);

        const listContainer = document.createElement("div");
        listContainer.className = "plate-list-container";

        const count = renderChecklistGroups(
            listContainer,
            statusSection.groups,
            statusSection.emptyMessage
        );
        countBadge.textContent = count;

        column.append(heading, listContainer);
        return column;
    }

    function renderChecklistGroups(container, groups, emptyMessage) {
        container.replaceChildren();

        const total = groups.reduce((count, group) => {
            const header = document.createElement("h4");
            header.className = "category-header";
            header.textContent = group.category.title;

            const list = document.createElement("ul");
            list.className = "plate-list";
            group.plates.forEach((plate) => {
                const item = document.createElement("li");
                item.textContent = plate.title;
                list.append(item);
            });

            container.append(header, list);
            return count + group.plates.length;
        }, 0);

        if (total === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-message";
            empty.textContent = emptyMessage;
            container.append(empty);
        }

        return total;
    }
})();
