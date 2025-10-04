import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2WpwNAE87gAJD0T3b60U0o24m4Aol6BI",
  authDomain: "drx-anime.firebaseapp.com",
  projectId: "drx-anime",
  storageBucket: "drx-anime.appspot.com",
  messagingSenderId: "1046704841991",
  appId: "1:1046704841991:web:0435ce22301b6465c191a2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const fetchAllAnime = async () => {
  const snapshot = await getDocs(collection(db, "anime_collection"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchAnimeById = async (id) => {
  const ref = doc(db, "anime_collection", id);
  const docSnap = await getDoc(ref);
  return docSnap.exists() ? docSnap.data() : null;
};
