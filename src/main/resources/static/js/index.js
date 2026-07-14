// INISIALISASI
void loadPage("dashboard");

let penggunaAktif = null;

const content = document.getElementById("content");
const title = document.getElementById("page-title");

const menuItems = document.querySelectorAll(".sidebar a:not(.menu-item)");

// MENU AKTIF
menuItems.forEach(item => {
    item.addEventListener("click", () => {

        document.querySelectorAll(".sidebar a")
            .forEach(menu => menu.classList.remove("active"));

        item.classList.add("active");

    });
});

// NAVIGASI HALAMAN
async function loadPage(page) {

    await destroyCurrentPage();

    const pageTitles = {
        dashboard: "Dashboard",
        "master-data/data-pengguna": "Data Pengguna",
        "master-data/master-data": "Master Data",
        "data-persediaan/data-pembelian": "Data Pembelian",
        "data-persediaan/data-barang": "Data Barang",
        "data-persediaan/data-riwayat-stok": "Riwayat Stok",
        "data-umkm/data-umkm": "Data UMKM",
        "data-umkm/data-stiker": "Data Stiker",
        orderan: "Data Orderan"
    };

    try {

        const response = await fetch(`pages/${page}.html`);

        if (!response.ok) {
            showToast(`HTTP ${response.status}`, "error");
        }

        content.innerHTML = await response.text();

        title.textContent = pageTitles[page] ?? "Aplikasi";
        document.title = title.textContent;

        const pageHandlers = {
            "master-data/data-pengguna": initDataPengguna,
            "master-data/master-data": initMasterData,
            "data-persediaan/data-pembelian": initDataPembelian,
            "data-persediaan/data-barang": initDataBarang,
            "data-persediaan/data-riwayat-stok": initDataRiwayatStok,
            "data-umkm/data-umkm": initDataUmkm,
            "data-umkm/data-stiker": initDataStiker
        };

        pageHandlers[page]?.();

    } catch (e) {

        content.innerHTML = `
            <div class="card">
                <h2>Error</h2>
                <p>Halaman gagal dimuat.</p>
                <p>${e.message}</p>
            </div>
        `;

        console.error(e);
    }
}

// DESTROY HALAMAN
async function destroyCurrentPage() {

    if (typeof destroyDataStiker === "function")
        await destroyDataStiker();

    if (typeof destroyDataUmkm === "function")
        await destroyDataUmkm();

    if (typeof destroyDataPembelian === "function")
        await destroyDataPembelian();
}

// SUBMENU
function toggleSubmenu(submenuId, arrowId) {

    document.getElementById(submenuId)
        .classList.toggle("active");

    document.getElementById(arrowId)
        .classList.toggle("rotate");

}
function resetSidebar() {

    document.querySelectorAll(".submenu")
        .forEach(menu => menu.classList.remove("active"));

    document.querySelectorAll(".arrow")
        .forEach(icon => icon.classList.remove("rotate"));

    document.querySelectorAll(".sidebar a")
        .forEach(menu => menu.classList.remove("active"));

}

// PROFILE
function updateProfile(user) {

    penggunaAktif = user;

    document.getElementById("profile-container").innerHTML = `
        <div class="profile">

            <div class="info">
                <p>Hey, <b>${user.namaLengkap}</b></p>
                <small class="text-muted">${user.level}</small>
            </div>

            <div class="profile-photo">
                <img
                    src="${user.pathGambar
        ? `${BASE_URL}${user.pathGambar}`
        : noImagePerson}"
                    alt="profile">
            </div>

        </div>
    `;
}

// LOGOUT
async function logout() {

    resetLoginForm();

    await loadPage("dashboard");
    resetSidebar();

    localStorage.removeItem("currentUser");

    document
        .getElementById("login-overlay")
        .classList.remove("hidden");

    document
        .getElementById("profile-container")
        .innerHTML = "";

}

// LOGIN
function resetLoginForm() {

    getEl("namaPengguna").value = "admin";
    getEl("kataSandi").value = "admin123";

    getEl("login-error").textContent = "";

    getEl("namaPengguna").focus();

    penggunaAktif = null;

}

// EXPORT
window.loadPage = loadPage;
window.toggleSubmenu = toggleSubmenu;
window.updateProfile = updateProfile;
window.logout = logout;
window.resetLoginForm = resetLoginForm;
window.resetSidebar = resetSidebar;
window.penggunaAktif = penggunaAktif;