const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Writes an audit log entry under the appointment's logs subcollection.
 * @param {string} appointmentId The appointment ID.
 * @param {string} eventType The type of audit event (e.g. 'trigger_started', 'validation_passed', etc.)
 * @param {string} message Description of the event.
 * @param {Object} details Additional diagnostic metadata.
 */
async function writeAuditLog(appointmentId, eventType, message, details = {}) {
  try {
    const db = getFirestore();
    const logRef = db.collection("appointments")
      .doc(appointmentId)
      .collection("logs")
      .doc();

    const logPayload = {
      eventType,
      message,
      details,
      timestamp: FieldValue.serverTimestamp()
    };

    console.log(`[AUDIT LOG] [${appointmentId}] [${eventType.toUpperCase()}]: ${message}`, JSON.stringify(details));
    await logRef.set(logPayload);
  } catch (error) {
    console.error(`Failed to write audit log for appointment ${appointmentId}:`, error);
  }
}

module.exports = {
  writeAuditLog
};
