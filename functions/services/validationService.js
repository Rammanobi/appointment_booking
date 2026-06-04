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

  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    return { isValid: false, error: "email is required" };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    return { isValid: false, error: "email format is invalid" };
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
