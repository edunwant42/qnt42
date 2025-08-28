// Import Firebase configuration, auth instance, and functions from config.js
import {
  auth,
  signInWithEmailAndPassword,
  ref,
  get,
  dbRef,
  child
} from "/qnt42/src/assets/js/config.js";

// Import utility functions
import {
  sanitizeInput,
  checkEmptyField,
  validateEmail,
} from "/qnt42/src/assets/js/utils.js";

// Get login button
const loginButton = document.getElementById("login-btn");

// Add click event listener
loginButton.addEventListener("click", async (event) => {
  event.preventDefault();

  // Capture and sanitize input values
  const email = sanitizeInput(document.getElementById("email").value);
  const password = sanitizeInput(document.getElementById("password").value);

  let redirectTo = "/qnt42/src/pages/auth/login.html";

  // Run validations
  if (
    !checkEmptyField("Email", email, "redirect", redirectTo) ||
    !checkEmptyField("Password", password, "redirect", redirectTo) ||
    !validateEmail(email, "redirect", redirectTo)
  ) {
    return;
  }

  // Attempt login
  try {

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Fetch user data from RTDB
    const snapshot = await get(child(dbRef, "users/" + userCredential.user.uid));

    if (!snapshot.exists()) {
      sessionStorage.setItem("error", "Error: User data not found.");
      window.location.href = "/qnt42/src/pages/auth/login.html";
      return;
    }

    const data = snapshot.val();
    const username = data.username || "!F";
    const secretKey = data.secretKey || "!F";

    // Persist safe info in localStorage (so it survives reloads)
    localStorage.setItem("user-info", JSON.stringify({
      username,
      secretKey,
    }));

    // Redirect to dashboard
    window.location.href = "/qnt42/src/pages/dashboard.html";
  }
  catch (error) {
    let userMessage = "Error: Login failed. ";
    let notifType = "error";

    switch (error.code) {
      case "auth/user-not-found":
        userMessage = "Error: No account found with this email.";
        break;
      case "auth/too-many-requests":
        userMessage = "Error: Too many failed attempts. Please try again later.";
        break;
      case "auth/invalid-credential":
        userMessage = "Error: Invalid email or password. Please try again.";
        break;
      case "auth/network-request-failed":
        userMessage = "Error: Network error. Please check your connection.";
        break;
      default:
        userMessage = "Error: Unknown error occurred. Please try again later.";
    }

    sessionStorage.setItem(notifType, userMessage);
    window.location.href = "/qnt42/src/pages/auth/login.html";
  };
});
