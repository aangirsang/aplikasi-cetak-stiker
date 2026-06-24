
let currentPageUmkm = 1;
let cariDataUmkm = "";
const rowsPerPageUmkm = 15;

let sortFieldDataUmkm = "namaUsaha";
let sortDirectionUmkm = "asc";

let dataUmkm = [];
let dataKategori = [];
let selectedUmkm = null;
let selectedKategori = null;

let isEditModeUmkm = false;
let openedDetailUmkmId = null;

async function initDataUmkm(){
    bersihPopupDataUmkm();

    await loadTableDataUmkm();
    await initCustomSelectKategori();
    await initPopupHapus();
    await initPopupLoading();

    getEl("btn-tambah-data-umkm").addEventListener("click", () => showPopupUmkm());
    getEl("btn-batal-umkm").addEventListener("click", closePopupUmkm);
    getEl("btn-simpan-umkm").addEventListener("click", () => simpanDataUmkm());

    getEl("txt-cari-data-umkm").addEventListener("input", async function(){
        cariDataUmkm = this.value.trim().toLowerCase();
        currentPageUmkm = 1;
        openedDetailUmkmId = null;
        await loadTableDataUmkm();
    });

    document.removeEventListener("click", closeDetailUmkmOutside);
    document.addEventListener("click", closeDetailUmkmOutside);

}

// TABEL DATA UMKM
async function loadTableDataUmkm(){
    try {
        dataUmkm = await fetchDataUmkm();

        const filtered = getFilterDataUmkm();
        const sorted = getSortedDataUmkm(filtered);
        const paginated = getPaginatedData(sorted, currentPageUmkm, rowsPerPageUmkm)

        renderTableUmkm(paginated);
        loadPagination(
            "pagination",
            filtered.length,
            currentPageUmkm,
            rowsPerPageUmkm,
            changePageUmkm
        );

    } catch(error){

        console.error(error);
        showToast(error, "error")
        dataUmkm = [];
    }
}
async function fetchDataUmkm(){
    const response = await fetch(BASE_URL_UMKM);

    if(!response.ok) {
        throw new Error ("Gagal mengambil data UMKM");
    }

    return await response.json();
}
function getFilterDataUmkm(){
    return dataUmkm.filter(umkm => {
       const semuaData = `
            ${umkm.namaUsaha}
            ${umkm.namaPemilik}
            ${umkm.noTelpon}
            ${umkm.alamat}
            ${umkm.dataKategori.kategori}
            ${umkm.status ? "aktif" : "non-aktif"}
       `.toLowerCase();

       return semuaData.includes(cariDataUmkm);
    });
}
function getSortedDataUmkm(data){
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldDataUmkm];
        let valueB = b[sortFieldDataUmkm];

        if(sortFieldDataUmkm === "kategori"){
            valueA = a.dataKategori?.kategori ?? "";
            valueB = b.dataKategori?.kategori ?? "";
        }

        if(typeof valueA === "boolean"){
            valueA = valueA ? 1 : 0
            valueB = valueB ? 1 : 0
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionUmkm === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionUmkm === "asc" ? result : -result;
    })
}
function renderTableUmkm(data){
    const tbody = getEl("tbl-body-data-umkm");

    tbody.innerHTML = data.map(item => {
        const isOpened = openedDetailUmkmId === item.id;

        return createRowUmkm(item, isOpened);
    }).join("");
}
function createRowUmkm(item, isOpened){
    return `
        <tr 
        class="umkm-row ${isOpened ? 'selected' : ''}"
        onclick="event.stopPropagation(); toggleDetailUmkm(${item.id})">
            <td>${item.namaUsaha}</td>
            <td>${item.namaPemilik}</td>
            <td>${item.noTelpon}</td>
            <td>${item.dataKategori.kategori}</td>
            <td>${item.status ? "Aktif" : "Non-Aktif"}</td>

            <td>
                <div class="actions">
                    <button
                        onclick="showPopupUmkm(${item.id})">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="konfirmasiHapusUmkm(${item.id})">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </td>
        </tr>
        
        <!-- DETAIL -->
        <tr class="detail-table ${isOpened ? 'show' : ''}">
            <td colspan="6">
                <div class="detail-content">
                    <table class="detail-horizontal-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Facebook</th>
                                <th>Instagram</th>
                                <th>WhatsApp</th>
                                <th>Tanggal Registrasi</th>
                                <th>Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="detail-row">
                                <td>${item.email}</td>
                                <td>${item.facebook}</td>
                                <td>${item.instagram}</td>
                                <td>${item.whatsapp}</td>
                                <td>${item.tglRegistrasi
                                    ? new Date(item.tglRegistrasi)
                                    .toISOString().split("T")[0]
                                    : ""}</td>
                                <td class="deskripsi-cell">${item.deskripsi}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </td>
        </tr>
    `;
}
async function changePageUmkm(page){
    currentPageUmkm = page;
    await loadTableDataUmkm();
}
async function sortTabelUmkm(field){
    if(sortFieldDataUmkm === field){
        sortDirectionUmkm = sortDirectionUmkm === "asc" ? "desc" : "asc";
    } else {
        sortFieldDataUmkm = field;
        sortDirectionUmkm = "asc";
    }

    await loadTableDataUmkm();
}

