# Monochrome Precision - Automated Appointment Booking & Reminder System

A production-grade, time-aware web application for booking appointments and scheduling automated notifications. Built with React (Vite), TailwindCSS, Firestore Realtime Database, Google Cloud Functions (2nd Gen), Gmail API (OAuth2), and Google Cloud Tasks.

---

## 🌐 Deployed Application
* **Frontend Web Application**: [https://appmanag-30eb1.web.app](https://appmanag-30eb1.web.app)
* **Cloud trigger location**: `us-central1`

---

## 🛠️ Key Features

### 1. Unified Real-Time Dashboard
* **Real-time Synchronization**: Interactive grid displaying appointments. Badges update automatically in real-time as background triggers modify status states (`Confirming` ➔ `Confirmed` ➔ `Scheduled` ➔ `Reminder Sent` ➔ `Completed`).
* **Active Filters & Search**: Search bookings instantly by name or email. Filter grid to show "All", "Upcoming", or "Failed" items with error details.

### 2. Time-Aware Asynchronous Scheduler (Phase 5)
* **Dual-Mode Execution**:
  * **Production**: Automatically queues delayed reminders via the **Google Cloud Tasks API**, targeting a secure HTTP callback endpoint exactly 1 hour prior to appointment times.
  * **Local Emulator fallback**: Simulates asynchronous delays using in-memory timers and a background Firestore task collection queue.
* **Idempotency & Duplicate Protection**: Safety filters verify if an appointment has been cancelled or if a reminder was already sent before sending emails.

### 3. Production Hardening & Safety Controls (Phase 7)
* **Double-Booking Prevention**: Server-side checks block duplicate submissions with the same email and appointment time within a 2-minute window.
* **Interactive Cancellation**: Users can cancel upcoming appointments directly from the actions column. This halts any scheduled reminder task and updates the status to `Cancelled` in real-time.

---

## 📂 Project Structure

```text
├── frontend/                     # React Single Page App (SPA)
│   ├── src/
│   │   ├── services/firebase.js  # Firestore connections
│   │   ├── pages/Dashboard.jsx   # Live dashboard grid with cancel actions
│   │   └── App.jsx               # Router & Layout
│   └── package.json
│
├── functions/                    # Cloud Functions for automation triggers
│   ├── services/
│   │   ├── orchestratorService.js # Orchestration & duplicate booking logic
│   │   ├── emailService.js        # Gmail API MIME encoding & sends
│   │   ├── reminderSchedulerService.js # Cloud Tasks vs Emulator routing
│   │   └── reminderExecutionService.js # Safety validation & execution
│   ├── index.js                  # Cloud run entrypoints & callbacks
│   └── package.json
│
├── firestore.rules               # Type validation, email regex, & timestamp rules
├── firestore.indexes.json        # Composite indexes for status filters & duplicate checks
└── firebase.json                 # Firebase deployment configurations
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have the Firebase CLI installed and you are logged into your Firebase account:
```bash
npm install -g firebase-tools
firebase login
```

### 2. Set Up Environment Variables
Create a `functions/.env` file with your credentials:
```env
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_SENDER_EMAIL=your_email@gmail.com
TEST_REMINDER_DELAY_SEC=15  # Set to a short offset (e.g. 15s) for testing reminders
```

### 3. Run the System
Start the Firebase emulators and the frontend server simultaneously:

#### Run Backend Emulators:
```bash
cd functions
npm install
firebase emulators:start
```

#### Run Frontend Web Client:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🔒 Security & Optimization
* **Environment Variables**: Sensitive Gmail OAuth credentials are kept out of source code.
* **Database Security Rules**: Strict schema validations on Firestore block empty customer names, malformed emails, and past appointment times.
* **No Database Polling**: The dashboard uses realtime Firestore subscriptions (`onSnapshot`) to listen for status changes, minimizing read charges and server overhead.
