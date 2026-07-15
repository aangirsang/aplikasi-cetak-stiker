let selectedBarang = null;

let pathGambarLama = "";
let selectedWebpFile = null;

let isEdit = false;

let currentPagePenyesuaian = 1;
let cariDataPenyesuaian = "";
const rowsPerPagePenyesuaian = 15;

let sortFieldDataPenyesuaian = "tanggal";
let sortDirectionPenyesuaian = "desc";

let dataPenyesuaian = [];
let selectedPenyesuaian = null;

async function initDataPenyesuaian() {
    await initPilihBarang();
    await initPopupHapus();
    await loadTabelDataPenyesuaian(true);

    setDefaultGambar();

    getEl("btn-tambah-data-penyesuaian").addEventListener(
        "click", () => showPopupDataPenyesuaian()
    );

    getEl("btn-popup-data-penyesuaian-batal").addEventListener(
        "click", closePopupDataPenyesuaian
    );

    getEl("btn-popup-data-penyesuaian-simpan").addEventListener(
        "click", () => simpanDataPenyesuaian()
    );

    getEl("btn-popup-data-penyesuaian-barang").addEventListener(
        "click", () => tampilPopupPilihBarang());

    getEl("popup-data-penyesuaian-stok-fisik").addEventListener("input", hitungSelisih);

    getEl("btn-popup-data-penyesuaian-cari-gambar").addEventListener("click", cariGambar);
    getEl("popup-data-penyesuaian-file-input").addEventListener("change", handlePreviewGambar);

    getEl("txt-cari-data-penyesuaian").addEventListener("input", async function(){
        cariDataPenyesuaian = this.value.trim().toLowerCase();
        currentPagePenyesuaian = 1;
        //openedDetailStiker = null;
        await loadTabelDataPenyesuaian();
    });

}

