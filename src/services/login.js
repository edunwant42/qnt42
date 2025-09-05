// Import Firebase configuration, auth instance, and functions from config.js
import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  ref,
  get,
  dbRef,
  child,
} from "/qnt42/src/assets/js/config.js";

// Import utility functions
import {
  sanitizeInput,
  checkEmptyField,
  validateEmail,
  decryptSecretKey,
} from "/qnt42/src/assets/js/utils.js";

// Get login button
const loginButton = document.getElementById("login-btn");

// Redirect URL constants
const LOGIN_PAGE = "/qnt42/src/pages/auth/authenticate.html?action=login";
const VERIFY_PAGE = "/qnt42/src/pages/auth/secure.html?action=verify&uid=";
const DASHBOARD_PAGE = "/qnt42/src/pages/dashboard.html";

// Add click event listener
loginButton.addEventListener("click", async (event) => {
  event.preventDefault();

  const originalText = loginButton.innerHTML;
  const originalDisabled = loginButton.disabled;

  // Show loading state
  loginButton.disabled = true;
  loginButton.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Signing in ...';

  // Capture and sanitize input values
  const email = sanitizeInput(document.getElementById("sign-in_email").value);
  const password = sanitizeInput(
    document.getElementById("sign-in_password").value
  );

  // Run validations
  if (
    !checkEmptyField("Email", email, "redirect", LOGIN_PAGE) ||
    !checkEmptyField("Password", password, "redirect", LOGIN_PAGE) ||
    !validateEmail(email, "redirect", LOGIN_PAGE)
  ) {
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Fetch user data from RTDB
    const snapshot = await get(
      child(dbRef, "users/" + userCredential.user.uid)
    );

    if (!snapshot.exists()) {
      sessionStorage.setItem("error", "Error: User data not found.");
      return (window.location.href = LOGIN_PAGE);
    }

    const data = snapshot.val();

    if (!data.verified) {
      sessionStorage.setItem(
        "info",
        "Info: Your account is not verified. Check your email for the verification OTP."
      );
      await signOut(auth);
      return (window.location.href = VERIFY_PAGE + userCredential.user.uid);
    }

    const username = data.username || "";
    const encryptedSecretKey = data.secretKey || "";

    if (!encryptedSecretKey) {
      sessionStorage.setItem(
        "error",
        "Error: Missing secret key. Contact support."
      );
      return (window.location.href = LOGIN_PAGE);
    }

    // Decrypt secret key
    const secretKey = await decryptSecretKey(
      encryptedSecretKey,
      password,
      userCredential.user.uid
    );

    // Persist safe info in localStorage
    localStorage.setItem(
      "user-info",
      JSON.stringify({
        uid: userCredential.user.uid,
        username,
        secretKey,
      })
    );

    // Redirect to dashboard
    window.location.href = DASHBOARD_PAGE;
  } catch (error) {
    let userMessage = "Error: Login failed.";
    switch (error.code) {
      case "auth/user-not-found":
        userMessage = "Error: No account found with this email.";
        break;
      case "auth/too-many-requests":
        userMessage =
          "Error: Too many failed attempts. Please try again later.";
        break;
      case "auth/invalid-credential":
        userMessage = "Error: Invalid email or password. Please try again.";
        break;
      case "auth/network-request-failed":
        userMessage = "Error: Network error. Please check your connection.";
        break;
    }
    sessionStorage.setItem("error", userMessage);
    window.location.href = LOGIN_PAGE;
  } finally {
    // Ensure button is reset
    loginButton.disabled = originalDisabled;
    loginButton.innerHTML = originalText;
  }
});
