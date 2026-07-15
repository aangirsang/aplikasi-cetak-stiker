let isEditDataPembelian = false;

let sortFieldPopupPembelian = "namaBarang";
let sortDirectionPopupPembelian = "asc";

let currentPagePembelian = 1;
let cariDataPembelian = "";
const rowsPerPagePembelian = 15;

let sortFieldDataPembelian = "tanggal";
let sortDirectionPembelian = "desc";

let openedDetailPembelianId = null;

let dataPembelian = [];
let selectPembelian = null;

let dataPembelianRinci = [];

async function initDataPembelian(){

    await initPilihBarang();
    await initPopupLoading();
    await initPopupHapus();
    await loadTabelDataPembelian(true);
    bersihPopupDataPembelian();

    getEl("btn-tambah-data-pembelian").addEventListener("click", () => showPopupPembelian());
    getEl("btn-popup-data-pembelian-simpan").addEventListener("click", () => simpanDataPembelian());
    getEl("btn-popup-data-pembelian-batal").addEventListener("click", closePopupPembelian);
    getEl("btn-popup-data-pembelian-barang").addEventListener(
        "click", () => tampilPopupPilihBarang());


    getEl("txt-cari-data-pembelian").addEventListener("input", async function(){
        cariDataPembelian = this.value.trim().toLowerCase();
        currentPagePembelian = 1;
        openedDetailPembelianId = null;
        await loadTabelDataPembelian();
    });

    document.removeEventListener("click", closeDetailPembelianOutside);
    document.addEventListener("click", closeDetailPembelianOutside);

}

// POPUP
function bersihPopupDataPembelian() {
    getEl("data-pemebelian-tanggal").textContent =
        new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    selectPembelian = null;
    dataPembelianRinci = [];
    isEditDataPembelian = false;

    renderTablePembelianRinci();
}
function showPopupPembelian(id = null){
    const popup = getEl("popup-data-pembelian");
    const popupTitle = getEl("popup-data-pembelian-title");

    bersihPopupDataPembelian();

    if(id) {
        popupTitle.textContent = "Edit Data Pembelian";
        isEditDataPembelian = true;
        selectPembelian = dataPembelian.find(item => item.id === id);
        dataPembelianRinci = selectPembelian.rincian;

        renderTablePembelianRinci();

    } else {
        popupTitle.textContent = "Tambah Data Pembelian";
        isEditDataPembelian = false;
    }

    popup.classList.add("show");
}
function closePopupPembelian(){
    getEl("popup-data-pembelian").classList.remove("show");

}
async function tampilPopupPilihBarang() {
    await showPopupPilihBarang(async (barang) =>{
        // Cek apakah barang sudah ada
        const index = dataPembelianRinci.findIndex(x => x.dataBarangId === barang.id);

        if(index >= 0){
            dataPembelianRinci[index].jumlah++;
        }else{
            dataPembelianRinci.push({
                id: barang.id,
                dataBarangId: barang.id,
                namaBarang: barang.namaBarang,
                harga: 0,
                jumlah: 1
            });
        }

        renderTablePembelianRinci();
    });
}

