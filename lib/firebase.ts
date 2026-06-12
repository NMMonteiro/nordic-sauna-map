import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCRlhueFAIhCQYCzItfopIlJxpoDrNrWqo",
    authDomain: "suomiportaat-website.firebaseapp.com",
    projectId: "suomiportaat-website",
    storageBucket: "suomiportaat-website.firebasestorage.app",
    messagingSenderId: "1081910030000",
    appId: "1:1081910030000:web:6a6e3b432998e154655575",
    measurementId: "G-806HMSYVH5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
