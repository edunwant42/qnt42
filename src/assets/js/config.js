// Load Firebase secrets directly
const firebaseConfig = {
  apiKey: "AIzaSyCZ8xN6-uAkTmVNHQy-PAjPcAEQ1OG6uUA",
  authDomain: "qnt42-9639f.firebaseapp.com",
  projectId: "qnt42-9639f",
  storageBucket: "qnt42-9639f.firebasestorage.app",
  messagingSenderId: "54787094346",
  appId: "1:531135208207:web:c09fa24da5c643f310fc7a"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';

import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

import { getDatabase, set, get, ref, child } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const dbRef = ref(db);

export { firebaseConfig, auth, db, dbRef, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut, onAuthStateChanged,set, get, ref, child };
