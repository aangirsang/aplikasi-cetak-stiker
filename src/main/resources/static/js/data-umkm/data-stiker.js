let currentPageStiker = 1;
let cariDataStiker = "";
const rowsPerPageStiker = 15;

let sortFieldDataStiker = "namaStiker";
let sortDirectionStiker = "asc";

let dataStiker = [];
let selectedStiker = null;
let selectedUmkm = null;

let isEditModeStiker = false;
let openedDetailStikerId = null;


let selectedWebpFiles = {
    1: null,
    2: null
};

let pathGambarLama = {
    1: "",
    2: ""
};

async function initDataStiker() {
    setDefaultGambarStiker(1);
    setDefaultGambarStiker(2);
    await initPopupLoading();
    await initPopupLihatGambar();
    await loadTabelDataStiker();
    await initPopupPilihUmkm();
    await initPopupHapus();

    getEl("btn-tambah-data-stiker").addEventListener("" +
        "click", () => showPopupStiker());

    getEl("btn-popup-data-stiker-batal").addEventListener(
        "click", tutupPopupStiker);

    getEl("btn-popup-data-stiker-cari-umkm").addEventListener(
        "click", () => tampilPopupPilihUmkm());

    getEl("btn-popup-data-stiker-simpan").addEventListener(
        "click", () => simpanDataStiker());

    // GAMBAR
    getEl("popup-data-stiker-file-input-1")
        .addEventListener("change", (event) => handlePreviewGambar(event, 1));
    getEl("popup-data-stiker-file-input-2")
        .addEventListener("change", (event) => handlePreviewGambar(event, 2));

    document.removeEventListener("click", closeDetailStikerOutside);
    document.addEventListener("click", closeDetailStikerOutside);

}

// TABEL DATA STIKER
async function loadTabelDataStiker() {
    showLoading("Memuat Data Stiker..");
    try {
        dataStiker = await fetchDataStiker();

        const filtered = await getFilterDataStiker();
        const sorted = await getsortedDataStiker(filtered);
        const paginated = getPaginatedData(sorted, currentPageStiker, rowsPerPageStiker)

        renderTabelStiker(paginated);
        loadPagination(
            "pagination",
            filtered.length,
            currentPageStiker,
            rowsPerPageStiker,
            changePageStiker
        );
    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataStiker = [];
    } finally {
        hideLoading();
    }
}
async function fetchDataStiker() {
    const response = await fetch(BASE_URL_STIKER);

    if(!response.ok){
        throw new Error("Gagal Memuat Data Stiker!");
    }

    return await response.json();
}
function getFilterDataStiker() {
    return dataStiker.filter(stiker => {
        const semuaData = `
            ${stiker.kodeStiker}
            ${stiker.dataUmkm.namaUsaha}
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

    tbody.innerHTML = data.map(item => {
        const umkm = item.dataUmkm
        const isOpened = openedDetailStikerId === item.id;

        return createTabelStiker(item, umkm, isOpened);
    }).join("");
}
function createTabelStiker(item, umkm, isOpened) {
    return `
        <tr 
            class="stiker-row ${isOpened ? 'selected' : ''}"
            onclick="event.stopPropagation(); toggleDetailStiker(${item.id})"
        >
            <td>${item.kodeStiker}</td>
            <td>${item.dataUmkm.namaUsaha}</td>
            <td>${item.namaStiker}</td>
            <td>${item.ukuran}</td>
            <td>${item.status ? "aktif" : "non-aktif"}</td>
            <td>
                <div class="actions">
                    <button
                        onclick="event.stopPropagation(); showPopupStiker(${item.id})">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="event.stopPropagation(); konfirmasiHapusDataStiker(${item.id})">
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
                                <td>${umkm.namaPemilik ?? "-"}</td>
                                <td>${umkm.whatsapp ?? "-"}</td>
                                <td>${umkm.facebook ?? "-"}</td>
                                <td>${umkm.instagram ?? "-"}</td>
                                <td class="cell-panjang">${umkm.alamat ?? "-"}</td>
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

// POPUP
function showPopupStiker(id = null){

    const popup = getEl("popup-data-stiker");
    const btnCari = getEl("btn-popup-data-stiker-cari-umkm");
    const popupTitle = getEl("popup-data-stiker-title");

    bersihPopupDataStiker();

    if(id === null){
        isEditModeStiker = false;

        btnCari.disabled = false;
        btnCari.classList.remove("btn-disabled");

        popupTitle.textContent = "Tambah Data Stiker";

        popup.classList.add("show");
        return;
    } else {

        isEditModeStiker = true;

        btnCari.disabled = true;
        btnCari.classList.add("btn-disabled");

        popupTitle.textContent = "Edit Data Stiker";

        selectedStiker = dataStiker.find(item => item.id === id);

        //isiDataUmkm(selectedCariUmkm);
        isiDataStiker(selectedStiker);
    }


    popup.classList.add("show");
}
function isiDataStiker(stiker) {
    showLoading("Memuat Data Stiker...");

    const umkm = stiker.dataUmkm;

    selectedUmkm = umkm;
    pathGambarLama[1] = stiker.pathGambar1 ?? "";
    pathGambarLama[2] = stiker.pathGambar2 ?? "";

    getEl("popup-data-stiker-nama-usaha").value = umkm.namaUsaha;
    getEl("popup-data-stiker-nama-pemilik").value = umkm.namaPemilik;
    getEl("popup-data-stiker-telepon").value = umkm.noTelpon;
    getEl("popup-data-stiker-alamat").value = umkm.alamat;
    getEl("popup-data-stiker-kode").value = stiker.kodeStiker;
    getEl("popup-data-stiker-nama").value = stiker.namaStiker;
    getEl("popup-data-stiker-panjang").value = stiker.panjang;
    getEl("popup-data-stiker-lebar").value = stiker.lebar;
    getEl("popup-data-stiker-catatan").value = stiker.catatan;

    const statusRadio =
        document.querySelector(
            `input[name="popup-data-stiker-status"][value="${stiker.status}"]`
        );

    if(statusRadio){
        statusRadio.checked = true;
    }

    // set image
    const previewImage1 =
        getEl("preview-gambar-1");

    previewImage1.onload = () => {
        hideLoading();
    };

    previewImage1.onerror = () => {
        hideLoading();
        previewImage1.src = noImageStiker;
    };

    previewImage1.src =
        stiker.pathGambar1
            ? `${BASE_URL}${stiker.pathGambar1}`
            : noImageStiker;

    // set image
    const previewImage2 =
        getEl("preview-gambar-2");

    previewImage2.onload = () => {
        hideLoading();
    };

    previewImage2.onerror = () => {
        hideLoading();
        previewImage2.src = noImageStiker;
    };

    previewImage2.src =
        stiker.pathGambar1
            ? `${BASE_URL}${stiker.pathGambar2}`
            : noImageStiker;

}
function tutupPopupStiker() {
    getEl("popup-data-stiker").classList.remove("show");
}
function toggleMenuImageStiker(button){
    const current = button.nextElementSibling;

    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        if(menu !== current){
            menu.classList.remove("show");
        }
    });

    current.classList.toggle("show");
}
function tutupMenuImageStiker() {
    document.querySelectorAll(".dropdown-menu").forEach(menu => {
        menu.classList.remove("show");
    });
}
document.addEventListener("click", e => {
    if(!e.target.closest(".desain-item")){
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            menu.classList.remove("show");
        });
    }
});
async function tampilPopupPilihUmkm(){
    await loadTabelDataStiker();

    await showPopupPilihUmkm(async (umkm) => {
            selectedUmkm = umkm;

            getEl("popup-data-stiker-nama-usaha").value =
                umkm.namaUsaha;
            getEl("popup-data-stiker-nama-pemilik").value =
                umkm.namaPemilik;
            getEl("popup-data-stiker-telepon").value =
                umkm.noTelpon;
            getEl("popup-data-stiker-alamat").value =
                umkm.alamat;

            await loadKodeStiker(umkm.id);
        }, selectedUmkm
    );
}
async function loadKodeStiker(umkmId) {

    try {
        const response = await fetch(
            `${BASE_URL_STIKER}/kode/${umkmId}`
        );

        if (!response.ok) {
            throw new Error("Gagal mengambil kode stiker");
        }

        const data = await response.json();

        getEl("popup-data-stiker-kode").value =
            data.kodeStiker;

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
    }
}

