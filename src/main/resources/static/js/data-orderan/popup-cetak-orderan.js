let selectOrderan = null;
let selectRincian = [];

async function initPopupCetakOrderan() {
    await initPopupLihatStiker();

    if(getEl("popup-cetak-orderan")) {
        return;
    }

    const response = await fetch(
        "pages/popup/orderan/popup-cetak-orderan.html"
    );

    const html = await response.text();

    document.body.insertAdjacentHTML("beforeend", html);

    getEl("btn-batal-cetak-oreran")
        .addEventListener("click", tutupPopupCetakOrderan);
}
function showPopupCetakOrderan(orderan) {
    selectOrderan = orderan;
    selectRincian = orderan.rincian
    getEl("popup-cetak-orderan-title")
        .textContent = `Cetak Orderan ${orderan.namaUmkm}`;

    getEl("popup-cetak-orderan-faktur")
        .textContent = orderan.faktur;

    getEl("popup-cetak-orderan-tanggal")
        .textContent = formatTanggal(orderan.tanggal);

    getEl("popup-cetak-orderan-jumlah")
        .textContent = `${orderan.totalStiker} Lembar`;

    getEl("cetak-order-nama-usaha")
        .value = orderan.namaUmkm;

    getEl("cetak-order-nama-pemilik")
        .value = orderan.namaPemilik;

    getEl("cetak-order-instagram")
        .value = orderan.instagram;

    getEl("cetak-order-kontak")
        .value = orderan.noTelpon;

    getEl("cetak-order-alamat")
        .value = orderan.alamat;

    renderListStikerCetakOrder(orderan.rincian)

    getEl("popup-cetak-orderan")
        .classList.add("show");
}
function renderListStikerCetakOrder(rincian){

    const container =
        getEl("popup-cetak-oreran-list");

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
        onclick="lihatStikerCetak('${rinci.stikerId}')">

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
                        readonly>
            
                    <span class="input-satuan-lembar">Lembar</span>
                </div>
            </div>


        </div>
    `).join("");
}
function lihatStikerCetak(id) {

    const rinci = selectRincian.find(r => r.stikerId === id);

    console.log(rinci);
    const stiker = {
        id: rinci.stikerId,
        kodeStiker: rinci.kodeStiker,
        namaStiker: rinci.namaStiker,
        panjang: rinci.panjang,
        lebar: rinci.lebar,
        status: rinci.status,
        catatan: rinci.catatan,
        pathGambar1: rinci.pathGambar1,
        pathGambar2: rinci.pathGambar2,
    };

    //if (!stiker) return;

    showPopupLihatStiker(stiker);
}

function tutupPopupCetakOrderan() {
    getEl("popup-cetak-orderan")
        .classList.remove("show");
}

window.initPopupCetakOrderan = initPopupCetakOrderan;
window.showPopupCetakOrderan = showPopupCetakOrderan;
window.lihatStikerCetak = lihatStikerCetak;
window.tutupPopupCetakOrderan = tutupPopupCetakOrderan;
