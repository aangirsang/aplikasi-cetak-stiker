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

async function doLogin(e){

    e.preventDefault();

    const namaPengguna = getEl("namaPengguna").value;
    const kataSandi = getEl("kataSandi").value;

    try{
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

        const result = await response.json();

        if (!result.success) {
            return;
        }

        // ambil data user dari session spring security
        const meResponse = await fetch(
            `${BASE_URL}/auth/me`,
            {
                credentials: "include"
            }
        );

        const me = await meResponse.json();

        penggunaAktif = me.data;

        localStorage.setItem(
            "currentUser",
            JSON.stringify(me.data)
        );

        updateProfile(me.data);

        resetLoginForm();

        console.log("result", result);
        console.log("me", me);
        console.log("loginOverlay", loginOverlay);

        loginOverlay.classList.add("hidden");

        await loadPage("dashboard");

        showToast(
            `Selamat Datang ${penggunaAktif.namaLengkap}`,
            "success"
        );

    }catch(err){
        getEl("login-error")
            .innerText = "Login gagal";
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