// TABEL
async function loadTabelDataPembelian(reload = false) {
    showLoading("Memuat Data Pembelian..");
    try {
        if(reload){
            dataPembelian = await fetchDataPembelian();
            cariDataPembelian = "";
        }

        const filtered = await getFilterDataPembelian();
        const sorted = await getsortedDataPembelian(filtered);
        const paginated = getPaginatedData(sorted, currentPagePembelian, rowsPerPagePembelian)

        renderTabelPembelian(paginated);
        loadPagination(
            "pagination",
            filtered.length,
            currentPagePembelian,
            rowsPerPagePembelian,
            changePagePembelian
        );
    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataPembelian = [];
    } finally {
        hideLoading();
    }
}
async function fetchDataPembelian() {
    const response = await fetch(BASE_URL_PEMBELIAN);

    if(!response.ok){
        throw new Error("Gagal Memuat Data Pembelian!");
    }

    return await response.json();
}
function getFilterDataPembelian() {
    return dataPembelian.filter(pembelian => {

        const keyword = cariDataPembelian;
        const tanggal = formatTanggal(pembelian.tanggal).toLowerCase();

        return (
            pembelian.namaPengguna.toLowerCase().includes(keyword) ||
            tanggal.includes(keyword) ||
            pembelian.subtotal.toString().includes(keyword) ||
            pembelian.rincian.some(rinci =>
                rinci.namaBarang.toLowerCase().includes(keyword)
            )
        );
    });
}
function getsortedDataPembelian(data) {
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldDataPembelian];
        let valueB = b[sortFieldDataPembelian];

        if (sortFieldDataPembelian === "namaPengguna") {
            valueA = a.namaPengguna ?? ""
            valueB = b.namaPengguna ?? ""
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionPembelian === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionPembelian === "asc" ? result : -result;
    })
}
function renderTabelPembelian(data) {
    const tbody = getEl("tbl-body-data-pembelian");

    tbody.innerHTML = data.map(item => {
        const isOpened = openedDetailPembelianId === item.id;

        return createTabelPembelian(item, isOpened);
    }).join("");
}
function createTabelPembelian(item, isOpened) {
    return `
        <tr 
            class="pembelian-row ${isOpened ? 'selected' : ''}"
            onclick="event.stopPropagation(); toggleDetailPembelian('${item.id}')"
        >
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.namaPengguna}</td>
            <td>${item.subtotal}</td>
            <td>
                <div class="actions">
                    <button
                        onclick="event.stopPropagation(); showPopupPembelian('${item.id}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="event.stopPropagation(); konfirmasiHapusDataPembelian('${item.id}')">
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
                                <th>Nama Barang</th>
                                <th>Harga</th>
                                <th>Jumlah</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                             ${
                                item.rincian.map(rinci => `
                                    <tr>
                                        <td>${rinci.namaBarang}</td>
                                        <td>${formatRupiah(rinci.harga)}</td>
                                        <td>${rinci.jumlah}</td>
                                        <td>${formatRupiah(rinci.total)}</td>
                                    </tr>
                                `).join("")
    }
                        </tbody>
                    </table>
                </div>
            </td>
        </tr>
    `
}
async function sortTabelPembelian(field) {
    if(sortFieldDataPembelian === field) {
        sortDirectionPembelian = sortDirectionPembelian === "asc" ? "desc" : "asc";
    } else {
        sortFieldDataPembelian = field;
        sortDirectionPembelian = "asc";
    }

    await loadTabelDataPembelian();
}
async function changePagePembelian(page){
    currentPagePembelian = page;
    await loadTabelDataPembelian();
}
async function toggleDetailPembelian(id) {
    openedDetailPembelianId = openedDetailPembelianId === id ? null : id;

    await loadTabelDataPembelian();

    setTimeout(() => {
        document.querySelector(".detail-table.show")?.scrollIntoView({
            behavior:"smooth",
            block:"nearest"
        });
    }, 50);
}
async function closeDetailPembelianOutside(event){
    if(event.target.closest(".pembelian-row, .detail-table")) return;
    if(openedDetailPembelianId === null) return;

    openedDetailPembelianId = null;
    await loadTabelDataPembelian();
}
async function destroyDataPembelian() {

    // Hapus event listener
    document.removeEventListener(
        "click",
        closeDetailPembelianOutside
    );

    // Reset state
    openedDetailPembelianId = null;

}

