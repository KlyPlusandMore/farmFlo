// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwy4_lJxdliBHE10fCT-Z7S5_Sz7t1XrE",
  authDomain: "farm-management-dd1fd.firebaseapp.com",
  projectId: "farm-management-dd1fd",
  storageBucket: "farm-management-dd1fd.appspot.com",
  messagingSenderId: "5001853027",
  appId: "1:5001853027:web:c2042871bbdfcdc69be056",
  measurementId: "G-BMRKZ20T45"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

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

export { app, analytics, db };
