import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2WpwNAE87gAJD0T3b60U0o24m4Aol6BI",
  authDomain: "drx-anime.firebaseapp.com",
  projectId: "drx-anime",
  storageBucket: "drx-anime.appspot.com",
  messagingSenderId: "1046704841991",
  appId: "1:1046704841991:web:0435ce22301b6465c191a2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
