const admin = require("firebase-admin");
const path = require("path");

// Load service account key
const serviceAccount = require("../appmanag-30eb1-firebase-adminsdk-fbsvc-ef858cfcbe.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createLiveAppointment() {
  console.log("Connecting to live Firestore database for project: appmanag-30eb1...");
  
  const appointmentDate = "2026-06-15";
  const appointmentTime = "14:30";
  const [year, month, day] = appointmentDate.split('-').map(Number);
  const [hours, minutes] = appointmentTime.split(':').map(Number);
  const combinedDate = new Date(year, month - 1, day, hours, minutes);

  const appointmentData = {
    customerName: "Antigravity Live Test",
    email: "ram.kuparati.ai@gmail.com",
    appointmentTime: admin.firestore.Timestamp.fromDate(combinedDate),
    status: 'created',
    confirmationSent: false,
    confirmationSentAt: null,
    reminderSent: false,
    reminderSentAt: null,
    emailStatus: 'pending',
    errorMessage: '',
    reminderTime: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection("appointments").add(appointmentData);
  console.log(`Successfully created appointment in live Firestore! Document ID: ${docRef.id}`);
  
  // Wait to allow server write confirmation
  setTimeout(() => {
    console.log("Check your Firebase console at: https://console.firebase.google.com/project/appmanag/firestore/default/data/appointments/" + docRef.id);
    process.exit(0);
  }, 2000);
}

createLiveAppointment().catch(console.error);
