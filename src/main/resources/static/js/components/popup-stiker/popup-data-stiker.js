let selectedPopupDataStiker = null;

let selectedUmkm = null;
let selectedBarang = null;

let isEditModeStiker = false;
let onSaveSuccessStiker = null;

let selectedWebpFiles = {
    1: null,
    2: null
};

let pathGambarLama = {
    1: "",
    2: ""
};

let gambarBerubah = {
    1: false,
    2: false
};

let selectedTif = null;
let selectedTifConvert = null;
let pathFile = ""

let statusLayout = false;

async function initPopupDataStiker() {
    // cek agar tidak dimuat dua kali
    if(getEl("popup-data-stiker")){
        return;
    }

    const response = await fetch(
        "pages/popup/stiker/popup-data-stiker.html"
    );

    const html = await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    setDefaultGambarStiker(1);
    setDefaultGambarStiker(2);

    await initPopupLoading();
    await initPopupLihatGambar();
    await initPilihBarang();
    await initPopupHapus();
    await initPopupLayoutCetak();


    getEl("btn-popup-data-stiker-batal").addEventListener(
        "click", tutupPopupStiker);

    getEl("btn-popup-data-stiker-simpan").addEventListener(
        "click", () => simpanDataStiker());

    // GAMBAR
    getEl("popup-data-stiker-file-input-1")
        .addEventListener("change", (event) => handlePreviewGambar(event, 1));
    getEl("popup-data-stiker-file-input-2")
        .addEventListener("change", (event) => handlePreviewGambar(event, 2));

    getEl("preview-gambar-1")
        .addEventListener("click", () =>lihatGambarStiker(1));
    getEl("preview-gambar-2")
        .addEventListener("click", () =>lihatGambarStiker(2));

    getEl("preview-layout-gambar")
        .addEventListener(
            "click",
            lihatPreviewLayoutTif
        );

    // BARANG
    getEl("popup-data-stiker-barang")
        .addEventListener("click", () => tampilPopupPilihBarang())

    // LAYOUT CETAK
    getEl("btn-popup-data-stiker-layout-cetak")
        .addEventListener("click", () => tampilPopupLayout());


    initDragDrop(1);
    initDragDrop(2);

}

