import { db, ref, get, set } from "/qnt42/src/assets/js/config.js";
import { sanitizeInput, getOtpValue } from "/qnt42/src/assets/js/utils.js";
import { sendAccountEmail } from "/qnt42/src/assets/js/mailer.js";

// OTP expiration time in milliseconds (15 minutes)
const OTP_EXPIRATION_TIME = 15 * 60 * 1000;

// Enhanced OTP handlers with better navigation
function attachEnhancedOtpHandlers(selector = ".otp-input") {
    const otpInputs = document.querySelectorAll(selector);

    otpInputs.forEach((input, index) => {
        input.setAttribute("inputmode", "numeric");
        input.setAttribute("pattern", "[0-9]*");
        input.setAttribute("autocomplete", "one-time-code");

        // Handle input event
        input.addEventListener("input", (event) => {
            let value = event.target.value.replace(/[^0-9]/g, "");

            // If pasted content has multiple digits, distribute them
            if (value.length > 1) {
                distributePastedValue(value, otpInputs, index);
                return;
            }

            event.target.value = value;

            // Auto-advance to next input if a digit was entered
            if (value !== "" && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        // Handle keydown events for navigation
        input.addEventListener("keydown", (event) => {
            // Handle backspace
            if (event.key === "Backspace") {
                if (input.value === "" && index > 0) {
                    // Move to previous field and clear it
                    otpInputs[index - 1].value = "";
                    otpInputs[index - 1].focus();
                } else {
                    // Clear current field but stay there
                    input.value = "";
                }
                event.preventDefault();
            }
            // Handle arrow keys for navigation
            else if (event.key === "ArrowLeft" && index > 0) {
                otpInputs[index - 1].focus();
                event.preventDefault();
            } else if (event.key === "ArrowRight" && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
                event.preventDefault();
            }
            // Handle tab key to navigate between fields
            else if (event.key === "Tab") {
                if (!event.shiftKey && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                    event.preventDefault();
                } else if (event.shiftKey && index > 0) {
                    otpInputs[index - 1].focus();
                    event.preventDefault();
                }
            }
        });

        // Handle paste event
        input.addEventListener("paste", (event) => {
            event.preventDefault();
            const pasteData = (event.clipboardData || window.clipboardData)
                .getData("text")
                .replace(/[^0-9]/g, "");

            if (pasteData.length === 0) return;

            distributePastedValue(pasteData, otpInputs, index);
        });

        // Handle focus event - select the text when focused
        input.addEventListener("focus", (event) => {
            event.target.select();
        });
    });

    // Auto-focus the first input
    if (otpInputs.length > 0) {
        otpInputs[0].focus();
    }
}

// Distribute pasted value across OTP fields
function distributePastedValue(pastedValue, otpInputs, startIndex) {
    const digits = pastedValue.split("").slice(0, otpInputs.length - startIndex);

    digits.forEach((digit, i) => {
        if (startIndex + i < otpInputs.length) {
            otpInputs[startIndex + i].value = digit;
        }
    });

    // Focus the next empty field or the last field if all are filled
    const nextEmptyIndex = findNextEmptyField(otpInputs, startIndex);
    if (nextEmptyIndex !== -1) {
        otpInputs[nextEmptyIndex].focus();
    } else {
        otpInputs[otpInputs.length - 1].focus();
    }
}

// Find the next empty field
function findNextEmptyField(otpInputs, startIndex = 0) {
    for (let i = startIndex; i < otpInputs.length; i++) {
        if (otpInputs[i].value === "") {
            return i;
        }
    }
    return -1;
}

// Check if all OTP fields are filled
function isAllFieldsFilled(otpInputs) {
    return Array.from(otpInputs).every((input) => input.value !== "");
}

// Check if OTP is expired
function isOtpExpired(otpCreatedAt) {
    if (!otpCreatedAt) return true;
    const now = Date.now();
    return now - otpCreatedAt > OTP_EXPIRATION_TIME;
}

// Initialize verification page
function initVerificationPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get("uid");
    const verifyForm = document.getElementById("vrfyAccountForm");
    const verifyButton = verifyForm.querySelector('button[type="submit"]');

    // Attach enhanced OTP behaviors on page load
    attachEnhancedOtpHandlers(".otp-input");

    // Verify OTP
    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Store original button content
        const originalText = verifyButton.innerHTML;
        const originalDisabled = verifyButton.disabled;

        // Show loading state
        verifyButton.disabled = true;
        verifyButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Verifying...';

        // Check if UID exists before proceeding
        if (!uid) {
            sessionStorage.setItem(
                "error",
                "Error: Missing user identification. Please request a new verification link."
            );
            
            // Reset button state
            verifyButton.disabled = originalDisabled;
            verifyButton.innerHTML = originalText;
            
            window.location.reload();
            return;
        }

        const otpInput = sanitizeInput(getOtpValue(".otp-input"));

        if (!otpInput || otpInput.length !== 6) {
            sessionStorage.setItem(
                "warning",
                "Warning: Please enter a valid 6-digit OTP."
            );
            
            // Reset button state
            verifyButton.disabled = originalDisabled;
            verifyButton.innerHTML = originalText;
            
            window.location.reload();
            return;
        }

        try {
            // Fetch user data only when form is submitted
            const snapshot = await get(ref(db, `users/${uid}`));
            if (!snapshot.exists()) {
                sessionStorage.setItem("error", "Error: User not found.");
                
                // Reset button state
                verifyButton.disabled = originalDisabled;
                verifyButton.innerHTML = originalText;
                
                window.location.reload();
                return;
            }

            const userData = snapshot.val();

            // Check if account is already verified
            if (userData.verified) {
                sessionStorage.setItem(
                    "info",
                    "Info: Your account is already verified. You can now access your account."
                );
                
                // Reset button state
                verifyButton.disabled = originalDisabled;
                verifyButton.innerHTML = originalText;
                
                window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=login";
                return;
            }

            // Check if OTP is expired
            if (isOtpExpired(userData.otpCreatedAt)) {
                sessionStorage.setItem(
                    "error",
                    "Error: The provided OTP Token has expired. Please request a new one to complete your account verification"
                );
                
                // Reset button state
                verifyButton.disabled = originalDisabled;
                verifyButton.innerHTML = originalText;
                
                window.location.reload();
                return;
            }

            if (userData.otp === otpInput) {
                // ✅ OTP correct → activate account
                await set(ref(db, `users/${uid}/verified`), true);
                await set(ref(db, `users/${uid}/verifiedAt`), new Date().toISOString());

                // Remove OTP from DB
                await set(ref(db, `users/${uid}/otp`), null);
                await set(ref(db, `users/${uid}/otpCreatedAt`), null);

                // Try to send welcome email, but don't block the verification process if it fails
                try {
                    await sendAccountEmail("welcome", userData.email, userData.username);
                } catch (emailError) {
                    console.error("Failed to send welcome email:", emailError);
                    // Continue with verification even if email fails
                }

                sessionStorage.setItem(
                    "success",
                    "Success: Your account has been successfully verified. You can now access your account."
                );
                window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=login";
            } else {
                sessionStorage.setItem(
                    "error",
                    "Error: Invalid OTP. Please provide the correct one."
                );
                
                // Reset button state
                verifyButton.disabled = originalDisabled;
                verifyButton.innerHTML = originalText;
                
                window.location.reload();
            }
        } catch (error) {
            console.error("Verification error:", error);
            sessionStorage.setItem(
                "error",
                "Error: Failed verifying account. " + error.message
            );
            
            // Reset button state
            verifyButton.disabled = originalDisabled;
            verifyButton.innerHTML = originalText;
            
            window.location.reload();
        } finally {
            // Ensure button is reset even if there's an unhandled exception
            verifyButton.disabled = originalDisabled;
            verifyButton.innerHTML = originalText;
        }
    });
}

// Initialize the verification page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initVerificationPage();
});
