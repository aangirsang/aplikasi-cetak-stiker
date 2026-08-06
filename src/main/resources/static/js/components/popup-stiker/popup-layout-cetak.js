// CANVAS
let canvas = null;
let ctx = null;

// IMAGE
let gambar = new Image();

let dpiX = 300;
let dpiY = 300;

let imageWidthMM = 0;
let imageHeightMM = 0;

// PAPER
const KERTAS =[
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
    }
]

let selectedKertas =null;


// LAYOUT
let paperWidth;
let paperHeight;

let orientation = "portrait";

// posisi gambar dalam mm
let offsetX = 0;
let offsetY = 0;

// zoom preview
let zoom = 1;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

// posisi kertas di canvas
let paperX = 0;
let paperY = 0;

// scale mm -> pixel
let scale = 1;

// DRAG
let dragging = false;

// CONFIG
const MARGIN = 40;

// TIFF AnyCut biasanya 96 DPI
const DPI = 96;

const MM_PER_PIXEL = 25.4 / DPI;

// VIEW
let viewX = 0;
let viewY = 0;

let panning = false;

let panStartX = 0;
let panStartY = 0;

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

    initCustomSelectKertas();
    selectedKertas = KERTAS[2];
    document.getElementById("selected-text-ukuran-kertas").textContent =
        selectedKertas.namaKertas;

    updatePaper();

    canvas = document.getElementById("layoutCanvas");

    ctx = canvas.getContext("2d", {
        alpha: true
    });


    canvas.addEventListener("wheel", onMouseWheel, {
        passive: false
    });

    canvas.addEventListener("mousedown", onMouseDown);

    canvas.addEventListener("mousemove", onMouseMove);

    canvas.addEventListener("mouseup", onMouseUp);

    canvas.addEventListener("mouseleave", onMouseUp);

    canvas.style.cursor = "grab";

    console.log(canvas);
    console.log(ctx);



    const workspace = document.querySelector(".layout-workspace");

    workspace.tabIndex = 0;

    workspace.addEventListener(
        "keydown",
        onKeyDown
    );


    workspace.focus();

    //initCanvasEvent();

    resizeCanvas();
}

// POPUP
async function showPopupLayoutCetak(url) {

    document
        .getElementById("popup-layout-cetak")
        .classList.add("show");


    await new Promise(resolve => requestAnimationFrame(resolve));

    resizeCanvas();

    showLoading("Menampilkan gambar...");

    try {

        await loadTiff(url);

    } catch (e) {

        console.error(e);
        alert(e.message);

    } finally {

        hideLoading();

    }



}

async function loadTiff(baseUrl) {

    // baseUrl contoh:
    // /uploads/file-cetak/a-2601

    // -------------------------
    // metadata
    // -------------------------
    const metadataResponse = await fetch(`${baseUrl}.json`);

    if (!metadataResponse.ok) {
        throw new Error("Metadata tidak ditemukan");
    }

    const metadata = await metadataResponse.json();

    dpiX = metadata.dpiX;
    dpiY = metadata.dpiY;

    imageWidthMM = metadata.imageWidthMM;
    imageHeightMM = metadata.imageHeightMM;

    // -------------------------
    // preview webp
    // -------------------------
    await new Promise((resolve, reject) => {

        gambar = new Image();

        gambar.onload = resolve;

        gambar.onerror = reject;

        gambar.src = `${baseUrl}.webp`;

    });

    resetLayout();
}

async function convertRGBAtoImage(
    rgba,
    width,
    height
){

    const tempCanvas =
        document.createElement("canvas");

    tempCanvas.width =
        width;

    tempCanvas.height =
        height;

    const tempCtx =
        tempCanvas.getContext("2d");

    const imageData =
        tempCtx.createImageData(
            width,
            height
        );

    imageData.data.set(rgba);

    tempCtx.putImageData(
        imageData,
        0,
        0
    );

    gambar =
        new Image();

    await new Promise(resolve=>{

        gambar.onload=resolve;

        gambar.src =
            tempCanvas.toDataURL(
                "image/webp",
                0.9
            );

    });

    console.log(gambar.width, gambar.height);
    console.log(gambar.complete);

    const webp = tempCanvas.toDataURL("image/webp");

    console.log(webp.substring(0,50));

    gambar.src = webp;
    console.log(gambar.width);
    console.log(gambar.height);
    console.log(gambar.complete);
    console.log(gambar.naturalWidth);
    console.log(gambar.naturalHeight);

}

function closeLayout() {

    document
        .getElementById("popup-layout-cetak")
        .classList.remove("show");

}

function setOrientation(mode) {

    const portrait = document.getElementById("btnPortrait");
    const landscape = document.getElementById("btnLandscape");

    portrait.classList.remove("active");
    landscape.classList.remove("active");

    if (mode === "portrait") {

        portrait.classList.add("active");

    } else {

        landscape.classList.add("active");

    }

    orientation = mode;

    updatePaper();   // jika ingin langsung mengubah ukuran kertas
}

function initCustomSelectKertas(){

    const optionsContainer = getEl("options-ukuran-kertas");
    const customSelect = getEl("custom-select-ukuran-kertas");
    const selectedText = getEl("selected-text-ukuran-kertas")
    const selectedBox = customSelect.querySelector(".select-box");
    try {
        optionsContainer.innerHTML =
            KERTAS.map(kertas => `
            <div 
                class="option"
                data-id="${kertas.namaKertas}"
            >
                ${kertas.namaKertas}
            </div>
        `).join("");

        document.querySelectorAll("#options-ukuran-kertas .option")
            .forEach(option => {
                option.addEventListener("click", function(){

                    selectedText.textContent = this.textContent;
                    selectedText.classList.remove("empty");

                    const namaKertasDipilih = this.dataset.id;

                    selectedKertas = KERTAS.find(
                        kertas => kertas.namaKertas === namaKertasDipilih
                    );

                    paperWidth = selectedKertas.width;
                    paperHeight = selectedKertas.height;

                    updatePaper();

                    customSelect.classList.add("filled");
                    customSelect.classList.remove("active");
                });
            });
    } catch(error){
        console.error(error);
        dataKategori = [];
    }

    selectedBox.addEventListener("click", () => {
        customSelect.classList.toggle("active");
    })

    document.addEventListener("click", (e) => {
        if(!customSelect.contains(e.target)) {
            customSelect.classList.remove("active");
        }
    })
}