//POPUP
async function showPopupStiker(id = null, onSaveSuccess = null) {
    onSaveSuccessStiker = onSaveSuccess;

    const popup = getEl("popup-data-stiker");
    const popupTitle = getEl("popup-data-stiker-title");

    bersihPopupDataStiker();

    if(id === null){
        await showPopupPilihUmkm(false, async (umkm) => {
                selectedUmkm = umkm;

                await loadKodeStiker(umkm.id);

                popupTitle.textContent = `Tambah Data Stiker: ${selectedUmkm.namaPemilik} - ${selectedUmkm.namaUsaha}`;
                popup.classList.add("show");

            }, selectedUmkm
        );

        isEditModeStiker = false;
        return;
    } else {

        isEditModeStiker = true;

        const response = await fetch(`${BASE_URL_STIKER}/${id}`)

        if(!response.ok) return showToast("Gagal Memuat Data Stiker!!", "error")

        selectedPopupDataStiker = await response.json();

        //isiDataUmkm(selectedCariUmkm);

        isiDataStiker(selectedPopupDataStiker);

        popupTitle.textContent = `Edit Data Stiker: ${selectedUmkm.namaPemilik} - ${selectedUmkm.namaUsaha}`;
    }


    popup.classList.add("show");
}
function isiDataStiker(stiker) {
    showLoading("Memuat Data Stiker...");

    selectedBarang = {
        id: stiker.barangId,
        namaBarang: stiker.namaBarang,
        stokBarang: stiker.stokBarang
    };

    selectedUmkm = {
        id: stiker.umkmId,
        namaUsaha: stiker.namaUsaha,
        namaPemilik: stiker.namaPemilik,
        noTelpon: stiker.noTelpon,
        alamat: stiker.alamat};

    pathGambarLama[1] = stiker.pathGambar1 ?? "";
    pathGambarLama[2] = stiker.pathGambar2 ?? "";

    getEl("popup-data-stiker-kode").value = stiker.kodeStiker;
    getEl("popup-data-stiker-nama").value = stiker.namaStiker;
    getEl("popup-data-stiker-panjang").value = stiker.panjang;
    getEl("popup-data-stiker-lebar").value = stiker.lebar;
    getEl("popup-data-stiker-catatan").value = stiker.catatan;
    getEl("popup-data-stiker-barang").value = selectedBarang.namaBarang;

    setKodeStiker(stiker.kodeStiker);

    const statusRadio =
        document.querySelector(
            `input[name="popup-data-stiker-status"][value="${stiker.status}"]`
        );

    if(statusRadio){
        statusRadio.checked = true;
    }

    // set image
    const previewImage1 =
        getEl("preview-gambar-1");

    previewImage1.onload = () => {
        hideLoading();
    };

    previewImage1.onerror = () => {
        hideLoading();
        previewImage1.src = noImageStiker;
    };

    previewImage1.src =
        stiker.pathGambar1
            ? `${BASE_URL}${stiker.pathGambar1}`
            : noImageStiker;

    // set image
    const previewImage2 =
        getEl("preview-gambar-2");

    previewImage2.onload = () => {
        hideLoading();
    };

    previewImage2.onerror = () => {
        hideLoading();
        previewImage2.src = noImageStiker;
    };

    previewImage2.src =
        stiker.pathGambar2
            ? `${BASE_URL}${stiker.pathGambar2}`
            : noImageStiker;

    tampilkanPreviewLayoutCetak(stiker);
}
function tutupPopupStiker() {
    getEl("popup-data-stiker").classList.remove("show");
}
function toggleMenuImageStiker(button){
    const current = button.nextElementSibling;

    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        if(menu !== current){
            menu.classList.remove("show");
        }
    });

    current.classList.toggle("show");
}
function tutupMenuImageStiker() {
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        menu.classList.remove("show");
    });
}
document.addEventListener("click", e => {
    if(!e.target.closest(".desain-item")){
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            menu.classList.remove("show");
        });
    }
});
async function loadKodeStiker(umkmId) {

    try {
        const response = await fetch(
            `${BASE_URL_STIKER}/kode/${umkmId}`
        );

        if (!response.ok) {
            showToast("Gagal mengambil kode stiker");
            return;
        }

        const data = await response.json();

        getEl("popup-data-stiker-kode").value =
            data.kodeStiker;

        setKodeStiker(data.kodeStiker);

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
    }
}
async function tampilPopupPilihBarang(){
    await showPopupPilihBarang(async (barang) =>{
        selectedBarang = barang;

        getEl("popup-data-stiker-barang").value = barang.namaBarang;
    });
}

async function tampilPopupLayout(){

    if(!selectedPopupDataStiker){
        //if (!validasiSimpanDataStiker()) return;
        selectedPopupDataStiker = await stikerToBody();
    }

    await showPopupLayoutCetak(selectedPopupDataStiker,(stiker) => {

        selectedPopupDataStiker = stiker
        selectedTif = selectedPopupDataStiker.selectedTif;
        selectedTifConvert = selectedPopupDataStiker.selectedTifConvert;

        statusLayout = true;

        isiDataStiker(selectedPopupDataStiker);

        console.log("Data Stiker Setelah Layout:", selectedPopupDataStiker);
    });

}

