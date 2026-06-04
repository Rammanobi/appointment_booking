Perfect. Since Phase 1 was **Architecture & Backend Foundation**, then **Phase 2 should be Database Design & Firestore Data Layer Implementation**.

This phase is extremely important because everything else (emails, reminders, dashboard, status tracking) depends on the database structure.

---

# PHASE 2 PROMPT

## Firestore Database Layer Design & Implementation

Copy everything below into Antigravity.

You are a Senior Firebase Database Architect.

You are building Phase 2 of an Appointment Reminder System.

Phase 1 architecture is already completed.

Your task is to design and implement the complete Firestore Database Layer.

Do NOT create frontend code.

Do NOT create UI components.

Focus entirely on:

* Firestore structure
* Data models
* Collections
* Documents
* Validation
* Queries
* Realtime support
* Status tracking
* Reminder tracking
* Logging support

The system requirements are:

1. Users create appointments.
2. Appointments are stored in Firestore.
3. Confirmation emails are sent through Gmail API.
4. Reminder emails are sent 1 hour before appointment time.
5. Dashboard updates in realtime.
6. All message activity must be tracked.

---

SECTION 1
DATABASE DESIGN PRINCIPLES
--------------------------

Design Firestore according to:

* Simplicity
* Scalability
* Realtime Performance
* Easy Querying
* Minimal Cost
* Easy Debugging

Explain every design decision.

Explain why Firestore is selected instead of SQL.

Explain how Firestore realtime listeners help the dashboard.

---

SECTION 2
COLLECTION DESIGN
-----------------

Create the complete collection structure.

Required collection:

appointments

Explain:

Why collection exists.
What it stores.
How it is queried.
How it supports future growth.

---

SECTION 3
APPOINTMENT DOCUMENT MODEL
--------------------------

Design the complete appointment document schema.

Required fields:

appointmentId
customerName
email
appointmentTime
createdAt
updatedAt
status
confirmationSent
confirmationSentAt
reminderSent
reminderSentAt
emailStatus
errorMessage
reminderTime

For each field explain:

* Data Type
* Purpose
* Example Value
* How Backend Uses It
* How Dashboard Uses It

Example:

Field:
customerName

Type:
String

Purpose:
Stores customer name entered during appointment creation.

Backend Usage:
Used inside confirmation email template.

Dashboard Usage:
Displayed inside appointments table.

Repeat this explanation for every field.

---

SECTION 4
STATUS MANAGEMENT SYSTEM
------------------------

Design appointment lifecycle.

Status Flow:

created
↓
confirmation_pending
↓
confirmation_sent
↓
reminder_pending
↓
reminder_sent
↓
completed

Explain:

* Why each status exists.
* What triggers status change.
* Which backend service updates it.

Create state transition diagram.

---

SECTION 5
EMAIL TRACKING DESIGN
---------------------

Design email tracking fields.

Track:

pending
sent
failed

Requirements:

Store timestamps.

Store failure reasons.

Store retry information.

Store last attempt time.

Design additional fields if necessary.

Explain why every field exists.

---

SECTION 6
REMINDER TRACKING DESIGN
------------------------

Design reminder tracking model.

Requirements:

Store calculated reminder time.

Track reminder execution.

Track reminder failures.

Track retry count.

Track execution logs.

Create full schema.

Explain every field.

---

SECTION 7
ERROR MANAGEMENT DESIGN
-----------------------

Design Firestore error tracking.

Store:

Error Type
Error Message
Timestamp
Service Name

Explain:

Why this helps debugging.

How backend uses this data.

How dashboard can display failures.

---

SECTION 8
DATABASE VALIDATION RULES
-------------------------

Design validation rules.

Validate:

customerName

Rules:

* Required
* Minimum length

email

Rules:

* Required
* Valid email format

appointmentTime

Rules:

* Required
* Must be future date
* Cannot be past date

Explain all validation logic.

Explain where validation occurs.

Frontend validation.
Backend validation.
Database validation.

---

SECTION 9
FIRESTORE QUERIES
-----------------

Design all queries required.

Appointment Creation Query

Appointment Fetch Query

Dashboard Query

Today's Appointment Query

Pending Reminder Query

Failed Email Query

Explain:

Query purpose.
Query fields.
Expected output.

---

SECTION 10
REALTIME DASHBOARD SUPPORT
--------------------------

Design Firestore structure for realtime dashboard.

Requirements:

Dashboard must update instantly.

No page refresh.

Realtime listener support.

Explain:

How Firestore listeners work.

What events trigger updates.

How dashboard receives new data.

How updates appear instantly.

---

SECTION 11
DATABASE INDEXES
----------------

Design indexes for:

appointmentTime

status

reminderTime

emailStatus

Explain:

Why each index exists.

How it improves performance.

When Firestore uses the index.

---

SECTION 12
SCALABILITY DESIGN
------------------

Assume:

100 appointments/day

1,000 appointments/day

10,000 appointments/day

Explain:

Database growth.

Read/write patterns.

Firestore limitations.

Cost considerations.

Optimization strategy.

---

SECTION 13
DEPLOYMENT CHECKLIST
--------------------

Create complete checklist.

Firestore Enabled

Indexes Created

Security Rules Applied

Collections Created

Environment Ready

Realtime Enabled

Reminder Tracking Ready

Email Tracking Ready

Output must be extremely detailed.

Every field, collection, validation rule, query, and index must be explained thoroughly so another AI agent can implement the Firestore database layer without making architectural decisions on its own.

---

### What Phase 2 Should Produce

By the end of Phase 2 you should have:

✅ Complete Firestore schema

✅ Complete document structure

✅ Status lifecycle

✅ Reminder tracking model

✅ Email tracking model

✅ Error tracking model

✅ Validation rules

✅ Query design

✅ Realtime dashboard design

✅ Firestore indexes

✅ Scalability plan

After this is completed, Phase 3 will be **Cloud Functions Trigger Layer**, where we build the actual automation logic that reacts when a new appointment is created. That is where Gmail sending and reminder scheduling begin.
