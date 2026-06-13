const popupState = {
    mode: null,       // level / kategori
    action: null,     // create / edit
    id: null
};
const deleteState = {
    mode: null,
    id: null
};
const popupConfig = {
    level: {
        titleCreate: "Tambah Data Level",
        titleEdit: "Edit Data Level",
        label: "Nama Level"
    },

    kategori: {
        titleCreate: "Tambah Data Kategori",
        titleEdit: "Edit Data Kategori",
        label: "Nama Kategori"
    }
};


async function initMasterData() {
    await bersihMasterData();

    getEl("btn-tambah-level").addEventListener("click", () => showPopupTambahDataMaster("level"));
    getEl("btn-tambah-kategori").addEventListener("click", () => showPopupTambahDataMaster("kategori"));
    getEl("btn-simpan-master-data").addEventListener("click", simpanMasterData);
    getEl("btn-batal-master-data").addEventListener("click", tutupPopup);
    getEl("btn-konfirmasi-hapus").addEventListener("click", konfirmasiHapus);
    getEl("btn-batal-hapus").addEventListener("click", tutupPopupKonfirmasi);
}
async function bersihMasterData() {
    await loadDataLevel();
    await loadDataKategori();

    getEl("popup-master-data-input").value = "";
}
function showPopupTambahDataMaster(type){

    const popup = getEl("popup-master-data");
    const popupTitle = getEl("popup-master-data-title");
    const popupLabel = getEl("popup-master-data-label");
    const popupInput = getEl("popup-master-data-input");

    popupState.mode = type;
    popupState.action = "create";
    popupState.id = null;

    const config = popupConfig[type];

    popupTitle.textContent = config.titleCreate;
    popupLabel.textContent = config.label;

    popupInput.value = "";

    popup.classList.add("show");

}
function showPopupEditDataMaster(type, data) {

    const popup = getEl("popup-master-data");
    const popupTitle = getEl("popup-master-data-title");
    const popupLabel = getEl("popup-master-data-label");
    const popupInput = getEl("popup-master-data-input");

    popupState.mode = type;
    popupState.action = "edit";
    popupState.id = data.id;

    const config = popupConfig[type];

    popupTitle.textContent = config.titleEdit;
    popupLabel.textContent = config.label;

    popupInput.value = data.nama;

    popup.classList.add("show");
}
function tutupPopup() {
    const popup = getEl("popup-master-data");
    const popupInput = getEl("popup-master-data-input");

    popup.classList.remove("show");

    popupInput.value = "";

    popupState.mode = null;
    popupState.action = null;
    popupState.id = null;
}
async function loadDataLevel() {
    const response = await fetch(BASE_URL_LEVEL)
    const data = await response.json();
    const levelList = document.getElementById("level-list")

    let html = "";

    data.forEach(level => {

        html += `
            <div class="list-item">
                <h3>${level.level}</h3>
                <div class="action-btn">
                    <button class="update-btn"
                        onclick="editLevel(${level.id}, '${level.level}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>
                    <button class="delete-btn"
                        onclick="hapusLevel(${level.id}, '${level.level}')">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </div>
        `;
    });

    levelList.innerHTML = html;
}
async function loadDataKategori() {
    const response = await fetch(BASE_URL_KATEGORI)
    const data = await response.json();
    const levelList = document.getElementById("kategori-list")

    let html = "";

    data.forEach(kategori => {

        html += `
            <div class="list-item">
                <h3>${kategori.kategori}</h3>
                <div class="action-btn">
                    <button class="update-btn"
                        onclick="editKategori(${kategori.id}, '${kategori.kategori}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>
                    <button class="delete-btn"
                        onclick="hapusKategori(${kategori.id}, '${kategori.kategori}')">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </div>
        `;
    });

    levelList.innerHTML = html;
}
async function simpanMasterData() {
    const popupInput = getEl("popup-master-data-input");

    if(!validasiSimpan()) return;

    const nama = popupInput.value.trim();
    try {

        if (popupState.mode === "level") {

            if (popupState.action === "create") {
                await simpanLevel(nama);
            } else {
                await updateLevel(
                    popupState.id,
                    nama
                );
            }

        } else if (popupState.mode === "kategori") {

            if (popupState.action === "create") {
                await simpanKategori(nama);
            } else {
                await updateKategori(
                    popupState.id,
                    nama
                );
            }

        }

        tutupPopup();

        await bersihMasterData();

    } catch (e) {
        console.error(e);
        alert("Gagal menyimpan data");
    }
}
function editLevel(id, nama) {
    showPopupEditDataMaster("level", {
        id,
        nama
    });
}
function editKategori(id, nama) {
    showPopupEditDataMaster("kategori", {
        id,
        nama
    });
}
function validasiSimpan(){
    let valid = true;

    [
        "popup-master-data-input"
    ].forEach(id => {
        if(!getValue(id)){
            tandaiInvalid(getEl(id));
            valid = false;
        }
    });

    return valid;
}
async function simpanLevel(nama) {

    const response = await fetch(BASE_URL_LEVEL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            level: nama
        })
    });

    if (!response.ok) {
        throw new Error("Gagal simpan level");
    }
}
async function updateLevel(id, nama) {

    const response = await fetch(`${BASE_URL_LEVEL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            level: nama
        })
    });

    if (!response.ok) {
        throw new Error("Gagal update level");
    }
}
async function simpanKategori(nama) {

    const response = await fetch(BASE_URL_KATEGORI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            kategori: nama
        })
    });

    if (!response.ok) {
        throw new Error("Gagal simpan kategori");
    }
}
async function updateKategori(id, nama) {

    const response = await fetch(`${BASE_URL_KATEGORI}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            kategori: nama
        })
    });

    if (!response.ok) {
        throw new Error("Gagal update kategori");
    }
}
function showPopupKonfirmasi(mode, id, nama) {

    deleteState.mode = mode;
    deleteState.id = id;

    getEl("popup-konfirmasi-title").textContent =
        "Konfirmasi Hapus";

    getEl("popup-konfirmasi-message").textContent =
        `Yakin ingin menghapus ${nama}?`;

    getEl("popup-konfirmasi")
        .classList
        .add("show");
}
function tutupPopupKonfirmasi() {

    getEl("popup-konfirmasi")
        .classList
        .remove("show");

    deleteState.mode = null;
    deleteState.id = null;
}
function hapusLevel(id, nama) {
    showPopupKonfirmasi(
        "level",
        id,
        nama
    );
}
function hapusKategori(id, nama) {
    showPopupKonfirmasi(
        "kategori",
        id,
        nama
    );
}
async function konfirmasiHapus() {

    try {

        if (deleteState.mode === "level") {

            await deleteLevel(
                deleteState.id
            );

        } else if (
            deleteState.mode === "kategori"
        ) {

            await deleteKategori(
                deleteState.id
            );
        }

        tutupPopupKonfirmasi();

        await bersihMasterData();

    } catch (e) {

        console.error(e);

        alert(
            e.message ||
            "Gagal menghapus data"
        );
    }
}
async function deleteLevel(id) {

    const response =
        await fetch(
            `${BASE_URL_LEVEL}/${id}`,
            {
                method: "DELETE"
            }
        );

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            text || "Gagal hapus level"
        );
    }
}
async function deleteKategori(id) {

    const response =
        await fetch(
            `${BASE_URL_KATEGORI}/${id}`,
            {
                method: "DELETE"
            }
        );

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            text ||
            "Gagal hapus kategori"
        );
    }
}

window.initMasterData = initMasterData;
window.editLevel = editLevel;
window.editKategori = editKategori;
window.hapusLevel = hapusLevel;
window.hapusKategori = hapusKategori;