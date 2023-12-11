// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrySESQJJrjyC5dHg8Jrq6OLdzOoF8aak",
  authDomain: "little-chat-86524.firebaseapp.com",
  projectId: "little-chat-86524",
  storageBucket: "little-chat-86524.appspot.com",
  messagingSenderId: "36280649503",
  appId: "1:36280649503:web:f988d749de4a71c40b922a",
  measurementId: "G-CH7YPCTNHE",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
