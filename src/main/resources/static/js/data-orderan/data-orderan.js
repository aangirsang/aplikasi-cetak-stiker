let isEdit = false;

let currentPageOrderan = 1;
let cariDataOrderan = "";
let tanggalAwalOrderan = "";
let tanggalAkhirOrderan = "";
const rowsPerPageOrderan = 15;

let sortFieldDataOrderan = "tanggal";
let sortDirectionOrderan = "desc";

let openedDetailOrderanId = null;

let dataOrderan = [];
let selectOrderan = null;
let selectUmkm = null;

let stikerTerpilih = [];
let rincian = [];

async function initDataOrderan() {

    await initPopupLoading();
    await initPopupHapus();
    await initPopupPilihUmkm();
    await initPopupPilihStiker();
    await initPopupCetakOrderan();

    await loadTabelDataOrderan(true);

    getEl("btn-tambah-data-orderan")
        .addEventListener("click",  () => showPopupOrderan());

    getEl("btn-batal-data-order")
        .addEventListener("click", closePopupOrderan);

    getEl("btn-umkm-data-order")
        .addEventListener("click",  () => tampilPopupPilihUmkm());

    getEl("btn-stiker-data-order")
        .addEventListener("click",  () => tampilPopupPilihStiker());

    getEl("btn-simpan-data-order")
        .addEventListener("click",  () => simpanDataOrderan());

    cariDataOrderan = "";
    tanggalAwalOrderan = "";
    tanggalAkhirOrderan = "";

    getEl("txt-cari-data-orderan")
        .addEventListener("input", async function() {
            cariDataOrderan = this.value.trim().toLowerCase();
            currentPageOrderan = 1;
            openedDetailOrderanId = null;
            await loadTabelDataOrderan();
        })

    getEl("cari-tanggal-awal")
        .addEventListener("change", async function () {
        tanggalAwalOrderan = this.value;
        currentPageOrderan = 1;
        await loadTabelDataOrderan();
    });

    getEl("cari-tanggal-akhir")
        .addEventListener("change", async function () {
        tanggalAkhirOrderan = this.value;
        currentPageOrderan = 1;
        await loadTabelDataOrderan();
    });


    document.removeEventListener("click", closeDetailOrderanOutside);
    document.addEventListener("click", closeDetailOrderanOutside);
}

