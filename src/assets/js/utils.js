import { mailConfig } from "/qnt42/src/assets/js/config.js";

/**
 * Validate and sanitize input data.
 *
 * @param {string} data The input data to validate.
 * @return {string} The sanitized data.
 */
export function sanitizeInput(data) {
    if (typeof data !== "string") return "";

    // Remove extra whitespace
    let sanitized = data.trim();

    // Remove backslashes
    sanitized = sanitized.replace(/\\/g, "");

    // Escape HTML special characters
    sanitized = sanitized
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return sanitized;
}

/**
 * Validate the email format.
 *
 * @param {string} email The email address to validate.
 * @param {string} action The action to take if validation fails ("redirect" or "reload").
 * @param {string} path The path to redirect if action = "redirect".
 * @return {boolean} True if valid, false otherwise.
 */
export function validateEmail(email, action = "reload", path) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        sessionStorage.setItem("warning", "Warning: Invalid email format");

        if (action === "reload") {
            window.location.reload();
        } else {
            window.location.href = path;
        }

        return false;
    }
    return true;
}

/**
 *  Validate if the terms and policies are accepted.
 *
 * @return {boolean} True if accepted, false otherwise.
 */
export function validateTerms() {
    const termsCheckbox = document.getElementById("terms");
    if (!termsCheckbox.checked) {
        sessionStorage.setItem(
            "warning",
            "Warning: You must agree to the Terms of Use and Privacy Policy."
        );
        window.location.reload();
        return false;
    }
    return true;
}

/**
 * Check if a required field is empty.
 *
 * @param {string} field The field name.
 * @param {string} value The value to check.
 * @param {string} action The action to take if validation fails ("redirect" or "reload").
 * @param {string} path The path to redirect if action = "redirect".
 * @return {boolean} True if valid, false otherwise.
 */
export function checkEmptyField(field, value, action = "reload", path) {
    if (!value || value.trim() === "") {
        sessionStorage.setItem("warning", `Warning: ${field} is required`);

        if (action === "reload") {
            window.location.reload();
        } else {
            window.location.href = path;
        }

        return false;
    }
    return true;
}

/**
 * Validate the security of a password.
 *
 * Checks for minimum length, uppercase, lowercase, numeric,
 * and special character requirements.
 *
 * @param {string} password The password to validate.
 * @return {boolean} True if valid, false otherwise (with redirect).
 */
export function validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
        sessionStorage.setItem(
            "warning",
            `Warning: Password must be at least ${minLength} characters long.`
        );
        window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=register";
        return false;
    }
    if (!hasUppercase) {
        sessionStorage.setItem(
            "warning",
            "Warning: Password must include at least one uppercase letter."
        );
        window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=register";
        return false;
    }
    if (!hasLowercase) {
        sessionStorage.setItem(
            "warning",
            "Warning: Password must include at least one lowercase letter."
        );
        window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=register";
        return false;
    }
    if (!hasNumber) {
        sessionStorage.setItem(
            "warning",
            "Warning: Password must include at least one number."
        );
        window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=register";
        return false;
    }
    if (!hasSpecialChar) {
        sessionStorage.setItem(
            "warning",
            "Warning: Password must include at least one special character."
        );
        window.location.href = "/qnt42/src/pages/auth/authenticate.html?action=register";
        return false;
    }

    return true;
}

/**
 * Generate a radom secure 256-bit secret encryption key (Base64 encoded).
 *
 * @return {string} A unique secret key for encryption.
 */
export function generateSecretKey() {
    // Generate 32 random bytes (256 bits)
    const keyBytes = window.crypto.getRandomValues(new Uint8Array(32));

    // Convert bytes to Base64 string for storage
    return btoa(String.fromCharCode(...keyBytes));
}

/**
 * Generate random OTP Token
 *
 * @return {string} A unique OTP token.
 */
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

/**
 * Removes notification messages (info, success, error, warning) stored in sessionStorage.
 *
 * @param {string} [type] - Optional. The specific notification type to clear.
 *                         Valid values: "info", "success", "error", "warning".
 *                         If omitted or invalid, all notification types will be cleared.
 */
