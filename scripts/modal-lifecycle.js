(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.PlateModalLifecycle = api;
    }
})(typeof window !== "undefined" ? window : globalThis, function () {
    function createModalLifecycle({ document }) {
        const activeDialogs = [];

        function removeActiveDialog(dialog) {
            const activeIndex = activeDialogs.indexOf(dialog);
            if (activeIndex !== -1) activeDialogs.splice(activeIndex, 1);
        }

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;

            const activeDialog = activeDialogs[activeDialogs.length - 1];
            activeDialog?.close();
        });

        function register({ modal, closeButton }) {
            let restoreFocusTo = null;
            let dialog = null;

            function isOpen() {
                return modal.style.display === "flex";
            }

            function open() {
                restoreFocusTo = document.activeElement;
                modal.style.display = "flex";
                removeActiveDialog(dialog);
                activeDialogs.push(dialog);
                closeButton?.focus?.();
            }

            function close() {
                if (!isOpen()) return;

                modal.style.display = "none";
                removeActiveDialog(dialog);
                restoreFocusTo?.focus?.();
            }

            closeButton?.addEventListener?.("click", close);
            modal.addEventListener?.("click", (event) => {
                if (event.target === modal) close();
            });

            dialog = Object.freeze({
                open,
                close,
                isOpen,
            });

            return dialog;
        }

        return Object.freeze({
            register,
        });
    }

    return Object.freeze({
        createModalLifecycle,
    });
});
