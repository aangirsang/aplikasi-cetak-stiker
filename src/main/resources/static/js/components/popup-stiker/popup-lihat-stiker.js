
let selectedPopupLihatStiker = null;

async function initPopupLihatStiker() {

    // cek agar tidak dimuat dua kali
    if(document.getElementById("popup-lihat-stiker")){
        return;
    }

    const response = await fetch(
        "pages/popup/stiker/popup-lihat-stiker.html"
    );

    const html = await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

    setDefaultGambarStiker(1);
    setDefaultGambarStiker(2);

    document.addEventListener("click", e => {
        if(e.target.id === "tutup-popup-lihat-stiker"){
            tutupPopupLihatStiker();
        }
    });
}

function showPopupLihatStiker(selectedStiker) {

    selectedPopupLihatStiker = selectedStiker;

    getEl("lihat-stiker-kode").textContent = selectedStiker.kodeStiker;
    getEl("lihat-stiker-nama").textContent = selectedStiker.namaStiker;
    getEl("lihat-stiker-ukuran").textContent = `${selectedStiker.panjang} x ${selectedStiker.lebar} cm`;
    getEl("lihat-stiker-status").textContent = `${selectedStiker.status ? "Aktif" : "Non-Aktif"}`;
    getEl("lihat-stiker-catatan").textContent = selectedStiker.catatan;

    setPreviewGambarPopupLihatStiker(1, selectedStiker.pathGambar1);
    setPreviewGambarPopupLihatStiker(2, selectedStiker.pathGambar2);

    document
        .getElementById("popup-lihat-stiker")
        .classList.add("show");
}
function tutupPopupLihatStiker() {

    document
        .getElementById("popup-lihat-stiker")
        .classList.remove("show");
}

function setPreviewGambarPopupLihatStiker(index, path) {
    const img = document.getElementById(`preview-gambar-${index}`);

    if (path) {
        img.src = `${BASE_URL}${path}`;
        img.dataset.path = path;
    } else {
        img.src = noImageStiker;
        img.dataset.path = "";
    }
}

//GAMBAR
function setDefaultGambarStiker(index){

    const img = getEl(`preview-gambar-${index}`);

    if(img.src.startsWith("blob:")){
        URL.revokeObjectURL(img.src);
    }

    img.src = noImageStiker;
}

window.showPopupLihatStiker = showPopupLihatStiker;
window.tutupPopupLihatStiker = tutupPopupLihatStiker;
window.initPopupLihatStiker = initPopupLihatStiker;