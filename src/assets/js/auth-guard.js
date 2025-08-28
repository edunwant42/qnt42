import {
    auth,
    onAuthStateChanged,
    dbRef,
    get,
    child
} from '/qnt42/src/assets/js/config.js';

// Page types for authentication control
const PAGE_TYPES = {
    PUBLIC: 'public',
    AUTH_ONLY: 'auth-only',
    GUEST_ONLY: 'guest-only'
};

// Canonical routes used across the app
const ROUTES = {
    DASHBOARD: '/qnt42/src/pages/dashboard.html',
    LOGIN: '/qnt42/src/pages/auth/login.html',
    REGISTER: '/qnt42/src/pages/auth/register.html',
    HOME: '/'
};

/**
 * Determines the current page's authentication requirements.
 * @returns {string} The page type constant.
 */
function getCurrentPageType() {
    const path = window.location.pathname.toLowerCase();

    // Protected dashboard pages
    if (path.includes('dashboard.html') || path.includes('/qnt42/src/pages/dashboard.html')) {
        return PAGE_TYPES.AUTH_ONLY;
    }

    // Guest-only pages (login, register, index/home)
    if (
        path.includes('/auth/login.html') ||
        path.includes('/auth/register.html') ||
        (path.includes('login.html') && path.includes('auth')) ||
        (path.includes('register.html') && path.includes('auth')) ||
        path === '/' ||
        path.includes('index.html')
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
        // Skip guard if registration or logout in progress
        if (window.isRegistering || window.isLoggingOut) {
            document.body.classList.remove('loading');
            if (window.isLoggingOut) window.isLoggingOut = false;
            return;
        }

        switch (pageType) {
            case PAGE_TYPES.AUTH_ONLY:
                if (!user) {
                    sessionStorage.setItem("info", "Info: You must be logged in to access the desired page.");
                    console.log('Redirecting unauthenticated user to login.');
                    redirectTo(ROUTES.LOGIN);
                    return;
                } else {
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
                if (user) {
                    console.log('Redirecting authenticated user to dashboard.');
                    redirectTo(ROUTES.DASHBOARD);
                    return;
                }
                break;

            case PAGE_TYPES.PUBLIC:
            default:
                break;
        }

        // Show the page content now that all checks are complete
        document.body.classList.remove('loading');
    });
}

// Initialize the guard when the page's DOM is fully loaded
document.addEventListener('DOMContentLoaded', initAuthGuard);

export { initAuthGuard, PAGE_TYPES };
