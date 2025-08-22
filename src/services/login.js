// Import Firebase configuration, auth instance, and functions from config.js
import { auth, signInWithEmailAndPassword } from '../assets/js/config.js';

// Get the form and inputs
const loginForm = document.querySelector('.form');

// Add event listener for form submission
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Capture input values when form is submitted
  const email = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="password"]').value;

  // Validate inputs
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Signed in successfully
    const user = userCredential.user;
    console.log("User logged in:", user);
    
    // Show success message with username if available
    const welcomeName = user.displayName || 'User';
    alert(`Welcome back, ${welcomeName}!`);
    
    // Redirect to dashboard
    window.location.href = '/src/dashboard.html';
    
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    
    console.error("Login error:", errorCode, errorMessage);
    
    // Handle different error types
    let userMessage = "Login failed. ";
    
    switch (errorCode) {
      case 'auth/user-not-found':
        userMessage += "No account found with this email.";
        break;
      case 'auth/wrong-password':
        userMessage += "Incorrect password.";
        break;
      case 'auth/invalid-email':
        userMessage += "Invalid email format.";
        break;
      case 'auth/user-disabled':
        userMessage += "This account has been disabled.";
        break;
      case 'auth/too-many-requests':
        userMessage += "Too many failed attempts. Please try again later.";
        break;
      case 'auth/network-request-failed':
        userMessage += "Network error. Please check your connection.";
        break;
      default:
        userMessage += errorMessage;
    }
    
    alert(userMessage);
  }
});
