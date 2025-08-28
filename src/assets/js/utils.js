
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
 * Check if a required field is empty.
 *
 * @param {string} field The field name.
 * @param {string} value The value to check.
 * @param {string} redirectPath The path to redirect if validation fails.
 * @return {boolean} True if valid, false otherwise (with redirect).
 */
export function checkEmptyField(field, value, redirectPath) {
    if (!value || value.trim() === "") {
        sessionStorage.setItem("warning", `Warning: ${field} is required`);
        window.location.href = redirectPath;
        return false;
    }
    return true;
}

/**
 * Validate the email format.
 *
 * @param {string} email The email address to validate.
 * @param {string} redirectPath The path to redirect if validation fails.
 * @return {boolean} True if valid, false otherwise (with redirect).
 */
export function validateEmail(email, redirectPath) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        sessionStorage.setItem("warning", "Warning: Invalid email format");
        window.location.href = redirectPath;
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
        sessionStorage.setItem("warning", `Warning: Password must be at least ${minLength} characters long.`);
        window.location.href = "/src/pages/auth/register";
        return false;
    }
    if (!hasUppercase) {
        sessionStorage.setItem("warning", "Warning: Password must include at least one uppercase letter.");
        window.location.href = "/src/pages/auth/register";
        return false;
    }
    if (!hasLowercase) {
        sessionStorage.setItem("warning", "Warning: Password must include at least one lowercase letter.");
        window.location.href = "/src/pages/auth/register";
        return false;
    }
    if (!hasNumber) {
        sessionStorage.setItem("warning", "Warning: Password must include at least one number.");
        window.location.href = "/src/pages/auth/register";
        return false;
    }
    if (!hasSpecialChar) {
        sessionStorage.setItem("warning", "Warning: Password must include at least one special character.");
        window.location.href = "/src/pages/auth/register";
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
