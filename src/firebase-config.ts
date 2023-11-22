// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpJ0cCZXMnUq_4yRtC6t3cE5mm_c0Xtzw",
  authDomain: "little-chat-64a75.firebaseapp.com",
  projectId: "little-chat-64a75",
  storageBucket: "little-chat-64a75.appspot.com",
  messagingSenderId: "788142629573",
  appId: "1:788142629573:web:2b72bfb869e2b1399386ac",
  measurementId: "G-FTMLX1Y20B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
