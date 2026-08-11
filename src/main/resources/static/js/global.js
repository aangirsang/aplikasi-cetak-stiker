//const BASE_URL = "http://localhost:8080/api" // UNTUK CODING/PENGEMBANG

const BASE_URL = "/api" // UNTUK JARINGAN
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

// MEMBUAT PDF
async function buatPDF(id) {

    // ==================================================
    // SHOW LOADING
    // ==================================================

    showLoading("Membuat PDF...");


    try {

        // ==================================================
        // LOAD DATA STIKER
        // ==================================================

        const response =
            await fetch(
                `${BASE_URL_STIKER}/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Gagal Memuat Data Stiker!"
            );
        }


        const stiker =
            await response.json();


        console.log(
            "Data Stiker:",
            stiker
        );


        // ==================================================
        // VALIDASI
        // ==================================================

        if (!stiker) {

            throw new Error(
                "Data stiker tidak tersedia"
            );
        }


        if (!stiker.pathTIF) {

            throw new Error(
                "File TIFF tidak tersedia"
            );
        }


        if (
            stiker.lebarKertas <= 0 ||
            stiker.tinggiKertas <= 0
        ) {

            throw new Error(
                "Ukuran kertas tidak valid"
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


        console.log(
            "DPI:",
            dpiX,
            "x",
            dpiY
        );


        // ==================================================
        // URL TIFF
        // ==================================================

        const url =
            BASE_URL +
            encodeURI(
                stiker.pathTIF
            ) +
            ".tif";


        console.log(
            "Memuat TIFF:",
            url
        );


        // ==================================================
        // DOWNLOAD TIFF
        // ==================================================

        showLoading(
            "Memuat file TIFF..."
        );


        const responseTiff =
            await fetch(url);


        if (!responseTiff.ok) {

            throw new Error(
                "File TIFF tidak ditemukan"
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

            throw new Error(
                "TIFF tidak dapat dibaca"
            );
        }


        // ==================================================
        // TIFF PERTAMA
        // ==================================================

        const ifd =
            ifds[0];


        UTIF.decodeImage(
            buffer,
            ifd
        );

        console.log(
            "TIFF WIDTH:",
            ifd.width
        );

        console.log(
            "TIFF HEIGHT:",
            ifd.height
        );

        console.log(
            "BITS:",
            JSON.stringify(ifd.t258)
        );

        console.log(
            "SAMPLES:",
            JSON.stringify(ifd.t277)
        );

        console.log(
            "COMPRESSION:",
            JSON.stringify(ifd.t259)
        );

        console.log(
            "PHOTOMETRIC:",
            JSON.stringify(ifd.t262)
        );

        console.log(
            "XRESOLUTION:",
            JSON.stringify(ifd.t282)
        );

        console.log(
            "YRESOLUTION:",
            JSON.stringify(ifd.t283)
        );


        const tifWidth =
            ifd.width;


        const tifHeight =
            ifd.height;


        console.log(
            "Ukuran TIFF:",
            tifWidth,
            "x",
            tifHeight
        );


        // ==================================================
        // INFORMASI TIFF
        // ==================================================

        console.log(
            "Bits per Sample:",
            ifd.t258
        );


        console.log(
            "Samples per Pixel:",
            ifd.t277
        );


        console.log(
            "Compression:",
            ifd.t259
        );


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

            throw new Error(
                "Gagal mengambil data pixel TIFF"
            );
        }


        // ==================================================
        // UKURAN KERTAS DALAM PIXEL
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


        console.log(
            "Kertas:",
            paperWidthPx,
            "x",
            paperHeightPx,
            "pixel"
        );


        // ==================================================
        // OFFSET DALAM PIXEL
        // ==================================================

        const offsetXPx =
            stiker.offsetX *
            dpiX /
            25.4;


        const offsetYPx =
            stiker.offsetY *
            dpiY /
            25.4;


        console.log(
            "Offset:",
            offsetXPx,
            offsetYPx
        );


        // ==================================================
        // BATAS GAMBAR TIFF
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
        // INTERSECTION DENGAN KERTAS
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

            throw new Error(
                "Gambar TIFF berada di luar area kertas"
            );
        }


        // ==================================================
        // UKURAN CROP
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


        console.log(
            "Source:",
            sourceX,
            sourceY
        );


        console.log(
            "Crop:",
            cropWidth,
            cropHeight
        );


        // ==================================================
        // CANVAS
        // ==================================================

        showLoading(
            "Menyiapkan pixel TIFF..."
        );


        const cropCanvas =
            document.createElement(
                "canvas"
            );


        cropCanvas.width =
            cropWidth;


        cropCanvas.height =
            cropHeight;


        const cropCtx =
            cropCanvas.getContext(
                "2d",
                {
                    alpha: true,
                    willReadFrequently: false
                }
            );


        // ==================================================
        // MATIKAN INTERPOLASI
        // ==================================================

        cropCtx.imageSmoothingEnabled =
            false;


        // ==================================================
        // IMAGE DATA
        // ==================================================

        const sourceImageData =
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

        cropCtx.putImageData(
            sourceImageData,
            -sourceX,
            -sourceY
        );


        // ==================================================
        // POSISI PDF
        // ==================================================

        const pdfX =
            cropLeft *
            25.4 /
            dpiX;


        const pdfY =
            cropTop *
            25.4 /
            dpiY;


        const pdfWidth =
            cropWidth *
            25.4 /
            dpiX;


        const pdfHeight =
            cropHeight *
            25.4 /
            dpiY;


        console.log(
            "PDF:",
            pdfX,
            pdfY,
            pdfWidth,
            pdfHeight
        );


        // ==================================================
        // BUAT PDF
        // ==================================================

        showLoading(
            "Membuat file PDF..."
        );


        const {
            jsPDF
        } = window.jspdf;


        const orientation =
            stiker.lebarKertas >
            stiker.tinggiKertas
                ? "landscape"
                : "portrait";


        const pdf =
            new jsPDF({

                orientation:

                orientation,

                unit:
                    "mm",

                format: [

                    stiker.lebarKertas,

                    stiker.tinggiKertas

                ],

                compress:
                    false

            });


        // ==================================================
        // PNG LOSSLESS
        // ==================================================

        showLoading(
            "Memasukkan gambar asli ke PDF..."
        );


        const pngData =
            cropCanvas.toDataURL(
                "image/png"
            );


        // ==================================================
        // TEST PNG
        // ==================================================

        const testPngUrl =
            pngData;


        const testLink =
            document.createElement("a");

        testLink.href =
            testPngUrl;

        testLink.download =
            "TEST-TIFF-CROP.png";

        testLink.click();

        console.log(
            "PNG berhasil dibuat"
        );


        // ==================================================
        // MASUKKAN KE PDF
        // ==================================================

        pdf.addImage(

            pngData,

            "PNG",

            pdfX,

            pdfY,

            pdfWidth,

            pdfHeight,

            undefined,

            "NONE"

        );


        // ==================================================
        // OUTPUT PDF
        // ==================================================

        showLoading(
            "Menyiapkan PDF..."
        );


        const blob =
            pdf.output(
                "blob"
            );


        // ==================================================
        // BLOB URL
        // ==================================================

        const blobUrl =
            URL.createObjectURL(
                blob
            );


        // ==================================================
        // SELESAI
        // ==================================================

        hideLoading();


        // ==================================================
        // BUKA PDF
        // ==================================================

        const pdfWindow =
            window.open(
                blobUrl,
                "_blank"
            );


        if (!pdfWindow) {

            throw new Error(
                "Popup diblokir oleh browser"
            );
        }


        // ==================================================
        // BERSIHKAN URL
        // ==================================================

        setTimeout(
            () => {

                URL.revokeObjectURL(
                    blobUrl
                );

            },
            60000
        );


        // ==================================================
        // TOAST
        // ==================================================

        showToast(
            "Berhasil membuat file PDF",
            "success"
        );


    } catch (error) {

        console.error(
            "Gagal membuat PDF:",
            error
        );


        hideLoading();


        showToast(
            error.message ||
            "Gagal membuat PDF",
            "error"
        );
    }
}
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
                `${BASE_URL_STIKER}/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Gagal Memuat Data Stiker!"
            );
        }


        const stiker =
            await response.json();


        console.log(
            "Data Stiker:",
            stiker
        );


        // ==================================================
        // VALIDASI
        // ==================================================

        if (!stiker) {

            throw new Error(
                "Data stiker tidak tersedia"
            );
        }


        if (!stiker.pathTIF) {

            throw new Error(
                "File TIFF tidak tersedia"
            );
        }


        if (
            stiker.lebarKertas <= 0 ||
            stiker.tinggiKertas <= 0
        ) {

            throw new Error(
                "Ukuran kertas tidak valid"
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


        console.log(
            "DPI:",
            dpiX,
            "x",
            dpiY
        );


        // ==================================================
        // URL TIFF
        // ==================================================

        const url =
            BASE_URL +
            encodeURI(
                stiker.pathTIF
            ) +
            ".tif";


        console.log(
            "Memuat TIFF:",
            url
        );


        // ==================================================
        // DOWNLOAD TIFF
        // ==================================================

        showLoading(
            "Memuat file TIFF..."
        );


        const responseTiff =
            await fetch(url);


        if (!responseTiff.ok) {

            throw new Error(
                "File TIFF tidak ditemukan"
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

            throw new Error(
                "TIFF tidak dapat dibaca"
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


        console.log(
            "TIFF:",
            tifWidth,
            "x",
            tifHeight
        );


        console.log(
            "BITS:",
            JSON.stringify(ifd.t258)
        );


        console.log(
            "SAMPLES:",
            JSON.stringify(ifd.t277)
        );


        console.log(
            "COMPRESSION:",
            JSON.stringify(ifd.t259)
        );


        console.log(
            "PHOTOMETRIC:",
            JSON.stringify(ifd.t262)
        );


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

            throw new Error(
                "Gagal membaca pixel TIFF"
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


        console.log(
            "Kertas:",
            paperWidthPx,
            "x",
            paperHeightPx
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


        console.log(
            "Offset:",
            offsetXPx,
            offsetYPx
        );


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

            throw new Error(
                "Gambar TIFF berada di luar area kertas"
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


        console.log(
            "Source:",
            sourceX,
            sourceY
        );


        console.log(
            "Crop:",
            cropWidth,
            cropHeight
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


        console.log(
            "Image MM:",
            imageWidthMM,
            "x",
            imageHeightMM
        );


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

        const printWindow =
            window.open(
                "",
                "_blank"
            );


        if (!printWindow) {

            throw new Error(
                "Popup diblokir oleh browser"
            );
        }


        // ==================================================
        // HTML PRINT
        // ==================================================

        printWindow.document.open();


        printWindow.document.write(`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Cetak TIFF</title>


<style>

@page {

    size:
        ${stiker.lebarKertas}mm
        ${stiker.tinggiKertas}mm;

    margin: 0;

}


html,
body {

    margin: 0;
    padding: 0;

    width:
        ${stiker.lebarKertas}mm;

    height:
        ${stiker.tinggiKertas}mm;

    overflow: hidden;

}


.print-page {

    position: relative;

    width:
        ${stiker.lebarKertas}mm;

    height:
        ${stiker.tinggiKertas}mm;

    margin: 0;

    padding: 0;

}


.print-image {

    position: absolute;

    left:
        ${cropLeft * 25.4 / dpiX}mm;

    top:
        ${cropTop * 25.4 / dpiY}mm;

    width:
        ${imageWidthMM}mm;

    height:
        ${imageHeightMM}mm;

    display: block;

    margin: 0;

    padding: 0;

    image-rendering: auto;

}


@media print {

    html,
    body {

        margin: 0;
        padding: 0;

    }

}

</style>

</head>


<body>


<div class="print-page">

    <img
        class="print-image"
        src="${pngData}"
    >

</div>


<script>

window.onload = function() {

    setTimeout(
        function() {

            window.focus();

            window.print();

        },
        500
    );

};



<\/script>


</body>

</html>
        `);


        printWindow.document.close();


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


        hideLoading();


        showToast(
            error.message ||
            "Gagal mencetak TIFF",
            "error"
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

