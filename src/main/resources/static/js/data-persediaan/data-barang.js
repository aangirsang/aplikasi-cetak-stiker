let currentPageBarang = 1;
let cariDataBarang = "";
const rowsPerPageBarang = 15;

let sortFieldDataBarang = "namaBarang";
let sortDirectionBarang = "asc";

let dataBarang = [];
let selectedBarang = null;

let isEditModeBarang = false;


async function initDataBarang() {
    await loadTabelDataBarang(true);
    await initPopupLoading();
    await initPopupHapus();
    bersihDataBarang();

    getEl("btn-tambah-data-barang").addEventListener("click", () => showPopupBarang());
    getEl("btn-batal-data-barang").addEventListener("click", closePopupBarang);
    getEl("btn-simpan-data-barang").addEventListener("click", () => simpanDataBarang());

    getEl("txt-cari-data-barang").addEventListener("input", async function(){
        cariDataBarang = this.value.trim().toLowerCase();
        currentPageBarang = 1;
        await loadTabelDataBarang();
    });

}
function bersihDataBarang(){

    getEl("popup-data-barang-input").value = ""
    getEl("popup-data-barang-input").focus()
}

// LOAD TABEL
async function loadTabelDataBarang(reload = false) {
    try {
        if(reload) {
            dataBarang = await fetchDataBarang();
        }

        const filtered = getFilterDataBarang();
        const sorted = getSortedDataBarang(filtered);
        const paginated = getPaginatedData(sorted, currentPageBarang, rowsPerPageBarang)

        renderTabelDataBarang(paginated);
        loadPagination("pagination", filtered.length, currentPageBarang, rowsPerPageBarang, changePageBarang);
    } catch(error){
        console.log(error);
        showToast(error, "error")
        dataUmkm = [];
    }

}
async function fetchDataBarang(){
    const response = await fetch(BASE_URL_BARANG);

    if(!response.ok) {
        throw new Error ("Gagal mengambil data!!")
    }

    return await response.json();
}
function getFilterDataBarang(){
    return dataBarang.filter(barang => {
        const semuaData = `
        ${barang.namaBarang}
        ${barang.stokBarang}
        `.toLowerCase();

        return semuaData.includes(cariDataBarang);
    })
}
function getSortedDataBarang(data){
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldDataBarang];
        let valueB = b[sortFieldDataBarang];

        if(typeof valueA === "string") {
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionBarang === "asc"
                ? result
                : -result;
        }

        const result = valueA - valueB;

        return sortDirectionBarang === "asc" ? result : -result;
    });
}
function renderTabelDataBarang(data){
    const tbody = getEl("tbl-body-data-barang")

    tbody.innerHTML = data.map(item =>
        createRowDataBarang(item)
    ).join("");
}
function createRowDataBarang(data){
    return `
        <tr class="barang-row">
            <td>${data.namaBarang}</td>
            <td>${data.stokBarang}</td>
            <td>
                <div class="actions">
                    <button
                        onclick="showPopupBarang('${data.id}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="konfirmasiHapusBarang('${data.id}')">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}
async function changePageBarang(page){
    currentPageBarang = page;
    await loadTabelDataBarang();
}
async function sortTabelBarang(field) {
    if(sortFieldDataBarang === field){
        sortDirectionBarang = sortDirectionBarang === "asc" ? "desc" : "asc";
    } else {
        sortFieldDataBarang = field;
        sortDirectionBarang = "asc";
    }

    await loadTabelDataBarang();
}

// POPUP
function showPopupBarang(id = null){
    const popup = getEl("popup-data-barang")
    const popupTitle = getEl("popup-data-barang-title");

    bersihDataBarang();

    if(id) {
        const barang = dataBarang.find(
            item => String(item.id) === String(id)
        );

        popupTitle.textContent = "Edit Data Barang"
        getEl("popup-data-barang-input").value = barang.namaBarang ?? "";

        isEditModeBarang = true;
        selectedBarang = id;
    } else {
        popupTitle.textContent = "Tambah Data Barang"
        isEditModeBarang = false;
    }

    popup.classList.add("show")
}
function closePopupBarang(){
    getEl("popup-data-barang").classList.remove("show");
}

// CRUD DATA BARANG
function validasiSimpanDataBarang(){
    let valid = true;

    const barang = getEl("popup-data-barang-input")

    if(barang.value === "") {
        tandaiInvalid(barang)
        valid = false;
    }

    if(!valid){
        showToast("Mohon Lengkapi Data!!", "warning");
    }
    return valid;
}
async function simpanDataBarang() {
    if (!validasiSimpanDataBarang()) return;

    const namaBarang = getValue("popup-data-barang-input")

    showLoading(
        isEditModeBarang
            ? "Mengubah Data Pengguna..."
            : "Menyimpan Data Pengguna..."
    );
    try {
        if(isEditModeBarang) {
            const response = await fetch(`${BASE_URL_BARANG}/${selectedBarang}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    namaBarang: namaBarang,
                })
            });
            if(await gagalSimpan(response)) return;
        } else {
            const response = await fetch(`${BASE_URL_BARANG}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    namaBarang: namaBarang
                })
            });
            if(await gagalSimpan(response)) return;
        }

        closePopupBarang();
        bersihDataBarang();
        await loadTabelDataBarang(true);

        showToast("Data Barang berhasil disimpan..", "success");
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
function konfirmasiHapusBarang(id) {
    showPopupHapus({
        title: "Konfirmasi Hapus Data Barang",
        message: "Anda yakin ingin menghapus data ini??",
        onConfirm: async () => {
            await hapusDataBarang(id);
        }
    });
}
async function hapusDataBarang(id) {
    showLoading("Menghapus Data Barang..")
    try {
        const response = await fetch(`${BASE_URL_BARANG}/${id}`, {
            method: "DELETE"
        });
        if (await gagalHapus(response)) return;

        await loadTabelDataBarang(true);
        showToast("Data Barang berhasil dihapus!!", "success");
    } catch (e){
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}

window.initDataBarang = initDataBarang;
window.showPopupBarang = showPopupBarang;
window.konfirmasiHapusBarang = konfirmasiHapusBarang;
window.sortTabelBarang = sortTabelBarang;