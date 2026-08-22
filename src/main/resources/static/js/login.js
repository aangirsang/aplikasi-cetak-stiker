const loginOverlay = getEl("login-overlay");
let currentUser;

try {

    currentUser = JSON.parse(
        localStorage.getItem("currentUser")
    );

} catch (e) {

    currentUser = null;

}

if (currentUser) {
    updateProfile(currentUser);
    penggunaAktif = currentUser;

    loginOverlay.classList.add("hidden");

    await statusServer();
} else {
    resetLoginForm();
    await statusServer();
}

getEl("form-login").addEventListener("submit", doLogin);

async function doLogin(e) {

    e.preventDefault();

    const namaPengguna = getEl("namaPengguna").value.trim();
    const kataSandi = getEl("kataSandi").value;

    const loginError = getEl("login-error");

    loginError.innerText = "";

    try {

        const response = await fetch(BASE_URL_LOGIN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                namaPengguna,
                kataSandi
            })
        });

        let result = null;

        try {
            result = await response.json();
        } catch {
            // Response bukan JSON
        }

        console.log(
            "Login:",
            response.status,
            result
        );

        // ==========================================
        // USERNAME / PASSWORD SALAH
        // ==========================================

        if (response.status === 401) {

            loginError.innerText =
                "Username atau password salah";

            return;
        }

        // ==========================================
        // LOGIN GAGAL DENGAN RESPONSE JSON
        // ==========================================

        if (!response.ok || !result?.success) {

            loginError.innerText =
                result?.message ||
                "Username atau password salah";

            return;
        }

        // ==========================================
        // LOGIN BERHASIL
        // ==========================================

        const meResponse = await fetch(
            `${BASE_URL}/auth/me`,
            {
                credentials: "include"
            }
        );

        if (!meResponse.ok) {
            return showToast(
                "Gagal mengambil session user", "error"
            );
        }

        const me = await meResponse.json();

        penggunaAktif = me.data;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(me.data)
        );

        updateProfile(me.data);

        resetLoginForm();

        loginOverlay.classList.add("hidden");

        await loadPage("dashboard");

        showToast(
            `Selamat Datang ${penggunaAktif.namaLengkap}`,
            "success"
        );

    } catch (err) {

        console.error("Login error:", err);

        loginError.innerText =
            "Tidak dapat terhubung ke server";
    }
}

async function statusServer() {

    const status = getEl("status-server");

    try {

        const response = await fetch(`${BASE_URL_PENGGUNA}/ping`);

        if (response.ok) {
            status.textContent = "Server Aktif";
            status.className = "status online";
        } else {
            status.textContent = "Server Tidak Aktif";
            status.className = "status offline";
        }

    } catch {

        status.textContent = "Server Tidak Aktif";
        status.className = "status offline";

    }
}
