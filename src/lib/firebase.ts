// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbh0qJsBYdLFrrj-PIpM_39u3zVCIPGs4",
  authDomain: "geopro-4f941.firebaseapp.com",
  projectId: "geopro-4f941",
  storageBucket: "geopro-4f941.firebasestorage.app",
  messagingSenderId: "61244887620",
  appId: "1:61244887620:web:2db5cf4162cc0de631e211",
  measurementId: "G-DPHSKZ1XLV"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analytics;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.log('Failed to initialize Analytics', error);
    }
}

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
