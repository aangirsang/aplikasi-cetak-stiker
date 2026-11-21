let penggunaAktif = null;

const content = document.getElementById("content");
const title = document.getElementById("page-title");
const loginOverlay = document.getElementById("login-overlay");

const menuItems = document.querySelectorAll(
    ".sidebar a:not(.menu-item)"
);

// ==============================
// INISIALISASI
// ==============================
// Pengecekan sesi saat halaman dibuka dilakukan oleh cekSesi() di login.js.
// Jangan dipanggil lagi di sini, supaya /auth/me dan dashboard
// tidak dimuat dua kali.

// ==============================
// MENU AKTIF
// ==============================
menuItems.forEach(item => {

    item.addEventListener("click", () => {

        document
            .querySelectorAll(".sidebar a")
            .forEach(menu =>
                menu.classList.remove("active")
            );

        item.classList.add("active");
    });

});

// ==============================
// NAVIGASI HALAMAN
// ==============================
let tokenHalaman = 0; // mencegah dua pemuatan halaman saling menimpa

async function loadPage(page) {

    if (!penggunaAktif) {
        tampilkanLogin();
        return;
    }

    // setiap pemanggilan baru membatalkan pemanggilan lama yang belum selesai
    const token = ++tokenHalaman;

    await destroyCurrentPage();
    if (token !== tokenHalaman) return;

    const pageTitles = {
        dashboard: "Aplikasi Cetak",
        "master-data/data-pengguna": "Data Pengguna",
        "master-data/master-data": "Master Data",
        "data-persediaan/data-pembelian": "Data Pembelian",
        "data-persediaan/data-penyesuaian": "Data Penyesuaian",
        "data-persediaan/data-barang": "Data Barang",
        "data-persediaan/data-barang-rusak": "Data Barang Rusak",
        "data-persediaan/data-riwayat-stok": "Riwayat Stok",
        "data-umkm/data-umkm": "Data UMKM",
        "data-umkm/data-stiker": "Data Stiker",
        "data-orderan": "Data Orderan"
    };

    try {

        const response = await fetch(
            `pages/${page}.html?t=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        if (token !== tokenHalaman) return;

        if (!response.ok) {

            content.innerHTML = `
            <div class="card">
                <h2>Error</h2>
                <p>Halaman gagal dimuat</p>
                <p>HTTP ${response.status}</p>
            </div>
            `;

            return showToast(
                `HTTP ${response.status}`,
                "error"
            );

        }

        const html = await response.text();
        if (token !== tokenHalaman) return;

        content.innerHTML = html;

        title.textContent =
            pageTitles[page]
            ?? "Aplikasi Cetak Stiker";

        const pageHandlers = {
            dashboard: initDashboard,
            "master-data/data-pengguna":
            initDataPengguna,
            "master-data/master-data":
            initMasterData,
            "data-persediaan/data-pembelian":
            initDataPembelian,
            "data-persediaan/data-barang":
            initDataBarang,
            "data-persediaan/data-riwayat-stok":
            initDataRiwayatStok,
            "data-persediaan/data-penyesuaian":
            initDataPenyesuaian,
            "data-persediaan/data-barang-rusak":
            initDataBarangRusak,
            "data-umkm/data-umkm":
            initDataUmkm,
            "data-umkm/data-stiker":
            initDataStiker,
            "data-orderan":
            initDataOrderan
        };

        await pageHandlers[page]?.();

    } catch (e) {
        console.error(e);
    }
}

// ==============================
// DESTROY HALAMAN
// ==============================
async function destroyCurrentPage() {

    if (typeof destroyDataStiker === "function")
        await destroyDataStiker();

    if (typeof destroyDataUmkm === "function")
        await destroyDataUmkm();

    if (typeof destroyDataPembelian === "function")
        await destroyDataPembelian();

    if (typeof destroyDataOrderan === "function")
        await destroyDataOrderan();

    if (typeof destroyTabelDashboard === "function")
        await destroyTabelDashboard();

    // hancurkan semua chart supaya tidak menumpuk di memori
    // dan canvas tidak pernah "already in use"
    if (typeof Chart !== "undefined" && Chart.instances) {
        Object.values(Chart.instances).forEach(chart => chart.destroy());
    }
}

// ==============================
// SUBMENU
// ==============================
function toggleSubmenu(
    submenuId,
    arrowId
) {

    document
        .getElementById(submenuId)
        .classList.toggle("active");

    document
        .getElementById(arrowId)
        .classList.toggle("rotate");
}

function resetSidebar() {

    document
        .querySelectorAll(".submenu")
        .forEach(menu =>
            menu.classList.remove("active")
        );

    document
        .querySelectorAll(".arrow")
        .forEach(icon =>
            icon.classList.remove("rotate")
        );

    document
        .querySelectorAll(".sidebar a")
        .forEach(menu =>
            menu.classList.remove("active")
        );
}

// ==============================
// PROFILE
// ==============================
function updateProfile(user) {

    penggunaAktif = user;

    const imageUrl = user.pathGambar?.trim()
        ? `${BASE_URL}${user.pathGambar}`
        : noImagePerson;

    const container = document.getElementById("profile-container");

    // struktur saja lewat innerHTML; teks dari database diisi lewat
    // textContent supaya nama berisi tanda < > tidak dibaca sebagai HTML
    container.innerHTML = `
        <div class="profile">

            <div class="info">
                <p><b class="profile-nama"></b></p>
                <small class="text-muted profile-level"></small>
            </div>

            <div class="profile-photo">
                <img alt="profile">
            </div>

        </div>
    `;

    container.querySelector(".profile-nama").textContent = user.namaLengkap ?? "";
    container.querySelector(".profile-level").textContent = user.level ?? "";

    const img = container.querySelector("img");
    img.onerror = () => {
        img.onerror = null;
        img.src = noImagePerson;
    };
    img.src = imageUrl;
}

// ==============================
// LOGOUT
// ==============================
async function logout() {

    try {
        const response = await apiFetch(`${BASE_URL}/auth/logout`, {
            method: "POST",
            skipAuthRedirect: true
        });
        if (!response.ok) console.error("Logout gagal:", response.status);
    } catch (e) {
        console.error(e);
    }

    await destroyCurrentPage();

    document
        .getElementById("profile-container")
        .innerHTML = "";

    content.innerHTML = "";

    title.textContent = "Login";

    // membersihkan localStorage, penggunaAktif, sidebar, form login,
    // lalu menampilkan overlay login
    tampilkanLogin();
}

// ==============================
// LOGIN FORM
// ==============================
function resetLoginForm() {

    // jangan isi kata sandi bawaan di form login
    getEl("namaPengguna").value = "";
    getEl("kataSandi").value = "";

    getEl("login-error")
        .textContent = "";

    getEl("namaPengguna")
        .focus();
}

// ==============================
// EXPORT
// ==============================
window.loadPage = loadPage;
window.toggleSubmenu = toggleSubmenu;
window.updateProfile = updateProfile;
window.logout = logout;
window.resetLoginForm = resetLoginForm;
window.resetSidebar = resetSidebar;

// window.penggunaAktif harus selalu sama dengan variabel di file ini.
// "window.penggunaAktif = penggunaAktif" hanya menyalin nilai awalnya (null).
Object.defineProperty(window, "penggunaAktif", {
    get: () => penggunaAktif,
    set: (nilai) => { penggunaAktif = nilai; },
    configurable: true
});