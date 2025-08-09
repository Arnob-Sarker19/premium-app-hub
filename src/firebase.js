// Replace these with your actual Firebase project settings

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyD0fpICbLfKl_2c8zNAbFAsDA_JdegXoXM",
    authDomain: "mod-app-website.firebaseapp.com",
    projectId: "mod-app-website",
    storageBucket: "mod-app-website.firebasestorage.app",
    messagingSenderId: "147904992205",
    appId: "1:147904992205:web:c82fe58d34f174c2fd2a84"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


