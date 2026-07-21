let callBackPilihStiker = null;
let currentPagePopupStiker = 1;
let sortPopupStiker = "namaPemilik";
let selectedPopupStikerUmkm = null;
let cariPopupStiker = "";
let sortDirectionPopupStiker = "asc";

let selectUmkm = null;
let daftarStiker = [];
let stikerTerpilih = [];

async function initPopupPilihStiker() {
    await initPopupLihatStiker();

    // cek agar tidak dimuat dua kali
    if(document.getElementById("popup-pilih-stiker")){
        return;
    }

    const response = await fetch(
        "pages/popup/stiker/popup-pilih-stiker.html"
    );

    const html = await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );


    getEl("cari-popup-pilih-stiker").addEventListener("input", async function () {
        cariPopupStiker = this.value.trim().toLowerCase();
        currentPagePopupStiker = 1;
        await loadTablePopupStiker();
    });

    getEl("batal-pilih-stiker-btn-popup")
        .addEventListener("click", tutupPopupPilihStiker);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            tutupPopupPilihStiker();
        }
    });

}

// POPUP

async function showPopupPilihStiker(onSelect, selectedUmkm, selectedStiker = []) {

    callBackPilihStiker = onSelect;

    selectUmkm = selectedUmkm;

    stikerTerpilih = [...selectedStiker];

    // reset pencarian
    cariPopupStiker = "";

    getEl("cari-popup-pilih-stiker").value = "";

    getEl("popup-pilih-stiker-title").textContent = `Data Stiker ${selectUmkm.namaUsaha}`

    await loadTablePopupStiker(true);

    document
        .getElementById("popup-pilih-stiker")
        .classList.add("show");
}

function tutupPopupPilihStiker() {

    document
        .getElementById("popup-pilih-stiker")
        .classList.remove("show");
}

async function loadTablePopupStiker(reload = false){
    showLoading("Memuat data stiker..")

    try{
        if(reload){
            daftarStiker = await fetchDataStiker(selectUmkm);
        }

        const filtered = filterDataPopupStiker();
        const sorted = sortedDataPopupStiker(filtered);
        renderTabelPopupStiker(sorted);
    } catch(error){
        console.error(error);
        showToast(error, "error")
        daftarStiker = [];
    } finally {
        hideLoading();
    }
}
async function fetchDataStiker(umkm) {
    const response = await fetch(`${BASE_URL_STIKER}/umkm-status-true/${umkm.id}`)

    if(!response.ok) {
        showToast("Gagal mengambil data stiker!!","error");
    }

    return response.json();
}
function filterDataPopupStiker(){

    return daftarStiker.filter(stiker => {
        const semuaData = `
            ${stiker.namaStiker}
            ${stiker.panjang}
            ${stiker.lebar}
        `.toLowerCase();

        return semuaData.includes(cariPopupStiker);
    });
}
function sortedDataPopupStiker(data){
    return [...data].sort((a,b) => {
        const valueA = (a[sortPopupStiker] ?? "").toString().toLowerCase();
        const valueB = (b[sortPopupStiker] ?? "").toString().toLowerCase();

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionPopupStiker === "asc"
                ? result
                : -result;
        }

        const result = valueA - valueB;
        return sortDirectionPopupStiker === "asc"
            ? result
            : -result;
    });
}
function renderTabelPopupStiker(data){
    const container =
        getEl("popup-stiker-list");

    container.innerHTML = data.map(item =>
        createCardPopupStiker(item)
    ).join("");

    initTooltipStiker();
}
function initTooltipStiker(){

    const tooltip =
        document.getElementById("tooltip-stiker");

    document
        .querySelectorAll(".item-card")
        .forEach(card => {

            card.addEventListener("mouseenter", () => {

                tooltip.textContent =
                    card.dataset.tooltip;

                tooltip.classList.add("show");
            });

            card.addEventListener("mousemove", e => {

                tooltip.style.left =
                    (e.clientX + 15) + "px";

                tooltip.style.top =
                    (e.clientY + 15) + "px";
            });

            card.addEventListener("mouseleave", () => {

                tooltip.classList.remove("show");
            });
        });
}
function createCardPopupStiker(item){

    const isSelected =
        stikerTerpilih.some(
            stiker => stiker.id === item.id
        );

    return `
        <div
            class="item-card ${isSelected ? "selected" : ""}" 
            data-tooltip="${item.namaStiker} (${item.panjang} x ${item.lebar} cm)"
            onclick="toggleSelectPopupStiker('${item.id}')">

            <div class="stiker-image">
                <img
                    src="${item.pathGambar1
                    ? `${BASE_URL}${item.pathGambar1}`
                    : noImageStiker}"
                    alt="${item.namaStiker}">
            </div>

            <div class="stiker-info">
                <div class="stiker-nama">
                    ${item.namaStiker}
                </div>

                <div class="stiker-ukuran">
                    ${item.panjang} x ${item.lebar} cm
                </div>
            </div>
            <div class="btn-card">
                <button
                    type="button"
                    onclick="event.stopPropagation(); 
                    lihatStiker('${item.id}')">
                    Lihat Stiker
                </button>
            </div>
        </div>
    `;
}
function pilihPopupStiker(){

    if(stikerTerpilih.length === 0){
        showToast("Pilih minimal satu stiker","warning");
        tandaiInvalid(getEl("table-container-popup-stiker"))
        return;
    }

    if(callBackPilihStiker){
        callBackPilihStiker(stikerTerpilih);
    }

    tutupPopupPilihStiker();
}
async function toggleSelectPopupStiker(id){

    const index = stikerTerpilih.findIndex(
        item => item.id === id
    );

    if(index >= 0){

        stikerTerpilih.splice(index, 1);

    } else {

        const stiker = getStiker(id);

        if(stiker){
            stikerTerpilih.push(stiker);
        }
    }

    await loadTablePopupStiker();
}
function getStiker(id){
    return daftarStiker.find(item => item.id === id);
}
async function lihatStiker(id) {

    console.log(id)

    const stiker = getStiker(id);

    if (!stiker) return;

    showPopupLihatStiker(stiker);
}

window.initPopupPilihStiker = initPopupPilihStiker;
window.showPopupPilihStiker = showPopupPilihStiker;
window.toggleSelectPopupStiker = toggleSelectPopupStiker;
window.pilihPopupStiker = pilihPopupStiker;
window.lihatStiker = lihatStiker;