//TABEL DATA
async function loadTabelDataPenyesuaian(reload = false) {
    showLoading("Memuat Data Penyesuaian..");
    try {
        if(reload){
            cariDataPenyesuaian = "";
            dataPenyesuaian = await fetchDataPenyesuaian();
        }

        const filtered = await getFilterDataPenyesuaian();
        const sorted = await getsortedDataPenyesuaian(filtered);
        const paginated = getPaginatedData(sorted, currentPagePenyesuaian, rowsPerPagePenyesuaian)

        renderTabelPenyesuaian(paginated);
        loadPagination(
            "pagination",
            filtered.length,
            currentPagePenyesuaian,
            rowsPerPagePenyesuaian,
            changePagePenyesuaian
        );
    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataPenyesuaian = [];
    } finally {
        hideLoading();
    }
}
async function fetchDataPenyesuaian() {
    const response = await fetch(BASE_URL_PENYESUAIAN);

    if(!response.ok){
        throw new Error("Gagal Memuat Data Penyesuaian!");
    }

    return await response.json();
}
function getFilterDataPenyesuaian() {
    return dataPenyesuaian.filter(penyesuaian => {

        const keyword = cariDataPenyesuaian;
        const tanggal = formatTanggal(penyesuaian.tanggal).toLowerCase();

        return (
            penyesuaian.namaPengguna.toLowerCase().includes(keyword) ||
            tanggal.includes(keyword) ||
            penyesuaian.namaBarang.toLowerCase().includes(keyword) ||
            penyesuaian.stokSistem.toString().includes(keyword) ||
            penyesuaian.stokFisik.toString().includes(keyword) ||
            penyesuaian.selisih.toString().includes(keyword) ||
            penyesuaian.alasan.toLowerCase().includes(keyword)
        );
    });
}
function getsortedDataPenyesuaian(data) {
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldDataPenyesuaian];
        let valueB = b[sortFieldDataPenyesuaian];

        if (sortFieldDataPenyesuaian === "namaBarang") {
            valueA = a.namaBarang ?? ""
            valueB = b.namaBarang ?? ""
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionPenyesuaian === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionPenyesuaian === "asc" ? result : -result;
    })
}
function renderTabelPenyesuaian(data) {
    const tbody = getEl("tbl-body-data-penyesuaian");

    tbody.innerHTML = data.map(item => {
        return createTabelPenyesuaian(item);
    }).join("");
}
function createTabelPenyesuaian(item) {
    return `
        <tr class="penyesuaian-row">
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.namaPengguna}</td>
            <td>${item.namaBarang}</td>
            <td>${item.stokSistem}</td>
            <td>${item.stokFisik}</td>
            <td>${item.selisih}</td>
            <td>${item.alasan}</td>
            <td>
                <div class="actions">
                    <button
                        onclick="event.stopPropagation(); showPopupDataPenyesuaian('${item.id}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="event.stopPropagation(); konfirmasiHapusDataPenyesuaian('${item.id}')">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}
async function sortTabelPenyesuaian(field) {
    if(sortFieldDataPenyesuaian === field) {
        sortDirectionPenyesuaian = sortDirectionPenyesuaian === "asc" ? "desc" : "asc";
    } else {
        sortFieldDataPenyesuaian = field;
        sortDirectionPenyesuaian = "asc";
    }

    await loadTabelDataPenyesuaian();
}
async function changePagePenyesuaian(page){
    currentPagePenyesuaian = page;
    await loadTabelDataPenyesuaian();
}

//POPUP DATA PENYESUAIAN
function showPopupDataPenyesuaian(id = null) {
    const popup = getEl("popup-data-penyesuaian");
    const title = getEl("popup-data-penyesuaian-title");
    const btnBarang = getEl("btn-popup-data-penyesuaian-barang");

    bersihPopupDataPenyesuaian();

    if(id) {
        isEdit = true;

        btnBarang.disabled = true;
        btnBarang.classList.add("btn-disabled");
        title.textContent = "Edit Data Penyesuaian"

        selectedPenyesuaian = dataPenyesuaian.find(item => item.id === id);

        selectedBarang = selectedPenyesuaian.dataBarang;

        console.log(selectedBarang);

        getEl("data-penyesuaian-tanggal").textContent = formatTanggal(selectedPenyesuaian.tanggal)

        pathGambarLama = selectedPenyesuaian.pathGambar ?? "";

        getEl("popup-data-penyesuaian-nama-barang").value = selectedPenyesuaian.namaBarang;

        getEl("popup-data-penyesuaian-stok-sistem").value = selectedPenyesuaian.stokSistem;
        getEl("popup-data-penyesuaian-stok-fisik").value = selectedPenyesuaian.stokFisik;
        getEl("popup-data-penyesuaian-selisih").value = selectedPenyesuaian.selisih;
        getEl("popup-data-penyesuaian-catatan").value = selectedPenyesuaian.alasan;

        // set image
        const previewImage =
            getEl("popup-data-penyesuaian-preview-image");

        showLoading("Memuat Gambar...");

        previewImage.onload = () => {
            hideLoading();
        };

        previewImage.onerror = () => {
            hideLoading();
            previewImage.src = noImageStiker;
        };

        previewImage.src =
            selectedPenyesuaian.pathGambar
                ? `${BASE_URL}${selectedPenyesuaian.pathGambar}`
                : noImageStiker;

        console.log(previewImage.src);
    } else {
        btnBarang.disabled = false;
        btnBarang.classList.remove("btn-disabled");

        title.textContent = "Tambah Data Penyesuaian"
        isEdit = false;
    }

    popup.classList.add("show");
}
function closePopupDataPenyesuaian() {
    getEl("popup-data-penyesuaian").classList.remove("show");
}
function bersihPopupDataPenyesuaian() {
    getEl("data-penyesuaian-tanggal").textContent =
        new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    selectedBarang = null;
    pathGambarLama = "";

    getEl("popup-data-penyesuaian-stok-fisik").value = 0;

    // reset image
    getEl(
        "popup-data-penyesuaian-preview-image"
    ).src = noImageStiker;

    getEl("popup-data-penyesuaian-file-input").value = "";

    [
        "popup-data-penyesuaian-nama-barang",
        "popup-data-penyesuaian-stok-sistem",
        "popup-data-penyesuaian-catatan"
    ].forEach(id => getEl(id).value = "");

    hitungSelisih();
}
async function tampilPopupPilihBarang() {
    bersihPopupDataPenyesuaian();

    await showPopupPilihBarang(async (barang) =>{
        selectedBarang = barang;
        getEl("popup-data-penyesuaian-nama-barang").value = barang.namaBarang;
        getEl("popup-data-penyesuaian-stok-sistem").value = barang.stokBarang;
        getEl("popup-data-penyesuaian-stok-fisik").value = 0;

        hitungSelisih();

    });
}
function hitungSelisih(){
    const stokSistem = getEl("popup-data-penyesuaian-stok-sistem").value
    const stokFisik = getEl("popup-data-penyesuaian-stok-fisik").value

    getEl("popup-data-penyesuaian-selisih").value = stokFisik - stokSistem;
}

//GAMBAR
function setDefaultGambar(){

    const img =
        document.getElementById(
            "popup-data-pengguna-preview-image"
        );

    if(!img) return;

    img.src =
        img.getAttribute("src")
        || noImageStiker;

    img.onerror = () => {
        img.src = noImageStiker;
    };
}
function cariGambar() {
    const input = getEl("popup-data-penyesuaian-file-input");
    input.value = ""; // 🔥 penting biar event selalu trigger
    input.click();
}
async function handlePreviewGambar(event) {

    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        showToast(
            "File harus berupa gambar",
            "warning"
        );

        event.target.value = "";
        return;
    }

    try {

        showLoading("Memuat Gambar...");

        const webpFile =
            await convertToWebp(
                file,
                2048,
                0.8
            );

        selectedWebpFile =
            webpFile;

        const previewImage =
            getEl(
                "popup-data-penyesuaian-preview-image"
            );

        previewImage.onload = () => {
            hideLoading();
        };

        previewImage.src =
            URL.createObjectURL(
                webpFile
            );

        const ukuranAwal =
            (file.size / 1024 / 1024)
                .toFixed(2);

        const ukuranWebp =
            (
                webpFile.size /
                1024 /
                1024
            ).toFixed(2);

        console.log(
            `Asli: ${ukuranAwal} MB`
        );

        console.log(
            `WebP: ${ukuranWebp} MB`
        );

    } catch(error){

        hideLoading();

        showToast(
            "Gagal memproses gambar",
            "error"
        );

        console.error(error);
    }
}
function isGambarBerubah(){

    const fileInput =
        getEl(
            "popup-data-penyesuaian-file-input"
        );

    return fileInput.files.length > 0;
}

//CRUD DATA
function validasiPenyesuaian() {
    let valid = true;
    const selisih = getEl("popup-data-penyesuaian-stok-fisik").value;

    if(selisih <= 0){
        tandaiInvalid(getEl('popup-data-penyesuaian-stok-fisik'));
        valid = false;
    }

    if(!getValue("popup-data-penyesuaian-catatan")) {
        tandaiInvalid(getEl("popup-data-penyesuaian-catatan"));
        valid = false;
    }

    if(!valid){
        showToast("Mohon Lengkapi Data!!", "warning");
    }
    return valid;
}
function konfirmasiHapusDataPenyesuaian(id) {
    showPopupHapus({
        title: "Konfirmasi Hapus Data Penyesuaian",
        message: "Anda yakin ingin menghapus Data Penyesuaian ini?",
        onConfirm: async () => {
            await hapusDataPenyesuaian(id);
        }
    });
}
async function simpanDataPenyesuaian() {
    if (!validasiPenyesuaian()) return;

    const dataBarangId = selectedBarang.id;
    const penggunaId = penggunaAktif.id;
    const stokSistem = selectedBarang.stokBarang;
    const stokFisik = getEl("popup-data-penyesuaian-stok-fisik").value
    const selisih = getEl("popup-data-penyesuaian-selisih").value;
    const alasan = getEl("popup-data-penyesuaian-catatan").value;

    let pathGambar = pathGambarLama;

    if(isGambarBerubah()) {
        pathGambar = await uploadGambarPenyesuaian();
    }

    showLoading(
        isEdit
            ? "Mengubah Data Pengguna..."
            : "Menyimpan Data Pengguna..."
    );

    try {
        if(isEdit){
            const response = await fetch(`${BASE_URL_PENYESUAIAN}/${selectedPenyesuaian.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    dataBarangId: dataBarangId,
                    dataPenggunaId: penggunaId,
                    stokSistem: Number(stokSistem),
                    stokFisik: Number(stokFisik),
                    selisih: Number(selisih),
                    alasan: alasan,
                    pathGambar: pathGambar
                })
            });
            if(await gagalSimpan(response)) return;
        }else{
            const response = await fetch(BASE_URL_PENYESUAIAN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    dataBarangId: dataBarangId,
                    dataPenggunaId: penggunaId,
                    stokSistem: Number(stokSistem),
                    stokFisik: Number(stokFisik),
                    selisih: Number(selisih),
                    alasan: alasan,
                    pathGambar: pathGambar
                })
            });

            if(await gagalSimpan(response)) return
        }

        closePopupDataPenyesuaian();
        bersihPopupDataPenyesuaian();

        await loadTabelDataPenyesuaian(true);

        showToast("Data Berhasil Disimpan!", "success");
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
async function hapusDataPenyesuaian(id) {
    showLoading("Menghapus Data Penyesuaian...");
    try {
        const response = await fetch(`${BASE_URL_PENYESUAIAN}/${id}`, {
            method: "DELETE"
        });

        if (await gagalHapus(response)) return;

        await loadTabelDataPenyesuaian(true);
        showToast("Data penyesuaian berhasil dihapus", "success");
    } catch (e){
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
async function uploadGambarPenyesuaian() {

    if(!selectedWebpFile){
        return "";
    }

    const formData =
        new FormData();

    formData.append(
        "files",
        selectedWebpFile
    );

    const response =
        await fetch(
            BASE_URL_UPLOAD_GAMBAR,
            {
                method: "POST",
                body: formData
            }
        );

    if(!response.ok){
        throw new Error(
            "Gagal upload gambar"
        );
    }

    const result =
        await response.json();

    return result[0]?.path ?? "";
}

window.initDataPenyesuaian = initDataPenyesuaian;
window.sortTabelPenyesuaian = sortTabelPenyesuaian;
window.showPopupDataPenyesuaian = showPopupDataPenyesuaian;
window.konfirmasiHapusDataPenyesuaian = konfirmasiHapusDataPenyesuaian;