// FORM
function bersihPopupDataStiker() {
    selectedPopupDataStiker = null;
    selectedUmkm = null;
    selectedBarang = null
    isEditModeStiker = false;

    statusLayout = false;

    selectedWebpFiles = {
        1: null,
        2: null
    };

    pathGambarLama = {
        1: "",
        2: ""
    };

    gambarBerubah = {
        1: false,
        2: false
    };

    setDefaultGambarStiker(1);
    setDefaultGambarStiker(2);

    [
        "popup-data-stiker-kode",
        "popup-data-stiker-nama",
        "popup-data-stiker-panjang",
        "popup-data-stiker-lebar",
        "popup-data-stiker-catatan",
        "popup-data-stiker-file-input-1",
        "popup-data-stiker-file-input-2",
        "popup-data-stiker-barang"
    ].forEach(id => getEl(id).value = "");

    document.querySelectorAll('input[name="popup-data-stiker-status"]')
        .forEach(input => {
            input.checked = false;
        });
    setKodeStiker("")

    getEl("preview-layout-gambar").src = noImageStiker;
}
function setKodeStiker(kode){
    const inputKode = document.getElementById("popup-data-stiker-kode");
    const counter = document.getElementById("popup-data-stiker-kode-counter");

    inputKode.value = kode;
    counter.textContent = `${kode.length}/20`;
}

