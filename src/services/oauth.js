// Google OAuth button handlers
document.addEventListener("DOMContentLoaded", function () {
    const googleLoginBtn = document.getElementById("google-login-btn");
    const googleRegisterBtn = document.getElementById("google-register-btn");

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            sessionStorage.setItem(
                "info",
                "Notice: Google OAuth login is not yet available. This feature is under development and will be released soon."
            );
            window.location.reload();
        });
    }

    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener("click", function (e) {
            e.preventDefault();
            sessionStorage.setItem(
                "info",
                "Notice: Google OAuth Registration is not yet available. This feature is under development and will be released soon."
            );
            window.location.reload();
        });
    }
});
