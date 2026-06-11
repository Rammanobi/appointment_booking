import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Based on the project_id: appmanag-30eb1 provided in the admin SDK JSON
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_WEB_API_KEY", // You will need to replace this with your web API key from Firebase Console
  authDomain: "appmanag-30eb1.firebaseapp.com",
  projectId: "appmanag-30eb1",
  storageBucket: "appmanag-30eb1.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to local firestore emulator if running locally
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log("Connected to Firestore emulator on localhost:8080");
}

export { db };
