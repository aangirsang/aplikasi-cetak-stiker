let currentPageStiker = 1;
let cariDataStiker = "";
const rowsPerPageStiker = 15;

let sortFieldDataStiker = "";
let sortDirectionStiker = "";

let dataStiker = [];
let selectedStiker = null;
let selectedUmkm = null;
let selectedBarang = null;

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

let gambarBerubah = {
    1: false,
    2: false
};

async function initDataStiker() {

    setDefaultGambarStiker(1);
    setDefaultGambarStiker(2);
    await initPopupLoading();
    await initPopupLihatGambar();
    await loadTabelDataStiker(true);
    await initPopupPilihUmkm();
    await initPilihBarang();
    await initPopupHapus();
    await initPopupLayoutCetak();



    getEl("btn-refresh-data-stiker").addEventListener("" +
        "click", () => loadTabelDataStiker(true));

    getEl("btn-tambah-data-stiker").addEventListener("" +
        "click", () => showPopupStiker());

    getEl("btn-download-data-stiker").addEventListener("" +
        "click", () => downloadDataStiker());

    getEl("btn-popup-data-stiker-batal").addEventListener(
        "click", tutupPopupStiker);

    getEl("btn-popup-data-stiker-simpan").addEventListener(
        "click", () => simpanDataStiker());

    // GAMBAR
    getEl("popup-data-stiker-file-input-1")
        .addEventListener("change", (event) => handlePreviewGambar(event, 1));
    getEl("popup-data-stiker-file-input-2")
        .addEventListener("change", (event) => handlePreviewGambar(event, 2));

    // BARANG
    getEl("popup-data-stiker-barang")
        .addEventListener("click", () => tampilPopupPilihBarang())

        // LAYOUT CETAK
    getEl("btn-popup-data-stiker-layout-cetak")
        .addEventListener("click", () => tampilPopupLayout());

    // CARI STIKER
    getEl("search-stiker").addEventListener("input", async function(){
        cariDataStiker = this.value.trim().toLowerCase();
        currentPageStiker = 1;
        openedDetailStikerId = null;
        await loadTabelDataStiker();
    });

    document.removeEventListener("click", closeDetailStikerOutside);
    document.addEventListener("click", closeDetailStikerOutside);

    initDragDrop(1);
    initDragDrop(2);

}

