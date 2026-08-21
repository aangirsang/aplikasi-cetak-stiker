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
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            const response = await fetch(
                `${BASE_URL}/api/auth/me`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok) {
                showToast("Sesion Pengguna Habis!!", "warning")
                penggunaAktif = null;

                localStorage.removeItem(
                    "currentUser"
                );

                loginOverlay.classList.remove("hidden");

                content.innerHTML = "";

                title.textContent = "Login";

                resetLoginForm();

                return;
            }

            const me = await response.json();

            penggunaAktif = me;

            updateProfile(me);

            loginOverlay.classList.add("hidden");

            await loadPage("dashboard");

        } catch (e) {
            console.error(e);
        }
    }
);

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
async function loadPage(page) {

    if (!penggunaAktif) {
        return;
    }

    await destroyCurrentPage();

    const pageTitles = {
        dashboard: "Dashboard",
        "master-data/data-pengguna": "Data Pengguna",
        "master-data/master-data": "Master Data",
        "data-persediaan/data-pembelian": "Data Pembelian",
        "data-persediaan/data-penyesuaian": "Data Penyesuaian",
        "data-persediaan/data-barang": "Data Barang",
        "data-persediaan/data-riwayat-stok": "Riwayat Stok",
        "data-umkm/data-umkm": "Data UMKM",
        "data-umkm/data-stiker": "Data Stiker",
        "data-orderan": "Data Orderan"
    };

    try {

        const response =
            await fetch(`pages/${page}.html`);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        content.innerHTML =
            await response.text();

        title.textContent =
            pageTitles[page]
            ?? "Aplikasi Cetak Stiker";

        /*
        document.title =
            title.textContent;

         */

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
            "data-umkm/data-umkm":
            initDataUmkm,
            "data-umkm/data-stiker":
            initDataStiker,
            "data-orderan":
            initDataOrderan
        };

        pageHandlers[page]?.();

    } catch (e) {

        console.error(e);

        content.innerHTML = `
            <div class="card">
                <h2>Error</h2>
                <p>Halaman gagal dimuat</p>
                <p>${e.message}</p>
            </div>
        `;

        showToast(
            e.message,
            "error"
        );
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

    document.getElementById(
        "profile-container"
    ).innerHTML = `
        <div class="profile">

            <div class="info">
                <p><b>${user.namaLengkap}</b></p>
                <small class="text-muted">
                    ${user.level}
                </small>
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

// ==============================
// LOGOUT
// ==============================
async function logout() {

    try {

        await fetch(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );

    } catch (e) {
        console.error(e);
    }

    localStorage.removeItem(
        "currentUser"
    );

    penggunaAktif = null;

    resetSidebar();

    document
        .getElementById(
            "profile-container"
        )
        .innerHTML = "";

    content.innerHTML = "";

    title.textContent = "Login";

    loginOverlay.classList.remove(
        "hidden"
    );

    resetLoginForm();
}

// ==============================
// LOGIN FORM
// ==============================
function resetLoginForm() {

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
window.penggunaAktif = penggunaAktif;