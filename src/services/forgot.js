import { sanitizeInput, checkEmptyField, validateEmail } from "/qnt42/src/assets/js/utils.js";

// Initialize forgot password page
function initForgotPasswordPage() {
    const forgotForm = document.getElementById("forgotPasswordForm");
    const forgotButton = forgotForm.querySelector('button[type="submit"]');

    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Store original button content
        const originalText = forgotButton.innerHTML;
        const originalDisabled = forgotButton.disabled;

        // Show loading state
        forgotButton.disabled = true;
        forgotButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Processing...';

        const email = sanitizeInput(document.getElementById("forgot-email").value);

        if (!checkEmptyField("Email", email) || !validateEmail(email)) {
            // Reset button state
            forgotButton.disabled = originalDisabled;
            forgotButton.innerHTML = originalText;
            return;
        }

        // Simulate processing time
        setTimeout(() => {
            // Show info message specific to password reset
            sessionStorage.setItem(
                "info",
                "Info: Password recovery is currently in development. For now, please try to contact support our support if you need assistance."
            );
            
            // Reset button state
            forgotButton.disabled = originalDisabled;
            forgotButton.innerHTML = originalText;
            
            window.location.reload();
        }, 1500);
    });
}

// Initialize the forgot password page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initForgotPasswordPage();
});
