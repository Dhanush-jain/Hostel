// app/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBI6rHOs_-7XLPbmj_2_PJM0G07vMRF1Us",
  authDomain: "hostel-c31fa.firebaseapp.com",
  projectId: "hostel-c31fa",
  storageBucket: "hostel-c31fa.firebasestorage.app",
  messagingSenderId: "674689258083",
  appId: "1:674689258083:web:e67676cae328a6be46de56",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
