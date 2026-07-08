const loginOverlay = getEl("login-overlay");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (currentUser) {
    updateProfile(currentUser);
    penggunaAktif = currentUser;

    loginOverlay.classList.add("hidden");
} else {
    resetLoginForm();
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

            return;
        }

        penggunaAktif = result.data;

        console.log(penggunaAktif);

        localStorage.setItem("currentUser",
            JSON.stringify(result.data)
        );

        updateProfile(result.data);
        resetLoginForm();

        loginOverlay.classList.add("hidden");

    }catch(err){
        getEl("login-error")
            .innerText = "Login gagal";
    }
}
