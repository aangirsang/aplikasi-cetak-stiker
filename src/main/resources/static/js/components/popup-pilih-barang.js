let currentPagePopupPilihBarang = 1;
const rowsPerPagePopupPilihBarang = 11;
let sortPopupPilihBarang = "namaBarang";
let selectedPopupPilihBarang = null;
let callBackPilihBarang = null;
let cariKeywordPopupPilihBarang = "";
let sortDirectionPopupPilihBarang = "asc";

let dataBarang = [];

async function initPilihBarang() {

    await initPopupLoading();

    // cek agar tidak dimuat dua kali
    if(document.getElementById("popup-pilih-barang")){
        return;
    }

    const response = await fetch(
        "pages/popup/popup-pilih-barang.html"
    );

    const html = await response.text();

    document.body.insertAdjacentHTML(
        "beforeend",
        html
    );

    getEl("cari-popup-pilih-barang").addEventListener("input", async function(){
        cariKeywordPopupPilihBarang = this.value.trim().toLowerCase();
        currentPagePopupPilihBarang = 1;
        await loadTablePopupPilihBarang();
    });

    document
        .getElementById("batal-popup-pilih-barang")
        ?.addEventListener("click", () => {

            console.log("klik batal");

            tutupPopupPilihBarang();
        });
}

async function showPopupPilihBarang(onSelect) {
    callBackPilihBarang = onSelect;

    cariKeywordPopupPilihBarang = "";
    getEl("cari-popup-pilih-barang").value = "";


    await loadTablePopupPilihBarang(true)
    document
        .getElementById("popup-pilih-barang")
        .classList.add("show");
}

function tutupPopupPilihBarang() {

    document
        .getElementById("popup-pilih-barang")
        .classList.remove("show");
}

async function loadTablePopupPilihBarang(reload = false){

    showLoading("Memuat Data Barang..");

    try {

        if (reload){
            dataBarang= await fetchDataPilihBarang();
        }

        const filtered = getFilterDataPopupPilihBarang();
        const sorted = getSortedDataPopupPilihBarang(filtered);
        const paginated = getPaginatedData(sorted, currentPagePopupPilihBarang, rowsPerPagePopupPilihBarang)

        renderTabelPopupPilihBarang(paginated);
        loadPagination(
            "pagination-popup-pilih-barang",
            filtered.length,
            currentPagePopupPilihBarang,
            rowsPerPagePopupPilihBarang,
            changePagePopupPilihBarang
        );
    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataBarang = [];
    } finally {
        hideLoading();
    }
}
async function fetchDataPilihBarang() {
    const response = await fetch(`${BASE_URL_BARANG}`);

    if(!response.ok) {
        throw new Error ("Gagal mengambil data Barang");
    }

    return await response.json();
}
function getFilterDataPopupPilihBarang(){
    return dataBarang.filter(barang => {
        const semuaData = `
            ${barang.namaBarang}
            ${barang.stokBarang}
       `.toLowerCase();

        return semuaData.includes(cariKeywordPopupPilihBarang);
    });
}
function getSortedDataPopupPilihBarang(data){
    return [...data].sort((a, b) => {
        let valueA = a[sortPopupPilihBarang];
        let valueB = b[sortPopupPilihBarang];

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionPopupPilihBarang === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionPopupPilihBarang === "asc" ? result : -result;
    })
}
function renderTabelPopupPilihBarang(data){

    const tbody = getEl("tbody-popup-pilih-barang");

    tbody.innerHTML = data.map(item =>
        createRowPopupPilihBarang(item)
    ).join("");

    const selectedRow =
        tbody.querySelector(".selected-row");

    selectedRow?.scrollIntoView({
        block: "center"
    });
}
function createRowPopupPilihBarang(barang){
    const selected = null;

    return `
        <tr
            class="pilih-barang-row ${selected ? "selected-row" : ""}"
            ondblclick="pilihPopupBarang('${barang.id}')">
            <td>${barang.namaBarang}</td>
            <td>${barang.stokBarang}</td>
        </tr>
    `;
}
async function changePagePopupPilihBarang(page){

    const totalPages = Math.ceil(
        getFilterDataPopupPilihBarang().length /
        rowsPerPagePopupPilihBarang
    );

    if(page < 1 || page > totalPages) return;

    currentPagePopupPilihBarang = page;

    await loadTablePopupPilihBarang();
}
async function sortTablePopupPilihBarang(field){
    if(sortPopupPilihBarang === field){
        sortDirectionPopupPilihBarang = sortDirectionPopupPilihBarang === "asc" ? "desc" : "asc";
    } else {
        sortPopupPilihBarang = field;
        sortDirectionPopupPilihBarang = "asc";
    }

    await loadTablePopupPilihBarang();
}

function pilihPopupBarang(id){
    const barang = dataBarang.find(item => item.id === id);
    if(!barang) return;

    selectedPopupPilihBarang = barang;

    if(callBackPilihBarang) {
        callBackPilihBarang(selectedPopupPilihBarang);
    }

    tutupPopupPilihBarang();
}

window.initPilihBarang = initPilihBarang;
window.showPopupPilihBarang = showPopupPilihBarang;
window.pilihPopupBarang = pilihPopupBarang;