export function clearOutNotifs(type) {
    switch (type) {
        case "info":
            sessionStorage.removeItem("info");
            break;
        case "success":
            sessionStorage.removeItem("success");
            break;
        case "error":
            sessionStorage.removeItem("error");
            break;
        case "warning":
            sessionStorage.removeItem("warning");
            break;
        default:
            sessionStorage.removeItem("info");
            sessionStorage.removeItem("success");
            sessionStorage.removeItem("error");
            sessionStorage.removeItem("warning");
    }
}

/**
 * Attach toggle functionality for password input fields with eye icons.
 *
 * @param {string} toggleButtonSelector - CSS selector for the toggle buttons (e.g., ".toggle-password").
 */
export function attachPasswordToggles(
    toggleButtonSelector = ".toggle-password"
) {
    const toggleButtons = document.querySelectorAll(toggleButtonSelector);

    toggleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const input = button.previousElementSibling; // The password input
            if (!input) return;

            // Toggle input type
            input.type = input.type === "password" ? "text" : "password";

            // Toggle icon class
            const icon = button.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-eye");
                icon.classList.toggle("fa-eye-slash");
            }
        });
    });
}

/**
 * Generate a cryptographically secure random integer between 0 and max - 1.
 *
 * Uses the Web Crypto API to avoid bias, ensuring that each integer in the range
 * has an equal probability of being selected.
 *
 * @param {number} max The exclusive upper bound of the random number (must be > 0).
 * @return {number} A secure random integer in the range [0, max - 1].
 */
function secureRandomInt(max) {
    const randomBuffer = new Uint32Array(1);
    const range = 0x100000000; // 2^32
    const threshold = range - (range % max); // avoid modulo bias
    let r;
    do {
        crypto.getRandomValues(randomBuffer);
        r = randomBuffer[0];
    } while (r >= threshold);
    return r % max;
}

/**
 * Shuffle an array in place using the Fisher–Yates (Knuth) algorithm.
 *
 * This function ensures each permutation of the array is equally likely.
 * It uses `secureRandomInt` for cryptographically secure randomness.
 *
 * @param {Array} array The array to shuffle.
 * @return {Array} The same array, shuffled in place.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Generate a random but secure password.
 *
 * The password consists of:
 * - A random prefix of 10–12 characters including lowercase, uppercase, numbers,
 *   and 1–2 simple special characters (.,'*-_).
 * - The first character is guaranteed not to be a special character.
 * - At least one lowercase, one uppercase, one number, and one special character
 *   in the prefix.
 * - A fixed suffix "@qnt42" for a personal/project touch.
 *
 * @return {string} A secure password string of approximately 16–18 characters.
 */
function generateRandomPassword() {
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const simpleSpecialChars = ".'*+^-|,_";
    const suffix = "@qnt42";

    const allChars =
        lowerCaseChars + upperCaseChars + numbers + simpleSpecialChars;

    // Random prefix length between 10 and 12 to match total ~16-18 with suffix
    const prefixLength = 10 + secureRandomInt(3); // 10, 11, or 12
    const prefixChars = [];

    // Ensure first character is NOT a special char
    const firstCharPool = lowerCaseChars + upperCaseChars + numbers;
    prefixChars.push(firstCharPool[secureRandomInt(firstCharPool.length)]);

    // Ensure at least one lowercase, one uppercase, one number
    prefixChars.push(lowerCaseChars[secureRandomInt(lowerCaseChars.length)]);
    prefixChars.push(upperCaseChars[secureRandomInt(upperCaseChars.length)]);
    prefixChars.push(numbers[secureRandomInt(numbers.length)]);

    // Ensure at least one special character in the shuffled part
    const mandatorySpecial =
        simpleSpecialChars[secureRandomInt(simpleSpecialChars.length)];
    prefixChars.push(mandatorySpecial);

    // Fill the rest of the prefix randomly
    while (prefixChars.length < prefixLength) {
        prefixChars.push(allChars[secureRandomInt(allChars.length)]);
    }

    // Shuffle all except the first character
    const firstChar = prefixChars.shift();
    const shuffled = shuffleArray(prefixChars).join("");

    return firstChar + shuffled + suffix; // total length ~16-18
}

