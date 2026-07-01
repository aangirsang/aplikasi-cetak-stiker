let popupHapusCallback = null;

async function initPopupHapus() {
    if (getEl("popup-konfirmasi-hapus")) return;

    const response = await fetch("pages/popup/popup-konfirmasi-hapus.html");
    const html = await response.text();

    document.body.insertAdjacentHTML("beforeend", html);

    getEl("popup-hapus-batal").addEventListener("click", closePopupHapus);

    getEl("popup-hapus-konfirmasi").addEventListener("click", async () => {
        try {
            if (popupHapusCallback) {
                await popupHapusCallback();
            }
        } finally {
            closePopupHapus();
        }
    });
}

function showPopupHapus({ title = "Konfirmasi", message = "Yakin ingin menghapus data?", onConfirm = null }) {
    popupHapusCallback = onConfirm;

    getEl("popup-hapus-title").textContent = title;
    getEl("popup-hapus-message").textContent = message;

    getEl("popup-konfirmasi-hapus").classList.add("show");
}

function closePopupHapus() {
    popupHapusCallback = null;
    getEl("popup-konfirmasi-hapus").classList.remove("show");
}