let popupLihatGambarInitialized = false;

let imgFullscreen;

let scale = 1;
let translateX = 0;
let translateY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

async function initPopupLihatGambar() {
    if(popupLihatGambarInitialized){
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

    imgFullscreen = document.getElementById("img-fullscreen");

    initImageViewer();

    popupLihatGambarInitialized = true;

    document.addEventListener("keydown", handlePopupShortcut);
}

function showPopupLihatGambar() {
    resetImageViewer();
    getEl('popup-lihat-gambar').classList.add("show");
}
function tutupPopupLihatGambar(){
    resetImageViewer();
    getEl('popup-lihat-gambar').classList.remove("show");
}
function updateImageTransform() {
    imgFullscreen.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}
function initImageViewer(){

    imgFullscreen.addEventListener("wheel", function(e){

        e.preventDefault();

        const rect = imgFullscreen.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const imageX = (mouseX - translateX) / scale;
        const imageY = (mouseY - translateY) / scale;

        if(e.deltaY < 0){
            scale *= 1.1;
        }else{
            scale /= 1.1;
        }

        scale = Math.max(1, Math.min(scale, 8));

        translateX = mouseX - imageX * scale;
        translateY = mouseY - imageY * scale;

        updateImageTransform();

    }, { passive:false });


    imgFullscreen.addEventListener("mousedown", function(e){

        if(e.button !== 0) return;

        isDragging = true;

        startX = e.clientX - translateX;
        startY = e.clientY - translateY;

        imgFullscreen.classList.add("dragging");

    });


    imgFullscreen.addEventListener("contextmenu", function(e){

        e.preventDefault();

        scale = 1;
        translateX = 0;
        translateY = 0;

        updateImageTransform();

    });

    document.addEventListener("mousemove", function(e){

        if(!isDragging) return;

        translateX = e.clientX - startX;
        translateY = e.clientY - startY;

        updateImageTransform();

    });

    document.addEventListener("mouseup", function(){

        if(!isDragging) return;

        isDragging = false;

        imgFullscreen.classList.remove("dragging");

    });

}
function resetImageViewer() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    isDragging = false;

    if (imgFullscreen) {
        imgFullscreen.classList.remove("dragging");
        updateImageTransform();
    }
}
function handlePopupShortcut(e) {
    if (
        e.key === "Escape" &&
        getEl("popup-lihat-gambar").classList.contains("show")
    ) {
        tutupPopupLihatGambar();
    }
}