// Authentication Guard - Manages user session and page access
import { auth } from './config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

// Page types for authentication control
const PAGE_TYPES = {
  PUBLIC: 'public',      // Anyone can access (home page)
  AUTH_ONLY: 'auth-only', // Only authenticated users (dashboard)
  GUEST_ONLY: 'guest-only' // Only unauthenticated users (login, register)
};

// Current page detection
function getCurrentPageType() {
  const path = window.location.pathname;
  
  if (path.includes('dashboard')) {
    return PAGE_TYPES.AUTH_ONLY;
  } else if (path.includes('login') || path.includes('register') || path.includes('index') || path === '/') {
    return PAGE_TYPES.GUEST_ONLY;
  } else {
    return PAGE_TYPES.PUBLIC;
  }
}

// Redirect functions
function redirectToLogin() {
  if (!window.location.pathname.includes('login')) {
    window.location.href = '/src/login.html';
  }
}

function redirectToDashboard() {
  if (!window.location.pathname.includes('dashboard')) {
    window.location.href = '/src/dashboard.html';
  }
}

function redirectToHome() {
  if (!window.location.pathname.includes('index') && !window.location.pathname === '/') {
    window.location.href = '/index.html';
  }
}

// Main authentication guard function
function initAuthGuard() {
  const pageType = getCurrentPageType();
  
  // Show loading state while checking auth
  document.body.style.visibility = 'hidden';
  
  onAuthStateChanged(auth, (user) => {
    // Check if registration is in progress
    if (window.isRegistering) {
      console.log('Registration in progress, skipping auth guard');
      document.body.style.visibility = 'visible';
      return;
    }
    
    if (user) {
      // User is authenticated
      console.log('User is authenticated:', user.displayName || user.email);
      
      if (pageType === PAGE_TYPES.GUEST_ONLY) {
        // Authenticated user trying to access login/register/home
        console.log('Redirecting authenticated user to dashboard');
        redirectToDashboard();
        return;
      }
      
      // Allow access to dashboard only - NO navbar modifications
      
    } else {
      // User is not authenticated
      console.log('User is not authenticated');
      
      if (pageType === PAGE_TYPES.AUTH_ONLY) {
        // Unauthenticated user trying to access protected page
        console.log('Redirecting unauthenticated user to login');
        redirectToLogin();
        return;
      }
      
      // Allow access to guest pages - NO navbar modifications
    }
    
    // Show the page content
    document.body.style.visibility = 'visible';
  });
}

// Update navbar based on authentication status
function updateNavbarForAuthenticatedUser(user) {
  const authButtons = document.querySelector('.auth-buttons');
  if (authButtons) {
    authButtons.innerHTML = `
      <div class="user-info">
        <span>Welcome, ${user.displayName || 'User'}</span>
        <a href="/src/dashboard.html" class="btn secondary">Dashboard</a>
        <button onclick="handleLogout()" class="btn primary">Logout</button>
      </div>
    `;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAuthGuard);

export { initAuthGuard, PAGE_TYPES };
