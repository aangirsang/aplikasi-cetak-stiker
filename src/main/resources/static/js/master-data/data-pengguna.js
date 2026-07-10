let dataPengguna = [];
let currentPagePengguna = 1;
let rowsPerPagePengguna = 10;

let searchKeywordPengguna = "";

let sortFieldPengguna = "namaPengguna";
let sortDirectionPengguna = "asc";

let dataLevel = [];
let selectedLevel = null;
let selectedPengguna = null;

let isEdit = false;

let pathGambarLama = "";
let selectedWebpFile = null;


async function initDataPengguna() {
    await loadTablePengguna();
    setDefaultGambarPengguna();
    await initPopupHapus();
    await initPopupLoading();

    getEl("cari-data-pengguna").addEventListener("input", async function(){
        searchKeywordPengguna = this.value.trim().toLowerCase();
        currentPagePengguna = 1;
        //openedDetailStiker = null;
        await loadTablePengguna();
    });

    getEl("btn-tambah-data-pengguna").addEventListener("click", () => showPopupPengguna());
    getEl("btn-popup-data-pengguna-batal").addEventListener("click", closePopupPengguna);
    getEl("btn-popup-data-pengguna-simpan").addEventListener("click", () => simpanDataPengguna());

    getEl("btn-popup-data-pengguna-cari-gambar").addEventListener("click", cariGambar);
    getEl("popup-data-pengguna-file-input").addEventListener("change", handlePreviewGambar);

    getEl(
        "popup-data-pengguna-kata-sandi"
    ).addEventListener(
        "input",
        validateUlangiPassword
    );

    getEl(
        "popup-data-pengguna-ulangi-kata-sandi"
    ).addEventListener(
        "input",
        validateUlangiPassword
    );

    try{
        dataLevel = await fetchDataLevel();
        renderLevelOptions();
    }catch(error){
        console.error(error);
        dataLevel = [];
    }

    const customSelect =
        getEl("custom-select");

    const selectBox =
        customSelect.querySelector(
            ".select-box"
        );

    selectBox.addEventListener(
        "click",
        () => {
            customSelect.classList
                .toggle("active");
        }
    );

    /* klik luar = tutup */
    document.addEventListener("click", (e) => {

        if(!customSelect.contains(e.target)){
            customSelect.classList
                .remove("active");
        }
    });
}