// TABEL DETAIL
async function toggleDetailUmkm(id){
    openedDetailUmkmId = openedDetailUmkmId === id ? null : id;

    await loadTableDataUmkm();

    setTimeout(() => {
        document.querySelector(".detail-table.show")?.scrollIntoView({
            behavior:"smooth",
            block:"nearest"
        });
    }, 50);
}

async function closeDetailUmkmOutside(event){
    if(event.target.closest(".umkm-row, .detail-table")) return;
    if(openedDetailUmkmId === null) return;

    openedDetailUmkmId = null;
    await loadTableDataUmkm();
}

// LOAD DATA KATEGORI
async function fetchDataKategori(){
    const response = await fetch(BASE_URL_KATEGORI);

    if(!response.ok) {
        throw new Error ("Gagal mengambil data Kategori");
    }

    return await response.json();
}
function renderKategoriOptions(){
    const optionsContainer = getEl("options-data-umkm-kategori");

    optionsContainer.innerHTML =
        dataKategori.map(kategori => `
            <div 
                class="option"
                data-id="${kategori.id}"
            >
                ${kategori.kategori}
            </div>
        `).join("");

    initOptionsKategori();
}
function initOptionsKategori(){
    const costumSelect = getEl("custom-select-data-umkm-kategori")
    const selectedText = getEl("selected-text-data-umkm-kategori")

    document.querySelectorAll("#options-data-umkm-kategori .option")
        .forEach(option => {
            option.addEventListener("click", function(){

                selectedText.textContent = this.textContent;
                selectedText.classList.remove("empty");

                const kategoriId = this.dataset.id;

                selectedKategori = dataKategori.find(
                    kategori =>
                        String(kategori.id) === String(kategoriId)
                );

                costumSelect.classList.add("filled");
                costumSelect.classList.remove("active");
            });
        });
}

// POPUP
function showPopupUmkm(id = null){
    const popup = getEl("popup-data-umkm")
    const popupTitle = getEl("popup-data-umkm-title");

    bersihPopupDataUmkm();

    if(id){
        const data = dataUmkm.find(
            item => String(item.id) === String(id)
        );

        popupTitle.textContent = "Edit Data UMKM";

        isiPopupDataUmkm(data);

        isEditModeUmkm = true;
        selectedUmkm = id;
    } else {
        popupTitle.textContent = "Tambah Data UMKM";
        isEditModeUmkm = false;
    }
    popup.classList.add("show");
}
function closePopupUmkm(){
    getEl("popup-data-umkm").classList.remove("show");
}
function isiPopupDataUmkm(data){
    getEl("popup-data-umkm-nama-usaha").value = data.namaUsaha ?? "";
    getEl("popup-data-umkm-nama-pemilik").value = data.namaPemilik ?? "";
    getEl("popup-data-umkm-deskripsi").value = data.deskripsi ?? "";
    getEl("popup-data-umkm-ktp").value = data.noKtp;
    getEl("popup-data-umkm-telepon").value = data.noTelpon ?? "";
    getEl("popup-data-umkm-email").value = data.email ?? "";
    getEl("popup-data-umkm-alamat").value = data.alamat ?? "";
    getEl("popup-data-umkm-wa").value = data.whatsapp ?? "";
    getEl("popup-data-umkm-instagram").value = data.instagram ?? "";
    getEl("popup-data-umkm-facebook").value = data.facebook ?? "";
    getEl("popup-data-umkm-tiktok").value = data.tiktok ?? "";

    getEl("popup-data-umkm-tanggal-lahir").value =
        data.tglLahir
            ? new Date(data.tglLahir).toISOString().split("T")[0]
            : "";

    if(data.dataKategori) {
        selectedKategori = data.dataKategori;
        getEl("selected-text-data-umkm-kategori").textContent = data.dataKategori.kategori;
        getEl("selected-text-data-umkm-kategori").classList.remove("empty");
        getEl("custom-select-data-umkm-kategori").classList.add("filled");
    }

    const statusRadio =
        document.querySelector(
            `input[name="popup-data-umkm-status"][value="${data.status}"]`
        );
    if(statusRadio){
        statusRadio.checked = true;
    }

    const kelaminRadio =
        document.querySelector(
            `input[name="popup-data-umkm-kelamin"][value="${data.jenisKelamin}"]`
        );
    if(kelaminRadio){
        kelaminRadio.checked = true;
    }
}

