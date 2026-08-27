let selectedStiker = null;
let layoutCloseCallback = null;
// CANVAS
let canvas = null;
let ctx = null;

// IMAGE
let gambar = new Image();
let metadataFile = null;

let selectedTif = null;
let selectedTifConvert = null;

let pathFile = ""

let dpiX = 300;
let dpiY = 300;

let imageWidthMM = 0;
let imageHeightMM = 0;

// PAPER
const KERTAS = [
    {
        namaKertas: "A4",
        width: 210,
        height: 297
    },
    {
        namaKertas: "F4",
        width: 210,
        height: 330
    },
    {
        namaKertas: "A3",
        width: 297,
        height: 420
    },
    {
        namaKertas: "Custom",
        width: 297,
        height: 420
    }
];

let selectedKertas = null;

let paperWidth = 0;
let paperHeight = 0;

let orientation = "portrait";

let customPaperWidth = 210;
let customPaperHeight = 297;

// IMAGE POSITION
let offsetX = 0;
let offsetY = 0;

// ZOOM
let zoom = 1;

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

// PAPER POSITION
// Posisi kertas pada canvas
let paperX = 0;
let paperY = 0;

// SCALE
// mm -> pixel
let scale = 1;

// VIEW
let viewX = 0;
let viewY = 0;

let panning = false;

let panStartX = 0;
let panStartY = 0;

// CONFIG
const MARGIN = 40;

const DPI = 96;
const MM_PER_PIXEL = 25.4 / DPI;

// INIT
async function initPopupLayoutCetak() {

    await initPopupLoading();

    if (document.getElementById("popup-layout-cetak")) {
        return;
    }

    const response = await fetch(
        "pages/popup/stiker/popup-layout-cetak.html"
    );

    const html = await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    // ----------------------------------------------
    // EVENT
    // ----------------------------------------------

    getEl("btn-layout-simpan")
        .addEventListener(
            "click",
            () => simpanLayout()
        );

    getEl("btn-layout-hapus")
        .addEventListener(
            "click",
            () => hapus()
        );

    // TIF

    const btnLayoutGambar =
        getEl("btn-layout-gambar");

    const inputLayoutTif =
        getEl("input-layout-tif");


    btnLayoutGambar.addEventListener(
        "click",
        () => {
            inputLayoutTif.click();
        }
    );


    inputLayoutTif.addEventListener(
        "change",
        handleUploadTif
    );


    // ----------------------------------------------
    // KERTAS
    // ----------------------------------------------

    initCustomSelectKertas();

    selectedKertas = KERTAS[2];

    getEl("selected-text-ukuran-kertas").textContent =
        selectedKertas.namaKertas;

    getEl("ukuran-kertas-panjang")
        .addEventListener(
            "input",
            onUkuranKertasChange
        );

    getEl("ukuran-kertas-lebar")
        .addEventListener(
            "input",
            onUkuranKertasChange
        );


    // ----------------------------------------------
    // CANVAS
    // ----------------------------------------------

    createCanvas();

    if (!canvas) {
        return;
    }


    // ----------------------------------------------
    // EVENT CANVAS
    // ----------------------------------------------

    canvas.addEventListener(
        "wheel",
        onMouseWheel,
        {
            passive: false
        }
    );

    canvas.addEventListener(
        "mousedown",
        onMouseDown
    );

    canvas.addEventListener(
        "mousemove",
        onMouseMove
    );

    canvas.addEventListener(
        "mouseup",
        onMouseUp
    );

    canvas.addEventListener(
        "mouseleave",
        onMouseUp
    );

    canvas.style.cursor = "grab";


    // ----------------------------------------------
    // KEYBOARD
    // ----------------------------------------------

    const workspace =
        document.querySelector(".layout-workspace");

    if (workspace) {

        workspace.tabIndex = 0;

        workspace.addEventListener(
            "keydown",
            onKeyDown
        );

        workspace.focus();
    }


    // ----------------------------------------------
    // KERTAS DEFAULT
    // ----------------------------------------------

    createPaper();

    resizeCanvas();
}

