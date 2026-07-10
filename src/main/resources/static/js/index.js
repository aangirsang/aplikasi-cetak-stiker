void loadPage('dashboard');
let penggunaAktif = null;

const menuItems = document.querySelectorAll('.sidebar a');

async function loadPage(page) {

    // Jika sedang berada di halaman Data Stiker
    if (typeof destroyDataStiker === "function") {
        await destroyDataStiker();
    }

    // Jika sedang berada di halaman Data Stiker
    if (typeof destroyDataUmkm === "function") {
        await destroyDataUmkm();
    }

    // Jika sedang berada di halaman Data Stiker
    if (typeof await destroyDataPembelian() === "function") {
        await destroyDataPembelian();
    }

    const content = document.getElementById('content');
    const title = document.getElementById('page-title');

    const pageTitles = {
        dashboard: 'Dashboard',
        'master-data/data-pengguna': 'Data Pengguna',
        'master-data/master-data': 'Master Data',
        'data-umkm/data-umkm': 'Data UMKM',
        'data-umkm/data-stiker': 'Data Stiker',
        orderan: 'Data Orderan'
    };

    try {

        const response = await fetch(`pages/${page}.html`);

        if (!response.ok) {
            showToast(`HTTP Error ${response.status}`);
        }

        content.innerHTML = await response.text();

        const pageTitle = pageTitles[page] || 'Aplikasi';

        title.innerHTML = pageTitle;
        document.title = pageTitle;

        const pageHandlers = {
            'master-data/data-pengguna': () => {
                initDataPengguna();
            },
            'master-data/master-data': () => {
                initMasterData();
            },
            'data-persediaan/data-pembelian': () =>{
                initDataPembelian();
            },
            'data-persediaan/data-barang': () =>{
                initDataBarang();
            },
            'data-persediaan/data-riwayat-stok': () =>{
                initDataRiwayatStok();
            },
            'data-umkm/data-umkm': () => {
                initDataUmkm();
            },
            'data-umkm/data-stiker': () => {
                initDataStiker();
            }
        }

        pageHandlers[page]?.();

    } catch (e) {

        content.innerHTML = `
            <div class="card">
                <h2>Error</h2>
                <p>Halaman ${pageTitles[page]} Gagal Dimuat</p>
                <p>${e.message}</p>
            </div>
        `;

        document.title = "Error";

        console.error(e);
    }
}

/* MENU AKTIF */
menuItems.forEach(item => {
    item.addEventListener('click', function () {

        menuItems.forEach(menu => {
            menu.classList.remove('active');
        });

        this.classList.add('active');
    });
});

// SUBMENU
function toggleSubmenu(submenuId, arrowId){

    const submenu =
        document.getElementById(submenuId);

    const arrow =
        document.getElementById(arrowId);

    submenu.classList.toggle('active');

    arrow.classList.toggle('rotate');
}

// PROFILE
function updateProfile(user){
    penggunaAktif = user;

    document.getElementById("profile-container").innerHTML = `
        <div class="profile">

            <div class="info">
                <p>
                    Hey,
                    <b>${user.namaLengkap}</b>
                </p>

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

function logout(){

    resetLoginForm();

    localStorage.removeItem(
        "currentUser"
    );

    document
        .getElementById(
            "login-overlay"
        )
        .classList.remove(
        "hidden"
    );

    document
        .getElementById(
            "profile-container"
        )
        .innerHTML = "";
}

function resetLoginForm() {

    /*
    [
        "namaPengguna",
        "kataSandi"
    ].forEach(id => {
        document.getElementById(id).value = "";
    });

     */

    getEl("namaPengguna").value = "admin";
    getEl("kataSandi").value = "admin123";

    getEl("login-error").textContent = "";
    getEl("namaPengguna").focus();

    penggunaAktif = null
}

window.loadPage = loadPage;
window.toggleSubmenu = toggleSubmenu;
window.updateProfile = updateProfile;
window.logout = logout;
window.resetLoginForm = resetLoginForm;
window.penggunaAktif = penggunaAktif;