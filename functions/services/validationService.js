/**
 * Validates the appointment schema.
 * @param {Object} data The appointment document data.
 * @returns {Object} { isValid: boolean, error: string|null }
 */
function validateAppointment(data) {
  if (!data) {
    return { isValid: false, error: "No data provided" };
  }

  // Validate customerName
  if (!data.customerName || typeof data.customerName !== 'string' || data.customerName.trim().length < 2) {
    return { 
      isValid: false, 
      error: "customerName is required and must be at least 2 characters long" 
    };
  }

  // Validate phone (E.164 international format)
  if (!data.phone || typeof data.phone !== 'string') {
    return { isValid: false, error: "phone is required" };
  }
  const phoneRegex = /^\+[1-9]\d{6,14}$/;
  if (!phoneRegex.test(data.phone)) {
    return { isValid: false, error: "phone format is invalid. Use international format like +918520845152" };
  }

  // Validate appointmentTime
  if (!data.appointmentTime) {
    return { isValid: false, error: "appointmentTime is required" };
  }

  // Parse appointmentTime to a date
  let appointmentDate;
  if (data.appointmentTime.toDate && typeof data.appointmentTime.toDate === 'function') {
    appointmentDate = data.appointmentTime.toDate();
  } else {
    appointmentDate = new Date(data.appointmentTime);
  }

  if (isNaN(appointmentDate.getTime())) {
    return { isValid: false, error: "appointmentTime is an invalid date" };
  }

  // Date must be in the future
  if (appointmentDate.getTime() <= Date.now()) {
    return { isValid: false, error: "appointmentTime must be a future date" };
  }

  return { isValid: true, error: null };
}

module.exports = {
  validateAppointment
};