// CANVAS
// Membuat / mengambil canvas
function createCanvas() {

    canvas = document.getElementById(
        "layoutCanvas"
    );

    if (!canvas) {

        console.error(
            "Canvas layoutCanvas tidak ditemukan"
        );

        return false;
    }

    ctx = canvas.getContext(
        "2d",
        {
            alpha: true
        }
    );

    return true;
}

// PAPER
// Membuat ukuran kertas
// berdasarkan jenis + orientasi
function createPaper() {

    if (!selectedKertas) {
        selectedKertas = KERTAS[2];
    }


    // ==============================================
    // CUSTOM
    // ==============================================

    if (selectedKertas.namaKertas === "Custom") {

        paperWidth = customPaperWidth;
        paperHeight = customPaperHeight;

    }

        // ==============================================
        // KERTAS NORMAL
    // ==============================================

    else {

        paperWidth = selectedKertas.width;
        paperHeight = selectedKertas.height;
    }


    // ==============================================
    // ORIENTATION
    // ==============================================

    if (orientation === "landscape") {

        [
            paperWidth,
            paperHeight
        ] = [
            paperHeight,
            paperWidth
        ];
    }


    // ==============================================
    // UPDATE INPUT
    // ==============================================

    const inputPanjang =
        getEl("ukuran-kertas-panjang");

    const inputLebar =
        getEl("ukuran-kertas-lebar");


    if (inputPanjang) {
        inputPanjang.value =
            selectedKertas.namaKertas === "Custom"
                ? customPaperHeight
                : paperHeight;
    }

    if (inputLebar) {
        inputLebar.value =
            selectedKertas.namaKertas === "Custom"
                ? customPaperWidth
                : paperWidth;
    }
}
function updateInputUkuranKertas() {

    const panjang = getEl("ukuran-kertas-panjang");
    const lebar = getEl("ukuran-kertas-lebar");

    if (!panjang || !lebar) {
        return;
    }

    const isCustom =
        selectedKertas?.namaKertas === "Custom";

    panjang.readOnly = !isCustom;
    lebar.readOnly = !isCustom;
}
function onUkuranKertasChange() {

    if (
        selectedKertas?.namaKertas !== "Custom"
    ) {
        return;
    }


    const panjang =
        parseFloat(
            getEl("ukuran-kertas-panjang").value
        );

    const lebar =
        parseFloat(
            getEl("ukuran-kertas-lebar").value
        );


    if (
        !Number.isFinite(panjang) ||
        !Number.isFinite(lebar) ||
        panjang <= 0 ||
        lebar <= 0
    ) {
        return;
    }


    // Simpan ukuran asli Custom
    customPaperHeight = panjang;
    customPaperWidth = lebar;


    createPaper();

    resetOffset();
    resetView();

    updateStatus();
    drawLayout();
}

// IMAGE METADATA
// Memuat metadata gambar
function loadImageMetadata(stiker) {

    metadataFile = {
        width: stiker.width,
        height: stiker.height,

        dpiX: stiker.dpiX,
        dpiY: stiker.dpiY,

        imageWidthMM: stiker.imageWidthMM,
        imageHeightMM: stiker.imageHeightMM
    };


    dpiX = metadataFile.dpiX;
    dpiY = metadataFile.dpiY;

    imageWidthMM =
        metadataFile.imageWidthMM;

    imageHeightMM =
        metadataFile.imageHeightMM;
}

// IMAGE
// Memuat gambar WEBP
async function loadImage(stiker) {

    const url =
        BASE_URL +
        encodeURI(stiker.pathTIF);


    await new Promise(
        (resolve, reject) => {

            gambar = new Image();

            gambar.onload = resolve;

            gambar.onerror = reject;

            gambar.src = `${url}.webp`;
        }
    );
}

// OFFSET
// Posisi gambar di tengah kertas
function resetOffset() {

    offsetX =
        (paperWidth - imageWidthMM) / 2;

    offsetY =
        (paperHeight - imageHeightMM) / 2;
}

// VIEW
// Reset zoom dan posisi viewport
function resetView() {

    zoom = 1;

    viewX = 0;
    viewY = 0;

    panning = false;
}

// STATE
// Reset data gambar
function clearLayout() {

    gambar = new Image();

    metadataFile = null;

    dpiX = 300;
    dpiY = 300;

    imageWidthMM = 0;
    imageHeightMM = 0;

    offsetX = 0;
    offsetY = 0;

    resetView();
}

