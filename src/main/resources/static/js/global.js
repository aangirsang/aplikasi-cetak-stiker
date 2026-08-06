const BASE_URL = "http://localhost:8080/api" // UNTUK CODING/PENGEMBANG

//const BASE_URL = "/api" // UNTUK JARINGAN
const BASE_URL_UPLOAD_GAMBAR = `${BASE_URL}/upload/gambar`
const BASE_URL_UPLOAD_CDR = `${BASE_URL}/upload/cdr`
const BASE_URL_UPLOAD_TIF = `${BASE_URL}/upload/tif`

const BASE_URL_PENGGUNA = `${BASE_URL}/data-pengguna`;
const BASE_URL_LEVEL = `${BASE_URL}/data-level`;
const BASE_URL_KATEGORI = `${BASE_URL}/data-kategori`;

const BASE_URL_BARANG = `${BASE_URL}/data-barang`;
const BASE_URL_PEMBELIAN = `${BASE_URL}/data-pembelian`;
const BASE_URL_RIWAYAT = `${BASE_URL_BARANG}/riwayat-stok`;
const BASE_URL_PENYESUAIAN = `${BASE_URL}/penyesuaian-stok`;

const BASE_URL_ORDERAN = `${BASE_URL}/data-orderan`;

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
            type="button"
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

    if(startPage > 1){

        pagination.innerHTML += `
            <button
                type="button"
                onclick="${callback.name}(1)">
                1
            </button>
        `;

        if(startPage > 2){
            pagination.innerHTML += `
                <span class="pagination-dots">...</span>
            `;
        }
    }

    for(let i = startPage; i <= endPage; i++){

        pagination.innerHTML += `
            <button
                type="button"
                class="${i === currentPage ? "active" : ""}"
                onclick="${callback.name}(${i})"
            >
                ${i}
            </button>
        `;
    }

    if(endPage < totalPages){

        if(endPage < totalPages - 1){
            pagination.innerHTML += `
                <span class="pagination-dots">...</span>
            `;
        }

        pagination.innerHTML += `
            <button
                type="button"
                onclick="${callback.name}(${totalPages})">
                ${totalPages}
            </button>
        `;
    }

    pagination.innerHTML += `
        <button
            type="button"
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

async function convertTifToWebp(file) {

    const buffer = await file.arrayBuffer();

    const ifds = UTIF.decode(buffer);

    if (ifds.length === 0) {
        throw new Error("TIFF kosong");
    }

    UTIF.decodeImage(buffer, ifds[0]);

    const rgba = UTIF.toRGBA8(ifds[0]);

    const width = ifds[0].width;
    const height = ifds[0].height;

    const dpiX = ifds[0].t282?.[0] ?? 300;
    const dpiY = ifds[0].t283?.[0] ?? 300;

    const imageWidthMM = width * 25.4 / dpiX;
    const imageHeightMM = height * 25.4 / dpiY;

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(width, height);

    imageData.data.set(rgba);

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/webp", 0.8)
    );

    return {
        webpFile: new File(
            [blob],
            file.name.replace(/\.tif$/i, ".webp"),
            {
                type: "image/webp"
            }
        ),
        width,
        height,
        dpiX,
        dpiY,
        imageWidthMM,
        imageHeightMM
    };
}
function createMetadataFile(
    kodeStiker,
    width,
    height,
    dpiX,
    dpiY,
    imageWidthMM,
    imageHeightMM
) {

    const metadata = {
        width,
        height,
        dpiX,
        dpiY,
        imageWidthMM,
        imageHeightMM
    };

    return new File(
        [
            JSON.stringify(metadata, null, 2)
        ],
        `${kodeStiker}.json`,
        {
            type: "application/json"
        }
    );

}

function formatTanggal(timestamp) {
    const date = new Date(timestamp);

    const tanggal = date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const jam = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });

    return `${tanggal} • ${jam}`;
}
function formatTanggalDownload(timestamp) {
    const date = new Date(timestamp);

    const tanggal = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const jam = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });

    return `${tanggal} • ${jam}`;
}
function formatTanggalTanpaJam(timestamp) {
    const date = new Date(timestamp);

    const tanggal = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return `${tanggal}`;
}
function formatTanggalFile(timestamp) {

    const d = new Date(timestamp);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}
function formatAngkaDownload(nilai) {
    return Number(nilai).toLocaleString("id-ID");
}

async function gagalHapus(response) {
    if (response.ok) return false;

    const errorData = await response.json();

    showToast(
        `Gagal Hapus!!, ${errorData.error}` || "Gagal menghapus data",
        "error"
    );

    return true;
}
async function gagalSimpan(response) {
    if (response.ok) return false;

    let message = "Gagal simpan data";

    try {
        const errorData = await response.json();
        message = errorData.message || errorData.error || message;
    } catch {
        message = await response.text();
    }

    showToast(message, "error");
    return true;
}

