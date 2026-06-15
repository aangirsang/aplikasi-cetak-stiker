function showToast(
    message,
    type = "success",
    duration = 3000
){

    const container =
        document.getElementById(
            "toast-container"
        );

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent =
        message;

    container.appendChild(
        toast
    );

    setTimeout(() => {

        toast.style.animation =
            "toastOut 0.3s ease forwards";

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, duration);
}