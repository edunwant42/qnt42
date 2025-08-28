
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
