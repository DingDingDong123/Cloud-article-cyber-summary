import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyD_mzygebkypgE5lzXbg2LQ80ASOSSxbus",
	authDomain: "the-reporter-5f8c2.firebaseapp.com",
	projectId: "the-reporter-5f8c2",
	storageBucket: "the-reporter-5f8c2.firebasestorage.app",
	messagingSenderId: "844107880719",
	appId: "1:844107880719:web:3f7b59866c75765a22c67a",
	measurementId: "G-SSPVRY9WV2"
  };
// Replace the placeholders with your actual Firebase project configuration
const app = initializeApp(firebaseConfig);       // ✅ Initialize FIRST
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
  