function renderTablePembelianRinci(){

    const tbody = getEl("tbl-body-data-pembelian-rinci");
    tbody.innerHTML = "";

    let subtotal = 0;

    dataPembelianRinci.forEach((item,index)=>{

        const total = item.harga * item.jumlah;
        subtotal += total;

        tbody.innerHTML += `
            <tr>
                <td>${item.namaBarang}</td>

                <td>
                    <input
                        type="number"
                        value="${item.harga}"
                        min="0"
                        step="1000"
                        style="text-align:center"
                        onchange="ubahHargaPembelian(${index}, this.value)">
                </td>

                <td>
                    <input
                        type="number"
                        value="${item.jumlah}"
                        min="1"
                        style="text-align:center"
                        onchange="ubahJumlahPembelian(${index}, this.value)">
                </td>

                <td>
                    ${formatRupiah(total)}
                </td>
                <td>
                    <div class="actions">
                        <button onclick="event.stopPropagation(); hapusBarang(${index})">
                            <span class="material-symbols-sharp">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    getEl("data-pemebelian-subtota").textContent =
        "Subtotal : " + formatRupiah(subtotal);
}
function ubahHargaPembelian(index, value){

    dataPembelianRinci[index].harga = Number(value);

    renderTablePembelianRinci();
}
function ubahJumlahPembelian(index, value){

    value = Number(value);

    if(value < 1){
        value = 1;
    }

    dataPembelianRinci[index].jumlah = value;

    renderTablePembelianRinci();
}
function formatRupiah(angka){

    return new Intl.NumberFormat("id-ID",{
        style:"currency",
        currency:"IDR",
        minimumFractionDigits:0
    }).format(angka);

}
async function sortTablePembelianRinci(field){
    if(sortFieldPopupPembelian === field){
        sortDirectionPopupPembelian = sortDirectionPopupPembelian === "asc" ? "desc" : "asc";
    } else {
        sortFieldPopupPembelian = field;
        sortDirectionPopupPembelian = "asc";
    }

}
function hapusBarang(index) {
    dataPembelianRinci.splice(index, 1);
    renderTablePembelianRinci();
}

// CRUD
async function simpanDataPembelian(){
    console.log(penggunaAktif)
    if(dataPembelianRinci.length === 0){
        showToast("Belum ada barang.", "warning");
        return;
    }
    const body = {
        dataPenggunaId: penggunaAktif.id, // sesuaikan dengan user login
        rincian: dataPembelianRinci.map(item => ({
            dataBarangId: item.dataBarangId,
            harga: item.harga,
            jumlah: item.jumlah
        }))
    };
    showLoading(
        isEditDataPembelian
        ? "Mengubah Data Pembelian..."
        : "Menyimpan Data Pembelian...");

    try {
        if(isEditDataPembelian){
            const response = await fetch(`${BASE_URL_PEMBELIAN}/${selectPembelian.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });
            if(await gagalSimpan(response)) return;
        } else {
            const response = await fetch(`${BASE_URL_PEMBELIAN}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            if(await gagalSimpan(response)) return;
        }
        closePopupPembelian();
        await loadTabelDataPembelian(true);
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
function konfirmasiHapusDataPembelian(id) {
    showPopupHapus({
        title: "Konfirmasi Hapus Data Pembelian",
        message: "Anda yakin ingin menghapus Data Pembelian ini?",
        onConfirm: async () => {
            await hapusDataPembelian(id);
        }
    });
}
async function hapusDataPembelian(id) {
    showLoading("Menghapus Data Pembelian...");
    try {
        const response = await fetch(`${BASE_URL_PEMBELIAN}/${id}`, {
            method: "DELETE"
        });

        if (await gagalHapus(response)) return;

        await loadTabelDataPembelian(true);
        showToast("Data pembelian berhasil dihapus", "success");
    } catch (e){
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}

window.initDataPembelian = initDataPembelian;
window.sortTablePembelianRinci = sortTablePembelianRinci;
window.ubahHargaPembelian = ubahHargaPembelian;
window.ubahJumlahPembelian = ubahJumlahPembelian;
window.formatRupiah = formatRupiah;
window.hapusBarang = hapusBarang;
window.toggleDetailPembelian = toggleDetailPembelian;
window.destroyDataPembelian = destroyDataPembelian;
window.showPopupPembelian = showPopupPembelian;
window.konfirmasiHapusDataPembelian = konfirmasiHapusDataPembelian;
window.sortTabelPembelian = sortTabelPembelian;