// FORM
function bersihPopupDataUmkm(){

    [
        "txt-cari-data-umkm",
        "popup-data-umkm-nama-usaha",
        "popup-data-umkm-deskripsi",
        "popup-data-umkm-nama-pemilik",
        "popup-data-umkm-ktp",
        "popup-data-umkm-tanggal-lahir",
        "popup-data-umkm-alamat",
        "popup-data-umkm-email",
        "popup-data-umkm-telepon",
        "popup-data-umkm-wa",
        "popup-data-umkm-instagram",
        "popup-data-umkm-facebook",
        "popup-data-umkm-tiktok"
    ].forEach(id => getEl(id).value = "");

    document.querySelectorAll('input[name="popup-data-umkm-status"]')
        .forEach(input => {
            input.checked = false;
        });

    document.querySelectorAll('input[name="popup-data-umkm-kelamin"]')
        .forEach(input => {
            input.checked = false;
        });

    const costumSelect = getEl("custom-select-data-umkm-kategori");
    const selectedText = getEl("selected-text-data-umkm-kategori");

    selectedText.textContent = "";
    selectedText.classList.add("empty");
    selectedKategori = null;
    costumSelect.classList
        .remove(
            "filled",
            "active"
        );
    isEditModeUmkm = false;
    cariDataUmkm = "";
}

// CUSTOM SELECT
async function initCustomSelectKategori(){

    try {
        dataKategori = await fetchDataKategori();
        renderKategoriOptions();
    } catch(error){
        console.error(error);
        dataKategori = [];
    }

    const customSelect = getEl("custom-select-data-umkm-kategori");
    const selectedBox = customSelect.querySelector(".select-box");

    selectedBox.addEventListener("click", () => {
        customSelect.classList.toggle("active");
    })

    document.addEventListener("click", (e) => {
        if(!customSelect.contains(e.target)) {
            customSelect.classList.remove("active");
        }
    })
}

