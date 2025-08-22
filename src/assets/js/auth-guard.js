// Authentication Guard - Manages user session and page access
import { auth } from './config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

// Page types for authentication control
const PAGE_TYPES = {
  PUBLIC: 'public',
  AUTH_ONLY: 'auth-only',
  GUEST_ONLY: 'guest-only'
};

/**
 * Determines the current page's authentication requirements.
 * @returns {string} The page type constant.
 */
function getCurrentPageType() {
  const path = window.location.pathname;

  if (path.includes('dashboard')) {
    return PAGE_TYPES.AUTH_ONLY;
  } else if (path.includes('login') || path.includes('register') || path.includes('index') || path === '/') {
    return PAGE_TYPES.GUEST_ONLY;
  }
  return PAGE_TYPES.PUBLIC;
}

/**
 * Redirects the user to a specified URL.
 * @param {string} page - The path to redirect to.
 */
function redirectTo(page) {
  window.location.href = page;
}

/**
 * The main authentication guard. Hides the body, checks auth state,
 * and shows content or redirects the user.
 */
function initAuthGuard() {
  const pageType = getCurrentPageType();

  // Add a class to the body to hide it via CSS
  document.body.classList.add('loading');

  // Listen for changes in the Firebase authentication state
  onAuthStateChanged(auth, (user) => {
    // Prevent guard from running during registration process
    if (window.isRegistering) {
      console.log('Registration in progress, skipping auth guard.');
      document.body.classList.remove('loading');
      return;
    }

    switch (pageType) {
      case PAGE_TYPES.AUTH_ONLY:
        // Redirect to login if a protected page is accessed by a guest
        if (!user) {
          console.log('Redirecting unauthenticated user to login.');
          redirectTo('/src/login.html');
          return;
        }
        break;
      case PAGE_TYPES.GUEST_ONLY:
        // Redirect to dashboard if a guest page is accessed by an authenticated user
        if (user) {
          console.log('Redirecting authenticated user to dashboard.');
          redirectTo('/src/dashboard.html');
          return;
        }
        break;
      case PAGE_TYPES.PUBLIC:
        // No action needed for public pages
        console.log('Public page, no redirection needed.');
        break;
    }

    // Show the page content now that all checks are complete
    document.body.classList.remove('loading');
    console.log('Authentication guard completed.');
  });
}

// Initialize the guard when the page's DOM is fully loaded
document.addEventListener('DOMContentLoaded', initAuthGuard);

export { initAuthGuard, PAGE_TYPES };
