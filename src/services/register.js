// Import Firebase configuration, auth instance, and functions from config.js
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signOut,
  set,
  ref,
} from "/src/assets/js/config.js";

// Import utility functions
import {
  sanitizeInput,
  checkEmptyField,
  validateEmail,
  validatePassword,
  generateSecretKey
} from "/src/assets/js/utils.js";


// Get register button
const registerButton = document.getElementById("register-btn");

// Add click event listener
registerButton.addEventListener("click", (event) => {
  event.preventDefault();

  // Capture and sanitize input values
  const username = sanitizeInput(document.getElementById("username").value);
  const email = sanitizeInput(document.getElementById("email").value);
  const password = sanitizeInput(document.getElementById("password").value);

  let redirectTo = "/src/pages/auth/register.html";

  // Run validations
  if (checkEmptyField("Username", username, redirectTo) &&
    checkEmptyField("Email", email, redirectTo) &&
    checkEmptyField("Password", password, redirectTo) &&
    validateEmail(email, redirectTo) &&
    validatePassword(password)) {

    // If everything passes, i'll continue creating the user
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Generate a unique secret key for this user
        const secretKey = generateSecretKey();
        set(ref(db, 'users/' + userCredential.user.uid), {
          username: username,
          email: email,
          secretKey: secretKey
        });
        sessionStorage.setItem("success", "Success: Registration successful!");
        window.location.href = "/src/pages/auth/register.html";
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        // Handle specific errors
        let userMessage = "Error: Registration failed. ";
        let notifType = "error";

        switch (errorCode) {
          case 'auth/email-already-in-use':
            userMessage += "Error: This email is already registered.";
            notifType = "error";
            break;
          case 'auth/network-request-failed':
            userMessage += "Error: Network error. Please check your connection.";
            notifType = "error";
            break;
          default:
            userMessage = "Error: Unknown error occurred. Please try again later.";
        }

        sessionStorage.setItem(notifType, userMessage);
        window.location.href = "/src/pages/auth/register.html";
      });
  }
});
