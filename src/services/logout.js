// Import Firebase configuration and auth functions
import { auth, signOut } from '../assets/js/config.js';

// Logout function
async function handleLogout() {
  try {
    await signOut(auth);
    console.log('User logged out successfully');
    alert('You have been logged out successfully!');
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error during logout. Please try again.');
  }
}

// Make logout function globally available
window.handleLogout = handleLogout;

// Export for module usage
export { handleLogout };
