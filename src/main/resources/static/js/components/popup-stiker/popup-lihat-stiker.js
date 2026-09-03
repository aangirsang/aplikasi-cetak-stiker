let selectedStiker = null;

async function initPopupLihatStiker() {
    await initPopupLihatGambar();
    await initPopupDataStiker();

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
        if(e.target.id === "edit-popup-lihat-stiker"){
            editDataStiker(selectedStiker.id);
        }
    });

    getEl("lihat-stiker-preview-gambar-1")
        .addEventListener("click", () => lihatGambarStiker(1));

    getEl("lihat-stiker-preview-gambar-2")
        .addEventListener("click", () => lihatGambarStiker(2));
}

async function showPopupLihatStiker(id) {

    await isiDataStiker(id);

    document
        .getElementById("popup-lihat-stiker")
        .classList.add("show");
}
function tutupPopupLihatStiker() {

    document
        .getElementById("popup-lihat-stiker")
        .classList.remove("show");
}
function bersihDataSttiker(){
    selectedStiker = null;

    getEl("lihat-stiker-kode").textContent = "";
    getEl("lihat-stiker-nama").textContent = "";
    getEl("lihat-stiker-ukuran").textContent = `0 cm`;
    getEl("lihat-stiker-status").textContent = "";
    getEl("lihat-stiker-catatan").textContent = "";

    setPreviewGambarPopupLihatStiker(1, "");
    setPreviewGambarPopupLihatStiker(2, "");
}
async function isiDataStiker(id) {
    const response = await fetch(`${BASE_URL_STIKER}/${id}`,{
        credentials: "include"  // pastikan ini ada
    });

    if (!response.ok) {
        showToast("Gagal mengambil data stiker!!", "error")
        throw new Error("Gagal mengambil data stiker");
    }

    selectedStiker = await response.json();


    getEl("lihat-stiker-kode").textContent = selectedStiker.kodeStiker;
    getEl("lihat-stiker-nama").textContent = selectedStiker.namaStiker;
    getEl("lihat-stiker-ukuran").textContent = `${selectedStiker.panjang} x ${selectedStiker.lebar} cm`;
    getEl("lihat-stiker-status").textContent = `${selectedStiker.status ? "Aktif" : "Non-Aktif"}`;
    getEl("lihat-stiker-catatan").textContent = selectedStiker.catatan;

    setPreviewGambarPopupLihatStiker(1, selectedStiker.pathGambar1);
    setPreviewGambarPopupLihatStiker(2, selectedStiker.pathGambar2);
}
async function editDataStiker(id) {
    await showPopupStiker(id, async (savedId) => {
       bersihDataSttiker();
       await isiDataStiker(savedId);
    });
}

function setPreviewGambarPopupLihatStiker(index, path) {
    const img = document.getElementById(`lihat-stiker-preview-gambar-${index}`);

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

    const img = getEl(`lihat-stiker-preview-gambar-${index}`);

    if(img.src.startsWith("blob:")){
        URL.revokeObjectURL(img.src);
    }

    img.src = noImageStiker;
}
function lihatGambarStiker(index){
    const img = document.getElementById(
        `lihat-stiker-preview-gambar-${index}`
    );

    if(!img.src || img.src === noImageStiker) return;

    document.getElementById("img-fullscreen").src = img.src;

    showPopupLihatGambar();
}

window.showPopupLihatStiker = showPopupLihatStiker;
window.tutupPopupLihatStiker = tutupPopupLihatStiker;
window.initPopupLihatStiker = initPopupLihatStiker;