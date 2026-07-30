let dataRiwayatStok = []

let cariRiwayatStok = "";
let tanggalAwalRiwayatStok = "";
let tanggalAkhirRiwayatStok = "";
let currentPageRiwayatStok = 1
let rowsPerPageRiwayatStok = 15

let pickerDownload = "";
let tanggalAwalDownloadRiwayatStok = "";
let tanggalAkhirDownloadRiwayatStok = "";

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

    getEl("btn-download-data-riwayat-stok"). addEventListener(
        "click", showPopupDownloadRiwayatStok)

    getEl("btn-popup-download-data-riwayat-stok-batal"). addEventListener(
        "click", closePopupDownloadRiwayatStok)

    getEl("btn-popup-download-data-riwayat-stok-download"). addEventListener(
        "click", downloadDataRiwayatStok)

    getEl("btn-refresh-data-riwayat-stok").addEventListener(
        "click", async () => {
            await loadTabelDataRiwayatStok(true);
            picker.clear();
        });

    const picker = flatpickr("#cari-range-tanggal-data-riwayat-stok", {
        locale: "id",
        mode: "range",
        dateFormat: "d F Y",
        async onClose(selectedDates) {

            if (selectedDates.length === 2) {
                tanggalAwalRiwayatStok = selectedDates[0];
                tanggalAkhirRiwayatStok = selectedDates[1];

                currentPageRiwayatStok = 1;
                await loadTabelDataRiwayatStok();
            }
        }
    });

    pickerDownload = flatpickr("#cari-range-tanggal-download-data-riwayat-stok", {
        locale: "id",
        mode: "range",
        dateFormat: "d F Y",
        async onClose(selectedDates) {

            if (selectedDates.length === 2) {
                tanggalAwalDownloadRiwayatStok = selectedDates[0];
                tanggalAkhirDownloadRiwayatStok = selectedDates[1];
            }
        }
    });
}

// TABEL
async function loadTabelDataRiwayatStok(reload = false) {

    showLoading("Memuat Data..");
    try {
        if(reload) {

            getEl("txt-cari-data-riwayat-stok").value = "";
            getEl("cari-range-tanggal-data-riwayat-stok").value = "";
            cariRiwayatStok = ""
            tanggalAwalRiwayatStok = "";
            tanggalAkhirRiwayatStok = "";

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

        const keyword = cariRiwayatStok;
        const tanggal = formatTanggal(riwayatStok.tanggal).toLowerCase();

        // =====================
        // Filter tanggal
        // =====================

        const tanggalOrder = new Date(riwayatStok.tanggal);
        tanggalOrder.setHours(0, 0, 0, 0);

        let cocokTanggal = true;

        if (tanggalAwalRiwayatStok || tanggalAkhirRiwayatStok) {

            const awal = new Date(tanggalAwalRiwayatStok || tanggalAkhirRiwayatStok);
            awal.setHours(0, 0, 0, 0);

            const akhir = new Date(tanggalAkhirRiwayatStok || tanggalAwalRiwayatStok);
            akhir.setHours(23, 59, 59, 999);

            cocokTanggal =
                tanggalOrder >= awal &&
                tanggalOrder <= akhir;
        }

        // =====================
        // Filter keyword
        // =====================

        const cocokKeyword =
            riwayatStok.namaPengguna.toLowerCase().includes(keyword) ||
            riwayatStok.namaBarang.toLowerCase().includes(keyword) ||
            riwayatStok.jenis.toLowerCase().includes(keyword) ||
            tanggal.includes(keyword) ||
            riwayatStok.saldoAwal.toString().includes(keyword) ||
            riwayatStok.perubahan.toString().includes(keyword) ||
            riwayatStok.saldoAkhir.toString().includes(keyword)


        return cocokKeyword && cocokTanggal;

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

//DOWNLOAD DATA
function showPopupDownloadRiwayatStok(){
    const popup = getEl("popup-download-data-riwayat-stok");

    pickerDownload.clear();
    popup.classList.add("show");
}
function closePopupDownloadRiwayatStok(){
    getEl("popup-download-data-riwayat-stok")
        .classList.remove("show");
}
function getDataRiwayatStok(data, tanggalAwal, tanggalAkhir) {

    let hasilFilter = data;

    // Jika kedua tanggal dipilih, baru lakukan filter
    if (tanggalAwal && tanggalAkhir) {

        const awal = new Date(tanggalAwal);
        awal.setHours(0, 0, 0, 0);

        const akhir = new Date(tanggalAkhir);
        akhir.setHours(23, 59, 59, 999);

        hasilFilter = data.filter(item => {
            const tanggal = new Date(item.tanggal);
            return tanggal >= awal && tanggal <= akhir;
        });
    }

    let csv = "\uFEFF";
    csv += "No,Tanggal,Nama Barang,Jenis Perubahan,Stok Awal,Perubahan Stok,Stok Akhir,Keterangan\n";

    hasilFilter.forEach((item, index) => {

        csv += [
            index + 1,
            formatTanggalDownload(item.tanggal),
            `"${item.namaBarang.replace(/"/g, '""')}"`,
            item.jenis,
            item.saldoAwal,
            item.perubahan,
            item.saldoAkhir,
            item.keterangan
        ].join("|");

        csv += "\n";
    });

    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    // Nama file
    const namaFile = "Data_Riwayat_Stok"
    if (tanggalAwal && tanggalAkhir) {
        a.download = `${namaFile}_${formatTanggalFile(tanggalAwal)}_${formatTanggalFile(tanggalAkhir)}.csv`;
    } else {
        a.download = `${namaFile}_Semua.csv`;
    }

    a.click();

    URL.revokeObjectURL(url);
}
async function downloadDataRiwayatStok(){
    showLoading("Download Data Riwayat Stok...");
    try {
        const data = await fetchDataRiwayatStok()

        getDataRiwayatStok(data, tanggalAwalDownloadRiwayatStok, tanggalAkhirDownloadRiwayatStok)
        closePopupDownloadRiwayatStok();
    } catch (e){
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}

window.initDataRiwayatStok = initDataRiwayatStok;
window.sortTableRiwayatStok = sortTableRiwayatStok;
window.changePageRiwayatStok = changePageRiwayatStok;