// RESET LAYOUT
// Reset tampilan layout
function resetLayout() {

    createCanvas();

    createPaper();

    resetView();

    if (
        imageWidthMM > 0 &&
        imageHeightMM > 0
    ) {
        resetOffset();
    }

    updateStatus();

    drawLayout();
}

// LOAD LAYOUT
// Membuka data stiker
async function loadTiff(stiker) {

    const pathGambar = stiker.pathTIF;


    const portrait = getEl("btnPortrait");
    const landscape =getEl("btnLandscape");

    const dibuat = getEl("dibuat");
    const diubah = getEl("diubah");


    // ==================================================
    // UKURAN KERTAS
    // ==================================================

    if (
        stiker.lebarKertas > 0 &&
        stiker.tinggiKertas > 0
    ) {
        paperWidth = stiker.lebarKertas;
        paperHeight = stiker.tinggiKertas;

        portrait.classList.remove("active");
        landscape.classList.remove("active");

        if (paperWidth <= paperHeight) {
            portrait.classList.add("active");
        } else {
            landscape.classList.add("active");
        }

        dibuat.textContent = `Dibuat: ${formatTanggal(stiker.dibuatPada)}`
        diubah.textContent = `Diubah: ${formatTanggal(stiker.diubahPada)}`


        getEl("selected-text-ukuran-kertas").textContent = stiker.kertas;

        pathFile = stiker.pathTIF;
    } else {

        createPaper();
        dibuat.textContent = `Dibuat: ${formatTanggal(new Date())}`
        diubah.textContent = `Diubah: ${formatTanggal(new Date())}`
    }

    // ==================================================
    // TANPA GAMBAR
    // ==================================================

    if (!pathGambar) {

        gambar = new Image();

        metadataFile = null;

        dpiX = 300;
        dpiY = 300;

        imageWidthMM = 0;
        imageHeightMM = 0;

        offsetX = 0;
        offsetY = 0;


        resetView();

        updateStatus();

        drawLayout();

        return;
    }


    // ==================================================
    // METADATA
    // ==================================================

    loadImageMetadata(stiker);


    // ==================================================
    // LOAD GAMBAR
    // ==================================================

    const url =
        BASE_URL +
        encodeURI(pathGambar);


    try {

        // load gambar
        await new Promise((resolve, reject) => {

            gambar = new Image();

            gambar.onload = resolve;

            gambar.onerror = () => {
                reject(
                    new Error(
                        `Gambar tidak ditemukan: ${gambar.src}`
                    )
                );
            };

            gambar.src = `${url}.webp`;
        });

    } catch (error) {

        console.error(error);

        showToast(
            `Gambar ${stiker.kodeStiker} Tidak Ditemukan!!`,
            "error"
        );

        return;
    }


    // ==================================================
    // OFFSET
    // ==================================================

    if (
        stiker.offsetX !== 0 ||
        stiker.offsetY !== 0
    ) {

        offsetX = stiker.offsetX;
        offsetY = stiker.offsetY;

    } else {

        resetOffset();
    }


    // ==================================================
    // VIEW
    // ==================================================

    resetView();

    updateStatus();

    drawLayout();
}

// POPUP
async function showPopupLayoutCetak(stiker, onClose) {
    layoutCloseCallback = onClose;
    selectedStiker = stiker;
    document
        .getElementById("popup-layout-cetak")
        .classList.add("show");

    console.log("Stiker layout:",
        selectedStiker)
    console.log("layoutCloseCallback:",
        layoutCloseCallback)
    getEl("popup-layout-title")
        .textContent = `${selectedStiker.namaUsaha} - ${selectedStiker.namaStiker}`

    // Reset data lama
    clearLayout();

    await new Promise(
        resolve => requestAnimationFrame(resolve)
    );


    // Pastikan canvas tersedia
    createCanvas();

    resizeCanvas();


    showLoading(
        "Menampilkan gambar..."
    );

    try {

        await loadTiff(
            selectedStiker
        );

    } catch (e) {

        console.error(e);

        alert(e.message);

    } finally {

        hideLoading();
    }
}
function closeLayout() {

    document
        .getElementById("popup-layout-cetak")
        .classList.remove("show");
}