// TABEL DATA PENGGUNA
async function loadTablePengguna(){

    try{

        dataPengguna = await fetchDataPengguna();

        const filtered = getFilteredDataPengguna();
        const sorted = getSortedDataPengguna(filtered);
        const paginated = getPaginatedData( sorted, currentPagePengguna, rowsPerPagePengguna);

        renderTablePengguna(paginated);

        loadPagination("pagination", filtered.length, currentPagePengguna, rowsPerPagePengguna, changePagePengguna);

    }catch(error){

        console.error(error);
        dataPengguna = [];
    }
}
async function fetchDataPengguna(){

    const response =
        await fetch(BASE_URL_PENGGUNA);

    if(!response.ok){
        throw new Error(
            "Gagal mengambil data pengguna"
        );
    }

    return await response.json();
}
function getFilteredDataPengguna(){

    return dataPengguna.filter(item => {
        const semuaData = `
            ${item.namaLengkap}
            ${item.namaPengguna}
            ${item.dataLevel?.level ?? ""}
            ${item.status ? "aktif" : "non-aktif"}
        `.toLowerCase();

        return semuaData.includes(
            searchKeywordPengguna
        );
    });
}
function getSortedDataPengguna(data){

    return [...data].sort((a, b) => {

        let valueA = a[sortFieldPengguna];
        let valueB = b[sortFieldPengguna];

        // nested object
        if(sortFieldPengguna === "level"){
            valueA = a.dataLevel?.level ?? "";
            valueB = b.dataLevel?.level ?? "";
        }

        // boolean
        if(typeof valueA === "boolean"){
            valueA = valueA ? 1 : 0;
            valueB = valueB ? 1 : 0;
        }

        // string
        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionPengguna === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;

        return sortDirectionPengguna === "asc"
            ? result
            : -result;
    });
}
function renderTablePengguna(data){

    const tbody = getEl("tbl-body-data-pengguna");

    tbody.innerHTML =
        data.map(item =>
            createRowPengguna(item)
        ).join("");
}
function createRowPengguna(item){

    return `
        <tr class="pengguna-row">
            <td>${item.namaLengkap}</td>
            <td>${item.namaPengguna}</td>
            <td>${item.dataLevel.level}</td>
            <td>${item.status ? "Aktif" : "Non-Aktif"}</td>

            <td>
                <div class="actions">
                    <button
                        onclick="showPopupPengguna(${item.id})">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="konfirmasiHapusPengguna('${item.id}')">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}
async function sortTablePengguna(field){
    if(sortFieldPengguna === field){
        sortDirectionPengguna = sortDirectionPengguna === "asc" ? "desc" : "asc";
    } else {
        sortFieldPengguna = field;
        sortDirectionPengguna = "asc";
    }

    await loadTablePengguna();
}
async function changePagePengguna(page){
    currentPagePengguna = page;
    await loadTablePengguna();
}

// LOAD DATA LEVEL
async function fetchDataLevel(){

    const response = await fetch(BASE_URL_LEVEL);

    if(!response.ok){
        throw new Error("Gagal mengambil data level");
    }

    return await response.json();
}
function renderLevelOptions(){

    const optionsContainer = getEl("level-options");

    optionsContainer.innerHTML =
        dataLevel.map(level => `
            <div
                class="option"
                data-id="${level.id}"
            >
                ${level.level}
            </div>
        `).join("");

    initOptionLevel();
}
function initOptionLevel(){

    const customSelect = getEl("custom-select");
    const selectedText = getEl("selected-text");

    document.querySelectorAll("#level-options .option")
        .forEach(option => {

            option.addEventListener(
                "click",
                function(){
                    selectedText.textContent =
                        this.textContent;

                    selectedText.classList
                        .remove("empty");

                    const levelId =
                        this.dataset.id;

                    selectedLevel =
                        dataLevel.find(
                            level =>
                                String(level.id)
                                === String(levelId)
                        );

                    customSelect.classList
                        .add("filled");

                    customSelect.classList
                        .remove("active");
                }
            );
        });
}

// POPUP
function showPopupPengguna(id = null){

    const popup = getEl("popup-data-pengguna");
    const popupTitle = getEl("popup-data-pengguna-title");

    // reset form dulu
    bersihPopupDataPengguna();

    if(id){
        const data = dataPengguna.find(
            item => String(item.id) === String(id)
        );

        popupTitle.textContent = "Edit Data Pengguna";

        isiPopupDataPengguna(data);

        isEdit = true;
        selectedPengguna = id;
    } else {
        popupTitle.textContent = "Tambah Data Pengguna";
        isEdit = false;
    }

    popup.classList.add("show");
}
function isiPopupDataPengguna(data){

    pathGambarLama = data.pathGambar ?? "";

    getEl("popup-data-pengguna-nama-lengkap").value = data.namaLengkap ?? "";
    getEl("popup-data-pengguna-nama-pengguna").value = data.namaPengguna ?? "";

    // set level
    if(data.dataLevel){
        selectedLevel = data.dataLevel;
        getEl("selected-text").textContent = data.dataLevel.level;
        getEl("selected-text").classList.remove("empty");
        getEl("custom-select").classList.add("filled");
    }

    // set status radio
    const statusRadio =
        document.querySelector(
            `input[name="popup-data-pengguna-status"][value="${data.status}"]`
        );

    if(statusRadio){
        statusRadio.checked = true;
    }

    // set image
    const previewImage =
        getEl("popup-data-pengguna-preview-image");

    showLoading("Memuat Gambar...");

    previewImage.onload = () => {
        hideLoading();
    };

    previewImage.onerror = () => {
        hideLoading();
        previewImage.src = noImagePerson;
    };

    previewImage.src =
        data.pathGambar
            ? `${BASE_URL}${data.pathGambar}`
            : noImagePerson;

    console.log(previewImage.src);
}
function closePopupPengguna(){
    getEl("popup-data-pengguna").classList.remove("show");
}

// FORM
function bersihPopupDataPengguna(){

    // reset input
    [
        "popup-data-pengguna-nama-lengkap",
        "popup-data-pengguna-nama-pengguna",
        "popup-data-pengguna-kata-sandi",
        "popup-data-pengguna-ulangi-kata-sandi"
    ].forEach(id => getEl(id).value = "");

    // reset radio
    document.querySelectorAll('input[name="popup-data-pengguna-status"]')
        .forEach(input => {
            input.checked = false;
        });

    // reset custom select
    resetCustomSelect();

    // reset image
    getEl(
        "popup-data-pengguna-preview-image"
    ).src = noImagePerson;

    getEl("popup-data-pengguna-file-input").value = "";

    // reset selected level
    selectedLevel = null;
    selectedPengguna = null;
    isEdit = false;
    pathGambarLama = "";
    selectedWebpFile = null;
}

// CUSTOM SELECT
function resetCustomSelect(){

    const customSelect =
        getEl("custom-select");

    const selectedText =
        getEl("selected-text");

    // reset text
    selectedText.textContent = "";

    // reset class
    selectedText.classList
        .add("empty");

    // reset selected value
    selectedLevel = null;

    // reset state
    customSelect.classList
        .remove(
            "filled",
            "active"
        );
}

// CRUD PENGGUNA
function validateUlangiPassword(){

    const password = getEl("popup-data-pengguna-kata-sandi");
    const ulangiPassword = getEl("popup-data-pengguna-ulangi-kata-sandi");

    const passwordValue = password.value.trim();
    const ulangiPasswordValue = ulangiPassword.value.trim();

    // reset class
    ulangiPassword.classList.remove("error","success");

    // kalau kosong jangan merah
    if(!ulangiPasswordValue){
        return;
    }

    // cek sama / tidak
    if(passwordValue !== ulangiPasswordValue) {
        ulangiPassword.classList.add("error");

    } else {
        ulangiPassword.classList.add("success");
    }
}
function validasiSimpanDataPengguna() {
    let valid = true;

    if(isEdit) {
        [
            "popup-data-pengguna-nama-lengkap",
            "popup-data-pengguna-nama-pengguna",
        ].forEach(id => {
            if(!getValue(id)){
                tandaiInvalid(getEl(id));
                valid = false;
            }
        });
    } else {
        [
            "popup-data-pengguna-nama-lengkap",
            "popup-data-pengguna-nama-pengguna",
            "popup-data-pengguna-kata-sandi",
            "popup-data-pengguna-ulangi-kata-sandi"
        ].forEach(id => {
            if(!getValue(id)){
                tandaiInvalid(getEl(id));
                valid = false;
            }
        });
    }


    // Level
    const level = getEl('selected-text').textContent.trim();

    if (level === "") {
        tandaiInvalid(getEl('custom-select'));
        valid = false;
    }

    // status
    const status = document.querySelector('input[name="popup-data-pengguna-status"]:checked');

    if (!status) {
        tandaiInvalid(getEl('popup-data-pengguna-status-grup'));
        valid = false;
    }

    const sandi = getValue('popup-data-pengguna-kata-sandi').trim();
    const ulangiSandi = getValue('popup-data-pengguna-ulangi-kata-sandi').trim();

    if(sandi !== ulangiSandi){
        tandaiInvalid(getEl('popup-data-pengguna-kata-sandi'));
        tandaiInvalid(getEl('popup-data-pengguna-ulangi-kata-sandi'));
        valid = false;
    }

    if(!valid){
        showToast("Mohon Lengkapi Data!!", "warning");
    }
    return valid;
}
async function simpanDataPengguna() {
    if (!validasiSimpanDataPengguna()) return;

    const namaLengkap = getValue("popup-data-pengguna-nama-lengkap");
    const namaPengguna = getValue("popup-data-pengguna-nama-pengguna");
    const kataSandi = getValue("popup-data-pengguna-kata-sandi");
    const status =
        document.querySelector(
            'input[name="popup-data-pengguna-status"]:checked'
        )?.value === "true";


    let pathGambar = pathGambarLama;

    if(isGambarBerubah()){
        pathGambar = await uploadGambarPengguna();
    }

    console.log(`Gambar Berubah = ${isGambarBerubah()}`)

    console.log(`${BASE_URL_PENGGUNA}/${selectedPengguna}`)
    console.log(selectedLevel);

    showLoading(
        isEdit
            ? "Mengubah Data Pengguna..."
            : "Menyimpan Data Pengguna..."
    );

    try {
        if(isEdit){
            console.log(kataSandi)
            const response = await fetch(`${BASE_URL_PENGGUNA}/${selectedPengguna}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    namaLengkap: namaLengkap,
                    namaPengguna: namaPengguna,
                    kataSandi: kataSandi,
                    status: status,
                    pathGambar: pathGambar,
                    dataLevel: {
                        id: selectedLevel.id
                    }
                })
            });

            if(await gagalSimpan(response)) return
        } else {
            const response = await fetch(BASE_URL_PENGGUNA, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    namaLengkap: namaLengkap,
                    namaPengguna: namaPengguna,
                    kataSandi: kataSandi,
                    status: status,
                    pathGambar: pathGambar,
                    dataLevel: {
                        id: selectedLevel.id
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();

                showToast(
                    errorData.message ||
                    "Gagal update pengguna"
                );
            }
        }

        closePopupPengguna();

        bersihPopupDataPengguna();
        await loadTablePengguna();

        showToast(
            "Data pengguna berhasil disimpan",
            "success"
        );
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }

}
async function uploadGambarPengguna() {

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
async function hapusDataPengguna(id){

    showLoading("Menghapus Data Pengguna...");
    try {

        const response =
            await fetch(
                `${BASE_URL_PENGGUNA}/${id}`,
                {
                    method: "DELETE"
                }
            );

        if (await gagalHapus(response)) return;

        await loadTablePengguna();
        showToast("Data Berhasil Dihapus!!", "success")
    } catch (e){
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
function konfirmasiHapusPengguna(id){

    showPopupHapus({

        title:
            "Konfirmasi Hapus",

        message:
            "Yakin ingin menghapus pengguna ini?",

        onConfirm:
            async () => {

                await hapusDataPengguna(
                    id
                );
            }
    });
}

// GAMBAR
function setDefaultGambarPengguna(){

    const img =
        document.getElementById(
            "popup-data-pengguna-preview-image"
        );

    if(!img) return;

    img.src =
        img.getAttribute("src")
        || noImagePerson;

    img.onerror = () => {
        img.src = noImagePerson;
    };
}
function cariGambar() {
    const input = getEl("popup-data-pengguna-file-input");
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
                "popup-data-pengguna-preview-image"
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
            "popup-data-pengguna-file-input"
        );

    return fileInput.files.length > 0;
}


window.initDataPengguna = initDataPengguna;
window.sortTablePengguna = sortTablePengguna;
window.showPopupPengguna = showPopupPengguna;
window.konfirmasiHapusPengguna = konfirmasiHapusPengguna;