(function (root) {
    function renderCatalog(rootEl, categories) {
        rootEl.replaceChildren(
            ...categories.map((category) => renderCategory(category))
        );
    }

    function renderCategory(category) {
        const section = document.createElement("section");
        section.className = "category-section";

        const heading = document.createElement("h2");
        heading.append(renderSticker(category.sticker), ` ${category.title}`);

        const grid = document.createElement("div");
        grid.className = "plate-grid";
        grid.replaceChildren(
            ...category.variants.map((variant) => renderPlateCard(variant))
        );

        section.append(heading, grid);
        return section;
    }

    function renderSticker(stickerDisplay) {
        const sticker = document.createElement("span");
        sticker.className = [
            "cat-sticker",
            `cat-sticker--${stickerDisplay.style}`,
        ].join(" ");

        const mark = document.createElement("span");
        mark.className = "cat-sticker__mark";
        mark.textContent = stickerDisplay.mark;

        const foot = document.createElement("span");
        foot.className = "cat-sticker__foot";
        foot.textContent = stickerDisplay.foot;

        sticker.append(mark, foot);
        return sticker;
    }

    function renderPlateCard(variant) {
        const card = document.createElement("div");
        card.className = "plate-card";

        card.dataset.photoStatus = variant.photoStatus;

        const title = document.createElement("h3");
        title.textContent = variant.title;
        title.title = variant.title;
        card.append(title);

        if (variant.missingPlaceholder) {
            card.append(renderMissingPlaceholder(variant.missingPlaceholder));
        } else {
            card.append(renderPlateImage(variant.image));
        }

        if (variant.badge) {
            card.append(renderPhotoStatusBadge(variant.badge));
        }

        return card;
    }

    function renderPlateImage(image) {
        const img = document.createElement("img");
        img.src = image.thumbnailSrc;
        img.alt = image.altText;
        img.className = "plate-image";
        img.loading = "lazy";
        img.decoding = "async";
        img.setAttribute("role", "button");
        img.setAttribute("tabindex", "0");
        img.dataset.fullSrc = image.fullSizeSrc;
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

    function renderMissingPlaceholder(placeholderDetails) {
        const placeholder = document.createElement("div");
        placeholder.className = "plate-empty";
        placeholder.setAttribute("role", "img");
        placeholder.setAttribute("aria-label", placeholderDetails.ariaLabel);

        const strip = document.createElement("div");
        strip.className = "plate-empty__strip";
        strip.append(
            textSpan("Plate Index"),
            textSpan(placeholderDetails.stripDetail)
        );

        const body = document.createElement("div");
        body.className = "plate-empty__body";
        body.append(
            renderPlaceholderRow(
                "Plate",
                placeholderDetails.plateTitle,
                "plate-empty__name"
            ),
            renderPlaceholderRow(
                "Category",
                placeholderDetails.categoryTitle,
                "plate-empty__category"
            ),
            renderPlaceholderRow("Status", placeholderDetails.statusText)
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

    function renderChecklist(rootEl, checklistSections) {
        rootEl.replaceChildren(
            ...checklistSections.map((statusSection) =>
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

        renderChecklistGroups(listContainer, statusSection);
        countBadge.textContent = statusSection.count;

        column.append(heading, listContainer);
        return column;
    }

    function renderChecklistGroups(container, statusSection) {
        container.replaceChildren();

        statusSection.groups.forEach((group) => {
            const header = document.createElement("h4");
            header.className = "category-header";
            header.textContent = group.category.title;

            const list = document.createElement("ul");
            list.className = "plate-list";
            group.variants.forEach((variant) => {
                const item = document.createElement("li");
                item.textContent = variant.title;
                list.append(item);
            });

            container.append(header, list);
        });

        if (statusSection.count === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-message";
            empty.textContent = statusSection.emptyMessage;
            container.append(empty);
        }
    }

    root.PlateCatalogRenderer = Object.freeze({
        renderCatalog,
        renderChecklist,
    });
})(typeof window !== "undefined" ? window : globalThis);
