# Phase 5
Excellent.

At the end of Phase 4, your system can:

```text
Appointment Created
        ↓
Confirmation Email Sent
```

But the bonus requirement still doesn't work.

The assignment specifically mentions:

> "If the appointment time is within 1 hour, automatically send a reminder message." 

Phase 5 solves that problem.

---

# PHASE 5

# REMINDER SCHEDULER & DELAYED EXECUTION ENGINE

## Main Goal

Before Phase 5:

```text
Appointment Created
       ↓
Confirmation Email Sent
```

End.

Nothing happens later.

---

After Phase 5:

```text
Appointment Created
       ↓
Confirmation Email Sent
       ↓
Reminder Scheduled
       ↓
Wait
       ↓
1 Hour Before Appointment
       ↓
Reminder Email Sent
```

Now the system becomes time-aware.

---

# WHY PHASE 5 EXISTS

Think:

User books:

```text
Tomorrow
3:00 PM
```

---

Question:

Should reminder send immediately?

```text
NO
```

---

Question:

Should reminder send after 5 seconds?

```text
NO
```

---

Question:

Should reminder send exactly 1 hour before?

```text
YES
```

---

Therefore system needs:

```text
WAIT
```

This is the purpose of Phase 5.

---

# THE CORE PROBLEM

Suppose:

```text
Current Time
10:00 AM
```

Appointment:

```text
Tomorrow
3:00 PM
```

---

Reminder should send:

```text
Tomorrow
2:00 PM
```

---

System must remember:

```text
Send Later
```

Not:

```text
Send Now
```

---

# REMINDER TIME CALCULATION

Appointment:

```text
3:00 PM
```

---

Formula:

```text
Reminder Time
=
Appointment Time
− 1 Hour
```

---

Example:

```text
Appointment
3:00 PM
```

Result:

```text
Reminder
2:00 PM
```

---

Store:

```json
{
 "appointmentTime":"3:00 PM",
 "reminderTime":"2:00 PM"
}
```

---

Why store it?

Because future execution depends on it.

---

# WHAT IS CLOUD TASKS?

Imagine:

You tell a friend:

```text
Remind me tomorrow at 2 PM.
```

---

Friend writes:

```text
Reminder
Tomorrow
2 PM
```

---

Then waits.

---

Then reminds you.

---

Cloud Tasks works similarly.

---

System creates:

```text
Future Job
```

---

Cloud Tasks stores:

```text
Execute Later
```

---

When time arrives:

```text
Automatically Run
```

---

# WHY NOT USE FRONTEND?

Bad approach:

```text
User Opens Website
        ↓
Browser Waits 24 Hours
        ↓
Send Reminder
```

Impossible.

---

User can:

```text
Close Browser
Close Laptop
Lose Internet
```

---

Reminder never arrives.

---

Backend must own scheduling.

---

# REMINDER WORKFLOW

When appointment created:

```text
Appointment Saved
        ↓
Calculate Reminder Time
        ↓
Create Scheduled Task
        ↓
Store Task Reference
        ↓
Wait
```

---

Nothing else happens.

---

System sleeps.

---

# VISUAL FLOW

```text
Appointment Created
         │
         ▼
Calculate Reminder Time
         │
         ▼
Create Cloud Task
         │
         ▼
Store Schedule
         │
         ▼
WAIT
         │
         ▼
Reminder Time Reached
         │
         ▼
Execute Reminder Function
```

---

# TASK CREATION SERVICE

Create:

```text
ReminderSchedulerService
```

Purpose:

```text
Create Future Jobs
```

---

Responsibilities:

```text
Calculate Reminder Time

Create Task

Track Task

Store Metadata
```

---

Nothing else.

---

# TASK DOCUMENT TRACKING

Firestore should store:

```json
{
 "taskCreated": true,
 "taskStatus": "scheduled"
}
```

---

Also:

```json
{
 "taskCreatedAt":"timestamp"
}
```

---

Also:

```json
{
 "taskExecutionTime":"2 PM"
}
```

---

Why?

Interview explanation:

```text
Every reminder is traceable.
```

---

# WAITING STATE

After scheduling:

```text
No CPU Usage
```

---

No:

```text
while(true)
```

---

No:

```text
continuous polling
```

---

No:

```text
checking every second
```

---

Cloud Tasks handles waiting.

Very efficient.

---

# REMINDER EXECUTION

At:

```text
2 PM
```

Cloud Tasks triggers:

```text
Reminder Function
```

---

Function receives:

```json
{
 "appointmentId":"123"
}
```

---

Now workflow starts.

---

# REMINDER FUNCTION

Responsibilities:

```text
Load Appointment

Verify Status

Build Reminder Email

Send Reminder

Update Firestore

Create Logs
```

---

Nothing else.

---

# BEFORE SENDING

Safety Check.

---

