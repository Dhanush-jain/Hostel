// app/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBI6rHOs_-7XLPbmj_2_PJM0G07vMRF1Us",
  authDomain: "hostel-c31fa.firebaseapp.com",
  projectId: "hostel-c31fa",
  storageBucket: "hostel-c31fa.firebasestorage.app",
  messagingSenderId: "674689258083",
  appId: "1:674689258083:web:e67676cae328a6be46de56",
};

/* getApps() guard: Next's fast refresh re-evaluates this module, and a
   second initializeApp() under the same name throws. */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* Everything below reads `app`, so it must stay below the line above.
   `const` is hoisted but left uninitialized, so touching it earlier in the
   module throws "Cannot access 'app' before initialization" rather than
   giving undefined. */
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
