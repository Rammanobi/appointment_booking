const { getFirestore } = require("firebase-admin/firestore");
const { validateAppointment } = require("./validationService");
const { updateAppointmentStatus } = require("./statusService");
const { calculateReminderTime } = require("./reminderService");
const { writeAuditLog } = require("./logService");
const { sendConfirmationEmail } = require("./emailService");
const { scheduleReminderTask } = require("./reminderSchedulerService");

/**
 * Orchestrates the automation engine workflow when a new appointment is created.
 * @param {string} appointmentId 
 * @param {Object} appointmentData 
 */
async function handleAppointmentCreated(appointmentId, appointmentData) {
  // 1. Audit trace - Trigger started
  await writeAuditLog(appointmentId, "trigger_started", "Cloud Function Firestore trigger activated.");

  try {
    // 2. Idempotency Check
    // If the status is not 'created', it means the orchestrator has already started or completed processing
    if (appointmentData.status && appointmentData.status !== "created") {
      await writeAuditLog(
        appointmentId,
        "idempotency_halt",
        `Prevented duplicate processing. Appointment is already in state: ${appointmentData.status}`
      );
      return;
    }

    // 3. Duplicate booking window prevention (2-minute window)
    const db = getFirestore();
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const duplicatesSnapshot = await db.collection("appointments")
      .where("email", "==", appointmentData.email)
      .where("appointmentTime", "==", appointmentData.appointmentTime)
      .where("createdAt", ">=", twoMinutesAgo)
      .get();

    let isDuplicate = false;
    duplicatesSnapshot.forEach((doc) => {
      if (doc.id !== appointmentId) {
        isDuplicate = true;
      }
    });

    if (isDuplicate) {
      await updateAppointmentStatus(appointmentId, "failed", {
        errorMessage: "Duplicate appointment submission detected within 2-minute window.",
        emailStatus: "failed"
      });
      await writeAuditLog(
        appointmentId,
        "validation_failed",
        "Duplicate appointment request rejected to prevent multiple notifications."
      );
      return;
    }

    // 3. Update status to 'confirmation_pending'
    await updateAppointmentStatus(appointmentId, "confirmation_pending");
    await writeAuditLog(appointmentId, "status_transition", "Status updated to confirmation_pending.");

    // 4. Server-side validation
    const validation = validateAppointment(appointmentData);
    if (!validation.isValid) {
      await updateAppointmentStatus(appointmentId, "failed", {
        errorMessage: validation.error,
        emailStatus: "failed"
      });
      await writeAuditLog(appointmentId, "validation_failed", `Validation check failed: ${validation.error}`);
      return;
    }
    await writeAuditLog(appointmentId, "validation_passed", "Validation check passed successfully.");

    // 5. Calculate reminder time (1 hour before scheduled time)
    const reminderTime = calculateReminderTime(appointmentData.appointmentTime);
    await writeAuditLog(
      appointmentId,
      "reminder_calculated",
      "Calculated reminder execution target time (1 hour before appointment).",
      { reminderTime: reminderTime.toDate().toISOString() }
    );

    // 6. Trigger confirmation email sending via Gmail API (or simulation)
    const emailResult = await sendConfirmationEmail(
      appointmentId,
      appointmentData.email,
      appointmentData.customerName,
      appointmentData.appointmentTime,
      appointmentData.confirmationMessage
    );

    const nextStatus = emailResult.emailStatus === "sent" ? "confirmation_sent" : "failed";

    // 7. Update status to 'confirmation_sent' and store calculations
    await updateAppointmentStatus(appointmentId, nextStatus, {
      reminderTime: reminderTime,
      ...emailResult
    });

    if (nextStatus === "confirmation_sent") {
      await writeAuditLog(
        appointmentId,
        "confirmation_sent_log",
        "Confirmation email sent successfully. Proceeding to schedule reminder task..."
      );

      // 8. Schedule the reminder task
      const scheduleResult = await scheduleReminderTask(appointmentId, {
        ...appointmentData,
        reminderTime
      });

      if (scheduleResult.success) {
        // Move to reminder_pending status
        await updateAppointmentStatus(appointmentId, "reminder_pending");
        await writeAuditLog(
          appointmentId,
          "status_transition",
          "Status updated to reminder_pending. Awaiting reminder execution time."
        );
      } else {
        await updateAppointmentStatus(appointmentId, "failed", {
          errorMessage: "Failed to schedule reminder task: " + (scheduleResult.error || "unknown error")
        });
      }
    } else {
      await writeAuditLog(
        appointmentId,
        "workflow_failed",
        `Phase 4 workflow failed: ${emailResult.errorMessage || "Email sending failed"}`
      );
    }

  } catch (error) {
    console.error(`Error in handleAppointmentCreated for appointment ${appointmentId}:`, error);
    
    // Failure Recovery
    try {
      await updateAppointmentStatus(appointmentId, "failed", {
        errorMessage: error.message || "Unknown error inside orchestrator",
        emailStatus: "failed"
      });
      await writeAuditLog(
        appointmentId,
        "workflow_crash",
        `Automation execution crashed: ${error.message}`,
        { stack: error.stack }
      );
    } catch (dbError) {
      console.error(`Double fault: failed to record crash details in Firestore for ${appointmentId}:`, dbError);
    }
  }
}

module.exports = {
  handleAppointmentCreated
};

