
// Import Firebase configuration, auth instance, and functions from config.js
import { auth, db, createUserWithEmailAndPassword, updateProfile, signOut, doc, setDoc } from '../assets/js/config.js';

// Get the register button element
const registerButton = document.getElementById("register-btn");

// Disable auth guard temporarily during registration
let isRegistering = false;

// Override the auth guard temporarily
window.isRegistering = false;

// add event listener for the button if clicked
registerButton.addEventListener("click", (event) => {
  event.preventDefault();

  // Capture input values when button is clicked (not when script loads)
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validate inputs
  if (!username || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }

  // Set registration flag to prevent auth guard interference
  window.isRegistering = true;

  // Create user with email and password
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User created successfully
      const user = userCredential.user;
      
      // Update user profile with username
      return updateProfile(user, {
        displayName: username
      }).then(() => {
        // Store user data with username for notes organization
        return setDoc(doc(db, 'users', user.uid), {
          username: username,
          email: email,
          createdAt: new Date()
        });
      });
    })
    .then(() => {
      // Everything completed successfully - now sign out the user
      return signOut(auth);
    })
    .then(() => {
      // User signed out, reset registration flag
      window.isRegistering = false;
      // Now redirect to login
      alert(`User registered successfully! Please log in with your credentials.`);
      window.location.href = '/src/login.html'; // Redirect to login page
    })
    .catch((error) => {
      // Reset registration flag on error
      window.isRegistering = false;
      
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Registration error:", errorCode, errorMessage);
      
      // Handle specific errors
      let userMessage = "Registration failed. ";
      
      switch (errorCode) {
        case 'auth/email-already-in-use':
          userMessage += "This email is already registered.";
          break;
        case 'auth/weak-password':
          userMessage += "Password is too weak (minimum 6 characters).";
          break;
        case 'auth/invalid-email':
          userMessage += "Invalid email format.";
          break;
        case 'auth/network-request-failed':
          userMessage += "Network error. Please check your connection.";
          break;
        default:
          userMessage += errorMessage;
      }
      
      alert(userMessage);
    });
});

