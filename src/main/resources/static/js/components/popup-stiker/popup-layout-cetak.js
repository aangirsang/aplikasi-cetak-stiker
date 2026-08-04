// ======================================================
// LAYOUT CETAK - BAGIAN 1A-1
// ======================================================

// ======================================================
// CANVAS
// ======================================================

let canvas = null;
let ctx = null;

// ======================================================
// IMAGE
// ======================================================

let gambar = new Image();

let dpiX = 300;
let dpiY = 300;

let imageWidthMM = 0;
let imageHeightMM = 0;

// ======================================================
// PAPER
// ======================================================

const PAPER = {

    A4: {
        width: 210,
        height: 297
    },

    F4: {
        width: 210,
        height: 330
    },

    A3: {
        width: 297,
        height: 420
    }

};

// ======================================================
// LAYOUT
// ======================================================

let paperWidth = PAPER.A4.width;
let paperHeight = PAPER.A4.height;

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

// ======================================================
// DRAG
// ======================================================

let dragging = false;

let lastMouseX = 0;
let lastMouseY = 0;

// ======================================================
// CONFIG
// ======================================================

const MARGIN = 40;

// TIFF AnyCut biasanya 96 DPI
const DPI = 96;

const MM_PER_PIXEL = 25.4 / DPI;

// ======================================================
// VIEW
// ======================================================

let viewX = 0;
let viewY = 0;

let panning = false;

let panStartX = 0;
let panStartY = 0;

// ======================================================
// INIT
// ======================================================

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

// ======================================================
// POPUP
// ======================================================

async function showPopupLayoutCetak(url) {

    document
        .getElementById("popup-layout-cetak")
        .classList.add("show");


    await new Promise(resolve => requestAnimationFrame(resolve));

    resizeCanvas();

    await loadTiff(url);

    //resetLayout();

}

async function loadTiff(url){

    const response = await fetch(url);

    if(!response.ok){

        throw new Error("Download TIFF gagal");

    }

    const buffer =
        await response.arrayBuffer();

    const ifds =
        UTIF.decode(buffer);

    console.log("XResolution", ifds[0].t282);
    console.log("YResolution", ifds[0].t283);
    console.log("ResolutionUnit", ifds[0].t296);

    if(ifds.length===0){

        throw new Error("TIFF kosong");

    }

    UTIF.decodeImage(
        buffer,
        ifds[0]
    );

    const rgba =
        UTIF.toRGBA8(ifds[0]);

    const width =
        ifds[0].width;

    const height =
        ifds[0].height;

    dpiX = ifds[0].t282?.[0] ?? 300;
    dpiY = ifds[0].t283?.[0] ?? 300;

    imageWidthMM = width * 25.4 / dpiX;
    imageHeightMM = height * 25.4 / dpiY;

    console.log(imageWidthMM, imageHeightMM);

    await convertRGBAtoImage(
        rgba,
        width,
        height
    );

    drawLayout();

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

// ======================================================
// RESIZE
// ======================================================

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

// ======================================================
// UTIL
// ======================================================

function mmToPixel(mm) {

    return mm * scale;

}

function pixelToMM(px) {

    return px / scale;

}

// ======================================================
// PAPER
// ======================================================

function updatePaper() {

    const ukuran =
        document.getElementById("paperSize").value;

    orientation =
        document.getElementById("paperOrientation").value;

    paperWidth =
        PAPER[ukuran].width;

    paperHeight =
        PAPER[ukuran].height;

    if (orientation === "landscape") {

        [
            paperWidth,
            paperHeight
        ] = [

            paperHeight,
            paperWidth

        ];

    }

    drawLayout();

}

// ======================================================
// RESET
// ======================================================

function resetLayout() {

    // Posisi gambar
    offsetX = 0;
    offsetY = 0;

    // Zoom
    zoom = 1;

    // View / Camera
    viewX = 0;
    viewY = 0;

    panning = false;

    updateStatus();

    drawLayout();


}

// ======================================================
// STATUS
// ======================================================

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

// ======================================================
// DRAW
// ======================================================

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

    ctx.translate(viewX, viewY);

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

// =========================
// Garis paling atas
// =========================

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

    // Scroll atas = zoom in
    if (e.deltaY < 0) {

        zoom += ZOOM_STEP;

    } else {

        zoom -= ZOOM_STEP;

    }

    zoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, zoom)
    );

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

// ======================================================
// EXPORT
// ======================================================

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