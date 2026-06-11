const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, orderBy, limit } = require('firebase/firestore');

// Use the production config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "REPLACE_WITH_YOUR_WEB_API_KEY", // Actually, we don't need the real API key if we use the firebase-admin SDK!
};

// Let's use firebase-admin instead so we don't need the web API key, but we need the service account credentials.
