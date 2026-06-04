const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { calculateReminderTime } = require("./reminderService");
const { writeAuditLog } = require("./logService");

/**
 * Schedules the delayed reminder email task.
 * @param {string} appointmentId 
 * @param {Object} appointmentData 
 */
async function scheduleReminderTask(appointmentId, appointmentData) {
  const db = getFirestore();
  const appointmentTime = appointmentData.appointmentTime;

  // Calculate the target reminder execution time (1 hour before scheduled time)
  const targetReminderTime = calculateReminderTime(appointmentTime);

  // Check if we are running locally in the Firebase Emulator
  const isEmulator = process.env.FUNCTIONS_EMULATOR === "true" || process.env.LOCAL_EMULATOR === "true";
  const testDelaySec = process.env.TEST_REMINDER_DELAY_SEC ? Number(process.env.TEST_REMINDER_DELAY_SEC) : null;

  if (isEmulator) {
    // Emulator mode: Simulating Cloud Tasks by writing to Firestore 'scheduled_tasks' queue
    let executionTime;
    let logMessage;

    if (testDelaySec) {
      // For developer testing: schedule task to execute after a short delay (e.g. 15 seconds)
      const executionDate = new Date(Date.now() + (testDelaySec * 1000));
      executionTime = Timestamp.fromDate(executionDate);
      logMessage = `Emulator Mode: Scheduled task queue simulation with testing offset of ${testDelaySec} seconds. Target: ${executionDate.toISOString()}`;
    } else {
      // Standard target time
      executionTime = targetReminderTime;
      logMessage = `Emulator Mode: Scheduled task queue simulation. Target: ${targetReminderTime.toDate().toISOString()}`;
    }

    const taskPayload = {
      appointmentId,
      executeAt: executionTime,
      status: "pending",
      createdAt: FieldValue.serverTimestamp()
    };

    console.log(`[SCHEDULER] [${appointmentId}]: ${logMessage}`);
    await db.collection("scheduled_tasks").doc(appointmentId).set(taskPayload);
    await writeAuditLog(appointmentId, "task_scheduled", logMessage, {
      executeAt: executionTime.toDate().toISOString(),
      mode: "emulator_simulation"
    });

    return { success: true, mode: "emulator", executeAt: executionTime };
  }

  // Production mode: Google Cloud Tasks API Integration
  try {
    const { CloudTasksClient } = require("@google-cloud/tasks");
    const tasksClient = new CloudTasksClient();

    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const location = process.env.LOCATION || "us-central1";
    const queueName = "reminder-queue";
    
    // Construct task queue path
    const queuePath = tasksClient.queuePath(projectId, location, queueName);
    
    // Target executor endpoint
    const functionUrl = process.env.REMINDER_CALLBACK_URL || `https://${location}-${projectId}.cloudfunctions.net/executeReminderCallback`;

    const payload = { appointmentId };
    const task = {
      httpRequest: {
        httpMethod: "POST",
        url: functionUrl,
        headers: {
          "Content-Type": "application/json"
        },
        body: Buffer.from(JSON.stringify(payload)).toString("base64")
      },
      scheduleTime: {
        seconds: targetReminderTime.seconds
      }
    };

    console.log(`[SCHEDULER] [${appointmentId}]: Creating live Cloud Task for target: ${targetReminderTime.toDate().toISOString()}`);
    
    const [response] = await tasksClient.createTask({
      parent: queuePath,
      task: task
    });

    const taskName = response.name;
    const logMessage = `Production Mode: Created Cloud Task successfully: ${taskName}`;
    
    await writeAuditLog(appointmentId, "task_scheduled", logMessage, {
      taskName,
      executeAt: targetReminderTime.toDate().toISOString(),
      mode: "google_cloud_tasks"
    });

    return { success: true, mode: "cloud_tasks", taskName, executeAt: targetReminderTime };

  } catch (error) {
    const errorMessage = error.message || "Failed to call Cloud Tasks client";
    console.error(`[SCHEDULER] [${appointmentId}] Live Cloud Task scheduling failed:`, error);
    
    // Fall back to emulator task writing as safety backup
    const backupDate = new Date(Date.now() + (30 * 1000)); // 30 seconds safety delay
    const backupTime = Timestamp.fromDate(backupDate);
    
    await db.collection("scheduled_tasks").doc(appointmentId).set({
      appointmentId,
      executeAt: backupTime,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      errorType: "cloud_tasks_fallback",
      errorDetails: errorMessage
    });

    await writeAuditLog(
      appointmentId,
      "task_schedule_fallback",
      `Google Cloud Tasks failed: ${errorMessage}. Falling back to Firestore-based scheduled queue backup in 30 seconds.`
    );

    return { success: true, mode: "fallback_simulation", executeAt: backupTime };
  }
}

module.exports = {
  scheduleReminderTask
};
