import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBvmNB75LGrGEeJxe5qiJpww3oOiP6c65I",
  authDomain: "nordic-saunas.firebaseapp.com",
  projectId: "nordic-saunas",
  storageBucket: "nordic-saunas.firebasestorage.app",
  messagingSenderId: "1027974178126",
  appId: "1:1027974178126:web:91e96abbc0153c0bf82a1f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