// RESIZE
function resizeCanvas() {

    if (!canvas) {
        return;
    }

    const workspace =
        document.querySelector(".layout-workspace");

    if (!workspace) {
        return;
    }

    canvas.width = workspace.clientWidth;

    canvas.height = workspace.clientHeight;

    drawLayout();
}

window.addEventListener(
    "resize",
    resizeCanvas
);

// PAPER
function updatePaper() {

    if (!selectedKertas) {
        return;
    }

    paperWidth = selectedKertas.width;
    paperHeight = selectedKertas.height;

    if (orientation === "landscape") {

        [paperWidth, paperHeight] = [
            paperHeight,
            paperWidth
        ];
    }
    getEl("ukuran-kertas-panjang").value = paperHeight;
    getEl("ukuran-kertas-lebar").value = paperWidth;

    resetLayout();
}

// RESET
function resetLayout() {

    // Zoom
    zoom = 1;

    // View / Camera
    viewX = 0;
    viewY = 0;
    panning = false;

    // Posisi gambar di tengah kertas
    offsetX = (paperWidth - imageWidthMM) / 2;
    offsetY = (paperHeight - imageHeightMM) / 2;

    updateStatus();
    drawLayout();
}

// STATUS
function updateStatus() {

    const elX =
        document.getElementById("offsetX");

    const elY =
        document.getElementById("offsetY");

    if(elX){

        elX.textContent =
            offsetX.toFixed(2)+" mm";

    }

    if(elY){

        elY.textContent =
            offsetY.toFixed(2)+" mm";

    }

    const info =
        document.getElementById("imageInfo");

    if(info){

        info.textContent =
            imageWidthMM.toFixed(1)
            +" × "+
            imageHeightMM.toFixed(1)
            +" mm";

    }

    const zoomLabel =
        document.getElementById("zoomValue");

    if (zoomLabel) {

        zoomLabel.textContent =
            Math.round(zoom * 100) + "%";

    }

}

// DRAW
function drawLayout() {

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background workspace (tidak ikut bergeser)
    ctx.fillStyle = "#777";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    scale = Math.min(
        (canvas.width - MARGIN * 2) / paperWidth,
        (canvas.height - MARGIN * 2) / paperHeight
    ) * zoom;

    const paperPixelWidth = paperWidth * scale;
    const paperPixelHeight = paperHeight * scale;

    paperX = (canvas.width - paperPixelWidth) / 2;
    paperY = (canvas.height - paperPixelHeight) / 2;

    // ===== Mulai viewport =====
    ctx.save();

    if (zoom > 1) {
        ctx.translate(viewX, viewY);
    }

    // Shadow
    ctx.shadowColor = "rgba(0,0,0,.25)";
    ctx.shadowBlur = 15;

    // Kertas
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

    // Clip ke area kertas
    ctx.beginPath();
    ctx.rect(
        paperX,
        paperY,
        paperPixelWidth,
        paperPixelHeight
    );
    ctx.clip();

    // Gambar
    if (gambar.complete) {

        ctx.drawImage(
            gambar,
            paperX + offsetX * scale,
            paperY + offsetY * scale,
            imageWidthMM * scale,
            imageHeightMM * scale
        );

    }

// Garis paling atas
    const garisY = paperY + (paperHeight - 20) * scale;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(paperX, garisY);
    ctx.lineTo(
        paperX + paperPixelWidth,
        garisY
    );
    ctx.stroke();

    ctx.restore();
    updateStatus();
}


// MOUSE AND KEYBOARD
function onKeyDown(e) {

    console.log(e.key);

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
function onMouseWheel(e) {

    e.preventDefault();

    const oldZoom = zoom;

    if (e.deltaY < 0) {
        zoom += ZOOM_STEP;
    } else {
        zoom -= ZOOM_STEP;
    }

    zoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, zoom)
    );

    // Ketika kembali ke Fit
    if (zoom <= 1) {
        viewX = 0;
        viewY = 0;
        panning = false;
    }

    // Baru keluar dari Fit -> reset juga
    if (oldZoom <= 1 && zoom > 1) {
        viewX = 0;
        viewY = 0;
    }

    updateStatus();
    drawLayout();
}
function onMouseDown(e) {

    if (zoom <= 1) {
        return;
    }

    if (e.button !== 0) {
        return;
    }

    panning = true;

    panStartX = e.clientX;
    panStartY = e.clientY;

    canvas.style.cursor = "grabbing";
}
function onMouseUp() {

    panning = false;

    canvas.style.cursor = "grab";
}
function onMouseMove(e) {

    if (!panning) {
        return;
    }

    viewX += e.clientX - panStartX;
    viewY += e.clientY - panStartY;

    panStartX = e.clientX;
    panStartY = e.clientY;

    drawLayout();
}

// EXPORT
window.initPopupLayoutCetak =
    initPopupLayoutCetak;

window.showPopupLayoutCetak =
    showPopupLayoutCetak;

window.closeLayout =
    closeLayout;

window.resetLayout =
    resetLayout;

window.ubahKertas =
    updatePaper;

window.setOrientation =
    setOrientation;