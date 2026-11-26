const BASE_URL = (() => {
    const { hostname, port } = window.location;
    const isLocalDev = hostname === "localhost" || hostname === "127.0.0.1";
    // sesuaikan port preview/dev sesuai kebutuhan, mis. IntelliJ preview
    return isLocalDev ? "http://localhost:8080/api" : "/api";
})();

const BASE_URL_UPLOAD_GAMBAR = `${BASE_URL}/upload/gambar`
const BASE_URL_UPLOAD_TIF = `${BASE_URL}/upload/tif`

const BASE_URL_PENGGUNA = `${BASE_URL}/data-pengguna`;
const BASE_URL_LEVEL = `${BASE_URL}/data-level`;
const BASE_URL_KATEGORI = `${BASE_URL}/data-kategori`;

const BASE_URL_BARANG = `${BASE_URL}/data-barang`;
const BASE_URL_BARANG_RUSAK = `${BASE_URL}/data-barang-rusak`;
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


const BREAKPOINT_RESPONSIVE = 650;
const ROWS_TETAP_RESPONSIVE = 12;


let isLoginOverlayShown = false;

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
// Beri browser kesempatan menggambar frame sebelum kerja berat
const nextPaint = () =>
    new Promise(resolve =>
        requestAnimationFrame(() => setTimeout(resolve, 0))
    );

async function loadingStep(text) {
    await showLoading(text);
    await nextPaint();
}

class CetakError extends Error {}

const canvasToBlob = canvas =>
    new Promise((resolve, reject) =>
        canvas.toBlob(
            blob => blob ? resolve(blob) : reject(new CetakError("Gagal membuat gambar PNG")),
            "image/png"
        )
    );

// Tunggu sampai halaman cetak benar-benar siap (bukan about:blank)
function waitForPrintDoc(win, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const timer = setInterval(() => {
            try {
                const doc = win.document;
                if (doc.readyState === "complete" && doc.getElementById("print-image")) {
                    clearInterval(timer);
                    return resolve(doc);
                }
            } catch (e) { /* belum siap */ }

            if (Date.now() - start > timeout) {
                clearInterval(timer);
                reject(new CetakError("Halaman cetak gagal dimuat"));
            }
        }, 50);
    });
}

