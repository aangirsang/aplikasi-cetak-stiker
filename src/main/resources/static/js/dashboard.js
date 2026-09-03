let dataOrderanDashboard = [];
let dataRincian = [];

let currentPageDashboard = 1;

let sortFieldTabelDashboard = "tanggal";
let sortDirectionDashboard = "desc";

let openedDetailDashboard = null;

const backgroundColor= [
    '#60A5FA',
    '#34D399',
    '#FBBF24',
    '#F87171',
    '#A78BFA',
    '#fb71f4',
    '#2DD4BF',
    '#f4c772',
    '#a3de4a',
    '#f88838'
]

let umkmChart
let orderChart

async function initDashboard(){
    await loadTabelDashboard();
    await initPopupLoading();
    await loadDiagramBatang();
    await loadDiagramGaris();

    document.removeEventListener("click", closeDetailTabelDashboardOutside);
    document.addEventListener("click", closeDetailTabelDashboardOutside);
}

//TABEL
async function loadTabelDashboard(){
    try {
        dataOrderanDashboard = await fetchTabelDashboard();

        const sorted = await getsortedDataOrderan(dataOrderanDashboard);
        const paginated = getPaginatedData(sorted, currentPageDashboard, 12)

        renderTabelOrderan(paginated);
        loadPagination(
            "pagination",
            sorted.length,
            currentPageDashboard,
            12,
            changePageDashboard
        );


    } catch(error){
        console.error(error);
        showToast(error, "error")
        dataOrderanDashboard = [];
    }
}
async function changePageDashboard(page){
    currentPageDashboard = page;
    await loadTabelDashboard();
}
async function fetchTabelDashboard(){
    const sekarang = new Date();
    const satuBulanSebelum = new Date(sekarang);

    satuBulanSebelum.setMonth(satuBulanSebelum.getMonth() - 1);

    const awal = formatTanggalFile(satuBulanSebelum);
    const akhir = formatTanggalFile(sekarang);

    const params = new URLSearchParams({
        tanggalAwal: awal,
        tanggalAkhir: akhir
    });


    const response = await fetch(`${BASE_URL_ORDERAN}/tanggal?${params}`, {
        credentials: "include"  // pastikan ini ada
    });

    if(!response.ok){
        throw new Error("Gagal Memuat Data Tabel!");
    }

    return await response.json();
}
function getsortedDataOrderan(data) {
    return [...data].sort((a, b) => {
        let valueA = a[sortFieldTabelDashboard];
        let valueB = b[sortFieldTabelDashboard];

        if (sortFieldTabelDashboard === "namaPengguna") {
            valueA = a.namaPengguna ?? ""
            valueB = b.namaPengguna ?? ""
        }

        if (sortFieldTabelDashboard === "namaUmkm") {
            valueA = a.namaUmkm ?? ""
            valueB = b.namaUmkm ?? ""
        }

        if (sortFieldTabelDashboard === "faktur") {
            valueA = a.faktur ?? ""
            valueB = b.faktur ?? ""
        }

        if(typeof valueA === "string"){
            const result =
                valueA.localeCompare(valueB);

            return sortDirectionDashboard === "asc"
                ? result
                : -result;
        }

        // number
        const result = valueA - valueB;
        return sortDirectionDashboard === "asc" ? result : -result;
    })
}
function renderTabelOrderan(data) {
    const tbody = getEl("tbl-body-dashboard");

    tbody.innerHTML = data.map(item => {
        const isOpened = openedDetailDashboard === item.id;

        return createTabelOrderan(item, isOpened);
    }).join("");
}
function createTabelOrderan(item, isOpened) {
    return `
        <tr 
                class="dahsboard-row ${isOpened ? 'selected' : ''}"
            onclick="event.stopPropagation(); toggleDetailDashboard('${item.id}')"
        >
            <td>${item.faktur}</td>
            <td>${formatTanggal(item.tanggal)}</td>
            <td>${item.namaUmkm}</td>
            <td>${item.totalStiker}</td>
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
async function toggleDetailDashboard(id) {
    openedDetailDashboard = openedDetailDashboard === id ? null : id;

    await loadTabelDashboard();

    setTimeout(() => {
        document.querySelector(".detail-table.show")?.scrollIntoView({
            behavior:"smooth",
            block:"nearest"
        });
    }, 50);
}
async function sortTabelDashboard(field) {
    if(sortFieldTabelDashboard === field) {
        sortDirectionDashboard = sortDirectionDashboard === "asc" ? "desc" : "asc";
    } else {
        sortFieldTabelDashboard = field;
        sortDirectionDashboard = "asc";
    }

    await loadTabelDashboard();
}
async function closeDetailTabelDashboardOutside(event){
    if(event.target.closest(".dahsboard-row, .detail-table")) return;
    if(openedDetailDashboard === null) return;

    openedDetailDashboard = null;
    await loadTabelDataOrderan();
}
async function destroyTabelDashboard() {

    // Hapus event listener
    document.removeEventListener(
        "click",
        closeDetailTabelDashboardOutside
    );

    // Reset state
    openedDetailDashboard = null;

}

// DIAGRAM
async function loadDiagramBatang() {
    const sekarang = new Date();
    const satuBulanSebelum = new Date(sekarang);

    satuBulanSebelum.setMonth(satuBulanSebelum.getMonth() - 1);

    const awal = formatTanggalFile(satuBulanSebelum);
    const akhir = formatTanggalFile(sekarang);

    const params = new URLSearchParams({
        kategori: "UMKM",
        tanggalAwal: awal,
        tanggalAkhir: akhir
    });

    const response = await fetch(`${BASE_URL_ORDERAN}/laporan?${params}`, {
        credentials: "include"  // pastikan ini ada
    });

    if (!response.ok) {
        return showToast("Gagal Memuat Data!!", "error");
    }

    const dataStiker = await response.json();

    dataStiker.sort((a, b) => b.jumlah - a.jumlah);

    const topData = dataStiker.slice(0, 10);

    const labels = topData.map(item =>
        item.namaUmkm.length > 20
            ? item.namaUmkm.substring(0, 20) + "..."
            : item.namaUmkm
    );

    const values = topData.map(item => item.jumlah);

    const barCtx = document.getElementById("barChart");

    umkmChart = new Chart(barCtx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Jumlah Order",
                data: values,
                backgroundColor,
                borderWidth: 0,
                borderRadius: 10,
                barThickness: 25
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false,
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
async function loadDiagramGaris(){
    const lineCtx = document.getElementById('lineChart');

    const sekarang = new Date();
    const satuBulanSebelum = new Date(sekarang);

    satuBulanSebelum.setMonth(satuBulanSebelum.getMonth() - 6);

    const awal = formatTanggalFile(satuBulanSebelum);
    const akhir = formatTanggalFile(sekarang);

    const params = new URLSearchParams({
        tanggalAwal: awal,
        tanggalAkhir: akhir
    });

    const response = await fetch(`${BASE_URL_ORDERAN}/rekap-bulanan?${params}`, {
        credentials: "include"  // pastikan ini ada
    });

    if (!response.ok) {
        return showToast("Gagal Memuat Data!!", "error");
    }

    const dataRekap = await response.json();

    dataRekap.forEach(item => {
        const namaBulan = new Date(item.tahun, item.bulan - 1)
            .toLocaleString("id-ID", { month: "long" });

    });

    const bulans = dataRekap.map(item =>
        new Date(item.tahun, item.bulan - 1)
            .toLocaleString("id-ID", { month: "long" })
    );

    const valuesOrderan = dataRekap.map(item => item.jumlah);
    orderChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: bulans,
            datasets: [{
                label: 'Pesanan',
                data: valuesOrderan,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

}

window.initDashboard = initDashboard;
window.toggleDetailDashboard = toggleDetailDashboard;
window.sortTabelDashboard = sortTabelDashboard;
window.destroyTabelDashboard = destroyTabelDashboard;