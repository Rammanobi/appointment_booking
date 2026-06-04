const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

const { handleAppointmentCreated } = require("./services/orchestratorService");
const { executeReminder } = require("./services/reminderExecutionService");
const { handleTaskScheduled } = require("./services/queueProcessor");

// 1. Core trigger: watches new appointments to initialize validation & confirmation email flows
exports.onAppointmentCreated = onDocumentCreated({
  document: "appointments/{appointmentId}",
  region: "us-central1"
}, async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  
  const appointmentId = event.params.appointmentId;
  const appointmentData = snapshot.data();
  
  console.log(`Processing new appointment trigger for ID: ${appointmentId}`);
  
  try {
    await handleAppointmentCreated(appointmentId, appointmentData);
    console.log(`Successfully completed automation workflow for appointment ID: ${appointmentId}`);
  } catch (error) {
    console.error(`Automation workflow failed for appointment ID: ${appointmentId}`, error);
  }
});

// 2. Production HTTP trigger: Target callback for Google Cloud Tasks API execution
exports.executeReminderCallback = onRequest({ 
  region: "us-central1",
  cors: true 
}, async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      res.status(400).send("Missing appointmentId parameter.");
      return;
    }
    
    console.log(`[HTTP CALLBACK] Received Cloud Task trigger for appointment: ${appointmentId}`);
    const result = await executeReminder(appointmentId);
    
    if (result.success) {
      res.status(200).send("Reminder execution completed successfully.");
    } else {
      res.status(500).send(`Reminder execution failed: ${result.reason}`);
    }
  } catch (error) {
    console.error("[HTTP CALLBACK] Error in reminder callback:", error);
    res.status(500).send("Internal server error during reminder execution.");
  }
});

// 3. Local Emulator task listener: Watch scheduled_tasks to simulate Cloud Tasks delays
exports.onScheduledTaskCreated = onDocumentCreated({
  document: "scheduled_tasks/{taskId}",
  region: "us-central1"
}, async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  
  const taskId = event.params.taskId;
  const taskData = snapshot.data();
  
  await handleTaskScheduled(taskId, taskData);
});