/**
 * Attach a click event to a button to generate a secure password.
 *
 * When the button is clicked:
 * - Generates a new password using `generateRandomPassword()`.
 * - Sets the password field value to the generated password.
 * - Makes the password field visible immediately.
 * - Updates the toggle icon if a show/hide password button exists.
 *
 * @param {string} buttonId The ID of the button that triggers password generation.
 * @param {string} passwordFieldId The ID of the input field to populate with the password.
 */
export function attachGeneratePasswordButton(buttonId, passwordFieldId) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.addEventListener("click", (e) => {
        e.preventDefault();
        const passwordField = document.getElementById(passwordFieldId);
        if (passwordField) {
            // Generate a new secure password using the updated generator
            const newPassword = generateRandomPassword();
            passwordField.value = newPassword;

            // Make the password visible immediately
            passwordField.type = "text";

            // Sync toggle icon if it exists
            const toggleIcon =
                passwordField.parentElement.querySelector(".toggle-password i");
            if (toggleIcon) {
                toggleIcon.classList.remove("fa-eye-slash");
                toggleIcon.classList.add("fa-eye");
            }
        }
    });
}

/**
 * Starts an inactivity timer that automatically logs the user out
 * after a fixed period (default: 42 minutes) of no activity.
 *
 * Activity events such as keypresses and clicks reset the timer.
 * If the user remains idle past the timeout, `handleLogout()` is triggered.
 *
 * Internal helpers:
 *  - resetTimer(): Resets the inactivity timer on user activity.
 *  - logTimeLeft(): (used for debugging) Logs remaining time until auto-logout.
 */
export function startInactivityTimer() {
    const inactivityLogoutTime = 42 * 60 * 1000; // 42 minutes
    let timeout;
    let lastActivityTime = Date.now();

    // Reset timer whenever user interacts
    function resetTimer() {
        lastActivityTime = Date.now(); // update on every activity
        clearTimeout(timeout);
        timeout = setTimeout(() => handleLogout(true), inactivityLogoutTime);
    }

    // Function to log the remaining time before logout
    function logTimeLeft() {
        const timeElapsed = Date.now() - lastActivityTime;
        const timeLeft = Math.max(inactivityLogoutTime - timeElapsed, 0);
        console.log(
            `Time left before logout: ${Math.ceil(timeLeft / 1000)} seconds`
        );
    }

    // Activity event listeners
    document.addEventListener("keypress", resetTimer);
    document.addEventListener("click", resetTimer);

    /*
          document.addEventListener("mousemove", resetTimer);
          document.addEventListener("scroll", resetTimer);
          document.addEventListener("touchstart", resetTimer);
          */

    // Start first timer
    resetTimer();

    // Log time left every second
    // setInterval(logTimeLeft, 1000);
}

/**
 * Collects and validates OTP input fields.
 *
 * Ensures each OTP box only contains 1 digit.
 * Returns the concatenated OTP string or "" if invalid.
 *
 * @param {string} selector - CSS selector for OTP input fields.
 * @return {string} Concatenated OTP string.
 */
export function getOtpValue(selector = ".otp-input") {
    const inputs = document.querySelectorAll(selector);
    let otp = "";

    for (const input of inputs) {
        const value = input.value.trim();

        // Validate: must be a single digit
        if (!/^[0-9]{1}$/.test(value)) {
            return ""; // Invalid OTP (missing or non-digit)
        }
        otp += value;
    }

    return otp;
}

/**
 * Attach OTP input behavior (auto move, backspace, paste).
 *
 * @param {string} selector - CSS selector for OTP input fields.
 */
