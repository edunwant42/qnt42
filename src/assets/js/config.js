/**
 * Firebase configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyD84LwFVcbIq57KmM7ooRbPymInBn7yqvE",
  authDomain: "qnt42-a27f3.firebaseapp.com",
  projectId: "qnt42-a27f3",
  storageBucket: "qnt42-a27f3.firebasestorage.app",
  messagingSenderId: "422487596465",
  appId: "1:422487596465:web:216b2abb2f1d9838a3f190",
  measurementId: "G-L93ZY6JGC5",
};

/**
 * Mail configuration for all QNT42 accounts/templates
 */
export const mailConfig = {
  contact: {
    PublicKey: "Qk6vUWdegzmDE4u1K",
    ServiceId: "srvc-contact_qnt42",
    Templates: { contact: "tmpl-contact_qnt42" },
  },
  Updates: {
    PublicKey: "1UqnFbpMg_QSmOCRK",
    ServiceId: "srvc-updates_qnt42",
    Templates: { welcome: "tmpl-welcome_qnt42" },
  },
  Security: {
    PublicKey: "SNi3LDlh5aTjxJ3t6",
    ServiceId: "srvc-security_qnt42",
    Templates: {
      reset: "tmpl-reset_qnt42",
      verify: "tmpl-verify_qnt42",
    },
  },
  Support: {
    PublicKey: "3MXQKCLHCkhpcCrEq",
    ServiceId: "srvc-support_qnt42",
    Templates: {
      forgot: "tmpl-forgot_qnt42",
      recoverOtp: "tmpl-recover_qnt42",
    },
  },
};

// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getDatabase,
  set,
  get,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const dbRef = ref(db);

export {
  auth,
  db,
  dbRef,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  updatePassword,
  set,
  get,
  ref,
  child,
};
