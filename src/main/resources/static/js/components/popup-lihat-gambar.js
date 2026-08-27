let popupLihatGambarInitialized = false;

let imgFullscreen;

let scale = 1;
let translateX = 0;
let translateY = 0;

let isDragging = false;

let startX = 0;
let startY = 0;


/* =========================================================
   CONFIG
   ========================================================= */

const MIN_SCALE = 1;
const MAX_SCALE = 8;

const ZOOM_STEP = 1.15;


/* =========================================================
   INIT
   ========================================================= */

async function initPopupLihatGambar() {

    if (popupLihatGambarInitialized) {
        return;
    }

    const response =
        await fetch(
            "pages/popup/popup-lihat-gambar.html"
        );

    const html =
        await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

    imgFullscreen =
        document.getElementById(
            "img-fullscreen"
        );

    initImageViewer();

    popupLihatGambarInitialized = true;

    document.addEventListener(
        "keydown",
        handlePopupShortcut
    );
}


/* =========================================================
   SHOW / CLOSE
   ========================================================= */

function showPopupLihatGambar() {

    resetImageViewer();

    getEl(
        "popup-lihat-gambar"
    ).classList.add("show");
}


function tutupPopupLihatGambar() {

    resetImageViewer();

    getEl(
        "popup-lihat-gambar"
    ).classList.remove("show");
}


/* =========================================================
   TRANSFORM
   ========================================================= */

function updateImageTransform() {

    if (!imgFullscreen) {
        return;
    }

    imgFullscreen.style.transform =
        `translate3d(
            ${translateX}px,
            ${translateY}px,
            0
        ) scale(${scale})`;
}


/* =========================================================
   ZOOM
   ========================================================= */

function zoomImage(e) {

    e.preventDefault();

    if (!imgFullscreen) {
        return;
    }

    const oldScale = scale;

    if (e.deltaY < 0) {

        // Zoom IN
        scale *= 1.15;

    } else {

        // Zoom OUT
        scale /= 1.15;
    }

    // Batasi zoom
    scale = Math.max(
        MIN_SCALE,
        Math.min(scale, MAX_SCALE)
    );

    // Jika kembali ke ukuran normal,
    // kembalikan posisi ke tengah
    if (scale === 1) {
        translateX = 0;
        translateY = 0;
    }

    updateImageTransform();
}


/* =========================================================
   IMAGE VIEWER
   ========================================================= */

function initImageViewer() {

    if (!imgFullscreen) {
        console.error(
            "img-fullscreen tidak ditemukan"
        );

        return;
    }


    /* =====================================================
       WHEEL ZOOM
       ===================================================== */

    imgFullscreen.addEventListener(
        "wheel",
        zoomImage,
        {
            passive: false
        }
    );


    /* =====================================================
       MOUSE DOWN
       ===================================================== */

    imgFullscreen.addEventListener(
        "mousedown",
        function(e) {

            if (e.button !== 0) {
                return;
            }


            /*
             * Jangan drag ketika gambar
             * belum diperbesar
             */
            if (scale <= 1) {
                return;
            }


            isDragging = true;


            startX =
                e.clientX -
                translateX;

            startY =
                e.clientY -
                translateY;


            imgFullscreen.classList.add(
                "dragging"
            );


            e.preventDefault();
        }
    );


    /* =====================================================
       CONTEXT MENU
       ===================================================== */

    imgFullscreen.addEventListener(
        "contextmenu",
        function(e) {

            e.preventDefault();

            resetImageViewer();
        }
    );


    /* =====================================================
       MOUSE MOVE
       ===================================================== */

    document.addEventListener(
        "mousemove",
        function(e) {

            if (!isDragging) {
                return;
            }


            translateX =
                e.clientX -
                startX;

            translateY =
                e.clientY -
                startY;


            updateImageTransform();
        }
    );


    /* =====================================================
       MOUSE UP
       ===================================================== */

    document.addEventListener(
        "mouseup",
        function() {

            if (!isDragging) {
                return;
            }


            isDragging = false;


            imgFullscreen.classList.remove(
                "dragging"
            );
        }
    );


    /* =====================================================
       MOUSE LEAVE
       ===================================================== */

    document.addEventListener(
        "mouseleave",
        function() {

            if (!isDragging) {
                return;
            }


            isDragging = false;


            imgFullscreen.classList.remove(
                "dragging"
            );
        }
    );
}


/* =========================================================
   RESET
   ========================================================= */

function resetImageViewer() {

    scale = 1;

    translateX = 0;

    translateY = 0;

    isDragging = false;


    if (imgFullscreen) {

        imgFullscreen.classList.remove(
            "dragging"
        );

        updateImageTransform();
    }
}


/* =========================================================
   ESCAPE
   ========================================================= */

function handlePopupShortcut(e) {

    if (
        e.key === "Escape" &&
        getEl(
            "popup-lihat-gambar"
        ).classList.contains("show")
    ) {

        tutupPopupLihatGambar();
    }
}