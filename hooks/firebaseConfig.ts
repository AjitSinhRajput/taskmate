import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB7h7rBA1vFkAEj61oyNcePMm4b73qOjUo",
  authDomain: "taskmate---capstone-project.firebaseapp.com",
  databaseURL: "https://taskmate---capstone-project-default-rtdb.firebaseio.com",
  projectId: "taskmate---capstone-project",
  storageBucket: "taskmate---capstone-project.firebasestorage.app",
  messagingSenderId: "573098258109",
  appId: "1:573098258109:web:c623cbd12a5469196351d4",
  measurementId: "G-SSL8RNN3X8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use Realtime DB instead of Firestore
export const db = getDatabase(app);