function tampilkanPreviewLayoutCetak(data) {

    const container =
        document.getElementById(
            "preview-layout-container"
        );

    if (!container) {
        console.error(
            "Element preview-layout-container tidak ditemukan!"
        );

        return;
    }


    const paper =
        container.querySelector(
            ".preview-paper"
        );

    const gambar =
        document.getElementById(
            "preview-layout-gambar"
        );

    const garis =
        document.getElementById(
            "preview-garis-bawah"
        );


    if (!paper || !gambar) {

        console.error(
            "Element preview layout tidak ditemukan!"
        );

        return;
    }


    // =====================================================
    // DATA KERTAS
    // =====================================================

    const paperWidth =
        Number(data.lebarKertas);

    const paperHeight =
        Number(data.tinggiKertas);


    // =====================================================
    // VALIDASI DATA KERTAS
    // =====================================================

    if (
        !Number.isFinite(paperWidth) ||
        !Number.isFinite(paperHeight) ||
        paperWidth <= 0 ||
        paperHeight <= 0
    ) {
        return;
    }


    // =====================================================
    // DATA GAMBAR ASLI
    // =====================================================

    const imageWidth =
        Number(data.imageWidthMM);

    const imageHeight =
        Number(data.imageHeightMM);


    // =====================================================
    // OFFSET GAMBAR
    // =====================================================

    const offsetX =
        Number(data.offsetX) || 0;

    const offsetY =
        Number(data.offsetY) || 0;


    // =====================================================
    // ASPECT RATIO KERTAS
    // =====================================================

    paper.style.aspectRatio =
        `${paperWidth} / ${paperHeight}`;


    // =====================================================
    // RESET STYLE GAMBAR
    // =====================================================

    gambar.style.position = "absolute";
    gambar.style.maxWidth = "none";
    gambar.style.maxHeight = "none";
    gambar.style.display = "block";


    // =====================================================
    // FUNGSI MENDAPATKAN UKURAN PIXEL KERTAS
    // =====================================================

    function getPaperPixelSize() {

        let width =
            paper.clientWidth;

        let height =
            paper.clientHeight;


        // -------------------------------------------------
        // Jika tinggi belum tersedia
        // hitung berdasarkan aspect ratio
        // -------------------------------------------------

        if (
            width > 0 &&
            height <= 0
        ) {

            height =
                width *
                paperHeight /
                paperWidth;
        }


        // -------------------------------------------------
        // Jika width belum tersedia
        // hitung berdasarkan aspect ratio
        // -------------------------------------------------

        if (
            height > 0 &&
            width <= 0
        ) {

            width =
                height *
                paperWidth /
                paperHeight;
        }


        return {
            width,
            height
        };
    }


    // =====================================================
    // APPLY POSISI GAMBAR ASLI
    // =====================================================

    function applyImagePosition() {

        const paperSize =
            getPaperPixelSize();

        const paperPixelWidth =
            paperSize.width;

        const paperPixelHeight =
            paperSize.height;


        if (
            paperPixelWidth <= 0 ||
            paperPixelHeight <= 0
        ) {

            console.warn(
                "Ukuran paper belum tersedia:",
                paperSize
            );

            return;
        }


        // =================================================
        // SCALE MM → PX
        // =================================================

        const scaleX =
            paperPixelWidth /
            paperWidth;

        const scaleY =
            paperPixelHeight /
            paperHeight;


        // =================================================
        // POSISI
        // =================================================

        const imageX =
            offsetX * scaleX;

        const imageY =
            offsetY * scaleY;


        // =================================================
        // UKURAN
        // =================================================

        const imagePixelWidth =
            imageWidth * scaleX;

        const imagePixelHeight =
            imageHeight * scaleY;


        // =================================================
        // APPLY
        // =================================================

        gambar.style.width =
            `${imagePixelWidth}px`;

        gambar.style.height =
            `${imagePixelHeight}px`;

        gambar.style.left =
            `${imageX}px`;

        gambar.style.top =
            `${imageY}px`;

    }


    // =====================================================
    // APPLY POSISI FALLBACK
    // =====================================================

    function applyFallbackPosition() {

        const paperSize =
            getPaperPixelSize();

        const paperPixelWidth =
            paperSize.width;

        const paperPixelHeight =
            paperSize.height;


        if (
            paperPixelWidth <= 0 ||
            paperPixelHeight <= 0
        ) {

            console.warn(
                "Paper belum memiliki ukuran pixel."
            );

            return;
        }


        // =================================================
        // UKURAN MAKSIMUM FALLBACK
        // =================================================

        const maxWidth =
            paperPixelWidth * 0.5;

        const maxHeight =
            paperPixelHeight * 0.5;


        // =================================================
        // UKURAN NATURAL SVG
        // =================================================

        const naturalWidth =
            gambar.naturalWidth;

        const naturalHeight =
            gambar.naturalHeight;


        if (
            naturalWidth <= 0 ||
            naturalHeight <= 0
        ) {

            console.warn(
                "Ukuran natural fallback tidak valid:",
                naturalWidth,
                naturalHeight
            );

            return;
        }


        // =================================================
        // SCALE PROPORSIONAL
        // =================================================

        const scale =
            Math.min(
                maxWidth / naturalWidth,
                maxHeight / naturalHeight
            );


        const width =
            naturalWidth * scale;

        const height =
            naturalHeight * scale;


        // =================================================
        // POSISI TENGAH
        // =================================================

        const left =
            (paperPixelWidth - width) / 2;

        const top =
            (paperPixelHeight - height) / 2;


        // =================================================
        // APPLY
        // =================================================

        gambar.style.width =
            `${width}px`;

        gambar.style.height =
            `${height}px`;

        gambar.style.left =
            `${left}px`;

        gambar.style.top =
            `${top}px`;

    }


    // =====================================================
    // SOURCE GAMBAR
    // =====================================================

    const pathTIF =
        typeof data.pathTIF === "string"
            ? data.pathTIF.trim()
            : "";


    const urlGambar =
        pathTIF
            ? `${BASE_URL}${pathTIF}.webp`
            : null;


    // =====================================================
    // FLAG FALLBACK
    // =====================================================

    let menggunakanNoImage =
        false;


    // =====================================================
    // ON LOAD
    // =====================================================

    gambar.onload = function () {

        // =================================================
        // FALLBACK
        // =================================================

        if (menggunakanNoImage) {

            applyFallbackPosition();

            return;
        }


        // =================================================
        // GAMBAR ASLI
        // =================================================

        // Jika data ukuran gambar tidak valid,
        // jangan gunakan ukuran 0 x 0.

        if (
            !Number.isFinite(imageWidth) ||
            !Number.isFinite(imageHeight) ||
            imageWidth <= 0 ||
            imageHeight <= 0
        ) {

            console.warn(
                "Ukuran gambar asli tidak valid:",
                imageWidth,
                imageHeight
            );


            // Gunakan ukuran natural gambar
            // dengan batas maksimal 80% paper.

            const paperSize =
                getPaperPixelSize();

            const maxWidth =
                paperSize.width * 0.8;

            const maxHeight =
                paperSize.height * 0.8;


            const naturalWidth =
                gambar.naturalWidth;

            const naturalHeight =
                gambar.naturalHeight;


            if (
                naturalWidth > 0 &&
                naturalHeight > 0
            ) {

                const scale =
                    Math.min(
                        maxWidth / naturalWidth,
                        maxHeight / naturalHeight
                    );


                const width =
                    naturalWidth * scale;

                const height =
                    naturalHeight * scale;


                const left =
                    (paperSize.width - width) / 2;

                const top =
                    (paperSize.height - height) / 2;


                gambar.style.width =
                    `${width}px`;

                gambar.style.height =
                    `${height}px`;

                gambar.style.left =
                    `${left}px`;

                gambar.style.top =
                    `${top}px`;
            }


            return;
        }


        applyImagePosition();
    };


    // =====================================================
    // ON ERROR
    // =====================================================

    gambar.onerror = function () {

        console.warn(
            "Gambar gagal dimuat:",
            gambar.src
        );


        // -------------------------------------------------
        // Jika fallback juga gagal
        // -------------------------------------------------

        if (menggunakanNoImage) {

            console.error(
                "noImageStiker juga gagal dimuat:",
                noImageStiker
            );

            return;
        }


        // -------------------------------------------------
        // Aktifkan fallback
        // -------------------------------------------------

        menggunakanNoImage =
            true;

        gambar.src =
            noImageStiker;
    };


    // =====================================================
    // MULAI LOAD
    // =====================================================
    console.log("Status Layout: ", statusLayout)

    if(statusLayout){
        let objectUrl = null;
        console.log("Status Tiff: ", !data.selectedTifConvert)

        if (data.selectedTifConvert instanceof File) {

            objectUrl =
                URL.createObjectURL(
                    data.selectedTifConvert
                );

            gambar.src = objectUrl;

            console.log("Menggunakan selectedTifConvert")

        } else if(!data.selectedTifConvert){
            menggunakanNoImage = true;

            gambar.src = noImageStiker;

            console.log("selectedTifConvert kosong setelah dihapus")
        }
    } else {
        if (urlGambar) {

            gambar.src = urlGambar;

            console.log("Menggunakan data dari backend")

        } else {

            menggunakanNoImage = true;

            gambar.src = noImageStiker;

            console.log("data backend kosong")

        }
    }

}

