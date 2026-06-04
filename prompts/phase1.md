# Phase 1
Good approach. Since you're using **another frontend agent**, don't give that agent backend details. Instead, make Antigravity build the backend phase-by-phase.

Also, **do not generate all phases at once**. Antigravity, Lovable, Cursor, Claude, and GPT generally perform better when given one large phase at a time.

Start with **Phase 1 only**, complete it, verify it works, then move to Phase 2.

---

# PHASE 1 PROMPT
## System Architecture & Backend Foundation

Copy this entire prompt into Antigravity.

:::writing{variant="document" id="58271"}
You are a senior Backend Architect and Firebase Engineer.

Build the backend foundation for an Appointment Reminder System.

This phase is architecture and backend setup only.

Do NOT create frontend pages.

The system will later support:

- Appointment creation
- Firestore database storage
- Gmail confirmation emails
- Automated reminder emails
- Realtime dashboard updates
- Appointment status tracking
- Error logging

The assignment requirements are:

1. User submits appointment information.
2. Appointment is saved into a database.
3. Confirmation notification is automatically sent.
4. Dashboard updates in realtime.
5. Bonus: reminder notification one hour before appointment.

For this implementation:

- Use Firebase Firestore as the database.
- Use Firebase Cloud Functions for backend logic.
- Use Gmail API for email delivery.
- Use Cloud Tasks for delayed reminder execution.
- Use Firebase Admin SDK.
- Use Node.js backend runtime.

Create a complete backend architecture.

Design all backend modules before implementation.

Create the following architecture layers:

1. Database Layer
2. Service Layer
3. Trigger Layer
4. Email Layer
5. Reminder Layer
6. Logging Layer
7. Configuration Layer

Design the folder structure.

Example:

backend/
├── functions/
├── services/
├── repositories/
├── config/
├── tasks/
├── triggers/
├── utils/
├── logs/

Explain the responsibility of every folder.

Create a detailed data flow explanation.

Explain exactly:

User Submission
→ Firestore Save
→ Trigger Execution
→ Email Send
→ Reminder Scheduling
→ Reminder Execution
→ Status Updates

Design Firestore collections.

Main collection:

appointments

Define every field.

Include:

customerName
email
appointmentTime
createdAt
status
confirmationSent
confirmationSentAt
reminderSent
reminderSentAt
emailStatus
errorMessage
reminderTime

Explain why each field exists.

Design Firestore indexes if needed.

Design backend environment variables.

Include:

Firebase Project ID
Gmail Client ID
Gmail Client Secret
Refresh Token
Sender Email
Cloud Task Configuration

Explain why every environment variable is needed.

Design backend security strategy.

Requirements:

- No API secrets stored in frontend.
- Gmail credentials must remain server-side.
- Cloud Functions must handle all email operations.
- Firestore write validation must exist.

Design backend validation rules.

Validate:

- Name required.
- Email required.
- Appointment time required.
- Appointment time must be future date.

Create sequence diagrams in text format.

Create architecture diagrams in text format.

Do not write implementation code yet.

Focus entirely on architecture, backend structure, data flow, validation strategy, security strategy, Firestore schema design, service separation, deployment planning, and scalability considerations.

The output must be detailed enough that another AI agent can implement the backend exactly as designed.
:::

---

After Antigravity finishes this phase:

1. Verify Firestore schema.
2. Verify folder structure.
3. Verify environment variables.
4. Verify architecture.
5. Verify service separation.

Only then move to Phase 2.

**Do not generate Phase 2 yet.**

Send me Antigravity's output for Phase 1, and I'll help refine it before we proceed to the implementation phase.