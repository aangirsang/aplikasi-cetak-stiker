let currentPageStiker = 1;
let cariDataStiker = "";
let rowsPerPageStiker = 12;

let sortFieldDataStiker = "";
let sortDirectionStiker = "";

let dataStiker = [];
let openedDetailStikerId = null;

let selectedStiker = null;
let selectedUmkm = null;


async function initDataStiker() {

    dataStiker = null;

    await initPopupDataStiker();
    await initPopupLoading();
    await loadTabelDataStiker(true);
    await initPopupPilihUmkm();
    await initPopupHapus();
    await initPopupLayoutCetak();

    pasangResizeTabel("tbl-body-data-stiker", {
        siap:        () => !!dataStiker,
        rowsSaatIni: () => rowsPerPageStiker,
        render:      () => renderHalamanStiker()
    });

    getEl("btn-refresh-data-stiker").addEventListener("" +
        "click", () => {
        loadTabelDataStiker(true);
        tombolHapusCari.hidden;
    });

    getEl("btn-tambah-data-stiker").addEventListener("" +
        "click", () => showPopupStiker(null, async () => {
        await loadTabelDataStiker(true);
    })
    );

    getEl("btn-download-data-stiker").addEventListener("" +
        "click", () => downloadDataStiker());

    // CARI STIKER
    getEl("search-stiker").addEventListener("input", async function(){
        cariDataStiker = this.value.trim().toLowerCase();
        currentPageStiker = 1;
        openedDetailStikerId = null;
        await loadTabelDataStiker();
    });

    // Hapus Pencarian
    const inputCariStiker = getEl("search-stiker");
    const tombolHapusCari = getEl("hapus-cari-data-stiker");

    function updateTombolHapusCari() {
        tombolHapusCari.hidden = inputCariStiker.value === "";
    }

    inputCariStiker.addEventListener("input", updateTombolHapusCari);

    tombolHapusCari.addEventListener("click", () => {
        inputCariStiker.value = "";
        inputCariStiker.dispatchEvent(new Event("input", { bubbles: true })); // picu pencarian ulang
        inputCariStiker.focus();
    });

    document.removeEventListener("click", closeDetailStikerOutside);
    document.addEventListener("click", closeDetailStikerOutside);
}

// TABEL DATA STIKER
function renderHalamanStiker(ukurUlang = true) {
    if (!getEl("tbl-body-data-stiker")) return; // halaman sudah ditinggalkan

    const filtered = getFilterDataStiker();
    const sorted   = getsortedDataStiker(filtered);

    rowsPerPageStiker = hitungRowsPerPage("tbl-body-data-stiker");

    // jaga agar halaman tidak melebihi total halaman
    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPageStiker));
    if (currentPageStiker > totalPages) currentPageStiker = totalPages;

    const paginated = getPaginatedData(sorted, currentPageStiker, rowsPerPageStiker);

    renderTabelStiker(paginated);
    loadPagination("pagination", filtered.length, currentPageStiker, rowsPerPageStiker, changePageStiker);

    // baris asli sudah ada, cek apakah ukurannya beda dari perkiraan
    if (ukurUlang && hitungRowsPerPage("tbl-body-data-stiker") !== rowsPerPageStiker) {
        renderHalamanStiker(false);
    }
}
async function loadTabelDataStiker(reload = false) {
    // loading hanya saat ambil data; sort, filter, dan ganti halaman cukup lokal
    if (reload) showLoading("Memuat Data Stiker..");

    try {
        if (reload) {
            dataStiker = await fetchDataStiker();

            dataStiker.sort((a, b) => {
                const usaha = a.namaUsaha.localeCompare(b.namaUsaha, "id", { sensitivity: "base" });
                if (usaha !== 0) return usaha;

                if (a.status !== b.status) return b.status - a.status;

                return a.kodeStiker.localeCompare(b.kodeStiker, "id", {
                    numeric: true,
                    sensitivity: "base"
                });
            });
            cariDataStiker = "";

            const cari = getEl("search-stiker");
            cari.value = "";
            cari.focus();
        }

        renderHalamanStiker();

    } catch (error) {
        console.error(error);
        showToast(error.message, "error"); // pakai .message, bukan objek error
        dataStiker = [];
    } finally {
        if (reload) hideLoading();
    }
}
async function fetchDataStiker() {
    const response = await apiFetch(BASE_URL_STIKER);

    if(!response.ok){
        throw new Error("Gagal Memuat Data Stiker!");
    }

    return await response.json();
}
function getFilterDataStiker() {
    return dataStiker.filter(stiker => {
        const semuaData = `
            ${stiker.kodeStiker}
            ${stiker.namaUsaha}
            ${stiker.namaStiker}
            ${stiker.ukuran}
            ${stiker.status ? "aktif" : "non-aktif"}
        `.toLowerCase();

        return semuaData.includes(cariDataStiker);
    });
}
function getsortedDataStiker(data) {
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldDataStiker];
        let valueB = b[sortFieldDataStiker];

        if (sortFieldDataStiker === "namaUsaha") {
            valueA = a.dataUmkm?.namaUsaha ?? ""
            valueB = b.dataUmkm?.namaUsaha ?? ""
        }

        if(typeof valueA === "boolean"){
            valueA = valueA ? 1 : 0
            valueB = valueB ? 1 : 0
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionStiker === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionStiker === "asc" ? result : -result;
    })
}
function renderTabelStiker(data) {
    const tbody = getEl("tbl-body-data-stiker");
    if (!tbody) return;

    tbody.innerHTML = data.map(item => {
        const isOpened = openedDetailStikerId === item.id;
        return createTabelStiker(item, isOpened);
    }).join("");
}
function createTabelStiker(item, isOpened) {
    return `
        <tr 
            class="stiker-row ${isOpened ? 'selected' : ''}"
            onclick="event.stopPropagation(); toggleDetailStiker('${item.id}')"
        >
            <td>${item.kodeStiker}</td>
            <td>${item.namaUsaha}</td>
            <td>${item.namaStiker}</td>
            <td>${item.ukuran}</td>
            <td>${item.status ? "aktif" : "non-aktif"}</td>
            <td>
                <div class="actions">
                    <button
                        onclick="event.stopPropagation(); cetakTIFF('${item.id}')">
                        <span class="material-symbols-sharp">picture_as_pdf</span>
                    </button>

                    <button
                        onclick="event.stopPropagation(); editData('${item.id}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="event.stopPropagation(); konfirmasiHapusDataStiker('${item.id}')">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </td>
        </tr>
        
        <!-- DETAIL -->
        <tr class="detail-table ${isOpened ? "show" : ""}">
            <td colspan="6">
                <div class="detail-content">
                    <table class="detail-horizontal-table">
                        <thead>
                            <tr>
                                <th>Nama Pemilik</th>
                                <th>WhatsApp</th>
                                <th>Facebook</th>
                                <th>Instagram</th>
                                <th>Alamat</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${item.namaPemilik ?? "-"}</td>
                                <td>${item.whatsapp ?? "-"}</td>
                                <td>${item.facebook ?? "-"}</td>
                                <td>${item.instagram ?? "-"}</td>
                                <td class="cell-panjang">${item.alamat ?? "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </td>
        </tr>
    `
}
async function sortTableStiker(field) {
    if(sortFieldDataStiker === field) {
        sortDirectionStiker = sortDirectionStiker === "asc" ? "desc" : "asc";
    } else {
        sortFieldDataStiker = field;
        sortDirectionStiker = "asc";
    }

    await loadTabelDataStiker();
}