// ORIENTATION
function setOrientation(mode) {

    const portrait =
        document.getElementById(
            "btnPortrait"
        );

    const landscape =
        document.getElementById(
            "btnLandscape"
        );


    portrait.classList.remove("active");
    landscape.classList.remove("active");


    if (mode === "portrait") {

        portrait.classList.add("active");

    } else {

        landscape.classList.add("active");
    }


    orientation = mode;


    // Hanya ubah kertas
    updatePaper();
}

// CUSTOM SELECT KERTAS
function initCustomSelectKertas() {

    const optionsContainer =
        getEl("options-ukuran-kertas");

    const customSelect =
        getEl("custom-select-ukuran-kertas");

    const selectedText =
        getEl("selected-text-ukuran-kertas");

    const selectedBox =
        customSelect.querySelector(
            ".select-box"
        );


    try {

        optionsContainer.innerHTML =
            KERTAS.map(
                kertas => `
                    <div
                        class="option"
                        data-id="${kertas.namaKertas}"
                    >
                        ${kertas.namaKertas}
                    </div>
                `
            ).join("");


        document
            .querySelectorAll(
                "#options-ukuran-kertas .option"
            )
            .forEach(option => {

                option.addEventListener(
                    "click",
                    function () {

                        const namaKertas =
                            this.dataset.id;


                        selectedKertas =
                            KERTAS.find(
                                kertas =>
                                    kertas.namaKertas ===
                                    namaKertas
                            );

                        selectedText.textContent =
                            selectedKertas.namaKertas;

                        selectedText.classList.remove(
                            "empty"
                        );


                        customSelect.classList.add(
                            "filled"
                        );

                        customSelect.classList.remove(
                            "active"
                        );


                        updatePaper();
                    }
                );
            });

    } catch (error) {

        console.error(error);
    }


    selectedBox.addEventListener(
        "click",
        () => {

            customSelect.classList.toggle(
                "active"
            );
        }
    );


    document.addEventListener(
        "click",
        e => {

            if (
                !customSelect.contains(
                    e.target
                )
            ) {

                customSelect.classList.remove(
                    "active"
                );
            }
        }
    );
}

// UPDATE PAPER
// Mengubah ukuran kertas
function updatePaper() {

    if (!selectedKertas) {
        return;
    }


    createPaper();

    resetView();

    resetOffset();

    updateStatus();

    drawLayout();
}

// SIMPAN
async function simpanLayout() {

    showLoading(
        "Menyimpan Data Stiker..."
    );

    try {

        let pathFileTif;

        const kertas = selectedKertas.namaKertas;
/*
        if (selectedTif) {

            const hasil =
                await uploadFileTif(selectedStiker.kodeStiker);

            pathFileTif =
                hasil.path;

            pathFile = pathFileTif.replace(/\.[^.]+$/, "");

        }

 */


        selectedStiker.offsetX = offsetX;
        selectedStiker.offsetY = offsetY;
        selectedStiker.lebarKertas = paperWidth;
        selectedStiker.tinggiKertas = paperHeight;
        selectedStiker.pathTIF = pathFile
        selectedStiker.kertas = kertas
        selectedStiker.width = metadataFile.width
        selectedStiker.height = metadataFile.height
        selectedStiker.dpiX = metadataFile.dpiX
        selectedStiker.dpiY = metadataFile.dpiY
        selectedStiker.imageWidthMM = metadataFile.imageWidthMM
        selectedStiker.imageHeightMM = metadataFile.imageHeightMM
        selectedStiker.selectedTif = selectedTif
        selectedStiker.selectedTifConvert = selectedTifConvert

/*
        let response;
        if(!selectedPopupDataStiker.id){
            response =
                await fetch(
                    `${BASE_URL_STIKER}`,
                    {
                        method: "POST",

                        headers: {
                            "Content-type":
                                "application/json"
                        },

                        body: JSON.stringify(
                            selectedPopupDataStiker
                        )
                    }
                );
        } else {
            response =
                await fetch(
                    `${BASE_URL_STIKER}/${selectedPopupDataStiker.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-type":
                                "application/json"
                        },

                        body: JSON.stringify(
                            selectedPopupDataStiker
                        )
                    }
                );
        }

        if (
            await gagalSimpan(response)
        ) {
            return;
        }

 */


        showToast(
            "Data Layout stiker berhasil disimpan",
            "success"
        );

        if (typeof layoutCloseCallback  === "function") {
            layoutCloseCallback (selectedStiker);
        }

        closeLayout();

        // Bersihkan callback
        layoutCloseCallback = null;

    } catch (e) {

        showToast(
            e.message,
            "error"
        );

    } finally {

        hideLoading();
    }
}