// FORM
function bersihPopupDataStiker() {
    selectedStiker = null;
    selectedUmkm = null;
    cariDataStiker = "";
    isEditModeStiker = false;
    selectedWebpFiles = {
        1: null,
        2: null
    };

    pathGambarLama = {
        1: "",
        2: ""
    };


    setDefaultGambarStiker(1);
   setDefaultGambarStiker(2);

   [
       "popup-data-stiker-nama-usaha",
       "popup-data-stiker-nama-pemilik",
       "popup-data-stiker-telepon",
       "popup-data-stiker-alamat",
       "popup-data-stiker-kode",
       "popup-data-stiker-nama",
       "popup-data-stiker-panjang",
       "popup-data-stiker-lebar",
       "popup-data-stiker-catatan",
       "popup-data-stiker-file-input-1",
       "popup-data-stiker-file-input-2"
   ].forEach(id => getEl(id).value = "");

    document.querySelectorAll('input[name="popup-data-stiker-status"]')
        .forEach(input => {
            input.checked = false;
        });
}

// GAMBAR
function setDefaultGambarStiker(index){

    const img = getEl(`preview-gambar-${index}`);

    if(img.src.startsWith("blob:")){
        URL.revokeObjectURL(img.src);
    }

    img.src = noImageStiker;
}
function pilihGambarStiker(index){
    const input = getEl(`popup-data-stiker-file-input-${index}`)
    input.value = "";
    input.click();
    tutupMenuImageStiker();
}
async function handlePreviewGambar(event, index) {

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

        selectedWebpFiles[index] = webpFile;

        const previewImage =
            getEl(
                `preview-gambar-${index}`
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
function hapusGambarStiker(index){
    const img = document.getElementById(
        `preview-gambar-${index}`
    );

    img.src = noImageStiker;
    img.dataset.path = "";
    tutupMenuImageStiker();
}
function lihatGambarStiker(index){
    const img = document.getElementById(
        `preview-gambar-${index}`
    );

    if(!img.src || img.src === noImageStiker) return;

    document.getElementById("img-fullscreen").src = img.src;

    showPopupLihatGambar();
    tutupMenuImageStiker();
}
function isGambarStikerBerubah(){

    return (
        getEl("popup-data-stiker-file-input-1").files.length > 0 ||
        getEl("popup-data-stiker-file-input-2").files.length > 0
    );
}
async function uploadGambarStiker(){

    const formData = new FormData();

    if(selectedWebpFiles[1]){
        formData.append(
            "files",
            selectedWebpFiles[1]
        );
    }

    if(selectedWebpFiles[2]){
        formData.append(
            "files",
            selectedWebpFiles[2]
        );
    }

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

    return await response.json();
}

// CRUD
function validasiSimpanDataStiker() {
    let valid = true
        if(!selectedUmkm){
            [
                "popup-data-stiker-nama-usaha",
                "popup-data-stiker-nama-pemilik",
                "popup-data-stiker-telepon",
                "popup-data-stiker-alamat"
            ].forEach(id => tandaiInvalid(getEl(id)));

            valid = false;
        }
        [
            "popup-data-stiker-nama",
            "popup-data-stiker-panjang",
            "popup-data-stiker-lebar"
        ].forEach(id => {
        if(!getValue(id)){
            tandaiInvalid(getEl(id));
            valid = false;
        }
    });
    if(!document.querySelector('input[name="popup-data-stiker-status"]:checked')){
        tandaiInvalid(getEl("popup-data-stiker-status-grup"));
        valid = false;
    }

    return valid;
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
async function simpanDataStiker() {
    if(!validasiSimpanDataStiker()) return;

    const kodeStiker = getValue("popup-data-stiker-kode")
    const namaStiker = getValue("popup-data-stiker-nama")
    const panjangStiker = getValue("popup-data-stiker-panjang")
    const lebarStiker = getValue("popup-data-stiker-lebar")
    const catatanStiker = getValue("popup-data-stiker-catatan")
    const statusStiker =
        document.querySelector(
            'input[name="popup-data-stiker-status"]:checked'
        )?.value === "true";

    let gambar1 = pathGambarLama[1];
    let gambar2 = pathGambarLama[2];

    if(isGambarStikerBerubah()){

        console.log("gambar berubah")

        const hasil =
            await uploadGambarStiker();

        let index = 0;

        if(selectedWebpFiles[1]){
            gambar1 = hasil[index++].path;
        }

        if(selectedWebpFiles[2]){
            gambar2 = hasil[index++].path;
        }
    }

    showLoading(
        isEditModeStiker
            ? "Mengubah Data Stiker..."
            : "Menyimpan Data Stiker..."
    );
    try {
        if(isEditModeStiker) {
            const response = await fetch(`${BASE_URL_STIKER}/${selectedStiker.id}`, {
                method: "PUT",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify({
                    umkmId: selectedUmkm.id,
                    kodeStiker: kodeStiker,
                    namaStiker: namaStiker,
                    panjang: panjangStiker,
                    lebar: lebarStiker,
                    catatan: catatanStiker,
                    status: statusStiker,
                    pathGambar1: gambar1,
                    pathGambar2: gambar2
                })
            });

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    errorData.message ||
                    "Gagal update stiker"
                );
            }
        } else {
            const response = await fetch(BASE_URL_STIKER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    umkmId: selectedUmkm.id,
                    kodeStiker: kodeStiker,
                    namaStiker: namaStiker,
                    panjang: panjangStiker,
                    lebar: lebarStiker,
                    catatan: catatanStiker,
                    status: statusStiker,
                    pathGambar1: gambar1,
                    pathGambar2: gambar2
                })
            });


            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    errorData.message ||
                    "Gagal simpan stiker"
                );
            }
        }

        tutupPopupStiker();
        bersihPopupDataStiker();
        await loadTabelDataStiker();
        showToast(
            "Data setiker berhasil disimpan",
            "success"
        );
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
async function hapusDataStiker(id) {
    showLoading("Menghapus Data Stiker...");
    try {
        const response = await fetch(`${BASE_URL_STIKER}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData =
                await response.json();

            throw new Error(
                errorData.message ||
                "Gagal menghapus data stiker"
            );
        }
        await loadTabelDataStiker();
        showToast("Data stiker berhasil dirubah", "success");
    } catch (e){
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}

window.destroyDataStiker = destroyDataStiker;
window.initDataStiker = initDataStiker;
window.toggleDetailStiker = toggleDetailStiker;
window.toggleMenuImageStiker = toggleMenuImageStiker;
window.pilihGambarStiker = pilihGambarStiker;
window.hapusGambarStiker = hapusGambarStiker;
window.lihatGambarStiker  = lihatGambarStiker;
window.showPopupStiker = showPopupStiker;
window.konfirmasiHapusDataStiker = konfirmasiHapusDataStiker;
window.sortTableStiker = sortTableStiker;