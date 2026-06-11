const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { sendReminderWhatsApp } = require("./whatsappService");
const { updateAppointmentStatus } = require("./statusService");
const { writeAuditLog } = require("./logService");

/**
 * Validates, prepares, and triggers the reminder WhatsApp message sending.
 * @param {string} appointmentId The appointment ID to execute the reminder for.
 */
async function executeReminder(appointmentId) {
  const db = getFirestore();
  
  await writeAuditLog(appointmentId, "reminder_started", "Reminder execution trigger activated.");

  try {
    // 1. Fetch appointment details
    const appointmentDoc = await db.collection("appointments").doc(appointmentId).get();
    
    if (!appointmentDoc.exists) {
      await writeAuditLog(appointmentId, "reminder_abort", "Safety check failed: Appointment document no longer exists.");
      return { success: false, reason: "document_not_found" };
    }

    const appt = appointmentDoc.data();

    // 2. Safety Check: Status
    // If appointment is already completed, cancelled, or failed, stop
    if (appt.status === "completed" || appt.status === "cancelled" || appt.status === "failed") {
      await writeAuditLog(
        appointmentId,
        "reminder_abort",
        `Safety check failed: Appointment state is already final (${appt.status}).`
      );
      return { success: false, reason: `appointment_state_final_${appt.status}` };
    }

    // 3. Safety Check: Idempotency
    if (appt.reminderSent === true) {
      await writeAuditLog(
        appointmentId,
        "reminder_abort",
        "Safety check failed: Reminder already marked as sent."
      );
      return { success: false, reason: "reminder_already_sent" };
    }

    // 4. Update status to 'reminder_pending' while processing message
    await updateAppointmentStatus(appointmentId, "reminder_pending");
    await writeAuditLog(appointmentId, "status_transition", "Status updated to reminder_pending.");

    // 5. Send Reminder WhatsApp (Twilio or simulation)
    const whatsAppResult = await sendReminderWhatsApp(
      appointmentId,
      appt.phone,
      appt.customerName,
      appt.appointmentTime,
      appt.reminderMessage
    );

    if (whatsAppResult.reminderSent) {
      // 6. Update status to 'reminder_sent'
      await updateAppointmentStatus(appointmentId, "reminder_sent", {
        ...whatsAppResult
      });
      await writeAuditLog(appointmentId, "status_transition", "Status updated to reminder_sent.");

      // 7. Transition status to 'completed' (Final State)
      await updateAppointmentStatus(appointmentId, "completed");
      await writeAuditLog(
        appointmentId,
        "workflow_completed",
        "Reminder workflow completed successfully. Appointment marked as completed."
      );

      return { success: true };
    } else {
      // WhatsApp failed
      await updateAppointmentStatus(appointmentId, "failed", {
        ...whatsAppResult
      });
      await writeAuditLog(
        appointmentId,
        "reminder_failed",
        `Failed to deliver reminder WhatsApp: ${whatsAppResult.errorMessage}`
      );

      return { success: false, reason: "whatsapp_delivery_failed", error: whatsAppResult.errorMessage };
    }

  } catch (error) {
    const errorMessage = error.message || "Unknown execution error";
    console.error(`[EXECUTOR] [${appointmentId}] Error executing reminder:`, error);

    try {
      await updateAppointmentStatus(appointmentId, "failed", {
        errorMessage: `Reminder execution crash: ${errorMessage}`
      });
      await writeAuditLog(
        appointmentId,
        "reminder_crash",
        `Executor crashed during run: ${errorMessage}`,
        { stack: error.stack }
      );
    } catch (dbError) {
      console.error(`Double fault in reminder execution for ${appointmentId}:`, dbError);
    }

    return { success: false, reason: "crashed", error: errorMessage };
  }
}

module.exports = {
  executeReminder
};