// POPUP
async function showPopupOrderan(id = null) {
    const popup = getEl("popup-data-orderan")
    const popupTitle = getEl("title-popup-data-orderan")

    await bersihPopupDataOrderan();

    if(id) {
        popupTitle.textContent = "Edit Data Orderan";
        isEdit = true;
        selectOrderan = dataOrderan.find(order => order.id === id);
        rincian = selectOrderan.rincian;

        isiPopupOrderan();

    } else {
        popupTitle.textContent = "Tambah Data Orderan";
        isEdit = false;
    }

    popup.classList.add("show");
}
function tampilPopupCetakOrderan(id) {
    selectOrderan = dataOrderan.find(order => order.id === id);
    if(selectOrderan){
        showPopupCetakOrderan(selectOrderan)
    }
}
function isiPopupOrderan() {
    selectUmkm = {
        id: selectOrderan.dataUmkmId,
        namaUmkm: selectOrderan.namaUmkm,
        namaPemilik: selectOrderan.namaPemilik,
        alamat: selectOrderan.alamat,
        instagram: selectOrderan.instagram,
        noTelpon: selectOrderan.noTelpon
    };

    rincian.map(rinci => {
        stikerTerpilih.push({
            id: rinci.stikerId,
            kodeStiker: rinci.kodeStiker,
            namaStiker: rinci.namaStiker,
            pathGambar1: rinci.pathGambar1,
        })
    })

    getEl("data-order-nama-usaha").value =
        selectOrderan.namaUmkm;
    getEl("data-order-nama-pemilik").value =
        selectOrderan.namaPemilik;
    getEl("data-order-instagram").value =
        selectOrderan.instagram;
    getEl("data-order-kontak").value =
        selectOrderan.noTelpon;
    getEl("data-order-alamat").value =
        selectOrderan.alamat;

    getEl("data-order-faktur").textContent =
        selectOrderan.faktur;
    getEl("data-order-tanggal").textContent =
        formatTanggal(selectOrderan.tanggal)

    tampilBtnStikerDataOrder(false)
    renderListStikerDataOrder();
    updateTotalJumlahDataOrder();
}
function closePopupOrderan() {
    getEl("popup-data-orderan").classList.remove("show");
}
async function bersihPopupDataOrderan() {
    await getFaktur();

    selectOrderan = null;
    selectUmkm = null;

    stikerTerpilih = [];
    rincian = [];

    renderListStikerDataOrder();

    tampilBtnStikerDataOrder(true);


    [
        "data-order-nama-usaha",
        "data-order-nama-pemilik",
        "data-order-instagram",
        "data-order-kontak",
        "data-order-alamat"
    ].forEach(id => getEl(id).value = "");

    getEl("data-order-jumlah").textContent =
        "0 Lembar";


    getEl("data-order-tanggal").textContent =
        new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    isEdit = false;
}
async function getFaktur() {
    showLoading("Mengambil data faktur..")
    try {
        const response = await fetch(`${BASE_URL_ORDERAN}/faktur`);

        if (!response.ok) {
            showToast("Gagal mengambil data faktur!!", "error");
            return;
        }

        const faktur = await response.json();

        getEl("data-order-faktur").textContent = faktur.faktur;

    } catch (e) {
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
function renderListStikerDataOrder(){

    const container =
        getEl("data-order-stiker-list");

    if(!rincian ||
        rincian.length === 0){

        container.innerHTML = `
            <div class="empty-data">
                Belum ada stiker dipilih
            </div>
        `;

        return;
    }

    container.innerHTML =
        rincian.map(rinci => `
        <div class="item-card"
        id="item-card-${rinci.stikerId}"
        onclick="lihatStiker(${rinci.stikerId})">

            <div class="stiker-image">
                <img
                    src="${rinci.pathGambar1
                    ? `${BASE_URL}${rinci.pathGambar1}`
                    : noImageStiker}"
                    alt="${rinci.namaStiker}">
            </div>

            <div class="stiker-info">
                <div class="stiker-nama">
                    ${rinci.namaStiker}
                </div>

                <div class="stiker-ukuran">
                    ${rinci.ukuranStiker} cm
                </div>
            </div>

            <div class="jumlah-cetak-group">

                <label>Jumlah Cetak</label>
            
                <div class="input-jumlah-wrapper">
                    <input
                        type="text"
                        value="${rinci.jumlah || ''}"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        onclick="event.stopPropagation()"
                        oninput="
                            this.value=this.value.replace(/[^0-9]/g,'');
                            updateJumlahCetakDataOrder('${rinci.stikerId}', this.value);
                        "
                        placeholder="Masukkan jumlah cetak">
            
                    <span class="input-satuan-lembar">Lembar</span>
                </div>
            
                <button
                    type="button"
                    onclick="
                    event.stopPropagation();
                    hapusStikerDataOrder('${rinci.stikerId}')
                    ">
                    Hapus
                </button>
                            
            </div>


        </div>
    `).join("");
}
function tampilBtnStikerDataOrder(status) {
    const btnStiker = getEl("btn-stiker-data-order");
    btnStiker.disabled = status;
    if (status === true){
        btnStiker.classList.add("btn-disabled");
    } else {
        btnStiker.classList.remove("btn-disabled");
    }
}
async function tampilPopupPilihUmkm(){
    await showPopupPilihUmkm(async (umkm) => {
        await bersihPopupDataOrderan();

        selectUmkm = umkm;

        getEl("data-order-nama-usaha").value =
            umkm.namaUsaha;
        getEl("data-order-nama-pemilik").value =
            umkm.namaPemilik;
        getEl("data-order-instagram").value =
            umkm.instagram;
        getEl("data-order-kontak").value =
            umkm.noTelpon;
        getEl("data-order-alamat").value =
            umkm.alamat;

        tampilBtnStikerDataOrder(false)

    }, selectUmkm);
}
async function tampilPopupPilihStiker(){
    await showPopupPilihStiker((stikerDipilih) => {

        const rincianBaru = [];

        stikerDipilih.forEach(stiker => {

            // cek apakah sudah ada sebelumnya
            const lama = rincian.find(r =>
                r.stikerId === stiker.id
            );

            if (lama) {
                // pertahankan jumlah lama
                rincianBaru.push({
                    ...lama
                });
            } else {
                // stiker baru
                rincianBaru.push({
                    stikerId: stiker.id,
                    kodeStiker: stiker.kodeStiker,
                    namaStiker: stiker.namaStiker,
                    ukuranStiker: `${stiker.panjang} x ${stiker.lebar}`,
                    pathGambar1: stiker.pathGambar1,
                    jumlah: 1
                });
            }
        });

        rincian = rincianBaru;
        stikerTerpilih = [...stikerDipilih];

        renderListStikerDataOrder();
    },selectUmkm, stikerTerpilih);
}
function hapusStikerDataOrder(id){

    rincian =
        rincian.filter(
            item => item.stikerId !== id
        );

    stikerTerpilih =
        stikerTerpilih.filter(
            item => item.id !== id
        );

    renderListStikerDataOrder();
    updateTotalJumlahDataOrder()
}
function updateJumlahCetakDataOrder(id, value){

    const stiker = rincian.find(
        item => item.stikerId  === id
    );

    if(stiker){

        stiker.jumlah =
            value === ""
                ? 0
                : parseInt(value);

        updateTotalJumlahDataOrder();
    }
}
function updateTotalJumlahDataOrder(){

    const total = rincian.reduce(
        (sum, item) => sum + (item.jumlah || 0),
        0
    );

    getEl("data-order-jumlah").textContent =
        `${total} Lembar`;
}

//TABEL
async function loadTabelDataOrderan(reload = false) {
    showLoading("Memuat Data Orderan..");
    try {
        if(reload){
            dataOrderan = await fetchDataOrderan();
            cariDataOrderan = "";
        }

        const filtered = await getFilterDataOrderan();
        const sorted = await getsortedDataOrderan(filtered);
        const paginated = getPaginatedData(sorted, currentPageOrderan, rowsPerPageOrderan)

        renderTabelOrderan(paginated);
        loadPagination(
            "pagination",
            filtered.length,
            currentPageOrderan,
            rowsPerPageOrderan,
            changePageOrderan
        );
    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataOrderan = [];
    } finally {
        hideLoading();
    }
}
async function fetchDataOrderan() {
    const response = await fetch(BASE_URL_ORDERAN);

    if(!response.ok){
        throw new Error("Gagal Memuat Data Orderan!");
    }

    return await response.json();
}
function getFilterDataOrderan() {
    return dataOrderan.filter(orderan => {

        const keyword = cariDataOrderan;
        const tanggal = formatTanggal(orderan.tanggal).toLowerCase();

        // =====================
        // Filter tanggal
        // =====================

        const tanggalOrder = new Date(orderan.tanggal);
        tanggalOrder.setHours(0, 0, 0, 0);

        let cocokTanggal = true;

        if (tanggalAwalOrderan || tanggalAkhirOrderan) {

            const awal = new Date(tanggalAwalOrderan || tanggalAkhirOrderan);
            awal.setHours(0, 0, 0, 0);

            const akhir = new Date(tanggalAkhirOrderan || tanggalAwalOrderan);
            akhir.setHours(23, 59, 59, 999);

            cocokTanggal =
                tanggalOrder >= awal &&
                tanggalOrder <= akhir;
        }

        // =====================
        // Filter keyword
        // =====================

        const cocokKeyword =
            orderan.namaPengguna.toLowerCase().includes(keyword) ||
            orderan.namaUmkm.toLowerCase().includes(keyword) ||
            orderan.faktur.toLowerCase().includes(keyword) ||
            tanggal.includes(keyword) ||
            orderan.totalStiker.toString().includes(keyword) ||
            orderan.rincian.some(rinci =>
                rinci.namaStiker.toLowerCase().includes(keyword) ||
                rinci.kodeStiker.toLowerCase().includes(keyword) ||
                rinci.ukuranStiker.toLowerCase().includes(keyword)
            );

        return cocokKeyword && cocokTanggal;
    });
}
function getsortedDataOrderan(data) {
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldDataOrderan];
        let valueB = b[sortFieldDataOrderan];

        if (sortFieldDataOrderan === "namaPengguna") {
            valueA = a.namaPengguna ?? ""
            valueB = b.namaPengguna ?? ""
        }

        if (sortFieldDataOrderan === "namaUmkm") {
            valueA = a.namaUmkm ?? ""
            valueB = b.namaUmkm ?? ""
        }

        if (sortFieldDataOrderan === "faktur") {
            valueA = a.faktur ?? ""
            valueB = b.faktur ?? ""
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionOrderan === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionOrderan === "asc" ? result : -result;
    })
}
function renderTabelOrderan(data) {
    const tbody = getEl("tbl-body-data-orderan");

    tbody.innerHTML = data.map(item => {
        const isOpened = openedDetailOrderanId === item.id;

        return createTabelOrderan(item, isOpened);
    }).join("");
}
function createTabelOrderan(item, isOpened) {
    return `
        <tr 
            class="orderan-row ${isOpened ? 'selected' : ''}"
            onclick="event.stopPropagation(); toggleDetailOrderan('${item.id}')"
        >
            <td>${item.faktur}</td>
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.namaUmkm}</td>
            <td>${item.totalStiker}</td>
            <td>
                <div class="actions">
                    <button
                        onclick="event.stopPropagation(); tampilPopupCetakOrderan('${item.id}')">
                        <span class="material-symbols-sharp">print</span>
                    </button>

                    <button
                        onclick="event.stopPropagation(); showPopupOrderan('${item.id}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>

                    <button onclick="event.stopPropagation(); konfirmasiHapusDataOrderan('${item.id}')">
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
                                <th>Kode Stiker</th>
                                <th>Nama Stiker</th>
                                <th>Ukuran Stiker</th>
                                <th>Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                             ${item.rincian.map(rinci => `
                                    <tr>
                                        <td>${rinci.kodeStiker}</td>
                                        <td>${rinci.namaStiker}</td>
                                        <td>${rinci.ukuranStiker}</td>
                                        <td>${rinci.jumlah}</td>
                                    </tr>
                                `).join("")}
                        </tbody>
                    </table>
                </div>
            </td>
        </tr>
    `
}
async function sortTabelOrderan(field) {
    if(sortFieldDataOrderan === field) {
        sortDirectionOrderan = sortDirectionOrderan === "asc" ? "desc" : "asc";
    } else {
        sortFieldDataOrderan = field;
        sortDirectionOrderan = "asc";
    }

    await loadTabelDataOrderan();
}
async function changePageOrderan(page){
    currentPageOrderan = page;
    await loadTabelDataOrderan();
}
async function toggleDetailOrderan(id) {
    openedDetailOrderanId = openedDetailOrderanId === id ? null : id;

    await loadTabelDataOrderan();

    setTimeout(() => {
        document.querySelector(".detail-table.show")?.scrollIntoView({
            behavior:"smooth",
            block:"nearest"
        });
    }, 50);
}
async function closeDetailOrderanOutside(event){
    if(event.target.closest(".orderan-row, .detail-table")) return;
    if(openedDetailOrderanId === null) return;

    openedDetailOrderanId = null;
    await loadTabelDataOrderan();
}
async function destroyDataOrderan() {

    // Hapus event listener
    document.removeEventListener(
        "click",
        closeDetailOrderanOutside
    );

    // Reset state
    openedDetailOrderanId = null;

}

