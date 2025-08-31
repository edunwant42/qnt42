import {
  auth,
  db,
  createUserWithEmailAndPassword,
  set,
  ref,
} from "/qnt42/src/assets/js/config.js";

import {
  sanitizeInput,
  checkEmptyField,
  validateEmail,
  validateTerms,
  validatePassword,
  generateSecretKey,
  generateOTP,
} from "/qnt42/src/assets/js/utils.js";

import { sendAccountEmail } from "/qnt42/src/assets/js/mailer.js";

const registerButton = document.getElementById("register-btn");

registerButton.addEventListener("click", async (event) => {
  event.preventDefault();

  // Set registration flag to prevent auth guard interference
  window.isRegistering = true;

  // Store original button content
  const originalText = registerButton.innerHTML;
  const originalDisabled = registerButton.disabled;

  // Show loading state
  registerButton.disabled = true;
  registerButton.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Processing ...';

  const username = sanitizeInput(document.getElementById("username").value);
  const email = sanitizeInput(document.getElementById("sign-up_email").value);
  const password = sanitizeInput(
    document.getElementById("sign-up_password").value
  );

  const redirectTo = "/qnt42/src/pages/auth/authenticate.html?action=register";

  if (
    checkEmptyField("Username", username, "redirect", redirectTo) &&
    checkEmptyField("Email", email, "redirect", redirectTo) &&
    checkEmptyField("Password", password, "redirect", redirectTo) &&
    validateEmail(email, "redirect", redirectTo) &&
    validatePassword(password) &&
    validateTerms()
  ) {
    try {
      // Clear any previous email errors
      localStorage.removeItem("emailError");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;
      const secretKey = generateSecretKey();
      const otp = generateOTP();
      const otpCreatedAt = Date.now();

      await set(ref(db, `users/${uid}`), {
        username,
        email,
        secretKey,
        otp,
        otpCreatedAt,
        verified: false,
        createdAt: new Date().toISOString(),
      });

      // Sign out the user immediately after registration
      await auth.signOut();

      // Add a small delay to ensure auth state is properly updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Send verification email using the new system
      const emailSent = await sendAccountEmail(
        "verifyAccount",
        email,
        username,
        {
          otp: otp,
          uid: uid,
        }
      );

      if (emailSent) {
        sessionStorage.setItem(
          "info",
          "Info: Registration successful! A verification OTP has been sent to your email. The code will expire in 15 minutes."
        );
        window.location.href =
          "/qnt42/src/pages/auth/secure.html?action=verify&uid=" + uid;
      } else {
        // Store email error details in localStorage for debugging
        const emailError = localStorage.getItem("emailError");
        throw new Error(`Failed to send verification email. ${emailError}`);
      }
    } catch (error) {
      console.error("Registration error details:", error);
      const errorCode = error.code;
      const errorMessage = error.message;

      let userMessage = "Error: Registration failed. ";
      let notifType = "error";

      switch (errorCode) {
        case "auth/email-already-in-use":
          userMessage += "This email is already registered.";
          break;
        case "auth/network-request-failed":
          userMessage += "Network error. Please check your connection.";
          break;
        case "auth/invalid-email":
          userMessage += "The email address is invalid.";
          break;
        case "auth/operation-not-allowed":
          userMessage += "Email/password accounts are not enabled.";
          break;
        case "auth/weak-password":
          userMessage += "The password is too weak.";
          break;
        default:
          userMessage += `Error: ${errorMessage}`;
      }

      sessionStorage.setItem(notifType, userMessage);
      window.location.href = redirectTo;
    } finally {
      // Clear registration flag
      window.isRegistering = false;
    }
  } else {
    // Reset button if validation fails
    registerButton.disabled = originalDisabled;
    registerButton.innerHTML = originalText;
    window.isRegistering = false;
  }
});
