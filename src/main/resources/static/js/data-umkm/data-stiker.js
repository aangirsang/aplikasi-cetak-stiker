let currentPageStiker = 1;
let cariDataStiker = "";
const rowsPerPageStiker = 15;

let sortFieldDataStiker = "namaStiker";
let sortDirectionStiker = "asc";

let dataStiker = [];
let dataUmkm = [];
let selectedStiker = null;
let selectedUmkm = null;

let isEditModeStiker = false;
let openedDetailStikerId = null;

let selectedGambarIndex = null;

let selectedWebpFile = null;

async function initDataStiker() {
    setDefaultGambarStiker(1);
    setDefaultGambarStiker(2);
    await initPopupLoading();
    await loadTabelDataStiker();

    getEl("btn-tambah-data-stiker").addEventListener("click", () => showPopupStiker());
    getEl("btn-popup-data-stiker-batal").addEventListener("click", tutupPopupStiker)

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
                        onclick="showPopupStiker(${item.id})">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="konfirmasiHapusStiker(${item.id})">
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

//  DETAIL DATA STIKER
async function toggleDetailStiker(id) {
    console.log(id);

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
    //bersihStiker();

    const popup = getEl("popup-data-stiker");
    const btnCari = getEl("btn-popup-data-stiker-cari-umkm");

    if(id === null){
        isEditModeStiker = false;

        btnCari.disabled = false;
        btnCari.classList.remove("btn-disabled");

        popup.classList.add("show");
        return;
    }

    isEditModeStiker = true;

    btnCari.disabled = true;
    btnCari.classList.add("btn-disabled");

    selectedStiker = dataStiker.find(item => item.id === id);
    if(!selectedStiker) return;

    //selectedCariUmkm = getUMKM(selectedStiker.umkmId);

    //isiDataUmkm(selectedCariUmkm);
    //isiDataStiker(selectedStiker);

    popup.classList.add("show");
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

// GAMBAR
function setDefaultGambarStiker(index){

    const img =
        document.getElementById(
            `preview-gambar-${index}`
        );

    if(!img) return;

    img.src =
        img.getAttribute("src")
        || noImageStiker;

    img.onerror = () => {
        img.src = noImageStiker;
    };
}

function pilihGambar(index){
    const input = getEl(`popup-data-stiker-file-input-${index}`)
    input.value = "";
    input.click();
    tutupMenuImageStiker();
}
async function handlePreviewGambar(event, index) {

    selectedWebpFile = null;

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

window.destroyDataStiker = destroyDataStiker;
window.initDataStiker = initDataStiker;
window.toggleDetailStiker = toggleDetailStiker;
window.toggleMenuImageStiker = toggleMenuImageStiker;
window.pilihGambar = pilihGambar;