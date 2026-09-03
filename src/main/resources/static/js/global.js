const BASE_URL = "http://localhost:8080/api" // UNTUK CODING/PENGEMBANG

//const BASE_URL = "/api" // UNTUK JARINGAN
const BASE_URL_UPLOAD_GAMBAR = `${BASE_URL}/upload/gambar`
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

function loadPagination(
    id,
    totalData,
    currentPage,
    rowsPerPage,
    callback
) {
    const pagination = getEl(id);

    pagination.innerHTML = "";

    const totalPages =
        Math.max(
            1,
            Math.ceil(totalData / rowsPerPage)
        );

    const maxVisible = 3;

    // ==========================================
    // CREATE BUTTON
    // ==========================================

    function createButton(
        text,
        page,
        disabled = false,
        active = false
    ) {
        const button =
            document.createElement("button");

        button.type = "button";
        button.textContent = text;

        if (active) {
            button.classList.add("active");
        }

        button.disabled = disabled;

        button.addEventListener("click", () => {
            callback(page);
        });

        return button;
    }

    // ==========================================
    // PREV
    // ==========================================

    pagination.appendChild(
        createButton(
            "Prev",
            currentPage - 1,
            currentPage === 1
        )
    );

    // ==========================================
    // PAGE RANGE
    // ==========================================

    let startPage =
        Math.max(
            1,
            currentPage -
            Math.floor(maxVisible / 2)
        );

    let endPage =
        startPage + maxVisible - 1;

    if (endPage > totalPages) {

        endPage = totalPages;

        startPage =
            Math.max(
                1,
                endPage - maxVisible + 1
            );
    }

    // ==========================================
    // FIRST PAGE
    // ==========================================

    if (startPage > 1) {

        pagination.appendChild(
            createButton("1", 1)
        );

        if (startPage > 2) {

            const dots =
                document.createElement("span");

            dots.className =
                "pagination-dots";

            dots.textContent = "...";

            pagination.appendChild(dots);
        }
    }

    // ==========================================
    // NUMBER
    // ==========================================

    for (
        let i = startPage;
        i <= endPage;
        i++
    ) {

        pagination.appendChild(
            createButton(
                i,
                i,
                false,
                i === currentPage
            )
        );
    }

    // ==========================================
    // LAST PAGE
    // ==========================================

    if (endPage < totalPages) {

        if (endPage < totalPages - 1) {

            const dots =
                document.createElement("span");

            dots.className =
                "pagination-dots";

            dots.textContent = "...";

            pagination.appendChild(dots);
        }

        pagination.appendChild(
            createButton(
                totalPages,
                totalPages
            )
        );
    }

    // ==========================================
    // NEXT
    // ==========================================

    pagination.appendChild(
        createButton(
            "Next",
            currentPage + 1,
            currentPage === totalPages
        )
    );
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

// CETAK TIFF
async function cetakTIFF(id) {

    // ==================================================
    // SHOW LOADING
    // ==================================================

    showLoading("Menyiapkan cetakan...");


    try {

        // ==================================================
        // LOAD DATA STIKER
        // ==================================================

        const response =
            await fetch(
                `${BASE_URL_STIKER}/${id}`,{credentials: "include"}
            );


        if (!response.ok) {

            hideLoading();

            return showToast(
                "Gagal mencetak TIFF",
                "error"
            );
        }


        const stiker =
            await response.json();

        // ==================================================
        // VALIDASI
        // ==================================================

        if (!stiker) {
            hideLoading();

            return showToast(
                "Data stiker tidak tersedia",
                "error"
            );
        }


        if (!stiker.pathTIF) {
            hideLoading();

            return showToast(
                "File TIFF tidak tersedia",
                "error"
            );
        }


        if (
            stiker.lebarKertas <= 0 ||
            stiker.tinggiKertas <= 0
        ) {
            hideLoading();

            return showToast(
                "Ukuran kertas tidak valid",
                "error"
            );

        }


        // ==================================================
        // DPI
        // ==================================================

        const dpiX =
            stiker.dpiX > 0
                ? stiker.dpiX
                : 300;


        const dpiY =
            stiker.dpiY > 0
                ? stiker.dpiY
                : 300;


        // ==================================================
        // URL TIFF
        // ==================================================

        const url =
            BASE_URL +
            encodeURI(
                stiker.pathTIF
            ) +
            ".tif";

        // ==================================================
        // DOWNLOAD TIFF
        // ==================================================

        showLoading(
            "Memuat file TIFF..."
        );


        const responseTiff =
            await fetch(url,{credentials: "include"});


        if (!responseTiff.ok) {
            hideLoading();

            return showToast(
                "File TIFF tidak ditemukan",
                "error"
            );
        }


        const buffer =
            await responseTiff.arrayBuffer();


        // ==================================================
        // DECODE TIFF
        // ==================================================

        showLoading(
            "Memproses gambar TIFF..."
        );


        const ifds =
            UTIF.decode(
                buffer
            );


        if (
            !ifds ||
            ifds.length === 0
        ) {
            hideLoading();

            return showToast(
                "TIFF tidak dapat dibaca",
                "error"
            );
        }


        const ifd =
            ifds[0];


        // ==================================================
        // DECODE IMAGE
        // ==================================================

        UTIF.decodeImage(
            buffer,
            ifd
        );


        const tifWidth =
            ifd.width;


        const tifHeight =
            ifd.height;

        // ==================================================
        // RGBA
        // ==================================================

        const rgba =
            UTIF.toRGBA8(
                ifd
            );


        if (
            !rgba ||
            rgba.length === 0
        ) {
            hideLoading();

            return showToast(
                "Gagal membaca pixel TIFF",
                "error"
            );
        }


        // ==================================================
        // UKURAN KERTAS PIXEL
        // ==================================================

        const paperWidthPx =
            Math.round(
                stiker.lebarKertas *
                dpiX /
                25.4
            );


        const paperHeightPx =
            Math.round(
                stiker.tinggiKertas *
                dpiY /
                25.4
            );

        // ==================================================
        // OFFSET PIXEL
        // ==================================================

        const offsetXPx =
            stiker.offsetX *
            dpiX /
            25.4;


        const offsetYPx =
            stiker.offsetY *
            dpiY /
            25.4;


        // ==================================================
        // BATAS TIFF
        // ==================================================

        const tifLeft =
            offsetXPx;


        const tifTop =
            offsetYPx;


        const tifRight =
            offsetXPx +
            tifWidth;


        const tifBottom =
            offsetYPx +
            tifHeight;


        // ==================================================
        // INTERSECTION
        // ==================================================

        const cropLeft =
            Math.max(
                0,
                tifLeft
            );


        const cropTop =
            Math.max(
                0,
                tifTop
            );


        const cropRight =
            Math.min(
                paperWidthPx,
                tifRight
            );


        const cropBottom =
            Math.min(
                paperHeightPx,
                tifBottom
            );


        // ==================================================
        // VALIDASI
        // ==================================================

        if (
            cropRight <= cropLeft ||
            cropBottom <= cropTop
        ) {
            hideLoading();

            return showToast(
                "Gambar TIFF berada di luar area kertas",
                "error"
            );
        }


        // ==================================================
        // CROP SIZE
        // ==================================================

        const cropWidth =
            Math.round(
                cropRight -
                cropLeft
            );


        const cropHeight =
            Math.round(
                cropBottom -
                cropTop
            );


        // ==================================================
        // SOURCE POSITION
        // ==================================================

        const sourceX =
            Math.round(
                cropLeft -
                tifLeft
            );


        const sourceY =
            Math.round(
                cropTop -
                tifTop
            );

        // ==================================================
        // CANVAS
        // ==================================================

        showLoading(
            "Menyiapkan gambar cetak..."
        );


        const printCanvas =
            document.createElement(
                "canvas"
            );


        printCanvas.width =
            cropWidth;


        printCanvas.height =
            cropHeight;


        const printCtx =
            printCanvas.getContext(
                "2d"
            );


        // ==================================================
        // MATIKAN SMOOTHING
        // ==================================================

        printCtx.imageSmoothingEnabled =
            false;


        // ==================================================
        // IMAGE DATA
        // ==================================================

        const imageData =
            new ImageData(
                new Uint8ClampedArray(
                    rgba
                ),
                tifWidth,
                tifHeight
            );


        // ==================================================
        // COPY PIXEL
        // ==================================================

        printCtx.putImageData(
            imageData,
            -sourceX,
            -sourceY
        );


        // ==================================================
        // UKURAN FISIK GAMBAR
        // ==================================================

        const imageWidthMM =
            cropWidth *
            25.4 /
            dpiX;


        const imageHeightMM =
            cropHeight *
            25.4 /
            dpiY;

        // ==================================================
        // CONVERT PNG
        // ==================================================

        showLoading(
            "Menyiapkan halaman cetak..."
        );


        const pngData =
            printCanvas.toDataURL(
                "image/png"
            );


        // ==================================================
        // OPEN PRINT WINDOW
        // ==================================================

        const printWindow = window.open(
            "./cetak-tif/print-tiff.html",
            "_blank"
        );

        printWindow.onload = () => {

            const doc = printWindow.document;

            doc.title = `${stiker.namaUsaha} - ${stiker.namaStiker}`;

            // ukuran kertas
            const style = doc.createElement("style");

            style.innerHTML = `
        @page{
            size:${stiker.lebarKertas}mm ${stiker.tinggiKertas}mm;
            margin:0;
        }

        html,
        body,
        .print-page{

            width:${stiker.lebarKertas}mm;
            height:${stiker.tinggiKertas}mm;
        }

        #print-image{

            left:${cropLeft * 25.4 / dpiX}mm;
            top:${cropTop * 25.4 / dpiY}mm;

            width:${imageWidthMM}mm;
            height:${imageHeightMM}mm;
        }
    `;

            doc.head.appendChild(style);

            doc.getElementById("print-image").src = pngData;

            setTimeout(() => {

                printWindow.focus();
                printWindow.print();

            }, 500);

        };


        // ==================================================
        // SELESAI
        // ==================================================

        hideLoading();


        showToast(
            "Halaman cetak siap",
            "success"
        );


    } catch (error) {

        console.error(
            "Gagal mencetak TIFF:",
            error
        );

    }
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

function formatRupiah(angka){

    return new Intl.NumberFormat("id-ID",{
        style:"currency",
        currency:"IDR",
        minimumFractionDigits:0
    }).format(angka);

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

async function fetchPartialHtml(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Gagal memuat ${path} (status ${response.status})`);
    }

    let html = await response.text();

    console.log("RAW panjang:", html.length);
    console.log("RAW ada popup-actions?", html.includes("popup-actions")); // ⬅️ BARU

    html = html.replace(
        /<!--\s*Code injected by live-server\s*-->[\s\S]*?<\/script>/gi,
        ""
    );

    console.log("CLEANED panjang:", html.length);
    console.log("CLEANED ada popup-actions?", html.includes("popup-actions")); // ⬅️ BARU

    return html;
}