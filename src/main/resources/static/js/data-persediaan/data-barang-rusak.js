let pathGambarLama = "";
let selectedWebpFile = null;

let isEdit = false;

let currentPageBarangRusak = 1;
let cariDataBarangRusak = "";
let tanggalAwalBarangRusak = "";
let tanggalAkhirBarangRusak = "";
const rowsPerPageBarangRusak = 15;

let tanggalAwalDownloadBarangRusak = "";
let tanggalAkhirDownloadBarangRusak = "";
let pickerDownload = "";

let sortFieldDataBarangRusak = "tanggal";
let sortDirectionBarangRusak = "desc";

let dataBarangRusak = [];
let selectedBarangRusak = null;
let selectedBarang = null;

async function initDataBarangRusak() {
    await initPilihBarang();
    await initPopupHapus()
    await loadTabelDataBarangRusak(true);

    setDefaultGambarBarangRusak();

    getEl("btn-tambah-data-barang-rusak")
        .addEventListener("click", () => showPopupDataBarangRusak());

    getEl("btn-popup-barang-rusak-batal")
        .addEventListener("click", () => closePopupDataBarangRusak());

    getEl("btn-popup-barang-rusak-simpan")
        .addEventListener("click", () => simpanDataBarangRusak());

    getEl("btn-popup-barang-rusak-cari-gambar")
        .addEventListener("click", cariGambar);

    getEl("popup-barang-rusak-file-input")
        .addEventListener("change", handlePreviewGambar);

    const picker = flatpickr("#cari-range-tanggal-data-barang-rusak", {
        locale: "id",
        mode: "range",
        dateFormat: "d F Y",
        async onClose(selectedDates) {

            if (selectedDates.length === 2) {
                tanggalAwalBarangRusak = selectedDates[0];
                tanggalAkhirBarangRusak  = selectedDates[1];

                currentPageBarangRusak  = 1;
                //await loadTabelDataBarangRusak();
            }
        }
    });
}
//TABEL DATA
async function loadTabelDataBarangRusak(reload = false) {
    await showLoading("Memuat Data Barang Rusak..");
    try {
        if(reload){
            getEl("cari-range-tanggal-data-barang-rusak").value = "";
            cariDataBarangRusak = "";
            tanggalAwalBarangRusak = "";
            tanggalAkhirBarangRusak = "";
            dataBarangRusak = await fetchDataBarangRusak();
        }

        const filtered = await getFilterDataBarangRusak();
        const sorted = await getsortedDataBarangRusak(filtered);
        const paginated = getPaginatedData(sorted, currentPageBarangRusak, rowsPerPageBarangRusak)

        renderTabelBarangRusak(paginated);
        loadPagination(
            "pagination",
            filtered.length,
            currentPageBarangRusak,
            rowsPerPageBarangRusak,
            changePageBarangRusak
        );
    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataBarangRusak = [];
    } finally {
        await hideLoading();
    }
}
async function fetchDataBarangRusak() {
    const response = await apiFetch(BASE_URL_BARANG_RUSAK);

    if(!response.ok){
        throw new Error("Gagal Memuat Data Barang Rusak!");
    }

    return await response.json();
}
function getFilterDataBarangRusak() {
    return dataBarangRusak.filter(barangRusak => {

        const keyword = cariDataBarangRusak;
        const tanggal = formatTanggal(barangRusak.tanggal).toLowerCase();

        // =====================
        // Filter tanggal
        // =====================

        const tanggalInput = new Date(barangRusak.tanggal);
        tanggalInput.setHours(0, 0, 0, 0);

        let cocokTanggal = true;

        if (tanggalAwalBarangRusak || tanggalAkhirBarangRusak) {

            const awal = new Date(tanggalAwalBarangRusak || tanggalAkhirBarangRusak);
            awal.setHours(0, 0, 0, 0);

            const akhir = new Date(tanggalAkhirBarangRusak || tanggalAwalBarangRusak);
            akhir.setHours(23, 59, 59, 999);

            cocokTanggal =
                tanggalInput >= awal &&
                tanggalInput <= akhir;
        }

        // =====================
        // Filter keyword
        // =====================

        const cocokKeyword =
            barangRusak.namaPengguna.toLowerCase().includes(keyword) ||
            tanggal.includes(keyword) ||
            barangRusak.namaBarang.toLowerCase().includes(keyword) ||
            barangRusak.catatan.toLowerCase().includes(keyword) ||
            barangRusak.jumlah.toString().includes(keyword)

        return cocokKeyword && cocokTanggal;
    });
}
function getsortedDataBarangRusak(data) {
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldDataBarangRusak];
        let valueB = b[sortFieldDataBarangRusak];

        if (sortFieldDataBarangRusak === "namaBarang") {
            valueA = a.namaBarang ?? ""
            valueB = b.namaBarang ?? ""
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionBarangRusak === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionBarangRusak === "asc" ? result : -result;
    })
}
function renderTabelBarangRusak(data) {
    const tbody = getEl("tbl-body-data-barang-rusak");

    tbody.innerHTML = data.map(item => {
        return createTabelBarangRusak(item);
    }).join("");
}
function createTabelBarangRusak(item) {
    return `
        <tr class="barang-rusak-row">
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.namaPengguna}</td>
            <td>${item.namaBarang}</td>
            <td>${item.jumlah}</td>
            <td>${item.catatan}</td>
            <td>
                <div class="actions">
                    <button
                        onclick="event.stopPropagation(); showPopupDataBarangRusak('${item.id}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="event.stopPropagation(); konfirmasiHapusBarangRusak('${item.id}')">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}
async function sortTabelBarangRusak(field) {
    if(sortFieldDataBarangRusak === field) {
        sortDirectionBarangRusak = sortDirectionBarangRusak === "asc" ? "desc" : "asc";
    } else {
        sortFieldDataBarangRusak = field;
        sortDirectionBarangRusak = "asc";
    }

    await loadTabelDataBarangRusak();
}
async function changePageBarangRusak(page){
    currentPageBarangRusak = page;
    await loadTabelDataBarangRusak();
}

//POPUP DATA PENYESUAIAN
async function showPopupDataBarangRusak(id = null) {
    const popup = getEl("popup-barang-rusak");
    const title = getEl("popup-barang-rusak-title");

    bersihPopupDataBarangRusak();

    if(id) {
        isEdit = true;
        title.textContent = "Edit Data Barang Rusak";

        selectedBarangRusak = dataBarangRusak.find(item => item.id === id);

        selectedBarang = {
            id: selectedBarangRusak.idBarang,
            namaBarang: selectedBarangRusak.namaBarang,
        }

        getEl("popup-barang-rusak-tanggal").textContent = formatTanggal(selectedBarangRusak.tanggal);
        getEl("popup-barang-rusak-nama-barang")
            .value = selectedBarang.namaBarang;

        getEl("popup-barang-rusak-jumlah")
            .value = selectedBarangRusak.jumlah;

        getEl("popup-barang-rusak-catatan")
            .value = selectedBarangRusak.catatan;

        // set image
        pathGambarLama = selectedBarangRusak.pathGambar ?? "";

        const previewImage =
            getEl("popup-barang-rusak-preview-image");

        await showLoading("Memuat Gambar...");

        previewImage.onload = () => {
            hideLoading();
        };

        previewImage.onerror = () => {
            hideLoading();
            previewImage.src = noImageStiker;
        };

        previewImage.src =
            selectedBarangRusak.pathGambar
                ? `${BASE_URL}${selectedBarangRusak.pathGambar}`
                : noImageStiker;
    } else {

        title.textContent = "Tambah Data Barang Rusak"
        isEdit = false;

        await showPopupPilihBarang(async (barang) => {
            selectedBarang = barang;
            getEl("popup-barang-rusak-nama-barang").value = selectedBarang.namaBarang;

            popup.classList.add("show");
        });
        return;
    }


    popup.classList.add("show");
}
function closePopupDataBarangRusak() {
    getEl("popup-barang-rusak").classList.remove("show");
}
function bersihPopupDataBarangRusak() {
    getEl("popup-barang-rusak-tanggal").textContent =
        new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    selectedBarang = null;
    pathGambarLama = "";

    getEl("popup-barang-rusak-jumlah").value = 0;

    // reset image
    getEl(
        "popup-barang-rusak-preview-image"
    ).src = noImageStiker;

    getEl("popup-barang-rusak-file-input").value = "";

    [
        "popup-barang-rusak-nama-barang",
        "popup-barang-rusak-catatan"
    ].forEach(id => getEl(id).value = "");
}

//CRUD DATA
function validasiBarangRusak() {
    let valid = true;
    const jumlah = getEl("popup-barang-rusak-jumlah").value;

    if(jumlah <= 0){
        tandaiInvalid(getEl('popup-barang-rusak-jumlah'));
        valid = false;
    }

    if(!getValue("popup-barang-rusak-catatan")) {
        tandaiInvalid(getEl("popup-barang-rusak-catatan"));
        valid = false;
    }

    if(!valid){
        showToast("Mohon Lengkapi Data!!", "warning");
    }
    return valid;
}
function konfirmasiHapusBarangRusak(id) {
    showPopupHapus({
        title: "Konfirmasi Hapus Data Barang Rusak",
        message: "Anda yakin ingin menghapus Data Barang Rusak ini?",
        onConfirm: async () => {
            await hapusDataBarangRusak(id);
        }
    });
}
async function simpanDataBarangRusak() {
    if (!validasiBarangRusak()) return;

    const dataBarangId = selectedBarang.id;
    const penggunaId = penggunaAktif.id;
    const jumlah = getEl("popup-barang-rusak-jumlah").value;
    const alasan = getEl("popup-barang-rusak-catatan").value;

    let pathGambar = pathGambarLama;

    if(isGambarBerubah()) {
        pathGambar = await uploadGambarBarangRusak();
    }

    console.log(isEdit);
    console.log(selectedBarangRusak);

    await showLoading(
        isEdit
            ? "Mengubah Data Barang Rusak..."
            : "Menyimpan Data Barang Rusak..."
    );

    try {
        const body = {
            idBarang: dataBarangId,
            idPengguna: penggunaId,
            jumlah: Number(jumlah),
            catatan: alasan,
            pathGambar: pathGambar
        }
        if(isEdit){
            const response = await apiFetch(`${BASE_URL_BARANG_RUSAK}/${selectedBarangRusak.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            });

            console.log(body);
            if(await gagalSimpan(response)) return;

            showToast("Data Berhasil Diubah!", "success");
        }else{
            const response = await apiFetch(BASE_URL_BARANG_RUSAK, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if(await gagalSimpan(response)) return

            showToast("Data Berhasil Disimpan!", "success");
        }

        closePopupDataBarangRusak();
        bersihPopupDataBarangRusak();

        await loadTabelDataBarangRusak(true);
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        await hideLoading();
    }
}
async function hapusDataBarangRusak(id) {
    await showLoading("Menghapus Data Penyesuaian...");
    try {
        const response = await apiFetch(`${BASE_URL_BARANG_RUSAK}/${id}`, {
            method: "DELETE"
        });

        if (await gagalHapus(response)) return;

        await loadTabelDataBarangRusak(true);
        showToast("Data barang rusak berhasil dihapus", "success");
    } catch (e){
        showToast(e.message, "error");
    } finally {
        await hideLoading();
    }
}
async function uploadGambarBarangRusak() {

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
        await apiFetch(
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

//GAMBAR
function setDefaultGambarBarangRusak(){

    const img =
        document.getElementById(
            "popup-barang-rusak-preview-image"
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
    const input = getEl("popup-barang-rusak-file-input");
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

        await showLoading("Memuat Gambar...");

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
                "popup-barang-rusak-preview-image"
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

    } catch(error){

        await hideLoading();

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
            "popup-barang-rusak-file-input"
        );

    return fileInput.files.length > 0;
}

window.initDataBarangRusak = initDataBarangRusak
window.sortTabelBarangRusak = sortTabelBarangRusak
window.showPopupDataBarangRusak = showPopupDataBarangRusak
window.konfirmasiHapusBarangRusak = konfirmasiHapusBarangRusak