async function cetakTIFF(id) {
    let blobUrl = null;

    try {
        await loadingStep("Menyiapkan cetakan...");

        // ---------- LOAD DATA STIKER ----------
        const response = await apiFetch(`${BASE_URL_STIKER}/${id}`);
        if (!response.ok) throw new CetakError("Gagal mencetak TIFF");

        const stiker = await response.json();
        if (!stiker) throw new CetakError("Data stiker tidak tersedia");
        if (!stiker.pathTIF) throw new CetakError("File TIFF tidak tersedia");

        if (!(stiker.lebarKertas > 0) || !(stiker.tinggiKertas > 0)) {
            throw new CetakError("Ukuran kertas tidak valid");
        }

        // ---------- DPI ----------
        const dpiX = stiker.dpiX > 0 ? stiker.dpiX : 300;
        const dpiY = stiker.dpiY > 0 ? stiker.dpiY : 300;
        const mmToPxX = mm => mm * dpiX / 25.4;
        const mmToPxY = mm => mm * dpiY / 25.4;

        // ---------- DOWNLOAD TIFF ----------
        await loadingStep("Memuat file TIFF...");

        const url = BASE_URL + encodeURI(stiker.pathTIF) + ".tif";
        const responseTiff = await apiFetch(url);
        if (!responseTiff.ok) throw new CetakError("File TIFF tidak ditemukan");

        const buffer = await responseTiff.arrayBuffer();

        // ---------- DECODE TIFF ----------
        await loadingStep("Memproses gambar TIFF...");

        const ifds = UTIF.decode(buffer);
        if (!ifds || ifds.length === 0) throw new CetakError("TIFF tidak dapat dibaca");

        const ifd = ifds[0];
        UTIF.decodeImage(buffer, ifd);

        const tifWidth = ifd.width;
        const tifHeight = ifd.height;

        await nextPaint(); // beri jeda paint di antara dua tahap berat

        const rgba = UTIF.toRGBA8(ifd);
        if (!rgba || rgba.length === 0) throw new CetakError("Gagal membaca pixel TIFF");

        // ---------- GEOMETRI (semua dibulatkan ke pixel utuh) ----------
        const paperWidthPx  = Math.round(mmToPxX(stiker.lebarKertas));
        const paperHeightPx = Math.round(mmToPxY(stiker.tinggiKertas));

        const tifLeft = Math.round(mmToPxX(stiker.offsetX || 0));
        const tifTop  = Math.round(mmToPxY(stiker.offsetY || 0));

        const cropLeft   = Math.max(0, tifLeft);
        const cropTop    = Math.max(0, tifTop);
        const cropRight  = Math.min(paperWidthPx,  tifLeft + tifWidth);
        const cropBottom = Math.min(paperHeightPx, tifTop + tifHeight);

        if (cropRight <= cropLeft || cropBottom <= cropTop) {
            throw new CetakError("Gambar TIFF berada di luar area kertas");
        }

        const cropWidth  = cropRight - cropLeft;
        const cropHeight = cropBottom - cropTop;
        const sourceX = cropLeft - tifLeft;
        const sourceY = cropTop - tifTop;

        // ---------- CANVAS ----------
        await loadingStep("Menyiapkan gambar cetak...");

        const printCanvas = document.createElement("canvas");
        printCanvas.width = cropWidth;
        printCanvas.height = cropHeight;

        const printCtx = printCanvas.getContext("2d");
        printCtx.imageSmoothingEnabled = false;

        // Pakai buffer yang sama (tanpa menyalin ratusan MB)
        const imageData = new ImageData(
            new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.length),
            tifWidth,
            tifHeight
        );

        // Hanya salin area yang terlihat di kertas
        printCtx.putImageData(
            imageData,
            -sourceX, -sourceY,
            sourceX, sourceY, cropWidth, cropHeight
        );

        // ---------- PNG (async, tanpa base64) ----------
        await loadingStep("Menyiapkan halaman cetak...");

        const blob = await canvasToBlob(printCanvas);
        blobUrl = URL.createObjectURL(blob);

        // bebaskan memori canvas
        printCanvas.width = printCanvas.height = 0;

        const imageWidthMM  = cropWidth  * 25.4 / dpiX;
        const imageHeightMM = cropHeight * 25.4 / dpiY;

        // ---------- BUKA HALAMAN CETAK ----------
        const printWindow = window.open("./cetak-tif/print-tiff.html", "_blank");
        if (!printWindow) {
            throw new CetakError("Popup diblokir browser. Izinkan popup untuk situs ini.");
        }

        const doc = await waitForPrintDoc(printWindow);

        doc.title = `${stiker.namaUsaha} - ${stiker.namaStiker}`;

        const style = doc.createElement("style");
        style.textContent = `
            @page { size: ${stiker.lebarKertas}mm ${stiker.tinggiKertas}mm; margin: 0; }

            html, body, .print-page {
                width: ${stiker.lebarKertas}mm;
                height: ${stiker.tinggiKertas}mm;
            }

            #print-image {
                left: ${cropLeft * 25.4 / dpiX}mm;
                top: ${cropTop * 25.4 / dpiY}mm;
                width: ${imageWidthMM}mm;
                height: ${imageHeightMM}mm;
            }
            
            #print-label {
                position: absolute;
                left: 3mm;
                bottom: 3mm;
                max-width: calc(${stiker.lebarKertas}mm - 6mm);
                font: 300 3.5mm/1.2 Arial, sans-serif;
                color: #888888FF;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                z-index: 10;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        `;
        doc.head.appendChild(style);

        // ---------- GAMBAR ----------
        const img = doc.getElementById("print-image");
        img.src = blobUrl;

        // ---------- LABEL POJOK KIRI BAWAH ----------
        const namaAnycut = stiker.namaAnycut ?? "";
        const teksLabel = ["Rumah BUMN Batu Bara: ", stiker.namaUsaha, " - ", stiker.namaStiker, namaAnycut !== "" ? `(${namaAnycut})` : ""]
            .filter(Boolean)
            .join("  ");

        const label = doc.createElement("div");
        label.id = "print-label";
        label.textContent = teksLabel;
        img.parentNode.appendChild(label);

        // tunggu gambar benar-benar ter-decode
        try { await img.decode(); } catch (e) { /* tetap lanjut */ }

        const urlToRevoke = blobUrl;
        printWindow.addEventListener("afterprint", () => URL.revokeObjectURL(urlToRevoke));
        blobUrl = null; // sudah diserahkan ke afterprint

        printWindow.focus();
        printWindow.setTimeout(() => printWindow.print(), 0);

        showToast("Halaman cetak siap", "success");

    } catch (error) {
        console.error("Gagal mencetak TIFF:", error);

        showToast(
            error instanceof CetakError ? error.message : "Terjadi kesalahan saat mencetak TIFF",
            "error"
        );

    } finally {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        await hideLoading();
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

    let message = "Gagal hapus data";

    try {
        const errorData = await response.json();
        message = errorData.message || errorData.error || message;

    } catch {
        message = await response.text();
    }

    showToast(message, "error");
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

//OTOMATIS JUMLAH BARIS
function modeResponsive() {
    return window.matchMedia(`(max-width: ${BREAKPOINT_RESPONSIVE}px)`).matches;
}
function hitungRowsPerPage(tbodyId, fallback = 10) {
    // layar kecil: tinggi card mengikuti isi, jangan diukur
    if (modeResponsive()) return ROWS_TETAP_RESPONSIVE;

    const tbody = getEl(tbodyId);
    const card  = tbody?.closest(".tabel-page-card");
    if (!card) return fallback; // halaman sudah tidak ada

    const thead = card.querySelector("thead");
    const row   = tbody.querySelector("tr");

    // ukur baris asli kalau ada, kalau belum pakai 2.8rem (sesuai CSS td)
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const rowHeight = row ? row.getBoundingClientRect().height : remPx * 2.8;

    const available = card.clientHeight - (thead ? thead.offsetHeight : 0);
    return Math.max(1, Math.floor(available / rowHeight));
}
function pasangResizeTabel(tbodyId, { siap, rowsSaatIni, render }) {
    const card = getEl(tbodyId)?.closest(".tabel-page-card");
    if (!card) return;

    let timer;
    const observer = new ResizeObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (!card.isConnected) { observer.disconnect(); return; } // halaman diganti
            if (!siap()) return;
            if (hitungRowsPerPage(tbodyId) !== rowsSaatIni()) render();
        }, 150);
    });
    observer.observe(card);
}


