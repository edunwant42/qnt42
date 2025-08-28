import { auth, signOut } from "/qnt42/src/assets/js/config.js";
import { clearOutNotifs, startInactivityTimer } from "/qnt42/src/assets/js/utils.js";

/**
 * Global logout handler used by onclick="handleLogout()" in Dashboard page.
 * - Signs out via Firebase
 * - Clears any UI-only sessionStorage items (e.g. username)
 * - Redirects to the public homepage
 * 
 * @param {boolean} inactivity - true if logout triggered by inactivity
 */
async function handleLogout(inactivity = false) {
    try {
        window.isLoggingOut = true; // mark logout in progress
        await signOut(auth);

        // Remove stored user info
        localStorage.removeItem("user-info");

        clearOutNotifs(); // clear all notification keys

        // If logout was triggered by inactivity, set info message
        if (inactivity) {
            sessionStorage.setItem(
                "Info",
                "Info: You have been logged out due to inactivity for your account and data security."
            );
        }

        // Redirect to home page
        window.location.href = "/qnt42/";
    } catch (err) {
        console.error("Logout failed", err);
        alert("Logout failed. Please try again.");
    }
}

window.addEventListener("load", startInactivityTimer);

// expose as global so inline onclick="handleLogout()" works
window.handleLogout = handleLogout;

export { handleLogout };
