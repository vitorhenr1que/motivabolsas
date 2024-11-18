import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGUnZC43DHeqdZHbyArJYjJjWM3Fk6IEo",
  authDomain: "bolsa-facil-613b6.firebaseapp.com",
  projectId: "bolsa-facil-613b6",
  storageBucket: "bolsa-facil-613b6.appspot.com",
  messagingSenderId: "732385338165",
  appId: "1:732385338165:web:a477dc41fb2ade943c627c",
  measurementId: "G-N97EBFJKVN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)