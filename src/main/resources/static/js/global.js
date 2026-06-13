const BASE_URL = "http://localhost:8080/"
const BASE_URL_PENGGUNA = `${BASE_URL}api/data-pengguna`;
const BASE_URL_LEVEL = `${BASE_URL}api/data-level`;
const BASE_URL_KATEGORI = `${BASE_URL}api/data-kategori`;

const getEl = id => document.getElementById(id);
const getValue = id => getEl(id).value.trim();

const noImagePerson = "./assets/images/no-image-person.svg";

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