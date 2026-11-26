let callbackPilihUmkm = null;

let currentPagePopupPilihUmkm = 1;
const rowsPerPagePopupPilihUmkm = 11;
let sortPopupPilihUmkm = "namaPemilik";
let selectedPopupPilihUmkm = null;
let cariKeywordPopupPilihUmkm = "";
let sortDirectionPopupPilihUmkm = "asc";

let idUmkm = "";
let selectedUmkm = null;

let adaStiker = false;

let dataUmkm = [];

async function initPopupPilihUmkm() {

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

    getEl("batal-popup-pilih-umkm")
        .addEventListener("click", () => {
            tutupPopupPilihUmkm();
        });

    getEl("btn-pilih-umkm")
        .addEventListener("click", () => {
            pilihPopupUmkm(idUmkm);
        })

    // Hapus Pencarian
    const inputCariUmkm = getEl("cari-popup-pilih-umkm");
    const tombolHapusCari = getEl("hapus-cari-popup-pilih-umkm");

    function updateTombolHapusCari() {
        tombolHapusCari.hidden = inputCariUmkm.value === "";
    }

    inputCariUmkm.addEventListener("input", updateTombolHapusCari);

    tombolHapusCari.addEventListener("click", () => {
        inputCariUmkm.value = "";
        inputCariUmkm.dispatchEvent(new Event("input", { bubbles: true })); // picu pencarian ulang
        inputCariUmkm.focus();
    });

}

async function showPopupPilihUmkm(stiker= false, onSelect, selectedUmkm = null) {

    callbackPilihUmkm = onSelect;

    selectedPopupPilihUmkm = selectedUmkm;

    adaStiker = stiker;
    idUmkm = "";

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


    setTimeout(() => {
        const input = getEl("cari-popup-pilih-umkm");
        input.focus();
        input.select();
    }, 50);
}
function tutupPopupPilihUmkm() {

    document
        .getElementById("popup-pilih-umkm")
        .classList.remove("show");
}
function pilihPopupUmkm(id){
    if(!id) {
        return showToast("Silahkan pilih data UMKM terlebih dahulu", "warning");
    }
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

function klikTabelPilihUmkm(id) {
    idUmkm = id;

    // hapus selected-row dari semua baris
    document.querySelectorAll('.pilih-umkm-row').forEach(row => {
        row.classList.remove('selected-row');
    });

    // tambahkan ke baris yang diklik
    const row = document.querySelector(`.pilih-umkm-row[data-id="${id}"]`);
    if (row) {
        row.classList.add('selected-row');
    }
}

// TABEL UMKM

async function loadTablePopupPilihUmkm(reload = false){

    await showLoading("Memuat Data UMKM..");

    try {

        if (reload && adaStiker){
            dataUmkm = await fetchDataUmkmPunyaStiker();
        }

        if (reload && !adaStiker){
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
        await hideLoading();
    }
}
async function fetchDataUmkm(){
    const response = await apiFetch(`${BASE_URL_UMKM}/aktif`);

    if(!response.ok) {
        throw new Error ("Gagal mengambil data UMKM");
    }

    return await response.json();
}
async function fetchDataUmkmPunyaStiker(){
    const response = await apiFetch(`${BASE_URL_UMKM}/punya-stiker`);

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
            ${umkm.kategori}
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
    return `
        <tr
            class="pilih-umkm-row"
            data-id="${umkm.id}"
            onclick="klikTabelPilihUmkm('${umkm.id}')"
            ondblclick="pilihPopupUmkm('${umkm.id}')">
            <td>${umkm.namaUsaha}</td>
            <td>${umkm.namaPemilik}</td>
            <td>${umkm.kategori}</td>
            <td>${umkm.noTelpon}</td>
            <td class="cell-alamat">${umkm.alamat}</td>
        </tr>
    `;
}
async function changePagePopupPilihUmkm(page){

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
window.klikTabelPilihUmkm = klikTabelPilihUmkm;
window.pilihPopupUmkm = pilihPopupUmkm;
window.changePagePopupPilihUmkm = changePagePopupPilihUmkm;
window.sortTablePopupPilihUmkm = sortTablePopupPilihUmkm;
