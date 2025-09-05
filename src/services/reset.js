import {
    auth,
    verifyPasswordResetCode,
    confirmPasswordReset,
} from "/qnt42/src/assets/js/config.js";
import {
    sanitizeInput,
    checkEmptyField,
    matchPasswords,
    validatePassword,
} from "/qnt42/src/assets/js/utils.js";

// Initialize reset password page
function initResetPasswordPage() {
    // Match your form ID from secure.html
    const resetForm = document.getElementById("rstPswrdForm");

    if (!resetForm) return;

    const resetButton = resetForm.querySelector('button[type="submit"]');

    // Extract oobCode from URL (Firebase gives it in query string)
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get("oobCode");

    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!oobCode) {
            window.notify("error", "Error: Invalid or missing reset code. Please request a new password reset.");
            return;
        }

        const newPassword = sanitizeInput(
            document.getElementById("newPasswordReset").value
        );
        const confirmPassword = sanitizeInput(
            document.getElementById("confirmPasswordReset").value
        );

        // Basic validation
        if (!checkEmptyField("New Password", newPassword) ||
            !checkEmptyField("Confirm Password", confirmPassword)) return;

        // Validate password strength
        if (!validatePassword(newPassword)) {
            return;
        }

        // Match passwords
        if (!matchPasswords(newPassword, confirmPassword)) {
            return;
        }

        // Store original button state
        const originalText = resetButton.innerHTML;
        resetButton.disabled = true;
        resetButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Processing ...';

        try {
            // First check the reset code is valid
            await verifyPasswordResetCode(auth, oobCode);

            // Then confirm the reset with the new password
            await confirmPasswordReset(auth, oobCode, newPassword);

            sessionStorage.setItem(
                "success",
                "Success: Your password has been reset successfully. You can now log in with your new password."
            );
            window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=login";

        } catch (error) {
            console.error(error);
            sessionStorage.setItem(
                "error",
                "Error: Failed resetting password: " + error.message
            );
            window.location.reload();

        } finally {
            // Restore button state
            resetButton.disabled = false;
            resetButton.innerHTML = originalText;
        }
    });
}

// Initialize the reset password page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initResetPasswordPage();
});
