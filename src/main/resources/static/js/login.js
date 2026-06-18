const loginOverlay =
    document.getElementById(
        "login-overlay"
    );

const currentUser =
    JSON.parse(
        localStorage.getItem(
            "currentUser"
        )
    );

if (currentUser) {

    updateProfile(
        currentUser
    );

    loginOverlay.classList.add(
        "hidden"
    );
}

document
    .getElementById(
        "form-login"
    )
    .addEventListener(
        "submit",
        doLogin
    );

async function doLogin(e){

    e.preventDefault();

    const namaPengguna =
        document.getElementById(
            "namaPengguna"
        ).value;

    const kataSandi =
        document.getElementById(
            "kataSandi"
        ).value;

    try{

        const response =
            await fetch(
                "/api/auth/login",
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

        const result =
            await response.json();

        if(!result.success){

            document
                .getElementById(
                    "login-error"
                )
                .innerText =
                result.message;

            return;
        }

        localStorage.setItem(
            "currentUser",
            JSON.stringify(
                result.data
            )
        );

        updateProfile(
            result.data
        );

        loginOverlay.classList.add(
            "hidden"
        );

    }catch(err){

        document
            .getElementById(
                "login-error"
            )
            .innerText =
            "Login gagal";
    }
}