(function (root) {
    const SELECTED_ASSET_IMAGE_CLASS = "plate-image";
    const SELECTED_ASSET_PREVIEW_CLASS = "plate-card__preview";
    const SELECTED_ASSET_FULL_SIZE_DATA = "fullSrc";
    const selectedAssetPreviewContexts = new WeakMap();

    function renderCatalog(rootEl, categories) {
        rootEl.replaceChildren(
            ...categories.map((category) => renderCategory(category))
        );
    }

    function renderCategory(category) {
        const section = document.createElement("section");
        section.className = "category-section";

        const heading = document.createElement("h2");
        heading.className = "category-heading";
        heading.id = category.fragmentId;
        heading.tabIndex = -1;
        const title = document.createElement("span");
        title.className = "category-title";
        title.textContent = category.title;
        heading.append(renderSticker(category.sticker), title);

        const grid = document.createElement("div");
        grid.className = "plate-grid";
        grid.replaceChildren(
            ...category.variants.map((variant) =>
                renderPlateCard(variant, category)
            )
        );

        section.append(heading, grid);
        return section;
    }

    function renderCategoryNavigation(rootEl, categories) {
        if (!rootEl) return;

        const register = document.createElement("details");
        register.className = "category-register";

        const summary = document.createElement("summary");
        summary.className = "category-register__summary";
        summary.textContent = "Categories";

        const navigation = document.createElement("nav");
        navigation.className = "category-register__navigation";
        navigation.setAttribute("aria-label", "Plate Categories");

        const list = document.createElement("ol");
        list.className = "category-register__list";
        list.replaceChildren(
            ...categories.map((category) => renderCategoryLink(category))
        );

        navigation.append(list);
        register.append(summary, navigation);
        rootEl.replaceChildren(register);

        function focusDestination(fragment) {
            if (!fragment || fragment.charAt(0) !== "#") return;

            const destination = document.getElementById(fragment.slice(1));
            if (!destination?.classList.contains("category-heading")) return;

            window.requestAnimationFrame(() =>
                destination.focus({ preventScroll: true })
            );
        }

        function closeAfterSelection(event) {
            const link = event.target.closest?.(".category-register__link");
            if (!link || !list.contains(link)) return;

            register.open = false;
            focusDestination(link.getAttribute("href"));
        }

        function closeOnEscape(event) {
            if (event.key !== "Escape" || !register.open) return;

            register.open = false;
            summary.focus();
        }

        function focusCurrentDestination() {
            focusDestination(window.location.hash);
        }

        list.addEventListener("click", closeAfterSelection);
        document.addEventListener("keydown", closeOnEscape);
        window.addEventListener("hashchange", focusCurrentDestination);
        focusCurrentDestination();
    }

    function renderCategoryLink(category) {
        const item = document.createElement("li");

        const link = document.createElement("a");
        link.className = "category-register__link";
        link.setAttribute("href", `#${category.fragmentId}`);

        const sticker = renderSticker(category.sticker);
        sticker.setAttribute("aria-hidden", "true");

        const title = document.createElement("span");
        title.className = "category-register__title";
        title.textContent = category.title;

        link.append(sticker, title);
        item.append(link);
        return item;
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

    function renderPlateCard(variant, category) {
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
            const selectedAsset = document.createElement("div");
            selectedAsset.className = "plate-card__selected-asset";
            selectedAsset.append(renderPlateImage(variant.image));
            if (variant.badge) {
                selectedAsset.append(renderPhotoStatusBadge(variant.badge));
            }

            card.classList.add("plate-card--interactive");
            card.append(
                selectedAsset,
                renderSelectedAssetPreviewControl(variant.title, category)
            );
        }

        return card;
    }

    function renderSelectedAssetPreviewControl(variantTitle, category) {
        const previewControl = document.createElement("button");
        previewControl.type = "button";
        previewControl.className = SELECTED_ASSET_PREVIEW_CLASS;
        previewControl.setAttribute("aria-label", `Preview ${variantTitle}`);
        previewControl.title = variantTitle;
        selectedAssetPreviewContexts.set(previewControl, {
            variantTitle,
            category: {
                title: category.title,
                stickerStyle: category.sticker.style,
            },
        });
        return previewControl;
    }

    function renderPlateImage(image) {
        const img = document.createElement("img");
        img.src = image.thumbnailSrc;
        img.alt = image.altText;
        img.className = SELECTED_ASSET_IMAGE_CLASS;
        img.loading = "lazy";
        img.decoding = "async";
        img.dataset[SELECTED_ASSET_FULL_SIZE_DATA] = image.fullSizeSrc;
        return img;
    }

    function bindSelectedAssetPreview(rootEl, requestPreview) {
        if (!rootEl) return () => {};

        if (typeof requestPreview !== "function") {
            throw new Error("Selected Asset preview callback is required");
        }

        function previewControlFromEvent(event) {
            const card = event.target.closest?.(".plate-card--interactive");
            if (!card || !rootEl.contains(card)) return null;
            return card.querySelector(`.${SELECTED_ASSET_PREVIEW_CLASS}`);
        }

        function previewRequestFor(previewControl) {
            const selectedAsset = previewControl.parentElement?.querySelector(
                `.${SELECTED_ASSET_IMAGE_CLASS}`
            );
            const context = selectedAssetPreviewContexts.get(previewControl);
            if (!selectedAsset || !context) return null;

            return {
                thumbnailSrc: selectedAsset.src,
                fullSizeSrc:
                    selectedAsset.dataset[SELECTED_ASSET_FULL_SIZE_DATA],
                altText: selectedAsset.alt,
                ...context,
            };
        }

        function openSelectedAsset(event) {
            const previewControl = previewControlFromEvent(event);
            if (!previewControl) return;

            const previewRequest = previewRequestFor(previewControl);
            if (!previewRequest) return;

            previewControl.focus();
            requestPreview(previewRequest);
        }

        rootEl.addEventListener("click", openSelectedAsset);

        return () => {
            rootEl.removeEventListener("click", openSelectedAsset);
        };
    }

    function renderSelectedAssetPreview(rootEl, previewRequest) {
        const selectedAsset = rootEl.querySelector(".image-preview__asset");
        const variantTitle = rootEl.querySelector(".image-preview__title");
        const category = rootEl.querySelector(".image-preview__category");

        selectedAsset.src = previewRequest.thumbnailSrc;
        selectedAsset.alt = previewRequest.altText;
        variantTitle.textContent = previewRequest.variantTitle;
        category.textContent = previewRequest.category.title;
        category.className = [
            "image-preview__category",
            "cat-sticker",
            `cat-sticker--${previewRequest.category.stickerStyle}`,
        ].join(" ");

        return selectedAsset;
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
        renderCategoryNavigation,
        renderChecklist,
        bindSelectedAssetPreview,
        renderSelectedAssetPreview,
    });
})(typeof window !== "undefined" ? window : globalThis);
