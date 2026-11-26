    let popupLoadingPromise = null;

    function initPopupLoading() {
        if (!popupLoadingPromise) {
            popupLoadingPromise = (async () => {
                const response = await fetch("pages/popup/popup-loading.html");
                const html = await response.text();
                document.body.insertAdjacentHTML("beforeend", html);
            })();
        }
        return popupLoadingPromise;
    }

    async function showLoading(text = "Memproses Data...") {
        await initPopupLoading();
        getEl("popup-loading-text").textContent = text;
        getEl("popup-loading").classList.add("show");
    }

    async function hideLoading() {
        await initPopupLoading();
        getEl("popup-loading").classList.remove("show");
    }

    window.initPopupLoading =
        initPopupLoading;

    window.showLoading =
        showLoading;

    window.hideLoading =
        hideLoading;