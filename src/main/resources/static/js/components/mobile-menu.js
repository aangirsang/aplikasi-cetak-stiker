document.addEventListener("DOMContentLoaded", () => {

    const menuButton =
        document.getElementById("mobile-menu-btn");

    const overlay =
        document.getElementById("mobile-menu-overlay");

    if (!menuButton || !overlay) {
        return;
    }


    function bukaMenu() {

        document.body.classList.add(
            "mobile-menu-open"
        );

        menuButton
            .querySelector("span")
            .textContent = "close";
    }


    function tutupMenu() {

        document.body.classList.remove(
            "mobile-menu-open"
        );

        menuButton
            .querySelector("span")
            .textContent = "menu";
    }


    function toggleMenu() {

        const terbuka =
            document.body.classList.contains(
                "mobile-menu-open"
            );

        if (terbuka) {
            tutupMenu();
        } else {
            bukaMenu();
        }
    }


    menuButton.addEventListener(
        "click",
        toggleMenu
    );


    overlay.addEventListener(
        "click",
        tutupMenu
    );


    /*
     * Tutup menu setelah memilih halaman
     */

    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(".sidebar a");

            if (!link) {
                return;
            }

            const menuItem =
                link.classList.contains("menu-item");

            if (menuItem) {
                return;
            }

            tutupMenu();
        }
    );


    /*
     * Jika kembali ke desktop,
     * pastikan menu ditutup.
     */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 900) {
                tutupMenu();
            }

        }
    );

});