//  DETAIL DATA STIKER
async function toggleDetailStiker(id) {
    openedDetailStikerId = openedDetailStikerId === id ? null : id;

    await loadTabelDataStiker();

    setTimeout(() => {
        document.querySelector(".detail-table.show")?.scrollIntoView({
            behavior:"smooth",
            block:"nearest"
        });
    }, 50);
}
async function closeDetailStikerOutside(event){
    if(event.target.closest(".stiker-row, .detail-table")) return;
    if(openedDetailStikerId === null) return;

    openedDetailStikerId = null;
    await loadTabelDataStiker();
}
async function changePageStiker(page){

    openedDetailStikerId = null;

    currentPageStiker = page;

    await loadTabelDataStiker();
}
async function destroyDataStiker() {

    // Hapus event listener
    document.removeEventListener(
        "click",
        closeDetailStikerOutside
    );

    // Reset state
    openedDetailStikerId = null;
    selectedStiker = null;
    selectedUmkm = null;

}

// CRUD
async function refreshDataStikerById(id) {
    const response = await apiFetch(`${BASE_URL_STIKER}/${id}`);

    if (!response.ok) {
        throw new Error("Gagal mengambil data stiker terbaru");
    }

    const updatedData = await response.json();

    const index = dataStiker.findIndex(
        item => item.id === id
    );

    if (index !== -1) {
        dataStiker[index] = updatedData;
    }
}
async function editData(id) {
    await showPopupStiker(id, async (savedId) => {
        await refreshDataStikerById(savedId);
        await loadTabelDataStiker();
    });
}
function konfirmasiHapusDataStiker(id) {
    showPopupHapus({
        title: "Konfirmasi Hapus Data Stiker",
        message: "Anda yakin ingin menghapus Data Stiker ini?",
        onConfirm: async () => {
            await hapusDataStiker(id);
        }
    });
}
async function hapusDataStiker(id) {
    showLoading("Menghapus Data Stiker...");
    try {
        const response = await apiFetch(`${BASE_URL_STIKER}/${id}`, {
            method: "DELETE"
        });

        if (await gagalHapus(response)) return;

        await loadTabelDataStiker(true);
        showToast("Data stiker berhasil dirubah", "success");
    } catch (e){
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}


// DOWNLOAD DATA
async function downloadDataStiker() {
    const data = await fetchDataStiker();

    const sortedData = [...data].sort((a, b) =>
        a.kodeStiker.localeCompare(b.kodeStiker, undefined, {
            numeric: true,
            sensitivity: "base"
        })
    );

    const header = [
        "No",
        "Kode Stiker",
        "Nama Usaha",
        "Nama Stiker",
        "Ukuran Panjang",
        "Ukuran Lebar",
        "Status"
    ];

    const rows = sortedData.map((item, index) => [
        index + 1,
        item.kodeStiker,
        item.namaUsaha,
        item.namaStiker,
        formatAngkaDownload(item.panjang),
        formatAngkaDownload(item.lebar),
        item.status ? "aktif" : "non-aktif"
    ]);

    const csv = [
        header,
        ...rows
    ]
        .map(row => row.join("|"))
        .join("\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        {type: "text/csv;charset=utf-8;"}
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Data_Stiker.csv";
    a.click();

    URL.revokeObjectURL(url);
}

window.destroyDataStiker = destroyDataStiker;
window.initDataStiker = initDataStiker;
window.toggleDetailStiker = toggleDetailStiker;
window.konfirmasiHapusDataStiker = konfirmasiHapusDataStiker;
window.sortTableStiker = sortTableStiker;
window.editData = editData;
window.refreshDataStikerById = refreshDataStikerById;