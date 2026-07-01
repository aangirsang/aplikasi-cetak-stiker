let popupLoadingInitialized = false;

async function initPopupLoading(){

    if(popupLoadingInitialized){
        return;
    }

    const response =
        await fetch(
            "pages/popup/popup-loading.html"
        );

    const html =
        await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

    popupLoadingInitialized = true;
}

function showLoading(
    text = "Memproses Data..."
){
    getEl(
        "popup-loading-text"
    ).textContent = text;

    getEl(
        "popup-loading"
    ).classList.add("show");
}

function hideLoading(){

    getEl(
        "popup-loading"
    ).classList.remove("show");
}

window.initPopupLoading =
    initPopupLoading;

window.showLoading =
    showLoading;

window.hideLoading =
    hideLoading;