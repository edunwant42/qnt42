import { db, ref, get, set } from "/qnt42/src/assets/js/config.js";
import {
    sanitizeInput,
    checkEmptyField,
    validateEmail,
    generateOTP,
} from "/qnt42/src/assets/js/utils.js";
import { sendAccountEmail } from "/qnt42/src/assets/js/mailer.js";

// Initialize recover OTP page
function initRecoverOtpPage() {
    const recoverForm = document.getElementById("requestTokenForm");
    const recoverButton = recoverForm.querySelector('button[type="submit"]');

    recoverForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Store original button content
        const originalText = recoverButton.innerHTML;
        const originalDisabled = recoverButton.disabled;

        // Show loading state
        recoverButton.disabled = true;
        recoverButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Processing ...';

        // Get the email from the recover form specifically
        const emailInput = document.getElementById("recover-email");
        const email = sanitizeInput(emailInput.value);

        // Validate the email field
        if (!checkEmptyField("Email", email) || !validateEmail(email)) {
            // Reset button state
            recoverButton.disabled = originalDisabled;
            recoverButton.innerHTML = originalText;
            return;
        }

        try {
            // Find user by email
            const usersRef = ref(db, "users");
            const snapshot = await get(usersRef);

            if (!snapshot.exists()) {
                sessionStorage.setItem("error", "Error: No users found in database.");

                // Reset button state
                recoverButton.disabled = originalDisabled;
                recoverButton.innerHTML = originalText;

                window.location.reload();
                return;
            }

            let userFound = false;
            let userData = null;
            let userId = null;

            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (user.email === email) {
                    userFound = true;
                    userData = user;
                    userId = childSnapshot.key;
                }
            });

            if (!userFound) {
                sessionStorage.setItem(
                    "error",
                    "Error: No account found with this email address."
                );

                // Reset button state
                recoverButton.disabled = originalDisabled;
                recoverButton.innerHTML = originalText;

                window.location.reload();
                return;
            }

            // Check if account is already verified
            if (userData.verified) {
                sessionStorage.setItem(
                    "info",
                    "Info: Your account is already verified. You can login with your credentials."
                );

                // Reset button state
                recoverButton.disabled = originalDisabled;
                recoverButton.innerHTML = originalText;

                window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=login";
                return;
            }

            // Generate new OTP and timestamp
            const newOtp = generateOTP();
            const otpCreatedAt = Date.now();

            // Update OTP in database
            await set(ref(db, `users/${userId}/otp`), newOtp);
            await set(ref(db, `users/${userId}/otpCreatedAt`), otpCreatedAt);

            // Send verification email with new OTP
            const emailSent = await sendAccountEmail(
                "recoverOtp",
                email,
                userData.username,
                {
                    otp: newOtp,
                    uid: userId,
                    resend_link: `${window.location.origin}/qnt42/src/pages/auth/secure.html?action=verify&uid=${userId}`,
                }
            );

            if (emailSent) {
                sessionStorage.setItem(
                    "success",
                    "Success: A new verification OTP has been sent to your email. The code will expire in 10 minutes."
                );
                window.location.href =
                    "/qnt42/src/pages/auth/secure.html?action=verify&uid=" + userId;
            } else {
                throw new Error("Failed to send verification email.");
            }
        } catch (error) {
            console.error("OTP recovery error:", error);
            sessionStorage.setItem(
                "error",
                "Error: Failed to process OTP recovery request. " + error.message
            );
            window.location.reload();
        } finally {
            // Reset button state
            recoverButton.disabled = originalDisabled;
            recoverButton.innerHTML = originalText;
        }
    });
}

// Initialize the recover OTP page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initRecoverOtpPage();
});