async function hapus() {


    const id = selectedStiker.layoutID;

    console.log(selectedStiker);
    console.log(id);
    console.log(!id);

    if(id){
        showLoading(
            "Menghapus Data..."
        );
        try {
            const response = await fetch(`${BASE_URL_STIKER}/hapus-layout/${id}`, {
                method: 'DELETE'
            });
            if(await gagalHapus(response)) return;

            selectedStiker.offsetX = 0;
            selectedStiker.offsetY = 0;
            selectedStiker.lebarKertas = 0;
            selectedStiker.tinggiKertas = 0;
            selectedStiker.pathTIF = ""
            selectedStiker.kertas = ""
            selectedStiker.width = 0
            selectedStiker.height = 0
            selectedStiker.dpiX = 0
            selectedStiker.dpiY = 0
            selectedStiker.imageWidthMM = 0
            selectedStiker.imageHeightMM = 0
            selectedStiker.selectedTif = null
            selectedStiker.selectedTifConvert = null

            if (typeof layoutCloseCallback  === "function") {
                layoutCloseCallback (selectedStiker);
            }

            showToast("Data berhasil dihapus", "success");
            closeLayout();
        } catch (e) {
            showToast(e.message, "warning");
        } finally {
            hideLoading();
        }
    }

}

// RESIZE CANVAS
function resizeCanvas() {

    if (!canvas) {
        return;
    }


    const workspace =
        document.querySelector(
            ".layout-workspace"
        );


    if (!workspace) {
        return;
    }


    canvas.width =
        workspace.clientWidth;

    canvas.height =
        workspace.clientHeight;


    drawLayout();
}
window.addEventListener(
    "resize",
    resizeCanvas
);

// STATUS
function updateStatus() {

    const elX =
        document.getElementById("offsetX");

    const elY =
        document.getElementById("offsetY");

    const info =
        document.getElementById("imageInfo");

    const zoomLabel =
        document.getElementById("zoomValue");


    if (elX) {

        elX.textContent =
            `${offsetX.toFixed(2)} mm`;
    }


    if (elY) {

        elY.textContent =
            `${offsetY.toFixed(2)} mm`;
    }


    if (info) {

        info.textContent =
            `${imageWidthMM.toFixed(1)} × ` +
            `${imageHeightMM.toFixed(1)} mm`;
    }


    if (zoomLabel) {

        zoomLabel.textContent =
            `${Math.round(zoom * 100)}%`;
    }
}

