let callbackPilihUmkm = null;

let currentPagePopupPilihUmkm = 1;
const rowsPerPagePopupPilihUmkm = 11;
let sortPopupPilihUmkm = "namaPemilik";
let selectedPopupPilihUmkm = null;
let cariKeywordPopupPilihUmkm = "";
let sortDirectionPopupPilihUmkm = "asc";

let dataUmkm = [];

async function initPopupPilihUmkm() {


    console.log("init popup");

    // cek agar tidak dimuat dua kali
    if(document.getElementById("popup-pilih-umkm")){
        return;
    }

    const response = await fetch(
        "pages/popup/popup-pilih-umkm.html"
    );

    const html = await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

    getEl("cari-popup-pilih-umkm").addEventListener("input", async function(){
        cariKeywordPopupPilihUmkm = this.value.trim().toLowerCase();
        currentPagePopupPilihUmkm = 1;
        await loadTablePopupPilihUmkm();
    });

    document
        .getElementById("batal-popup-pilih-umkm")
        ?.addEventListener("click", () => {

            console.log("klik batal");

            tutupPopupPilihUmkm();
        });

}

async function showPopupPilihUmkm(onSelect, selectedUmkm = null) {

    callbackPilihUmkm = onSelect;

    selectedPopupPilihUmkm = selectedUmkm;

    // reset pencarian
    cariKeywordPopupPilihUmkm = "";
    getEl("cari-popup-pilih-umkm").value = "";

    if(selectedPopupPilihUmkm === null){

        // buka dari halaman pertama
        currentPagePopupPilihUmkm = 1;

    } else {

        const filtered = getFilterDataPopupPilihUmkm();
        const sorted = getSortedDataPopupPilihUmkm(filtered);

        const index = sorted.findIndex(
            item => item.id === selectedPopupPilihUmkm.id
        );

        if(index >= 0){
            currentPagePopupPilihUmkm =
                Math.floor(index / rowsPerPagePopupPilihUmkm) + 1;
        } else {
            currentPagePopupPilihUmkm = 1;
        }
    }

    await loadTablePopupPilihUmkm(true);

    document
        .getElementById("popup-pilih-umkm")
        .classList.add("show");
}

function tutupPopupPilihUmkm() {

    document
        .getElementById("popup-pilih-umkm")
        .classList.remove("show");
}


function pilihPopupUmkm(id){
    const umkm = dataUmkm.find(item => item.id === id);
    if(!umkm) return;

    selectedPopupPilihUmkm = umkm;

    /*
    isiDataUmkm(umkm);

    if(!isEditModeStiker){
        getEl("stiker-kode").value = generateKodeStiker(umkm);
    }

     */
    if(callbackPilihUmkm) {
        callbackPilihUmkm(selectedPopupPilihUmkm);
    }

    tutupPopupPilihUmkm();
}

// TABEL UMKM

async function loadTablePopupPilihUmkm(reload = false){

    showLoading("Memuat Data UMKM..");

    try {

        if (reload){
            dataUmkm = await fetchDataUmkm();
        }

        const filtered = getFilterDataPopupPilihUmkm();
        const sorted = getSortedDataPopupPilihUmkm(filtered);
        const paginated = getPaginatedData(sorted, currentPagePopupPilihUmkm, rowsPerPagePopupPilihUmkm)

        renderTabelPopupPilihUmkm(paginated);
        loadPagination(
            "pagination-popup-pilih-umkm",
            filtered.length,
            currentPagePopupPilihUmkm,
            rowsPerPagePopupPilihUmkm,
            changePagePopupPilihUmkm
        );
    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataUmkm = [];
    } finally {
        hideLoading();
    }
}
async function fetchDataUmkm(){
    const response = await fetch(`${BASE_URL_UMKM}/aktif`);

    if(!response.ok) {
        throw new Error ("Gagal mengambil data UMKM");
    }

    return await response.json();
}
function getFilterDataPopupPilihUmkm(){
    return dataUmkm.filter(umkm => {
        const semuaData = `
            ${umkm.namaUsaha}
            ${umkm.namaPemilik}
            ${umkm.dataKategori.kategori}
            ${umkm.noTelpon}
            ${umkm.alamat}
       `.toLowerCase();

        return semuaData.includes(cariKeywordPopupPilihUmkm);
    });
}
function getSortedDataPopupPilihUmkm(data){
    return [...data].sort((a, b) => {
        let valueA = a[sortPopupPilihUmkm];
        let valueB = b[sortPopupPilihUmkm];

        if(sortPopupPilihUmkm === "kategori"){
            valueA = a.dataKategori?.kategori ?? "";
            valueB = b.dataKategori?.kategori ?? "";
        }

        if(typeof valueA === "boolean"){
            valueA = valueA ? 1 : 0
            valueB = valueB ? 1 : 0
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionPopupPilihUmkm === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionPopupPilihUmkm === "asc" ? result : -result;
    })
}
function renderTabelPopupPilihUmkm(data){

    const tbody = getEl("tbody-popup-pilih-umkm");

    tbody.innerHTML = data.map(item =>
        createRowPopupPilihUmkm(item)
    ).join("");

    const selectedRow =
        tbody.querySelector(".selected-row");

    selectedRow?.scrollIntoView({
        block: "center"
    });
}
function createRowPopupPilihUmkm(umkm){

    const selected =
        selectedPopupPilihUmkm &&
        selectedPopupPilihUmkm.id === umkm.id;

    return `
        <tr
            class="pilih-umkm-row ${selected ? "selected-row" : ""}"
            ondblclick="pilihPopupUmkm('${umkm.id}')">
            <td>${umkm.namaUsaha}</td>
            <td>${umkm.namaPemilik}</td>
            <td>${umkm.dataKategori.kategori}</td>
            <td>${umkm.noTelpon}</td>
            <td class="cell-alamat">${umkm.alamat}</td>
        </tr>
    `;
}
async function changePagePopupPilihUmkm(page){

    console.log("Klik halaman:", page);

    const totalPages = Math.ceil(
        getFilterDataPopupPilihUmkm().length /
        rowsPerPagePopupPilihUmkm
    );

    if(page < 1 || page > totalPages) return;

    currentPagePopupPilihUmkm = page;

    await loadTablePopupPilihUmkm();
}
async function sortTablePopupPilihUmkm(field){
    if(sortPopupPilihUmkm === field){
        sortDirectionPopupPilihUmkm = sortDirectionPopupPilihUmkm === "asc" ? "desc" : "asc";
    } else {
        sortPopupPilihUmkm = field;
        sortDirectionPopupPilihUmkm = "asc";
    }

    await loadTablePopupPilihUmkm();
}

window.initPopupPilihUmkm = initPopupPilihUmkm;
window.showPopupPilihUmkm = showPopupPilihUmkm;
window.pilihPopupUmkm = pilihPopupUmkm;
window.changePagePopupPilihUmkm = changePagePopupPilihUmkm;
window.sortTablePopupPilihUmkm = sortTablePopupPilihUmkm;
