
import {
    auth,
    onAuthStateChanged,
    dbRef,
    get,
    child
} from '/src/assets/js/config.js';


// Page types for authentication control
const PAGE_TYPES = {
    PUBLIC: 'public',
    AUTH_ONLY: 'auth-only',
    GUEST_ONLY: 'guest-only'
};

// Canonical routes used across the app
const ROUTES = {
    DASHBOARD: '/src/pages/dashboard',
    LOGIN: '/src/pages/auth/login',
    REGISTER: '/src/pages/auth/register',
    HOME: '/'
};

/**
 * Determines the current page's authentication requirements.
 * @returns {string} The page type constant.
 */
function getCurrentPageType() {
    const path = window.location.pathname.toLowerCase();

    // Protected dashboard pages
    if (path.includes('dashboard') || path.includes('/src/pages/dashboard')) {
        return PAGE_TYPES.AUTH_ONLY;
    }

    // Guest-only pages (login, register, index/home)
    if (
        path.includes('/auth/login') ||
        path.includes('/auth/register') ||
        path.includes('login') && path.includes('auth') ||
        path.includes('register') && path.includes('auth') ||
        path === '/' ||
        path.includes('index')
    ) {
        return PAGE_TYPES.GUEST_ONLY;
    }

    return PAGE_TYPES.PUBLIC;
}

/**
 * Redirect helper that accepts either a named route or a full path.
 * @param {string} target - route name (e.g. 'DASHBOARD') or path
 */
function redirectTo(target) {
    if (!target) return;
    // Accept both named keys or direct paths
    const key = typeof target === 'string' && ROUTES[target.toUpperCase()];
    window.location.href = key || target;
}

/**
 * The main authentication guard. Hides the body, checks auth state,
 * and shows content or redirects the user.
 */
function initAuthGuard() {
    const pageType = getCurrentPageType();

    // Hide body while checking
    document.body.classList.add('loading');

    onAuthStateChanged(auth, async (user) => {
        // If a registration flow is in progress elsewhere, or a logout is in progress, skip guard
        if (window.isRegistering || window.isLoggingOut) {
            document.body.classList.remove('loading');
            // clear the logout flag so normal guard resumes on next state change
            if (window.isLoggingOut) window.isLoggingOut = false;
            return;
        }

        switch (pageType) {
            case PAGE_TYPES.AUTH_ONLY:
                // Redirect to login if a protected page is accessed by a guest
                if (!user) {
                    sessionStorage.setItem("info", "Info: You must be logged in to access the desired page.");
                    console.log('Redirecting unauthenticated user to login.');
                    redirectTo(ROUTES.LOGIN);
                    return;
                } else {
                    // Rehydrate user-info if missing
                    const existing = localStorage.getItem("user-info");
                    if (!existing) {
                        try {
                            const snapshot = await get(child(dbRef, "users/" + user.uid));
                            if (snapshot.exists()) {
                                const data = snapshot.val();
                                localStorage.setItem("user-info", JSON.stringify({
                                    username: data.username || "!F",
                                    secretKey: data.secretKey || "!F"
                                }));
                            }
                        } catch (err) {
                            console.error("Auth guard: failed to fetch user data", err);
                        }
                    }
                }
                break;
            case PAGE_TYPES.GUEST_ONLY:
                // Redirect to dashboard if a guest page is accessed by an authenticated user
                if (user) {
                    console.log('Redirecting authenticated user to dashboard.');
                    redirectTo(ROUTES.DASHBOARD);
                    return;
                }
                break;
            case PAGE_TYPES.PUBLIC:
            default:
                // No action for public pages
                break;
        }

        // Show the page content now that all checks are complete
        document.body.classList.remove('loading');
    });
}

// Initialize the guard when the page's DOM is fully loaded
document.addEventListener('DOMContentLoaded', initAuthGuard);

export { initAuthGuard, PAGE_TYPES };