export function attachOtpHandlers(selector = ".otp-input") {
    const otpInputs = document.querySelectorAll(selector);

    otpInputs.forEach((input, index) => {
        input.setAttribute("inputmode", "numeric"); // mobile numeric keypad
        input.setAttribute("pattern", "[0-9]*");

        input.addEventListener("input", (event) => {
            let value = event.target.value.replace(/[^0-9]/g, "");
            if (value.length > 1) value = value.charAt(0); // keep only first digit
            event.target.value = value;

            if (value !== "" && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" && input.value === "" && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        input.addEventListener("paste", (event) => {
            event.preventDefault();
            const pasteData = (event.clipboardData || window.clipboardData)
                .getData("text")
                .replace(/[^0-9]/g, "")
                .slice(0, otpInputs.length);

            if (pasteData.length === 0) return;

            otpInputs.forEach((field, idx) => {
                field.value = pasteData[idx] || "";
            });

            const nextIndex = Math.min(pasteData.length, otpInputs.length - 1);
            otpInputs[nextIndex].focus();
        });
    });
}

/**
 * Low-level function: Sends email via EmailJS
 */
export async function sendEmail({
    PublicKey,
    serviceId,
    templateId,
    templateParams,
    submitBtn,
}) {
    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Sending ...';
        }

        emailjs.init(PublicKey);
        const response = await emailjs.send(serviceId, templateId, templateParams);

        console.log("EmailJS response:", response);

        if (submitBtn) {
            sessionStorage.setItem(
                "success",
                "Success: Your message has been sent! We'll get back to you soon."
            );
        }
        return true;
    } catch (error) {
        console.error("EmailJS Error:", error);
        // Store the error for debugging
        storeEmailError(error);

        sessionStorage.setItem(
            "error",
            "Error: Unable to send message. Please try again later."
        );
        return false;
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
        }
    }
}

/**
 * High-level function: Sends an email using mailConfig
 */
export async function sendTemplateEmail(
    account,
    templateKey,
    templateParams,
    submitBtn
) {
    const config = mailConfig[account];
    if (!config) {
        console.error(`Email account not found: ${account}`);
        return false;
    }

    const templateId = config.Templates?.[templateKey];
    if (!templateId) {
        console.error(
            `Template ID not found for key: ${templateKey} in account: ${account}`
        );
        return false;
    }

    return await sendEmail({
        PublicKey: config.PublicKey,
        serviceId: config.ServiceId,
        templateId,
        templateParams,
        submitBtn,
    });
}

/**
 * Stores email error details in localStorage.
 * @param {*} error
 */
export function storeEmailError(error) {
    try {
        localStorage.setItem(
            "emailError",
            JSON.stringify({
                message: error.message,
                time: new Date().toISOString(),
            })
        );
    } catch (e) {
        console.error("Failed to store email error:", e);
    }
}

/**
 * Encrypts data using AES-GCM
 * @param {string} data - Data to encrypt
 * @param {string} secretKey - Base64 encoded secret key
 * @returns {Promise<string>} Base64 encoded encrypted data
 */
export async function encryptData(data, secretKey) {
    try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        // Import the key
        const key = await window.crypto.subtle.importKey(
            "raw",
            base64ToArrayBuffer(secretKey),
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );

        // Generate IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Encrypt the data
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            dataBuffer
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        return arrayBufferToBase64(combined);
    } catch (error) {
        console.error("Encryption error:", error);
        throw error;
    }
}

/**
 * Decrypts data using AES-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {string} secretKey - Base64 encoded secret key
 * @returns {Promise<string>} Decrypted data
 */
export async function decryptData(encryptedData, secretKey) {
    try {
        // Convert base64 to array buffer
        const combinedBuffer = base64ToArrayBuffer(encryptedData);

        // Extract IV and encrypted data
        const iv = combinedBuffer.slice(0, 12);
        const data = combinedBuffer.slice(12);

        // Import the key
        const key = await window.crypto.subtle.importKey(
            "raw",
            base64ToArrayBuffer(secretKey),
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );

        // Decrypt the data
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            data
        );

        // Convert to string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        console.error("Decryption error:", error);
        throw error;
    }
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {*} base64 
 * @returns 
 */
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Converts an ArrayBuffer to a Base64 string.
 * @param {*} buffer 
 * @returns 
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Updates the copyright year dynamically.
 */
export function updateCopyrightYear() {
    const currentYearSpan = document.getElementById("currentYear");
    if (currentYearSpan) {
        const currentYear = new Date().getFullYear();
        currentYearSpan.textContent = currentYear;
    }
}