//CRUD
async function simpanDataOrderan(){
    if(!selectUmkm){
        tandaiInvalid(getEl('form-data-order-grid-kiri'));
        showToast("Belum ada umkm yang dipilih!!","warning");
        return;
    }else if(rincian.length === 0){
        tandaiInvalid(getEl('form-data-order-grid-kanan'));
        showToast("Belum ada stiker yang dipilih!!","warning");
        return;
    }

    const body = {
        dataPenggunaId: penggunaAktif.id,
        dataUmkmId: selectUmkm.id,
        rincian: rincian.map(rinci =>({
            dataStikerId: rinci.stikerId,
            jumlah: rinci.jumlah
        }))
    };

    showLoading(
        isEdit
            ? "Mengubah Data Pembelian..."
            : "Menyimpan Data Pembelian...");

    try {
        if(isEdit) {
            const response = await fetch(`${BASE_URL_ORDERAN}/${selectOrderan.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });
            if(await gagalSimpan(response)) return;
        } else {
            const response = await fetch(BASE_URL_ORDERAN, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });
            if(await gagalSimpan(response)) return;
        }

        await loadTabelDataOrderan(true);
        closePopupOrderan();
        showToast("Simpan data orderan berhasil..", "success")
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
async function hapusDataOrderan(id){
    showLoading("Menghapus Data Orderan...");
    try {
        const response = await fetch(`${BASE_URL_ORDERAN}/${id}`, {
            method: "DELETE"
        });
        
        if(await gagalHapus(response)) return;
        
        await loadTabelDataOrderan(true);
        showToast("Hapus data orderan berhasil..", "success")
    } catch (e){
        showToast(e.message, "error");
    } finally {
        hideLoading();
    }
}
function konfirmasiHapusDataOrderan(id) {
    showPopupHapus({
        title: "Konfirmasi Hapus Data Orderan",
        message: "Anda yakin ingin menghapus Data Orderan ini?",
        onConfirm: async () => {
            await hapusDataOrderan(id);
        }
    });
}

window.initDataOrderan = initDataOrderan;
window.updateJumlahCetakDataOrder = updateJumlahCetakDataOrder;
window.hapusStikerDataOrder = hapusStikerDataOrder;
window.sortTabelOrderan = sortTabelOrderan;
window.destroyDataOrderan = destroyDataOrderan;
window.toggleDetailOrderan = toggleDetailOrderan;
window.showPopupOrderan = showPopupOrderan;
window.tampilPopupCetakOrderan = tampilPopupCetakOrderan;
window.konfirmasiHapusDataOrderan = konfirmasiHapusDataOrderan;