Verify:

```text
Appointment Exists?
```

---

Verify:

```text
Reminder Already Sent?
```

---

Verify:

```text
Appointment Not Cancelled?
```

---

Verify:

```text
Email Exists?
```

---

If any fail:

```text
STOP
```

---

# DUPLICATE PROTECTION

Suppose:

Task executes twice.

---

Without protection:

```text
Reminder Sent

Reminder Sent Again
```

---

Bad.

---

Check:

```json
{
 "reminderSent": true
}
```

---

If:

```text
TRUE
```

Stop.

---

If:

```text
FALSE
```

Send.

---

This prevents duplicates.

---

# REMINDER EMAIL WORKFLOW

Reminder Function:

```text
Load Appointment
        ↓
Build Email
        ↓
Call Gmail API
        ↓
Email Delivered
```

---

Subject:

```text
Appointment Reminder
```

---

Body:

```text
Hello John,

Your appointment begins in one hour.

Appointment Time:
3:00 PM

Thank you.
```

---

# STATUS MANAGEMENT

Before reminder:

```text
reminder_pending
```

---

After reminder:

```text
reminder_sent
```

---

Visual:

```text
confirmation_sent
          ↓
reminder_pending
          ↓
reminder_sent
```

---

# FIRESTORE UPDATE

After successful send:

```json
{
 "reminderSent": true
}
```

---

Store:

```json
{
 "reminderSentAt":"timestamp"
}
```

---

Store:

```json
{
 "status":"reminder_sent"
}
```

---

Store:

```json
{
 "emailStatus":"sent"
}
```

---

Dashboard instantly updates.

---

# FAILURE HANDLING

Suppose:

```text
Gmail Timeout
```

---

Or:

```text
Internet Failure
```

---

Or:

```text
Invalid Email
```

---

Never crash.

---

Instead:

```text
Catch Error
```

---

Store:

```json
{
 "status":"reminder_failed"
}
```

---

Store:

```json
{
 "errorMessage":"gmail timeout"
}
```

---

Store:

```json
{
 "lastAttemptAt":"timestamp"
}
```

---

System survives.

---

# RETRY STRATEGY

Attempt:

```text
1
```

Fail.

---

Retry:

```text
2
```

Fail.

---

Retry:

```text
3
```

---

After max retries:

```text
Mark Failed
```

---

Store:

```json
{
 "retryCount":3
}
```

---

Very useful in production.

---

# LOGGING

Log:

```text
Task Created
```

---

Log:

```text
Task Executed
```

---

Log:

```text
Reminder Started
```

---

Log:

```text
Reminder Sent
```

---

Log:

```text
Reminder Failed
```

---

Example:

```json
{
 "event":"reminder_sent",
 "appointmentId":"123",
 "timestamp":"..."
}
```

---

# MONITORING

Track:

```text
Scheduled Reminders
```

---

Track:

```text
Pending Reminders
```

---

Track:

```text
Successful Reminders
```

---

Track:

```text
Failed Reminders
```

---

Track:

```text
Retry Count
```

---

This helps prove the bonus feature works.

---

# SERVICES CREATED IN PHASE 5

```text
ReminderSchedulerService
```

Creates future jobs.

---

```text
ReminderExecutionService
```

Runs at reminder time.

---

```text
ReminderValidationService
```

Checks safety conditions.

---

```text
ReminderStatusService
```

Updates Firestore.

---

```text
ReminderLogService
```

Stores logs.

---

```text
ReminderRetryService
```

Handles failures.

---

# FINAL PHASE 5 ARCHITECTURE

```text
Appointment Created
        │
        ▼
Reminder Scheduler Service
        │
        ▼
Calculate Reminder Time
        │
        ▼
Create Cloud Task
        │
        ▼
Cloud Tasks Waiting
        │
        ▼
Reminder Time Reached
        │
        ▼
Reminder Execution Service
        │
        ▼
Validation Service
        │
        ▼
Gmail API
        │
        ▼
Customer Inbox
        │
        ▼
Status Update Service
        │
        ▼
Firestore
        │
        ▼
Realtime Dashboard
```

# What You Achieve After Phase 5

By the end of Phase 5:

✅ Reminder time calculation works

✅ Future reminder scheduling works

✅ Cloud Tasks integration designed

✅ Automatic reminder execution works

✅ Reminder email delivery works

✅ Reminder status tracking works

✅ Retry strategy works

✅ Logging works

✅ Duplicate prevention works

✅ Bonus requirement is fully covered

At this point, the entire assignment workflow is complete:

```text
Form
 ↓
Firestore
 ↓
Confirmation Email
 ↓
Realtime Dashboard
 ↓
Scheduled Reminder
 ↓
Reminder Email
```

The remaining phases would mainly be **deployment, monitoring, testing, and interview/demo preparation**, not core functionality.
