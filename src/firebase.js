import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD59xle8q-IAFMXrNu9wykcJj4Nf1j7PvI",
  authDomain: "kch-rx-scheduler.firebaseapp.com",
  projectId: "kch-rx-scheduler",
  storageBucket: "kch-rx-scheduler.firebasestorage.app",
  messagingSenderId: "610459959959",
  appId: "1:610459959959:web:668738349ecee66c915fd2",
  measurementId: "G-5P8QWPN5Z9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
