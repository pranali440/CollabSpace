import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "collab-13678.firebaseapp.com",
  databaseURL: "https://collab-13678-default-rtdb.firebaseio.com",
  projectId: "collab-13678",
  storageBucket: "collab-13678.firebasestorage.app",
  messagingSenderId: "866311902087",
  appId: "1:866311902087:web:967ac9ec7c0beca525f922"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);