// DRAW
function drawLayout() {

    if (!ctx || !canvas) {
        return;
    }


    // ----------------------------------------------
    // Clear canvas
    // ----------------------------------------------

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ----------------------------------------------
    // Background
    // ----------------------------------------------

    ctx.fillStyle = "#777";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ----------------------------------------------
    // Scale
    // ----------------------------------------------

    scale =
        Math.min(
            (canvas.width - MARGIN * 2) /
            paperWidth,

            (canvas.height - MARGIN * 2) /
            paperHeight
        ) * zoom;


    const paperPixelWidth =
        paperWidth * scale;

    const paperPixelHeight =
        paperHeight * scale;


    // ----------------------------------------------
    // Posisi kertas
    // ----------------------------------------------

    paperX =
        (canvas.width - paperPixelWidth) / 2;

    paperY =
        (canvas.height - paperPixelHeight) / 2;


    // ----------------------------------------------
    // VIEWPORT
    // ----------------------------------------------

    ctx.save();


    if (zoom > 1) {

        ctx.translate(
            viewX,
            viewY
        );
    }


    // ----------------------------------------------
    // Shadow
    // ----------------------------------------------

    ctx.shadowColor =
        "rgba(0,0,0,.25)";

    ctx.shadowBlur = 15;


    // ----------------------------------------------
    // Kertas
    // ----------------------------------------------

    ctx.fillStyle = "#FFF";

    ctx.fillRect(
        paperX,
        paperY,
        paperPixelWidth,
        paperPixelHeight
    );


    ctx.shadowBlur = 0;


    ctx.strokeStyle = "#AAA";

    ctx.strokeRect(
        paperX,
        paperY,
        paperPixelWidth,
        paperPixelHeight
    );


    // ----------------------------------------------
    // Clip ke area kertas
    // ----------------------------------------------

    ctx.beginPath();

    ctx.rect(
        paperX,
        paperY,
        paperPixelWidth,
        paperPixelHeight
    );

    ctx.clip();


    // ----------------------------------------------
    // Gambar
    // ----------------------------------------------

    if (
        gambar.complete &&
        imageWidthMM > 0 &&
        imageHeightMM > 0
    ) {

        ctx.drawImage(
            gambar,

            paperX +
            offsetX * scale,

            paperY +
            offsetY * scale,

            imageWidthMM * scale,
            imageHeightMM * scale
        );
    }


    // ----------------------------------------------
    // Batas area cetak
    // Epson L1800
    //
    // Atas  : 3 mm
    // Kiri  : 3 mm
    // Kanan : 3 mm
    // Bawah : 20 mm
    // ----------------------------------------------

        const marginAtas = 3;
        const marginKiri = 3;
        const marginKanan = 3;
        const marginBawah = 20;


    // ----------------------------------------------
    // Posisi batas area cetak
    // ----------------------------------------------

        const batasKiri =
            paperX + marginKiri * scale;

        const batasKanan =
            paperX + (paperWidth - marginKanan) * scale;

        const batasAtas =
            paperY + marginAtas * scale;

        const batasBawah =
            paperY + (paperHeight - marginBawah) * scale;


    // ----------------------------------------------
    // Gambar garis batas
    // ----------------------------------------------

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        ctx.beginPath();

    // Garis ATAS
        ctx.moveTo(
            batasKiri,
            batasAtas
        );

        ctx.lineTo(
            batasKanan,
            batasAtas
        );

    // Garis KANAN
        ctx.moveTo(
            batasKanan,
            batasAtas
        );

        ctx.lineTo(
            batasKanan,
            batasBawah
        );

    // Garis BAWAH — 20 mm dari bawah
        ctx.moveTo(
            batasKanan,
            batasBawah
        );

        ctx.lineTo(
            batasKiri,
            batasBawah
        );

    // Garis KIRI
        ctx.moveTo(
            batasKiri,
            batasBawah
        );

        ctx.lineTo(
            batasKiri,
            batasAtas
        );

        ctx.stroke();

    // ----------------------------------------------
    // Restore viewport
    // ----------------------------------------------

    ctx.restore();


    updateStatus();
}

// KEYBOARD
function onKeyDown(e) {

    let step = 1;


    // Shift = 10 mm
    if (e.shiftKey) {
        step = 10;
    }


    // Ctrl = 0.1 mm
    if (e.ctrlKey) {
        step = 0.1;
    }


    switch (e.key) {

        case "ArrowLeft":
            offsetX -= step;
            break;

        case "ArrowRight":
            offsetX += step;
            break;

        case "ArrowUp":
            offsetY -= step;
            break;

        case "ArrowDown":
            offsetY += step;
            break;

        default:
            return;
    }


    e.preventDefault();

    updateStatus();

    drawLayout();
}

