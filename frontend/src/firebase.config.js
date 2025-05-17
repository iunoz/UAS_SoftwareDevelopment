// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPEIXFMrlWyOhP56xiS-Ji7DNumaAQKmY",
  authDomain: "decor-lighting.firebaseapp.com",
  projectId: "decor-lighting",
  storageBucket: "decor-lighting.firebasestorage.app",
  messagingSenderId: "114328563201",
  appId: "1:114328563201:web:2cdfebee68e3ac491e9a00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);