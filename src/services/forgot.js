import {
    sanitizeInput,
    checkEmptyField,
    validateEmail,
} from "/qnt42/src/assets/js/utils.js";
import { auth, sendPasswordResetEmail } from "/qnt42/src/assets/js/config.js"; // use from your config.js

// Initialize forgot password page
function initForgotPasswordPage() {
    const forgotForm = document.getElementById("forgotPasswordForm");
    const forgotButton = forgotForm.querySelector('button[type="submit"]');

    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = sanitizeInput(document.getElementById("forgot-email").value);

        // Validation
        if (!checkEmptyField("Email", email) || !validateEmail(email)) return;

        // Store original button content
        const originalText = forgotButton.innerHTML;
        forgotButton.disabled = true;
        forgotButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Sending...';

        try {
            // Firebase built-in reset email sender
            await sendPasswordResetEmail(auth, email, {
                url: "https://edunwant42.github.io/qnt42/src/pages/auth/secure.html?action=reset",
                handleCodeInApp: true,
            });

            sessionStorage.setItem(
                "success",
                "Success: A password reset email has been sent If your provided email is valid. Please check your inbox (and spam folder)."
            );
            window.location.reload();
        } catch (error) {
            console.error(error);
            sessionStorage.setItem(
                "error",
                "Error: Could not send reset email: " + error.message
            );
            window.location.reload();
        } finally {
            // Restore button state
            forgotButton.disabled = false;
            forgotButton.innerHTML = originalText;
        }
    });
}

// Initialize the forgot password page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initForgotPasswordPage();
});
