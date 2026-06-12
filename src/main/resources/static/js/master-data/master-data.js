let isEdit = false;
const BASE_URL =
    "http://localhost:8080/api/data-level";

function initMasterData() {
    loadDataLevel();
    getEl("btn-tambah-level").addEventListener("click", showPopupTambahDataMaster);
    getEl("btn-simpan-master-data").addEventListener("click", simpanMasterData);
    getEl("btn-batal-master-data").addEventListener("click", closePopup);
}
function showPopupTambahDataMaster(id = null){

    console.log("Klik Tambah Master Data");
    const popup = getEl("popup-tambah-master-data");

    popup.classList.add("show");

}
function closePopup() {

    document
        .getElementById("popup-tambah-master-data")
        .classList.remove('active');
    document
        .getElementById("popup-tambah-master-data")
        .classList.remove('show');
}
async function loadDataLevel() {
    const response = await fetch(BASE_URL)
    const data = await response.json();
    const levelList = document.getElementById("level-list")

    let html = "";

    data.forEach(level => {

        html += `
            <div class="list-item">
                <h3>${level.level}</h3>
            <button
                    class="delete-btn"
                    
                >
                    <span class="material-symbols-sharp">
                        delete
                    </span>
                </button>
            </div>
        `;
    });

    levelList.innerHTML = html;
}
async function simpanMasterData() {
    if(!validasiLevel()) return;
    const level =getValue("popup-tambah-master-data-input")

    const body = {level: level};

    try {
        const response =
            await fetch(BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify(
                        body
                    )
            });

        const result =
            await response.json();
        closePopup();
        console.log(result);

        alert(
            "Berhasil disimpan"
        );

        loadDataLevel();

    } catch (error) {
        console.error(error);
    }
}
function validasiLevel(){
    let valid = true;

    [
        "popup-tambah-master-data-input"
    ].forEach(id => {
        if(!getValue(id)){
            tandaiInvalid(getEl(id));
            valid = false;
        }
    });

    return valid;
}
window.initMasterData = initMasterData;