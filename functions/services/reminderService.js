const { Timestamp } = require("firebase-admin/firestore");

/**
 * Calculates the reminder execution timestamp (1 hour before appointmentTime).
 * @param {Object|string|Date} appointmentTime The scheduled appointment time.
 * @returns {Timestamp} The calculated reminder execution time as a Firestore Timestamp.
 */
function calculateReminderTime(appointmentTime) {
  let appointmentDate;
  if (appointmentTime && typeof appointmentTime.toDate === 'function') {
    appointmentDate = appointmentTime.toDate();
  } else {
    appointmentDate = new Date(appointmentTime);
  }

  // Subtract 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
  const reminderTimeMs = appointmentDate.getTime() - (60 * 60 * 1000);
  const reminderDate = new Date(reminderTimeMs);

  return Timestamp.fromDate(reminderDate);
}

module.exports = {
  calculateReminderTime
};