// TABEL DATA STIKER
async function loadTabelDataStiker(reload = false) {
    showLoading("Memuat Data Stiker..");
    try {
        if (reload) {
            dataStiker = await fetchDataStiker();

            dataStiker.sort((a, b) => {
                // 1. Nama Usaha
                const usaha = a.namaUsaha.localeCompare(b.namaUsaha, "id", {
                    sensitivity: "base"
                });
                if (usaha !== 0) return usaha;

                // 2. Status (true dulu, false terakhir dalam nama usaha yang sama)
                if (a.status !== b.status) {
                    return b.status - a.status;
                }

                // 3. Kode Stiker
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
                        onclick="event.stopPropagation(); showPopupStiker('${item.id}')">
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

// POPUP
async function showPopupStiker(id = null){

    const popup = getEl("popup-data-stiker");
    const popupTitle = getEl("popup-data-stiker-title");

    bersihPopupDataStiker();

    if(id === null){
        await showPopupPilihUmkm(async (umkm) => {
                selectedUmkm = umkm;

                await loadKodeStiker(umkm.id);

                popupTitle.textContent = `Tambah Data Stiker: ${selectedUmkm.namaPemilik} - ${selectedUmkm.namaUsaha}`;
                popup.classList.add("show");

            }, selectedUmkm
        );

        isEditModeStiker = false;
        return;
    } else {

        isEditModeStiker = true;

        selectedStiker = dataStiker.find(item => item.id === id);

        //isiDataUmkm(selectedCariUmkm);

        isiDataStiker(selectedStiker);

        console.log(selectedUmkm);

        popupTitle.textContent = `Edit Data Stiker: ${selectedUmkm.namaPemilik} - ${selectedUmkm.namaUsaha}`;
    }


    popup.classList.add("show");
}
function isiDataStiker(stiker) {
    showLoading("Memuat Data Stiker...");

    selectedBarang = {
        id: stiker.barangId,
        namaBarang: stiker.namaBarang,
        stokBarang: stiker.stokBarang
    };

    selectedUmkm = {
        id: stiker.umkmId,
        namaUsaha: stiker.namaUsaha,
        namaPemilik: stiker.namaPemilik,
        noTelpon: stiker.noTelpon,
        alamat: stiker.alamat};

    pathGambarLama[1] = stiker.pathGambar1 ?? "";
    pathGambarLama[2] = stiker.pathGambar2 ?? "";

    getEl("popup-data-stiker-kode").value = stiker.kodeStiker;
    getEl("popup-data-stiker-nama").value = stiker.namaStiker;
    getEl("popup-data-stiker-panjang").value = stiker.panjang;
    getEl("popup-data-stiker-lebar").value = stiker.lebar;
    getEl("popup-data-stiker-catatan").value = stiker.catatan;
    getEl("popup-data-stiker-barang").value = selectedBarang.namaBarang;

    setKodeStiker(stiker.kodeStiker);

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
        stiker.pathGambar2
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
async function loadKodeStiker(umkmId) {

    try {
        const response = await fetch(
            `${BASE_URL_STIKER}/kode/${umkmId}`
        );

        if (!response.ok) {
            showToast("Gagal mengambil kode stiker");
            return;
        }

        const data = await response.json();

        getEl("popup-data-stiker-kode").value =
            data.kodeStiker;

        setKodeStiker(data.kodeStiker);

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
    }
}
async function tampilPopupPilihBarang(){
    await showPopupPilihBarang(async (barang) =>{
        selectedBarang = barang;

        console.log(selectedBarang);

        getEl("popup-data-stiker-barang").value = barang.namaBarang;
    });
}

async function tampilPopupLayout(){

    if(!selectedStiker){
        if (!validasiSimpanDataStiker()) return;
        selectedStiker = await stikerToBody();
    }

    console.log(selectedStiker);
    await showPopupLayoutCetak(selectedStiker);
}

// FORM
function bersihPopupDataStiker() {
    selectedStiker = null;
    selectedUmkm = null;
    selectedBarang = null
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

    gambarBerubah = {
        1: false,
        2: false
    };

    setDefaultGambarStiker(1);
    setDefaultGambarStiker(2);

   [
       "popup-data-stiker-kode",
       "popup-data-stiker-nama",
       "popup-data-stiker-panjang",
       "popup-data-stiker-lebar",
       "popup-data-stiker-catatan",
       "popup-data-stiker-file-input-1",
       "popup-data-stiker-file-input-2",
       "popup-data-stiker-barang"
   ].forEach(id => getEl(id).value = "");

    document.querySelectorAll('input[name="popup-data-stiker-status"]')
        .forEach(input => {
            input.checked = false;
        });
    setKodeStiker("")
}
function setKodeStiker(kode){
    const inputKode = document.getElementById("popup-data-stiker-kode");
    const counter = document.getElementById("popup-data-stiker-kode-counter");

    inputKode.value = kode;
    counter.textContent = `${kode.length}/20`;
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
        gambarBerubah[index] = true;

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
    const img = getEl(`preview-gambar-${index}`);

    img.src = noImageStiker;

    selectedWebpFiles[index] = null;

    if(index === 1){
        pathGambarLama[1] = "";
    }else{
        pathGambarLama[2] = "";
    }

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

    return gambarBerubah[1] || gambarBerubah[2];
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
function initDragDrop(index){

    const container =
        document.getElementById(
            `preview-container-${index}`
        );

    container.addEventListener("dragover", e=>{
        e.preventDefault();
        container.classList.add("dragover");
    });

    container.addEventListener("dragenter", e=>{
        e.preventDefault();
        container.classList.add("dragover");
    });

    container.addEventListener("dragleave", e=>{

        if(e.target === container){
            container.classList.remove("dragover");
        }

    });

    container.addEventListener("drop", async e=>{

        e.preventDefault();

        container.classList.remove("dragover");

        const files = e.dataTransfer.files;

        if(files.length === 0) return;

        await handlePreviewGambar({
            target:{
                files:files
            }
        }, index);

        container.classList.add("has-image");
    });

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

        if(!selectedBarang){
            tandaiInvalid(getEl("popup-data-stiker-barang"));
            valid = false;
        }

    if(!document.querySelector('input[name="popup-data-stiker-status"]:checked')){
        tandaiInvalid(getEl("popup-data-stiker-status-grup"));
        valid = false;
    }

    return valid;
}
async function stikerToBody() {
    if (!validasiSimpanDataStiker()) return;

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

    if (isGambarStikerBerubah()) {

        const hasil =
            await uploadGambarStiker();

        let index = 0;

        if (selectedWebpFiles[1]) {
            gambar1 = hasil[index++].path;
        }

        if (selectedWebpFiles[2]) {
            gambar2 = hasil[index++].path;
        }
    }

    /*
    let pathFileTif = pathTif;
    let pathFile;

    if (selectedTif) {

        const hasil =
            await uploadFileTif(kodeStiker);

        pathFileTif =
            hasil.path;

        pathFile = pathFileTif.replace(/\.[^.]+$/, "");

        console.log(pathFile);

    }

     */

    return {
        umkmId: selectedUmkm.id,
        barangId: selectedBarang.id,
        kodeStiker,
        namaStiker,
        panjang: panjangStiker,
        lebar: lebarStiker,
        catatan: catatanStiker,
        status: statusStiker,
        pathGambar1: gambar1,
        pathGambar2: gambar2
    };
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
    const body = await stikerToBody();

    showLoading(
        isEditModeStiker
            ? "Mengubah Data Stiker..."
            : "Menyimpan Data Stiker..."
    );

    if (!validasiSimpanDataStiker()) return hideLoading();

    try {
        if(isEditModeStiker) {
            const response = await fetch(`${BASE_URL_STIKER}/${selectedStiker.id}`, {
                method: "PUT",
                headers: {"Content-type": "application/json"},
                body: JSON.stringify(body)
            });

            if(await gagalSimpan(response)) return;
        } else {
            const response = await fetch(BASE_URL_STIKER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });


            if(await gagalSimpan(response)) return;
        }

        tutupPopupStiker();
        bersihPopupDataStiker();
        await loadTabelDataStiker(true);
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
window.toggleMenuImageStiker = toggleMenuImageStiker;
window.pilihGambarStiker = pilihGambarStiker;
window.hapusGambarStiker = hapusGambarStiker;
window.lihatGambarStiker  = lihatGambarStiker;
window.showPopupStiker = showPopupStiker;
window.konfirmasiHapusDataStiker = konfirmasiHapusDataStiker;
window.sortTableStiker = sortTableStiker;