// CRUD UMKM
function validasiSimpanDataUmkm(){
    let valid = true;
    const kategori = getEl('selected-text-data-umkm-kategori').textContent.trim();
    const status = document.querySelector('input[name="popup-data-umkm-status"]:checked');
    const kelamin = document.querySelector('input[name="popup-data-umkm-kelamin"]:checked');


    [
        "popup-data-umkm-nama-usaha",
        "popup-data-umkm-deskripsi",
        "popup-data-umkm-nama-pemilik",
        "popup-data-umkm-ktp",
        "popup-data-umkm-tanggal-lahir",
        "popup-data-umkm-alamat",
        "popup-data-umkm-email",
        "popup-data-umkm-telepon",
        "popup-data-umkm-wa",
        "popup-data-umkm-instagram",
        "popup-data-umkm-facebook",
        "popup-data-umkm-tiktok"
    ].forEach(id => {
        if(!getValue(id)){
            tandaiInvalid(getEl(id));
            valid = false;
        }
    });

    if(kategori === "") {
        tandaiInvalid(getEl("custom-select-data-umkm-kategori"))
        valid = false;
    }

    if(!status) {
        tandaiInvalid(getEl('popup-data-umkm-status-grup'));
        valid = false;
    }

    if(!kelamin) {
        tandaiInvalid(getEl('popup-data-umkm-kelamin-grup'));
        valid = false;
    }

    if(!valid){
        showToast("Mohon Lengkapi Data!!", "warning");
    }
    return valid;
}
async function simpanDataUmkm(){
    if (!validasiSimpanDataUmkm()) return;

    const namaUsaha = getValue("popup-data-umkm-nama-usaha");
    const namaPemilik = getValue("popup-data-umkm-nama-pemilik");
    const deskripsi = getValue("popup-data-umkm-deskripsi");
    const ktp = getValue("popup-data-umkm-ktp");
    const telepon = getValue("popup-data-umkm-telepon");
    const email = getValue("popup-data-umkm-email");
    const alamat = getValue("popup-data-umkm-alamat");
    const whatsapp = getValue("popup-data-umkm-wa");
    const instagram = getValue("popup-data-umkm-instagram");
    const facebook = getValue("popup-data-umkm-facebook");
    const titok = getValue("popup-data-umkm-tiktok");


    const kelamin = document.querySelector(
        'input[name="popup-data-umkm-kelamin"]:checked'
    )?.value === "true";
    const status = document.querySelector(
        'input[name="popup-data-umkm-status"]:checked'
    )?.value === "true";

    const tanggalLahirString = getEl("popup-data-umkm-tanggal-lahir").value;
    const tanggalLahirLong =
        tanggalLahirString
            ? new Date(tanggalLahirString).getTime()
            : null;

    console.log(isEditModeUmkm)

    showLoading(
        isEditModeUmkm
            ? "Mengubah Data..."
            : "Menyimpan Data..."
    );

    try {
        if(isEditModeUmkm){
            const response = await fetch(`${BASE_URL_UMKM}/${selectedUmkm}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    namaUsaha: namaUsaha,
                    namaPemilik: namaPemilik,
                    dataKategori: {id: selectedKategori.id},
                    deskripsi: deskripsi,
                    noKtp: ktp,
                    jenisKelamin: kelamin,
                    tglLahir: tanggalLahirLong,
                    noTelpon: telepon,
                    email: email,
                    alamat: alamat,
                    whatsapp: whatsapp,
                    instagram: instagram,
                    facebook: facebook,
                    tiktok: titok,
                    status: status,
                    tglRegistrasi: new Date().getTime()
                })
            });

            const text = await response.text();

            console.log("Status:", response.status);
            console.log("Response:", text);

            if (response.ok) {
                closePopupUmkm();

                bersihPopupDataUmkm();

                await loadTableDataUmkm();

                showToast(
                    "Data UMKM berhasil disimpan",
                    "success"
                );
            } else {
                showToast(
                    text || "Terjadi kesalahan",
                    "warning"
                );
            }
        } else {
            const response = await fetch(BASE_URL_UMKM, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    namaUsaha: namaUsaha,
                    namaPemilik: namaPemilik,
                    dataKategori: {id: selectedKategori.id},
                    deskripsi: deskripsi,
                    noKtp: ktp,
                    jenisKelamin: kelamin,
                    tglLahir: tanggalLahirLong,
                    noTelpon: telepon,
                    email: email,
                    alamat: alamat,
                    whatsapp: whatsapp,
                    instagram: instagram,
                    facebook: facebook,
                    tiktok: titok,
                    status: status,
                    tglRegistrasi: new Date().getTime()
                })
            });

            const text = await response.text();

            console.log("Status:", response.status);
            console.log("Response:", text);

            if (response.ok) {
                closePopupUmkm();

                bersihPopupDataUmkm();

                await loadTableDataUmkm();

                showToast(
                    "Data UMKM berhasil disimpan",
                    "success"
                );
            } else {
                showToast(
                    text || "Terjadi kesalahan",
                    "warning"
                );
            }
        }

    }  catch (e) {
        showToast(e.message, "warning");
    } finally {
        hideLoading();
    }
}
async function hapusDataUmkm(id) {
    showLoading(
        "Menghapus Data..."
    );

    try {
        const response = await fetch(`${BASE_URL_UMKM}/${id}`, {
            method: 'DELETE'
        });
        const text = await response.text();

        console.log("Status:", response.status);
        console.log("Response:", text);

        if (response.ok) {

            await loadTableDataUmkm();

            showToast("Data UMKM berhasil dihapus", "success");
        } else {
            showToast(
                text || "Terjadi kesalahan",
                "warning"
            );
        }
    } catch (e) {
        showToast(e.message, "warning");
    } finally {
        hideLoading();
    }
}
function konfirmasiHapusUmkm(id){
    console.log(
        "konfirmasiHapusUmkm",
        id
    );

    showPopupHapus({
        title: "Konfirmasi Hapus Data UMKM",
        message: "Anda Yakin Ingin Menghapus Data UMKM Ini?",
        onConfirm:
        async () =>{
            await hapusDataUmkm(id);
        }
    });
}

window.initDataUmkm = initDataUmkm;
window.showPopupUmkm = showPopupUmkm;
window.changePageUmkm = changePageUmkm;
window.sortTabelUmkm = sortTabelUmkm;
window.konfirmasiHapusUmkm = konfirmasiHapusUmkm;
window.toggleDetailUmkm = toggleDetailUmkm;