function lihatPreviewLayoutTif() {

    const gambar =
        getEl("preview-layout-gambar");

    if (!gambar || !gambar.src) {
        showToast(
            "Gambar TIF belum tersedia",
            "warning"
        );
        return;
    }

    const src = gambar.src;

    if (
        src === noImageStiker ||
        src.endsWith("/undefined") ||
        src.endsWith("/")
    ) {
        showToast(
            "Gambar TIF belum tersedia",
            "warning"
        );
        return;
    }

    const fullscreen =
        getEl("img-fullscreen");

    if (!fullscreen) {
        console.error(
            "img-fullscreen tidak ditemukan"
        );
        return;
    }

    fullscreen.src = src;

    showPopupLihatGambar();
}


// GAMBAR
function setDefaultGambarStiker(index){

    const img = getEl(`preview-gambar-${index}`);

    if(img.src.startsWith("blob:")){
        URL.revokeObjectURL(img.src);
    }

    img.src = noImageStiker;
}
function pilihGambarStiker(index){
    const input = getEl(`popup-data-stiker-file-input-${index}`)
    input.value = "";
    input.click();
    tutupMenuImageStiker();
}
async function handlePreviewGambar(event, index) {

    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        showToast(
            "File harus berupa gambar",
            "warning"
        );

        event.target.value = "";
        return;
    }

    try {

        showLoading("Memuat Gambar...");

        const webpFile =
            await convertToWebp(
                file,
                2048,
                0.8
            );

        selectedWebpFiles[index] = webpFile;
        gambarBerubah[index] = true;

        const previewImage =
            getEl(
                `preview-gambar-${index}`
            );

        previewImage.onload = () => {
            hideLoading();
        };

        previewImage.src =
            URL.createObjectURL(
                webpFile
            );
    } catch(error){

        hideLoading();

        showToast(
            "Gagal memproses gambar",
            "error"
        );

        console.error(error);
    }

}
function hapusGambarStiker(index){
    const img = getEl(`preview-gambar-${index}`);

    img.src = noImageStiker;

    selectedWebpFiles[index] = null;

    if(index === 1){
        pathGambarLama[1] = "";
    }else{
        pathGambarLama[2] = "";
    }

    tutupMenuImageStiker();
}
function lihatGambarStiker(index){
    const img = document.getElementById(
        `preview-gambar-${index}`
    );

    if(!img.src || img.src === noImageStiker) return;

    document.getElementById("img-fullscreen").src = img.src;

    showPopupLihatGambar();
    tutupMenuImageStiker();
}
function isGambarStikerBerubah(){

    return gambarBerubah[1] || gambarBerubah[2];
}
async function uploadGambarStiker(){

    const formData = new FormData();

    if(selectedWebpFiles[1]){
        formData.append(
            "files",
            selectedWebpFiles[1]
        );
    }

    if(selectedWebpFiles[2]){
        formData.append(
            "files",
            selectedWebpFiles[2]
        );
    }

    const response =
        await fetch(
            BASE_URL_UPLOAD_GAMBAR,
            {
                method: "POST",
                body: formData
            }
        );

    if(!response.ok){
        throw new Error(
            "Gagal upload gambar"
        );
    }

    return await response.json();
}
function initDragDrop(index){

    const container =
        document.getElementById(
            `preview-container-${index}`
        );

    container.addEventListener("dragover", e=>{
        e.preventDefault();
        container.classList.add("dragover");
    });

    container.addEventListener("dragenter", e=>{
        e.preventDefault();
        container.classList.add("dragover");
    });

    container.addEventListener("dragleave", e=>{

        if(e.target === container){
            container.classList.remove("dragover");
        }

    });

    container.addEventListener("drop", async e=>{

        e.preventDefault();

        container.classList.remove("dragover");

        const files = e.dataTransfer.files;

        if(files.length === 0) return;

        await handlePreviewGambar({
            target:{
                files:files
            }
        }, index);

        container.classList.add("has-image");
    });

}

