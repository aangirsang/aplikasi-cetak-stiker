const BASE_URL = "http://localhost:8080/"
const getEl = id => document.getElementById(id);
const getValue = id => getEl(id).value.trim();
function tandaiInvalid(el){
    el.classList.remove("error-validasi");
    void el.offsetWidth;
    el.classList.add("error-validasi");

    setTimeout(() => {
        el.classList.remove("error-validasi");
    }, 800);
}