//CEK SESSION LOGIN
async function apiFetch(url, options = {}) {
    const { skipAuthRedirect = false, ...fetchOptions } = options;

    const finalOptions = {
        ...fetchOptions,
        credentials: fetchOptions.credentials || "include"
    };

    const response = await fetch(url, finalOptions);

    if ((response.status === 401 || response.status === 403) && !skipAuthRedirect) {
        handleSessionExpired();

        //showToast("Sesi Anda telah berakhir, silakan login kembali", "warning");
        throw new Error("Sesi Anda telah berakhir, silahkan login kembali");
    }

    return response;
}

function tampilkanLogin(pesan = "") {
    isLoginOverlayShown = true;

    localStorage.removeItem("currentUser");
    penggunaAktif = null;

    const loginOverlay = getEl("login-overlay");
    if (loginOverlay) {
        resetLoginForm();
        resetSidebar();
        loginOverlay.classList.remove("hidden");
    }

    const loginError = getEl("login-error");
    if (loginError) {
        loginError.innerText = pesan;
    }

    setTimeout(() => getEl("namaPengguna")?.focus(), 100);
}

function handleSessionExpired() {
    if (isLoginOverlayShown) return; // cegah trigger berkali-kali
    tampilkanLogin("Sesi Anda telah berakhir, silakan login kembali");
}

class SessionExpiredError extends Error {}