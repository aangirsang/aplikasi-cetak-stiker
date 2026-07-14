const loginOverlay = getEl("login-overlay");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

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
        const response =
            await fetch(BASE_URL_LOGIN,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        namaPengguna,
                        kataSandi
                    })
                }
            );

        const result = await response.json();
        if(!result.success){
            getEl("login-error").innerText = result.message;

            showToast(result.message, "error");

            return;
        }

        penggunaAktif = result.data;


        localStorage.setItem("currentUser",
            JSON.stringify(result.data)
        );

        updateProfile(result.data);
        resetLoginForm();

        showToast(`Selamat Datang ${penggunaAktif.namaLengkap}`, "success");

        loginOverlay.classList.add("hidden");

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
