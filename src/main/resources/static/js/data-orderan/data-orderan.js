let observerOrderan = null;
let totalElementsOrderan = 0;
let totalCetakOrderan = null;
let reqIdOrderan = 0;
let timerCariOrderan = null;
const cacheRincianOrderan = new Map();

let isEdit = false;

let currentPageOrderan = 1;
let cariDataOrderan = "";
let tanggalAwalOrderan = "";
let tanggalAkhirOrderan = "";
let rowsPerPageOrderan = 12;

let pickerDownload = "";
let tanggalAwalDownloadOrderan = "";
let tanggalAkhirDownloadOrderan = "";
let selectedRekap = "";

let sortFieldDataOrderan = "tanggal";
let sortDirectionOrderan = "desc";

let openedDetailOrderanId = null;

let dataOrderan = [];
let selectOrderan = null;
let selectUmkm = null;

let stikerTerpilih = [];
let rincian = [];

const escHtml = s => String(s ?? "").replace(/[&<>"']/g,
    c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

async function initDataOrderan() {

    function debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    dataOrderan = null; // buang data dari kunjungan sebelumnya

    await initPopupLoading();
    await initPopupHapus();
    await initPopupPilihUmkm();
    await initPopupPilihStiker();
    await initPopupCetakOrderan();
    await initCustomSelectRekap();

    await loadTabelDataOrderan(true);

    // observer dipasang SETELAH data dimuat, pada card milik halaman ini
    const card = getEl("tbl-body-data-orderan").closest(".tabel-page-card");
    observerOrderan = new ResizeObserver(debounce(() => {
        // halaman sudah diganti: lepas sendiri
        if (!card.isConnected) {
            observerOrderan.disconnect();
            return;
        }
        if (ukuranHalamanOrderan() !== rowsPerPageOrderan) {
            renderHalamanOrderan();
        }
    }, 150));
    observerOrderan.observe(card);

    getEl("btn-refresh-data-orderan")
        .addEventListener("click", async () => {
            await loadTabelDataOrderan(true);
            picker.clear();
        });

    getEl("btn-tambah-data-orderan")
        .addEventListener("click", () => showPopupOrderan());

    getEl("btn-download-data-orderan")
        .addEventListener("click", () => showPopupDownloadOrderan());

    getEl("btn-batal-data-order")
        .addEventListener("click", closePopupOrderan);

    getEl("btn-stiker-data-order")
        .addEventListener("click", () => tampilPopupPilihStiker());

    getEl("btn-simpan-data-order")
        .addEventListener("click", () => simpanDataOrderan());

    getEl("btn-popup-download-data-orderan-download")
        .addEventListener("click", () => downloadDataOrderan());

    getEl("btn-popup-download-data-orderan-batal")
        .addEventListener("click", () => closePopupDownloadOrderan());

    getEl("txt-cari-data-orderan").addEventListener(
        "input",
        debounce(async (e) => {
            cariDataOrderan = e.target.value.trim();
            currentPageOrderan = 1;
            openedDetailOrderanId = null;
            await loadTabelDataOrderan();
        }, 300)
    );

    const picker = flatpickr("#cari-range-tanggal-data-orderan", {
        locale: "id",
        mode: "range",
        dateFormat: "d F Y",
        async onClose(selectedDates) {
            if (selectedDates.length === 2) {
                tanggalAwalOrderan = selectedDates[0];
                tanggalAkhirOrderan = selectedDates[1];
            } else if (selectedDates.length === 0) {
                tanggalAwalOrderan = "";
                tanggalAkhirOrderan = "";
            } else {
                return; // baru satu tanggal dipilih, tunggu sampai lengkap
            }

            currentPageOrderan = 1;
            openedDetailOrderanId = null;
            await loadTabelDataOrderan();
        }
    });

    pickerDownload = flatpickr("#cari-range-tanggal-download-data-orderan", {
        locale: "id",
        mode: "range",
        dateFormat: "d F Y",
        async onClose(selectedDates) {
            if (selectedDates.length === 2) {
                tanggalAwalDownloadOrderan = selectedDates[0];
                tanggalAkhirDownloadOrderan = selectedDates[1];
            }
        }
    });

    // Hapus Pencarian
    const inputCariOrder = getEl("txt-cari-data-orderan");
    const tombolHapusCari = getEl("hapus-cari-data-orderan");

    function updateTombolHapusCari() {
        tombolHapusCari.hidden = inputCariOrder.value === "";
    }

    inputCariOrder.addEventListener("input", updateTombolHapusCari);

    tombolHapusCari.addEventListener("click", () => {
        inputCariOrder.value = "";
        inputCariOrder.dispatchEvent(new Event("input", { bubbles: true })); // picu pencarian ulang
        inputCariOrder.focus();
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
        selectOrderan = await getDataOrder(id);
        if (!selectOrderan) return;   // getDataOrder sudah menampilkan toast error
        rincian = selectOrderan.rincian;

        isiPopupOrderan();

    } else {
        popupTitle.textContent = "Tambah Data Orderan";
        isEdit = false;
        await showPopupPilihUmkm(true,async (umkm) => {
            await bersihPopupDataOrderan();

            selectUmkm = umkm;

            getEl("data-order-umkm").textContent =
                `${umkm.namaPemilik} - ${umkm.namaUsaha}`;

            popup.classList.add("show");

        }, selectUmkm);
        return;
    }

    popup.classList.add("show");
}
async function tampilPopupCetakOrderan(id) {
    selectOrderan = await getDataOrder(id);
    if (!selectOrderan) return;   // getDataOrder sudah menampilkan toast error
    if (selectOrderan) {
        showPopupCetakOrderan(selectOrderan)
    }
}
function isiPopupOrderan() {
    selectUmkm = {
        id: selectOrderan.dataUmkmId,
        namaUsaha: selectOrderan.namaUmkm,
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


    getEl("data-order-faktur").textContent =
        selectOrderan.faktur;
    getEl("data-order-tanggal").textContent =
        formatTanggal(selectOrderan.tanggal)
    getEl("data-order-umkm").textContent =
        `${selectOrderan.namaPemilik} - ${selectOrderan.namaUmkm}`;

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
    await showLoading("Mengambil data faktur..")
    try {
        const response = await apiFetch(`${BASE_URL_ORDERAN}/faktur`);

        if (!response.ok) {
            showToast("Gagal mengambil data faktur!!", "error");
            return;
        }

        const faktur = await response.json();

        getEl("data-order-faktur").textContent = faktur.faktur;

    } catch (e) {
        showToast(e.message, "error");
    } finally {
        await hideLoading();
    }
}
async function getDataOrder(id) {
    await showLoading("Mengambil data orderan..")
    try {
        const response = await apiFetch(`${BASE_URL_ORDERAN}/${id}`);

        if(!response.ok) {
            showToast("Gagal mengambil data orderan...", "error");
            return;
        }

        return await response.json();
    } catch (e) {
        showToast(e.message, "error");
    } finally {
        await hideLoading();
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
        onclick="lihatStikerOrderan('${rinci.stikerId}')">

            <div class="stiker-image">
                <img
                    src="${rinci.pathGambar1 ? `${BASE_URL}${rinci.pathGambar1}` : noImageStiker}"
                    alt="${rinci.namaStiker}"
                    onerror="this.onerror=null; this.src='${noImageStiker}';">
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
        updateTotalJumlahDataOrder();
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
async function lihatStikerOrderan(id){
    await showPopupLihatStiker(id);
}

//TABEL
function ukuranHalamanOrderan() {
    return Math.min(100, hitungRowsPerPageOrderan());
}
function siapkanPencarian(data) {
    data.forEach(o => {
        o._cari = [
            o.namaPengguna,
            o.namaUmkm,
            o.faktur,
            formatTanggal(o.tanggal),
            o.totalStiker,
            ...(o.rincian || []).map(r => `${r.namaStiker} ${r.kodeStiker} ${r.ukuranStiker}`)
        ].join(" ").toLowerCase();

        const hari = new Date(o.tanggal);
        hari.setHours(0, 0, 0, 0);
        o._hari = hari.getTime();
    });
    return data;
}
async function loadTabelDataOrderan(reload = false) {
    if (reload) await showLoading("Memuat Data Orderan..");

    try {
        if (reload) {
            cariDataOrderan = "";
            tanggalAwalOrderan = "";
            tanggalAkhirOrderan = "";
            currentPageOrderan = 1;
            cacheRincianOrderan.clear();
            getEl("txt-cari-data-orderan").value = "";
            getEl("txt-cari-data-orderan").focus();
        }

        await renderHalamanOrderan();

    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
    } finally {
        if (reload) await hideLoading();
    }
}
function bangunQueryOrderan() {
    const params = new URLSearchParams({
        page: currentPageOrderan - 1,   // backend mulai dari 0
        size: rowsPerPageOrderan
    });

    if (tanggalAwalOrderan || tanggalAkhirOrderan) {
        const a = new Date(tanggalAwalOrderan || tanggalAkhirOrderan);
        a.setHours(0, 0, 0, 0);
        const b = new Date(tanggalAkhirOrderan || tanggalAwalOrderan);
        b.setHours(23, 59, 59, 999);
        params.set("awal", a.getTime());
        params.set("akhir", b.getTime());
    }

    const kata = (cariDataOrderan || "").trim();
    if (kata) params.set("kata", kata);

    return params;
}
// satu-satunya tempat yang tahu bentuk JSON dari backend
function bacaResponseOrderan(json) {
    return {
        items:         json.content ?? [],
        totalElements: json.page?.totalElements ?? json.totalElements ?? 0,
        totalPages:    json.page?.totalPages    ?? json.totalPages    ?? 0,
        totalCetak:    json.totalCetak ?? null
    };
}
async function fetchDataOrderan() {
    const response = await apiFetch(`${BASE_URL_ORDERAN}/data-tabel?${bangunQueryOrderan()}`);

    if (!response.ok) {
        throw new Error("Gagal Memuat Data Orderan!");
    }

    return bacaResponseOrderan(await response.json());
}
function getFilterDataOrderan() {
    const keyword = cariDataOrderan;

    // hitung batas tanggal SEKALI, bukan per baris
    let awal = null, akhir = null;
    if (tanggalAwalOrderan || tanggalAkhirOrderan) {
        const a = new Date(tanggalAwalOrderan || tanggalAkhirOrderan);
        a.setHours(0, 0, 0, 0);
        awal = a.getTime();

        const b = new Date(tanggalAkhirOrderan || tanggalAwalOrderan);
        b.setHours(23, 59, 59, 999);
        akhir = b.getTime();
    }

    return dataOrderan.filter(o =>
        (awal === null || (o._hari >= awal && o._hari <= akhir)) &&
        (!keyword || o._cari.includes(keyword))
    );
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

function hitungRowsPerPageOrderan() {
    // layar kecil: tinggi tidak terkunci, jangan diukur
    if (modeResponsive()) return ROWS_TETAP_RESPONSIVE;

    const tbody = getEl("tbl-body-data-orderan");
    const card  = tbody?.closest(".tabel-page-card");
    if (!card) return rowsPerPageOrderan;

    const thead = card.querySelector("thead");
    const row   = tbody.querySelector("tr");

    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const rowHeight = row ? row.getBoundingClientRect().height : remPx * 2.8;

    const available = card.clientHeight - (thead ? thead.offsetHeight : 0);
    return Math.max(1, Math.floor(available / rowHeight));
}
async function renderHalamanOrderan(ukurUlang = true) {
    if (!getEl("tbl-body-data-orderan")) return; // halaman sudah ditinggalkan

    const myReq = ++reqIdOrderan;
    rowsPerPageOrderan = ukuranHalamanOrderan(); // backend membatasi 100

    try {
        const hasil = await fetchDataOrderan();

        // ada request yang lebih baru, atau halaman sudah ditinggalkan
        if (myReq !== reqIdOrderan || !getEl("tbl-body-data-orderan")) return;

        // halaman sekarang melewati batas (misal setelah hapus data): mundur lalu muat ulang
        if (hasil.totalPages > 0 && currentPageOrderan > hasil.totalPages) {
            currentPageOrderan = hasil.totalPages;
            return renderHalamanOrderan(ukurUlang);
        }

        totalElementsOrderan = hasil.totalElements;
        totalCetakOrderan = hasil.totalCetak;

        getEl("order-count").textContent = `Total Order: ${hasil.totalElements} Order`;
        getEl("print-count").textContent =
            `Total Cetak: ${hasil.totalCetak ?? "-"} Lembar`;

        renderTabelOrderan(hasil.items);
        loadPagination("pagination", hasil.totalElements, currentPageOrderan,
            rowsPerPageOrderan, changePageOrderan);

        // ukuran baris asli mungkin beda dari perkiraan: muat ulang sekali saja
        if (ukurUlang && ukuranHalamanOrderan() !== rowsPerPageOrderan) {
            return renderHalamanOrderan(false);
        }
    } catch (error) {
        if (myReq !== reqIdOrderan) return;
        console.error(error);
        showToast(error.message, "error");
    }
}
function renderTabelOrderan(data) {
    const tbody = getEl("tbl-body-data-orderan");
    if (!tbody) return;

    tbody.innerHTML = data.map(item =>
        createTabelOrderan(item, openedDetailOrderanId === item.id)
    ).join("");

    // detail yang sedang terbuka tapi isinya belum ada (misal setelah ganti halaman)
    if (openedDetailOrderanId && data.some(i => i.id === openedDetailOrderanId)) {
        muatRincianOrderan(openedDetailOrderanId);
    }
}
function createTabelOrderan(item, isOpened) {
    return `
        <tr
            class="orderan-row ${isOpened ? 'selected' : ''}"
            data-id="${escHtml(item.id)}"
            onclick="event.stopPropagation(); toggleDetailOrderan('${escHtml(item.id)}')"
        >
            <td>${escHtml(item.faktur)}</td>
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${escHtml(item.namaUmkm)}</td>
            <td>${escHtml(item.totalStiker)}</td>
            <td>
                <div class="actions">
                    <button onclick="event.stopPropagation(); tampilPopupCetakOrderan('${escHtml(item.id)}')">
                        <span class="material-symbols-sharp">print</span>
                    </button>
                    <button onclick="event.stopPropagation(); showPopupOrderan('${escHtml(item.id)}')">
                        <span class="material-symbols-sharp">edit</span>
                    </button>
                    <button onclick="event.stopPropagation(); konfirmasiHapusDataOrderan('${escHtml(item.id)}')">
                        <span class="material-symbols-sharp">delete</span>
                    </button>
                </div>
            </td>
        </tr>

        <tr class="detail-table ${isOpened ? "show" : ""}" data-id="${escHtml(item.id)}">
            <td colspan="5">
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
                        <tbody></tbody>
                    </table>
                </div>
            </td>
        </tr>
    `;
}
function htmlRincianOrderan(daftar) {
    if (!daftar.length) {
        return `<tr><td colspan="4">Tidak ada rincian</td></tr>`;
    }
    return daftar.map(r => `
        <tr>
            <td>${escHtml(r.kodeStiker)}</td>
            <td>${escHtml(r.namaStiker)}</td>
            <td>${escHtml(r.ukuranStiker)}</td>
            <td>${escHtml(r.jumlah)}</td>
        </tr>
    `).join("");
}
function tbodyRincianOrderan(id) {
    return document.querySelector(`.detail-table[data-id="${CSS.escape(id)}"] tbody`);
}
async function muatRincianOrderan(id) {
    if (cacheRincianOrderan.has(id)) {
        const tb = tbodyRincianOrderan(id);
        if (tb) tb.innerHTML = htmlRincianOrderan(cacheRincianOrderan.get(id));
        return;
    }

    const awal = tbodyRincianOrderan(id);
    if (awal) awal.innerHTML = `<tr><td colspan="4">Memuat...</td></tr>`;

    try {
        const response = await apiFetch(`${BASE_URL_ORDERAN}/${encodeURIComponent(id)}/rincian`);
        if (!response.ok) throw new Error("Gagal Memuat Rincian Orderan!");

        const data = await response.json();
        cacheRincianOrderan.set(id, data);

        // tabel bisa saja sudah dirender ulang selama menunggu, ambil elemennya lagi
        const tb = tbodyRincianOrderan(id);
        if (tb) tb.innerHTML = htmlRincianOrderan(data);
    } catch (error) {
        console.error(error);
        const tb = tbodyRincianOrderan(id);
        if (tb) tb.innerHTML = `<tr><td colspan="4">Gagal memuat rincian</td></tr>`;
        showToast(error.message, "error");
    }
}

// panggil setelah edit atau hapus orderan
function invalidasiRincianOrderan(id) {
    id ? cacheRincianOrderan.delete(id) : cacheRincianOrderan.clear();
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
async function changePageOrderan(page) {
    currentPageOrderan = page;
    await renderHalamanOrderan();
}
function toggleDetailOrderan(id) {

    const row = document.querySelector(
        `.orderan-row[data-id="${id}"]`
    );

    const detail = document.querySelector(
        `.detail-table[data-id="${id}"]`
    );

    if (!row || !detail) return;

    const isOpened = openedDetailOrderanId === id;

    // Tutup detail sebelumnya
    if (openedDetailOrderanId !== null) {

        const oldRow = document.querySelector(
            `.orderan-row[data-id="${openedDetailOrderanId}"]`
        );

        const oldDetail = document.querySelector(
            `.detail-table[data-id="${openedDetailOrderanId}"]`
        );

        oldRow?.classList.remove("selected");
        oldDetail?.classList.remove("show");
    }

    if (isOpened) {
        openedDetailOrderanId = null;
        return;
    }

    openedDetailOrderanId = id;

    row.classList.add("selected");
    detail.classList.add("show");
    muatRincianOrderan(id);

    setTimeout(() => {
        detail.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }, 50);
}
function closeDetailOrderanOutside(event) {

    if (event.target.closest(".orderan-row, .detail-table")) {
        return;
    }

    if (openedDetailOrderanId === null) {
        return;
    }

    const row = document.querySelector(
        `.orderan-row[data-id="${openedDetailOrderanId}"]`
    );

    const detail = document.querySelector(
        `.detail-table[data-id="${openedDetailOrderanId}"]`
    );

    row?.classList.remove("selected");
    detail?.classList.remove("show");

    openedDetailOrderanId = null;
    clearTimeout(timerCariOrderan);
    reqIdOrderan++;                 // abaikan response yang masih berjalan
    cacheRincianOrderan.clear();
}
async function destroyDataOrderan() {
    document.removeEventListener("click", closeDetailOrderanOutside);

    observerOrderan?.disconnect();
    observerOrderan = null;

    clearTimeout(timerCariOrderan);
    reqIdOrderan++;
    cacheRincianOrderan.clear();
    openedDetailOrderanId = null;
}
function cariOrderan(nilai) {
    clearTimeout(timerCariOrderan);
    timerCariOrderan = setTimeout(() => {
        cariDataOrderan = nilai;
        currentPageOrderan = 1;
        renderHalamanOrderan();
    }, 300);
}

function terapkanFilterTanggalOrderan() {
    currentPageOrderan = 1;
    renderHalamanOrderan();
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

    await showLoading(
        isEdit
            ? "Mengubah Data Pembelian..."
            : "Menyimpan Data Pembelian...");

    try {
        if(isEdit) {
            const response = await apiFetch(`${BASE_URL_ORDERAN}/${selectOrderan.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });
            if(await gagalSimpan(response)) return;
        } else {
            const response = await apiFetch(BASE_URL_ORDERAN, {
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
        await hideLoading();
    }
}
async function hapusDataOrderan(id){
    await showLoading("Menghapus Data Orderan...");
    try {
        const response = await apiFetch(`${BASE_URL_ORDERAN}/${id}`, {
            method: "DELETE"
        });
        
        if(await gagalHapus(response)) return;
        
        await loadTabelDataOrderan(true);
        showToast("Hapus data orderan berhasil..", "success")
    } catch (e){
        showToast(e.message, "error");
    } finally {
        await hideLoading();
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

//DOWNLOAD DATA
function showPopupDownloadOrderan(){
    const popup = getEl("popup-download-data-orderan");

    pickerDownload.clear();
    resetRekap();

    popup.classList.add("show");
}
function closePopupDownloadOrderan(){
    getEl("popup-download-data-orderan")
        .classList.remove("show");
}
async function initCustomSelectRekap(){

    try {
        renderRekapOptions();
    } catch(error){
        console.error(error);
        dataKategori = [];
    }

    const customSelect = getEl("custom-select-data-rekap-orderan");
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
function renderRekapOptions() {
    const optionsContainer = getEl("options-data-rekap-orderan");

    const options = [
        { id: "Semua", nama: "Semua" },
        { id: "UMKM", nama: "UMKM" },
        { id: "STIKER", nama: "Stiker" }
    ];

    optionsContainer.innerHTML = options.map(option => `
        <div
            class="option"
            data-id="${option.id}"
        >
            ${option.nama}
        </div>
    `).join("");

    initOptionsRekap();
}
function initOptionsRekap() {
    const customSelect = getEl("custom-select-data-rekap-orderan");
    const selectedText = getEl("selected-text-data-rekap-orderan");

    document.querySelectorAll("#options-data-rekap-orderan .option")
        .forEach(option => {
            option.addEventListener("click", function () {

                selectedText.textContent = this.textContent;
                selectedText.classList.remove("empty");

                selectedRekap = this.dataset.id;

                customSelect.classList.add("filled");
                customSelect.classList.remove("active");
            });
        });
}
function resetRekap() {
    const customSelect = getEl("custom-select-data-rekap-orderan");
    const selectedText = getEl("selected-text-data-rekap-orderan");

    // Pilih "Semua"
    selectedRekap = "";

    selectedText.textContent = "";
    selectedText.classList.add("empty");

    customSelect.classList
        .remove(
            "filled",
            "active"
        );
}
async function fetchDownloadOrderan(kategori, awal, akhir) {
    const params = new URLSearchParams({
        kategori: kategori,
        tanggalAwal: awal,
        tanggalAkhir: akhir
    });

    const response = await apiFetch(`${BASE_URL_ORDERAN}/laporan?${params}`);

    if(!response.ok){
        showToast("Gagal memuat data!!","error")
    }

    return await response.json();
}
function validasiDownload(){
    let valid = true;
    const kategori = getEl("selected-text-data-rekap-orderan").textContent.trim();

    if(kategori === "") {
        tandaiInvalid(getEl("custom-select-data-rekap-orderan"))
        valid = false;
        showToast("Pilh Kategori Download!!","warning")
    }
    return valid;
}
async function downloadDataOrderan() {
    if (!validasiDownload()) return;
    await showLoading("Download Data Orderan..");

    let namaFile = "";
    let header = [];
    let rows = [];

    let awal = "";
    let akhir = "";

    if (tanggalAwalDownloadOrderan && tanggalAkhirDownloadOrderan) {
        awal = formatTanggalFile(tanggalAwalDownloadOrderan);
        akhir = formatTanggalFile(tanggalAkhirDownloadOrderan);
    }

    try {
        const downloadData = await fetchDownloadOrderan(
            selectedRekap,
            awal,
            akhir
        );

        if(selectedRekap === "Semua"){
            header = [
                "No",
                "Tanggal",
                "Nama Usaha",
                "Kode Stiker",
                "Nama Stiker",
                "Ukuran Stiker",
                "Jumlah"
            ];

            rows = downloadData.map((item, index) => [
                index + 1,
                formatTanggalTanpaJam(item.tanggal),
                item.namaUmkm,
                item.kodeStiker,
                item.namaStiker,
                item.ukuranStiker,
                `${item.jumlah} Lembar`
            ]);

            namaFile = "Data_Orderan_Semua"

        } else if(selectedRekap === "UMKM"){
            header = [
                "No",
                "Nama Usaha",
                "Total Cetak"
            ];

            rows = downloadData.map((item, index) => [
                index + 1,
                item.namaUmkm,
                `${item.jumlah} Lembar`
            ]);

            namaFile = "Data_Orderan_UMKM"

        } else if(selectedRekap === "STIKER"){
            header = [
                "No",
                "Nama Usaha",
                "Kode Stiker",
                "Nama Stiker",
                "Ukuran Stiker",
                "Total Cetak"
            ];

            rows = downloadData.map((item, index) => [
                index + 1,
                item.namaUmkm,
                item.kodeStiker,
                item.namaStiker,
                `${item.panjang} x ${item.lebar}`,
                `${item.jumlah} Lembar`
            ]);

            namaFile = "Data_Orderan_Stiker"
        }

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

        // Nama file
        if (tanggalAwalDownloadOrderan && tanggalAkhirDownloadOrderan) {
            const awal = formatTanggalFile(tanggalAwalDownloadOrderan);
            const akhir = formatTanggalFile(tanggalAkhirDownloadOrderan);
            a.download = `${namaFile}_${awal}_${akhir}.csv`;
        } else {
            a.download = `${namaFile}.csv`;
        }

        a.click();

        URL.revokeObjectURL(url);

    } catch(error){
        console.error(error);
        showToast(error, "error")
    } finally {
        await hideLoading();
    }

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
window.lihatStikerOrderan = lihatStikerOrderan;