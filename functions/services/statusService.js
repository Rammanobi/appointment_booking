const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Updates the status and tracking fields of an appointment.
 * @param {string} appointmentId 
 * @param {string} status The new status value
 * @param {Object} additionalFields Any additional fields to update
 */
async function updateAppointmentStatus(appointmentId, status, additionalFields = {}) {
  const db = getFirestore();
  const appointmentRef = db.collection("appointments").doc(appointmentId);

  const updatePayload = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
    ...additionalFields
  };

  console.log(`Updating appointment ${appointmentId} status to: ${status}`);
  await appointmentRef.update(updatePayload);
}

module.exports = {
  updateAppointmentStatus
};
