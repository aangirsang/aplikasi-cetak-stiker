let dataRiwayatStok = []

let cariRiwayatStok = "";
let currentPageRiwayatStok = 1
let rowsPerPageRiwayatStok = 15

let sortFieldRiwayatStok = "tanggal";
let sortDirectionRiwayatStok = "desc";

async function initDataRiwayatStok() {

    await initPopupLoading();
    await loadTabelDataRiwayatStok(true);

    getEl("txt-cari-data-riwayat-stok").addEventListener("input", async function(){
        cariRiwayatStok = this.value.trim().toLowerCase();
        currentPageRiwayatStok = 1;
        //openedDetailStiker = null;
        await loadTabelDataRiwayatStok();
    });
}

// TABEL
async function loadTabelDataRiwayatStok(reload = false) {
    showLoading("Memuat Data..");
    try {
        if(reload) {
            dataRiwayatStok = await fetchDataRiwayatStok();
        }

        const filtered = await getFilterDataRiwayatStok();
        const sorted = await getsortedDataRiwayatStok(filtered);
        const paginated = getPaginatedData(sorted, currentPageRiwayatStok, rowsPerPageRiwayatStok)

        renderTabelRiwayatStok(paginated);
        loadPagination(
            "pagination",
            filtered.length,
            currentPageRiwayatStok,
            rowsPerPageRiwayatStok,
            changePageRiwayatStok
        );
    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataRiwayatStok = [];
    } finally {
        hideLoading();
    }
}
async function fetchDataRiwayatStok() {
    const response = await fetch(BASE_URL_RIWAYAT);

    if(!response.ok){
        throw new Error("Gagal Memuat Data!!");
    }

    return await response.json();
}
function getFilterDataRiwayatStok() {
    return dataRiwayatStok.filter(riwayatStok => {
        const semuaData = `
            ${riwayatStok.tanggal}
            ${riwayatStok.namaPengguna}
            ${riwayatStok.namaBarang}
            ${riwayatStok.jenis}
            ${riwayatStok.saldoAwal}
            ${riwayatStok.perubahan}
            ${riwayatStok.saldoAkhir}
        `.toLowerCase();

        return semuaData.includes(cariRiwayatStok);
    });
}
function getsortedDataRiwayatStok(data) {
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldRiwayatStok];
        let valueB = b[sortFieldRiwayatStok];

        if (sortFieldRiwayatStok === "tanggal") {
            valueA = a.tanggal ?? ""
            valueB = b.tanggal ?? ""
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionRiwayatStok === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionRiwayatStok === "asc" ? result : -result;
    })
}
function renderTabelRiwayatStok(data) {
    const tbody = getEl("tbl-body-data-riwayat-stok");

    tbody.innerHTML = data.map(item => {
        return createTabelRiwayatStok(item);
    }).join("");
}
function createTabelRiwayatStok(item) {
    return `
        <tr class="data-riwayat-row">
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.namaPengguna}</td>
            <td>${item.namaBarang}</td>
            <td>${item.jenis}</td>
            <td>${item.saldoAwal}</td>
            <td>${item.perubahan}</td>
            <td>${item.saldoAkhir}</td>
            <td>
                <div class="actions">
                    <button
                        onclick="event.stopPropagation(); showPopupDataRiwayat(${item.id})">
                        <span class="material-symbols-sharp">eye_tracking</span>
                    </button>
                </div>
            </td>
        </tr>
    `
}
async function changePageRiwayatStok(page){
    currentPageRiwayatStok = page;
    await loadTabelDataRiwayatStok();
}
async function sortTableRiwayatStok(field){
    if(sortFieldRiwayatStok === field){
        sortDirectionRiwayatStok = sortDirectionRiwayatStok === "asc" ? "desc" : "asc";
    } else {
        sortFieldRiwayatStok = field;
        sortDirectionRiwayatStok = "asc";
    }

    await loadTabelDataRiwayatStok();
}


window.initDataRiwayatStok = initDataRiwayatStok;
window.sortTableRiwayatStok = sortTableRiwayatStok;
window.changePageRiwayatStok = changePageRiwayatStok;