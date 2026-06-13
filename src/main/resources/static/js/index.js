void loadPage('dashboard');
const menuItems = document.querySelectorAll('.sidebar a');

async function loadPage(page) {

    const content = document.getElementById('content');
    const title = document.getElementById('page-title');

    const pageTitles = {
        dashboard: 'Dashboard',
        'master-data/data-pengguna': 'Data Pengguna',
        'master-data/master-data': 'Master Data',
        orderan: 'Data Orderan'
    };

    try {

        const response = await fetch(`pages/${page}.html`);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.text();

        content.innerHTML = data;

        const pageTitle = pageTitles[page] || 'Aplikasi';

        title.innerHTML = pageTitle;
        document.title = pageTitle;

        const pageHandlers = {
            'master-data/data-pengguna': () => {
                initDataPengguna();
            },
            'master-data/master-data': () => {
                initMasterData();
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
const currentUser = {
    name: 'Andri',
    role: 'Administrator',
    photo: './assets/images/profile.jpg'
};
document.getElementById('profile-container').innerHTML = `
    <div class="profile">

        <div class="info">
            <p>Hey, <b>${currentUser.name}</b></p>
            <small class="text-muted">${currentUser.role}</small>
        </div>

        <div class="profile-photo">
            <img src="${currentUser.photo}" alt="profile">
        </div>

    </div>
`;
window.loadPage = loadPage;
window.toggleSubmenu = toggleSubmenu;