// ZOOM
function resetViewPosition() {

    viewX = 0;
    viewY = 0;
    panning = false;
}
function onMouseWheel(e) {

    e.preventDefault();


    const oldZoom = zoom;


    if (e.deltaY < 0) {

        zoom += ZOOM_STEP;

    } else {

        zoom -= ZOOM_STEP;
    }


    zoom =
        Math.max(
            MIN_ZOOM,
            Math.min(
                MAX_ZOOM,
                zoom
            )
        );


    // Kembali ke fit
    if (zoom <= 1) {

        viewX = 0;
        viewY = 0;

        panning = false;
    }


    // Pertama kali masuk zoom
    if (
        oldZoom <= 1 &&
        zoom > 1
    ) {

        viewX = 0;
        viewY = 0;
    }


    updateStatus();

    drawLayout();
}
function zoom100() {

    zoom = 1;

    resetViewPosition();

    updateStatus();
    drawLayout();
}
function fitPageWidth() {

    if (
        !canvas ||
        paperWidth <= 0 ||
        paperHeight <= 0
    ) {
        return;
    }

    const baseScale =
        Math.min(
            (canvas.width - MARGIN * 2) / paperWidth,
            (canvas.height - MARGIN * 2) / paperHeight
        );

    const widthScale =
        (canvas.width - MARGIN * 2) / paperWidth;

    zoom =
        widthScale / baseScale;

    resetViewPosition();

    updateStatus();
    drawLayout();
}
function fitPageHeight() {

    if (
        !canvas ||
        paperWidth <= 0 ||
        paperHeight <= 0
    ) {
        return;
    }

    const baseScale =
        Math.min(
            (canvas.width - MARGIN * 2) / paperWidth,
            (canvas.height - MARGIN * 2) / paperHeight
        );

    const heightScale =
        (canvas.height - MARGIN * 2) / paperHeight;

    zoom =
        heightScale / baseScale;

    resetViewPosition();

    updateStatus();
    drawLayout();
}

// PAN
function onMouseDown(e) {

    if (zoom <= 1) {
        return;
    }


    if (e.button !== 0) {
        return;
    }


    panning = true;


    panStartX =
        e.clientX;

    panStartY =
        e.clientY;


    canvas.style.cursor =
        "grabbing";
}
function onMouseUp() {

    panning = false;


    if (canvas) {

        canvas.style.cursor =
            "grab";
    }
}
function onMouseMove(e) {

    if (!panning) {
        return;
    }


    viewX +=
        e.clientX -
        panStartX;

    viewY +=
        e.clientY -
        panStartY;


    panStartX =
        e.clientX;

    panStartY =
        e.clientY;


    drawLayout();
}

// TIF
async function handleUploadTif(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }


    // ==================================================
    // VALIDASI
    // ==================================================

    if (
        !file.name
            .toLowerCase()
            .endsWith(".tif")
    ) {

        showToast(
            "File harus berekstensi .tif",
            "warning"
        );

        return;
    }


    selectedTif = file;

    showLoading("Memuat Gambar...");


    try {

        // ==================================================
        // TIF -> WEBP
        // ==================================================

        const result =
            await convertTifToWebp(
                selectedTif
            );


        selectedTifConvert =
            result.webpFile;


        // ==================================================
        // METADATA
        // ==================================================

        metadataFile = {

            width: result.width,
            height: result.height,

            dpiX: result.dpiX,
            dpiY: result.dpiY,

            imageWidthMM:
            result.imageWidthMM,

            imageHeightMM:
            result.imageHeightMM
        };

        // ==================================================
        // TAMPILKAN WEBP
        // ==================================================

        const webpUrl =
            URL.createObjectURL(
                selectedTifConvert
            );


        gambar = new Image();


        gambar.onload = () => {

            // Ukuran gambar dari metadata
            imageWidthMM =
                metadataFile.imageWidthMM;

            imageHeightMM =
                metadataFile.imageHeightMM;


            // Letakkan gambar di tengah kertas
            resetOffset();

            // Reset zoom / view
            resetView();


            updateStatus();

            drawLayout();


            // Object URL sudah tidak diperlukan
            URL.revokeObjectURL(
                webpUrl
            );
        };


        gambar.onerror = () => {

            URL.revokeObjectURL(
                webpUrl
            );

            showToast(
                "Gagal menampilkan gambar WEBP",
                "error"
            );
        };


        gambar.src = webpUrl;


    } catch (error) {

        console.error(error);

        showToast(
            "Gagal memproses gambar",
            "error"
        );

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



// EXPORT
window.initPopupLayoutCetak = initPopupLayoutCetak;
window.showPopupLayoutCetak = showPopupLayoutCetak;
window.closeLayout = closeLayout;
window.resetLayout = resetLayout;
window.ubahKertas = updatePaper;
window.setOrientation = setOrientation;
window.handleUploadTif = handleUploadTif;
window.zoom100 = zoom100;
window.fitPageWidth = fitPageWidth;
window.fitPageHeight = fitPageHeight;