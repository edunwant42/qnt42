import {
    auth,
    onAuthStateChanged,
    dbRef,
    get,
    child,
} from "/qnt42/src/assets/js/config.js";

// Page types for authentication control
const PAGE_TYPES = {
    PUBLIC: "public",
    AUTH_ONLY: "auth-only",
    GUEST_ONLY: "guest-only",
};

// Canonical routes used across the app
const ROUTES = {
    DASHBOARD: "/qnt42/src/pages/dashboard.html",
    HOME: "/qnt42/",
    VERIFY: "/qnt42/src/pages/auth/secure.html?action=verify",
};

/**
 * Determines the current page's authentication requirements.
 * @returns {string} The page type constant.
 */
function getCurrentPageType() {
    const path = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get("action");

    // Protected dashboard pages
    if (path.includes("/pages/dashboard.html")) {
        return PAGE_TYPES.AUTH_ONLY;
    }

    // Guest-only pages (only authentication pages)
    if (
        // Authentication pages
        (path.includes("authenticate.html") &&
            ["login", "register"].includes(action)) ||
        (path.includes("secure.html") && ["verify", "reset"].includes(action)) ||
        (path.includes("recover.html") && ["forgot", "request"].includes(action))
    ) {
        return PAGE_TYPES.GUEST_ONLY;
    }

    // Public pages (home, policy pages, etc.)
    return PAGE_TYPES.PUBLIC;
}

/**
 * Check if user is verified
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} True if user is verified
 */
async function isUserVerified(uid) {
    try {
        const snapshot = await get(child(dbRef, "users/" + uid));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return data.verified === true;
        }
        return false;
    } catch (err) {
        console.error("Error checking user verification:", err);
        return false;
    }
}

/**
 * Redirect helper that accepts either a named route or a full path.
 * @param {string} target - route name (e.g. 'DASHBOARD') or path
 */
function redirectTo(target) {
    if (!target) return;
    const key = typeof target === "string" && ROUTES[target.toUpperCase()];
    window.location.href = key || target;
}

/**
 * The main authentication guard. Hides the body, checks auth state,
 * and shows content or redirects the user.
 */
function initAuthGuard() {
    const pageType = getCurrentPageType();

    // Hide body while checking
    document.body.classList.add("loading");

    onAuthStateChanged(auth, async (user) => {
        // Skip guard if registration or logout in progress
        if (window.isRegistering || window.isLoggingOut) {
            document.body.classList.remove("loading");
            if (window.isLoggingOut) window.isLoggingOut = false;
            return;
        }

        switch (pageType) {
            case PAGE_TYPES.AUTH_ONLY:
                if (!user) {
                    sessionStorage.setItem(
                        "info",
                        "Info: You must be logged in to access the desired page."
                    );
                    console.log("Redirecting unauthenticated user to home.");
                    redirectTo(ROUTES.HOME);
                    return;
                } else {
                    // Check if user is verified before allowing access to dashboard
                    const isVerified = await isUserVerified(user.uid);
                    if (!isVerified) {
                        sessionStorage.setItem(
                            "info",
                            "Info: Please verify your email address before accessing the dashboard."
                        );
                        redirectTo(ROUTES.VERIFY + "&uid=" + user.uid);
                        return;
                    }

                    const existing = localStorage.getItem("user-info");
                    if (!existing) {
                        try {
                            const snapshot = await get(child(dbRef, "users/" + user.uid));
                            if (snapshot.exists()) {
                                const data = snapshot.val();
                                localStorage.setItem(
                                    "user-info",
                                    JSON.stringify({
                                        uid: user.uid,
                                        username: data.username || "!F",
                                        secretKey: data.secretKey || "!F",
                                    })
                                );
                            }
                        } catch (err) {
                            console.error("Auth guard: failed to fetch user data", err);
                        }
                    }
                }
                break;

            case PAGE_TYPES.GUEST_ONLY:
                if (user) {
                    // Check if user is verified before redirecting to dashboard
                    const isVerified = await isUserVerified(user.uid);
                    if (isVerified) {
                        console.log("Redirecting authenticated user to dashboard.");
                        redirectTo(ROUTES.DASHBOARD);
                        return;
                    }
                    // If not verified, allow them to stay on verification page
                }
                break;

            case PAGE_TYPES.PUBLIC:
            default:
                break;
        }

        // Show the page content now that all checks are complete
        document.body.classList.remove("loading");
    });
}

// Initialize the guard when the page's DOM is fully loaded
document.addEventListener("DOMContentLoaded", initAuthGuard);

export { initAuthGuard, PAGE_TYPES };