// CRUD
function validasiSimpanDataStiker() {
    let valid = true

    if(!getValue("popup-data-stiker-nama")){
        tandaiInvalid(getEl("popup-data-stiker-nama"));
        valid = false;
    }

    [
        "popup-data-stiker-panjang",
        "popup-data-stiker-lebar"
    ].forEach(id => {
        if(getValue(id) <= 0){
            tandaiInvalid(getEl(id));
            valid = false;
        }
    });

    if(!selectedBarang){
        tandaiInvalid(getEl("popup-data-stiker-barang"));
        valid = false;
    }

    if(!document.querySelector('input[name="popup-data-stiker-status"]:checked')){
        tandaiInvalid(getEl("popup-data-stiker-status-grup"));
        valid = false;
    }

    if(!valid){
        showToast("Data stiker belum lengkap!!!", "warning");
    } else {
        return valid;
    }
}
async function stikerToBody() {

    const kodeStiker = getValue("popup-data-stiker-kode")
    const namaStiker = getValue("popup-data-stiker-nama")
    const panjangStiker = getValue("popup-data-stiker-panjang")
    const lebarStiker = getValue("popup-data-stiker-lebar")
    const catatanStiker = getValue("popup-data-stiker-catatan")
    const statusStiker =
        document.querySelector(
            'input[name="popup-data-stiker-status"]:checked'
        )?.value === "true";

    let gambar1 = pathGambarLama[1];
    let gambar2 = pathGambarLama[2];

    if (isGambarStikerBerubah()) {

        const hasil =
            await uploadGambarStiker();

        let index = 0;

        if (selectedWebpFiles[1]) {
            gambar1 = hasil[index++].path;
        }

        if (selectedWebpFiles[2]) {
            gambar2 = hasil[index++].path;
        }
    }

    let pathFileTif;
    if (selectedTif) {

        const hasil =
            await uploadFileTif(kodeStiker);

        pathFileTif =
            hasil.path;

        pathFile = pathFileTif.replace(/\.[^.]+$/, "");

    } else (
        pathFile = selectedPopupDataStiker.pathTIF

    )

    return {
        umkmId: selectedUmkm.id,
        barangId: selectedBarang?.id ?? null,
        kodeStiker,
        namaStiker,
        panjang: panjangStiker,
        lebar: lebarStiker,
        catatan: catatanStiker,
        status: statusStiker,
        pathGambar1: gambar1,
        pathGambar2: gambar2,

        layoutID: selectedPopupDataStiker.layoutID,
        pathTIF: pathFile,
        kertas: selectedPopupDataStiker.kertas,
        lebarKertas: selectedPopupDataStiker.lebarKertas,
        tinggiKertas: selectedPopupDataStiker.tinggiKertas,
        offsetX: selectedPopupDataStiker.offsetX,
        offsetY: selectedPopupDataStiker.offsetY,
        width: selectedPopupDataStiker.width,
        height: selectedPopupDataStiker.height,
        dpiX: selectedPopupDataStiker.dpiX,
        dpiY: selectedPopupDataStiker.dpiY,
        imageWidthMM: selectedPopupDataStiker.imageWidthMM,
        imageHeightMM: selectedPopupDataStiker.imageHeightMM,
    };
}
async function simpanDataStiker() {
    showLoading(
        isEditModeStiker
            ? "Mengubah Data Stiker..."
            : "Menyimpan Data Stiker..."
    );
    if (!validasiSimpanDataStiker()) return hideLoading();

    const body = await stikerToBody();

    console.log("Data yang Disimpan:", body);

    try {
        if(isEditModeStiker) {
            const response = await fetch(`${BASE_URL_STIKER}/${selectedPopupDataStiker.id}`, {
                method: "PUT",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body)
            });

            if(await gagalSimpan(response)) return;
        } else {
            const response = await fetch(BASE_URL_STIKER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });


            if(await gagalSimpan(response)) return;
        }

        if (onSaveSuccessStiker) {
            await onSaveSuccessStiker(
                isEditModeStiker
                    ? selectedPopupDataStiker.id
                    : null
            );
        }

        tutupPopupStiker();
        bersihPopupDataStiker();
        showToast(
            "Data setiker berhasil disimpan",
            "success"
        );
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}

async function uploadFileTif(kodeStiker){


    const formData = new FormData();

    formData.append(
        "file",
        selectedTif,
        `${kodeStiker}.tif`
    );

    formData.append(
        "file",
        selectedTifConvert,
        `${kodeStiker}.webp`
    );

    const response = await fetch(
        BASE_URL_UPLOAD_TIF,
        {
            method:"POST",
            body:formData
        }
    );

    if(!response.ok){

        throw new Error(
            "Gagal upload file TIF"
        );

    }

    const text = await response.json();

    return text[0];

}


window.initPopupDataStiker = initPopupDataStiker;
window.toggleMenuImageStiker = toggleMenuImageStiker;
window.pilihGambarStiker = pilihGambarStiker;
window.hapusGambarStiker = hapusGambarStiker;
window.lihatGambarStiker  = lihatGambarStiker;
window.showPopupStiker = showPopupStiker;
window.selectedPopupDataStiker = selectedPopupDataStiker;