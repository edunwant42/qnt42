/**
 * Firebase configuration
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCZ8xN6-uAkTmVNHQy-PAjPcAEQ1OG6uUA",
  authDomain: "qnt42-9639f.firebaseapp.com",
  projectId: "qnt42-9639f",
  storageBucket: "qnt42-9639f.firebasestorage.app",
  messagingSenderId: "54787094346",
  appId: "1:531135208207:web:c09fa24da5c643f310fc7a",
};

/**
 * Mail configuration for all QNT42 accounts/templates
 */
export const mailConfig = {
  contact: {
    PublicKey: "2p52LAUNd4eyqfGdw",
    ServiceId: "srvc-contact_qnt42",
    Templates: { contact: "tmpl-contact_qnt42" },
  },
  Updates: {
    PublicKey: "2hmaWu2GDSHi0_nMQ",
    ServiceId: "srvc-updates_qnt42",
    Templates: { welcome: "tmpl-welcome_qnt42" },
  },
  Security: {
    PublicKey: "kVSEWbzKqZpX9eONi",
    ServiceId: "srvc-security_qnt42",
    Templates: {
      reset: "tmpl-reset_qnt42",
      verify: "tmpl-verify_qnt42",
    },
  },
  Support: {
    PublicKey: "xLr6UrF_Q0bebMvzg",
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
  updatePassword
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
