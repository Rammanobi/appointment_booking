# Project Architecture: Appointment Booking System

## Overview
This system is a real-time appointment booking and reminder application built with React, Firebase, and Twilio. It handles immediate WhatsApp confirmations upon booking and schedules a precise 1-hour prior reminder using Google Cloud Tasks.

## Technology Stack
- **Frontend**: React (Vite), TailwindCSS, React Router
- **Backend / Database**: Firebase Cloud Functions (Node.js 20, 2nd Gen), Firestore
- **Asynchronous Scheduling**: Google Cloud Tasks
- **Messaging Integration**: Twilio WhatsApp Sandbox API

---

## Data Flow & Architecture

### 1. Booking Creation
1. **User Action**: The customer submits the booking form on the React frontend (`/create`).
2. **Database Insertion**: The frontend writes a new document directly to the `appointments` collection in Firestore with the status `created`.
3. **Real-time Dashboard**: The `/dashboard` route listens to the `appointments` collection via `onSnapshot` and instantly displays the new booking.

### 2. Orchestration & Confirmation
1. **Firestore Trigger**: The `onAppointmentCreated` Cloud Function is triggered automatically when a new document is added.
2. **Duplicate Prevention**: The orchestrator verifies that no other appointment for the exact same phone number and time was created within the last 2 minutes (filtered securely in memory to avoid index requirements).
3. **WhatsApp Confirmation**: 
   - The system formats a message strictly complying with Twilio Sandbox template rules: `"Your appointment is coming up on [Date/Time] at [Name]"`.
   - The Twilio SDK sends the confirmation message via the WhatsApp API.
4. **Status Updates**: The Firestore document's `whatsappStatus` and `status` fields are updated. The Dashboard updates in real-time to show `Confirmed`.

### 3. Asynchronous Reminder Scheduling
1. **Cloud Task Creation**: Once the confirmation is successful, the orchestrator calculates the exact UNIX timestamp for 1 hour before the appointment.
2. **Queueing**: A Google Cloud Task is created and queued with a `scheduleTime` set to that exact timestamp. The task points to the `executeReminderCallback` HTTP Cloud Function endpoint.
3. **Status Update**: The appointment status transitions to `Scheduled`.

### 4. Reminder Execution
1. **Task Execution**: Exactly 1 hour before the appointment, Google Cloud Tasks invokes the `executeReminderCallback` HTTP endpoint.
2. **Idempotency & Safety Validation**: 
   - The endpoint checks Firestore to verify the appointment has not been `Cancelled` or already had a reminder sent.
3. **WhatsApp Reminder**: 
   - The system sends the Twilio Sandbox template reminder message.
4. **Final State**: The appointment transitions to `Completed`.

---

## State Machine (Appointment Status)
The system follows a strict, unidirectional state flow driven by background triggers:

1. `created` - Raw insert from frontend.
2. `confirmation_pending` - Orchestrator is running duplicate checks.
3. `confirmation_sent` - Twilio confirmation dispatched successfully.
4. `reminder_pending` - Cloud Task successfully queued.
5. `Scheduled` - Final resting state until reminder time.
6. `Completed` - Reminder sent successfully.
7. `Failed` - If validation, Twilio API, or orchestrator errors occur.
8. `Cancelled` - If the user manually cancels the appointment from the Dashboard.

## Third-Party Integration: Twilio WhatsApp
Due to sandbox constraints, all WhatsApp messages conform to the strict pre-approved template:
`Your appointment is coming up on {{1}} at {{2}}`
This ensures 100% delivery reliability regardless of the 24-hour conversational window policy.
