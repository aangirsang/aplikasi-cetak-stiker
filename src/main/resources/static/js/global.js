const BASE_URL = "http://localhost:8080/api" // UNTUK CODING/PENGEMBANG
//const BASE_URL = "/api" // UNTUK JARINGAN

const BASE_URL_PENGGUNA = `${BASE_URL}/data-pengguna`;
const BASE_URL_UPLOAD_GAMBAR = `${BASE_URL}/upload/gambar`
const BASE_URL_LEVEL = `${BASE_URL}/data-level`;
const BASE_URL_KATEGORI = `${BASE_URL}/data-kategori`;

const BASE_URL_UMKM = `${BASE_URL}/data-umkm`;
const BASE_URL_STIKER = `${BASE_URL}/data-stiker`;

const BASE_URL_LOGIN = `${BASE_URL}/auth/login`;

const getEl = id => document.getElementById(id);
const getValue = id => getEl(id).value.trim();

const noImagePerson = "./assets/images/no-image-person.svg";
const noImageStiker = "./assets/images/no-image-stiker.svg";

function tandaiInvalid(el){
    el.classList.remove("error-validasi");
    void el.offsetWidth;
    el.classList.add("error-validasi");

    setTimeout(() => {
        el.classList.remove("error-validasi");
    }, 800);
}

// ========================================
// PAGINATED DATA
// ========================================

function getPaginatedData(data, page, rows){
    const start = (page - 1) * rows;
    return data.slice(start, start + rows);
}

function loadPagination(id, totalData, currentPage, rowsPerPage, callback){
    const pagination = getEl(id);

    pagination.innerHTML = "";

    const totalPages =
        Math.max(1, Math.ceil(totalData / rowsPerPage));

    const maxVisible = 3;

    pagination.innerHTML += `
        <button
            onclick="${callback.name}(${currentPage - 1})"
            ${currentPage === 1 ? "disabled" : ""}
        >
            Prev
        </button>
    `;

    let startPage =
        Math.max(
            1,
            currentPage - Math.floor(maxVisible / 2)
        );

    let endPage =
        startPage + maxVisible - 1;

    if(endPage > totalPages){
        endPage = totalPages;
        startPage =
            Math.max(
                1,
                endPage - maxVisible + 1
            );
    }

    // tombol halaman pertama
    if(startPage > 1){

        pagination.innerHTML += `
            <button onclick="${callback.name}(1)">
                1
            </button>
        `;

        if(startPage > 2){
            pagination.innerHTML += `
                <span class="pagination-dots">
                    ...
                </span>
            `;
        }
    }

    // tombol tengah
    for(let i = startPage; i <= endPage; i++){

        pagination.innerHTML += `
            <button
                class="${i === currentPage ? "active" : ""}"
                onclick="${callback.name}(${i})"
            >
                ${i}
            </button>
        `;
    }

    // tombol halaman terakhir
    if(endPage < totalPages){

        if(endPage < totalPages - 1){
            pagination.innerHTML += `
                <span class="pagination-dots">
                    ...
                </span>
            `;
        }

        pagination.innerHTML += `
            <button onclick="${callback.name}(${totalPages})">
                ${totalPages}
            </button>
        `;
    }

    pagination.innerHTML += `
        <button
            onclick="${callback.name}(${currentPage + 1})"
            ${currentPage === totalPages ? "disabled" : ""}
        >
            Next
        </button>
    `;
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector("span");

    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility_off";
    } else {
        input.type = "password";
        icon.textContent = "visibility";
    }
}

function convertToWebp(
    file,
    maxSize = 2048,
    quality = 0.8
) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();

            img.onload = () => {

                let width =
                    img.width;

                let height =
                    img.height;

                if(
                    width > maxSize ||
                    height > maxSize
                ){

                    const ratio =
                        Math.min(
                            maxSize / width,
                            maxSize / height
                        );

                    width =
                        Math.round(
                            width * ratio
                        );

                    height =
                        Math.round(
                            height * ratio
                        );
                }

                const canvas =
                    document.createElement(
                        "canvas"
                    );

                canvas.width =
                    width;

                canvas.height =
                    height;

                const ctx =
                    canvas.getContext(
                        "2d"
                    );

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                canvas.toBlob(
                    blob => {

                        if(!blob){

                            reject(
                                new Error(
                                    "Gagal convert WebP"
                                )
                            );

                            return;
                        }

                        const webpFile =
                            new File(
                                [blob],
                                file.name.replace(
                                    /\.[^.]+$/,
                                    ".webp"
                                ),
                                {
                                    type:
                                        "image/webp"
                                }
                            );

                        resolve(
                            webpFile
                        );

                    },
                    "image/webp",
                    quality
                );
            };

            img.onerror =
                reject;

            img.src =
                URL.createObjectURL(
                    file
                );
        }
    );
}