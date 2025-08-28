
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
