const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { executeReminder } = require("./reminderExecutionService");

/**
 * Handles processing of a scheduled task document in emulator mode.
 * Uses event-driven setTimeout triggers to run the execution at the exact target time.
 * @param {string} taskId 
 * @param {Object} taskData 
 */
async function handleTaskScheduled(taskId, taskData) {
  const db = getFirestore();
  const { appointmentId, executeAt, status } = taskData;

  if (status !== "pending") {
    return;
  }

  const executeTime = executeAt.toDate ? executeAt.toDate() : new Date(executeAt);
  const delayMs = executeTime.getTime() - Date.now();

  console.log(`[QUEUE EMULATOR] [${appointmentId}] Detected pending scheduled task. Target time: ${executeTime.toISOString()}`);

  const runTask = async () => {
    try {
      // Re-fetch document to ensure it wasn't cancelled or processed in a separate trigger
      const taskDoc = await db.collection("scheduled_tasks").doc(appointmentId).get();
      
      if (!taskDoc.exists || taskDoc.data().status !== "pending") {
        console.log(`[QUEUE EMULATOR] [${appointmentId}] Task is no longer pending. Skipping execution.`);
        return;
      }

      // Transition task state to 'processing'
      await db.collection("scheduled_tasks").doc(appointmentId).update({
        status: "processing",
        startedAt: FieldValue.serverTimestamp()
      });

      console.log(`[QUEUE EMULATOR] [${appointmentId}] Starting delayed executor trigger...`);
      const result = await executeReminder(appointmentId);

      const finalStatus = result.success ? "completed" : "failed";
      
      // Update task record state
      await db.collection("scheduled_tasks").doc(appointmentId).update({
        status: finalStatus,
        finishedAt: FieldValue.serverTimestamp(),
        error: result.error || null
      });

      console.log(`[QUEUE EMULATOR] [${appointmentId}] Task finished with status: ${finalStatus}`);
    } catch (error) {
      console.error(`[QUEUE EMULATOR] [${appointmentId}] Error executing task:`, error);
      
      try {
        await db.collection("scheduled_tasks").doc(appointmentId).update({
          status: "failed",
          finishedAt: FieldValue.serverTimestamp(),
          error: error.message || "Unknown execution error"
        });
      } catch (dbErr) {
        console.error("Double fault in task executor recovery:", dbErr);
      }
    }
  };

  if (delayMs <= 0) {
    console.log(`[QUEUE EMULATOR] [${appointmentId}] Target time is in the past. Executing task immediately.`);
    await runTask();
  } else {
    const delaySec = (delayMs / 1000).toFixed(1);
    console.log(`[QUEUE EMULATOR] [${appointmentId}] Target time is in the future. Initializing execution timer: ${delaySec} seconds...`);
    
    // Set in-memory execution timer
    setTimeout(runTask, delayMs);
  }
}

module.exports = {
  handleTaskScheduled
};
