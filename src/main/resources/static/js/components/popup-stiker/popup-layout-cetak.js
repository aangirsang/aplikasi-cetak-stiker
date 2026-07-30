// ======================================================
// CANVAS
// ======================================================

let canvas;
let ctx;
let gambar = new Image();

// ======================================================
// LAYOUT
// ======================================================

let offsetX = 0;
let offsetY = 0;

let paperWidth = 210;
let paperHeight = 297;

let paperX = 0;
let paperY = 0;

let orientation = "portrait";

// ======================================================
// DRAG
// ======================================================

let dragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// ======================================================
// CONSTANT
// ======================================================

const MM_PER_PIXEL = 25.4 / 96;
const MARGIN = 30;

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
// INIT
// ======================================================

async function initPopupLayoutCetak() {

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
    ctx = canvas.getContext("2d");

    initCanvasEvent();

    resizeCanvas();
}

// ======================================================
// POPUP
// ======================================================

function showPopupLayoutCetak() {

    document.getElementById("popup-layout-cetak").style.display = "flex";

    resizeCanvas();
}

function closeLayout() {

    document.getElementById("popup-layout-cetak").style.display = "none";
}

// ======================================================
// CANVAS
// ======================================================

function resizeCanvas() {

    const workspace = document.querySelector(".layout-workspace");

    canvas.width = workspace.clientWidth;
    canvas.height = workspace.clientHeight;

    drawLayout();
}

// ======================================================
// DRAW
// ======================================================

function drawLayout() {

    if (!ctx) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const scale = hitungScale();

    hitungPosisiKertas(scale);

    drawPaper(scale);

    drawImage(scale);
}

function hitungScale() {

    return Math.min(

        (canvas.width - MARGIN * 2) / paperWidth,

        (canvas.height - MARGIN * 2) / paperHeight

    );
}

function hitungPosisiKertas(scale) {

    const paperPixelWidth = paperWidth * scale;
    const paperPixelHeight = paperHeight * scale;

    paperX = (canvas.width - paperPixelWidth) / 2;
    paperY = (canvas.height - paperPixelHeight) / 2;
}

function drawPaper(scale) {

    ctx.fillStyle = "#FFFFFF";

    ctx.fillRect(
        paperX,
        paperY,
        paperWidth * scale,
        paperHeight * scale
    );

    ctx.strokeStyle = "#BBBBBB";

    ctx.strokeRect(
        paperX,
        paperY,
        paperWidth * scale,
        paperHeight * scale
    );
}

function drawImage(scale) {

    if (!gambar.complete) {
        return;
    }

    ctx.drawImage(

        gambar,

        paperX + offsetX * scale,
        paperY + offsetY * scale,

        gambar.width * scale,
        gambar.height * scale

    );
}

function initCanvasEvent() {

    canvas.addEventListener("mousedown", onMouseDown);

    canvas.addEventListener("mousemove", onMouseMove);

    canvas.addEventListener("mouseup", onMouseUp);

    canvas.addEventListener("mouseleave", onMouseUp);
}

function onMouseDown(e) {

    dragging = true;

    lastMouseX = e.offsetX;
    lastMouseY = e.offsetY;
}

function onMouseMove(e) {

    if (!dragging) return;

    offsetX += e.offsetX - lastMouseX;
    offsetY += e.offsetY - lastMouseY;

    lastMouseX = e.offsetX;
    lastMouseY = e.offsetY;

    updateStatus();

    drawLayout();
}

function onMouseUp() {

    dragging = false;
}

function updateStatus() {

    document.getElementById("offsetX").textContent =
        offsetX.toFixed(2) + " px";

    document.getElementById("offsetY").textContent =
        offsetY.toFixed(2) + " px";
}

function resetLayout() {

    offsetX = 0;
    offsetY = 0;

    updateStatus();

    drawLayout();
}

function ubahKertas() {

    const ukuran =
        document.getElementById("paperSize").value;

    orientation =
        document.getElementById("paperOrientation").value;

    paperWidth = PAPER[ukuran].width;
    paperHeight = PAPER[ukuran].height;

    if (orientation === "landscape") {
        [paperWidth, paperHeight] = [paperHeight, paperWidth];
    }

    drawLayout();
}

async function simpanLayout() {

    const body = {

        offsetX: offsetX * MM_PER_PIXEL,
        offsetY: offsetY * MM_PER_PIXEL

    };

    console.log(body);

    // POST
}

// ======================================================
// EXPORT
// ======================================================

window.addEventListener("resize", resizeCanvas);

window.initPopupLayoutCetak = initPopupLayoutCetak;
window.showPopupLayoutCetak = showPopupLayoutCetak;
window.ubahKertas = ubahKertas;
window.resetLayout = resetLayout;
window.closeLayout = closeLayout;