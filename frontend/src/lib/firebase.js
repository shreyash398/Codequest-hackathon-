import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyD1YDsAL1zjQOCEM_8TbuDYttfPi4rv6Vc",
    authDomain: "energy-meter-5e417.firebaseapp.com",
    databaseURL: "https://energy-meter-5e417-default-rtdb.firebaseio.com",
    projectId: "energy-meter-5e417",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
