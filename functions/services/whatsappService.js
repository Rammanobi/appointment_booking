const { writeAuditLog } = require("./logService");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Formats a Date/Timestamp into a human-readable string.
 * @param {Object|string|Date} appointmentTime
 * @returns {string} e.g. "Wednesday, June 10, 2026 at 10:00 AM"
 */
function formatDateTime(appointmentTime) {
  if (!appointmentTime) return "";

  let date;
  if (typeof appointmentTime.toDate === "function") {
    date = appointmentTime.toDate();
  } else {
    date = new Date(appointmentTime);
  }

  if (isNaN(date.getTime())) return "";

  const dateString = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const timeString = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return `${dateString} at ${timeString}`;
}

/**
 * Checks if the Twilio environment variables are mock placeholders.
 * @returns {boolean}
 */
function isConfiguredWithPlaceholders() {
  const vars = [
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    process.env.TWILIO_WHATSAPP_NUMBER
  ];

  return vars.some(v =>
    !v ||
    v.includes("REPLACE_WITH") ||
    v.includes("your_") ||
    v.trim() === ""
  );
}

/**
 * Initializes and returns the Twilio client or marks it as mock mode.
 * @returns {Object} { client, isMock: boolean, fromNumber: string }
 */
function getTwilioClient() {
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";

  if (isConfiguredWithPlaceholders()) {
    console.warn("Twilio client initialized in SIMULATION/MOCK mode due to missing/placeholder credentials.");
    return {
      client: null,
      isMock: true,
      fromNumber
    };
  }

  try {
    const twilio = require("twilio");
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    return {
      client,
      isMock: false,
      fromNumber
    };
  } catch (error) {
    console.error("Failed to initialize Twilio client, falling back to mock mode:", error);
    return {
      client: null,
      isMock: true,
      fromNumber
    };
  }
}

/**
 * Runs a task with retry limits and exponential backoff.
 */
async function retryWithBackoff(fn, appointmentId, messageType, retries = 3, delay = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    attempt++;
    try {
      const data = await fn();
      return { data, attemptCount: attempt };
    } catch (error) {
      const errorMessage = error.message || "Unknown error";
      await writeAuditLog(
        appointmentId,
        "whatsapp_attempt_failed",
        `WhatsApp attempt ${attempt} of ${retries} failed: ${errorMessage}`,
        { attempt, maxRetries: retries, error: errorMessage }
      );

      if (attempt === retries) {
        throw { originalError: error, attemptCount: attempt };
      }

      console.warn(`[RETRY] WhatsApp send attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

/**
 * Sends a confirmation WhatsApp message.
 * @param {string} appointmentId
 * @param {string} phone
 * @param {string} customerName
 * @param {Object} appointmentTime
 * @param {string} customMessage
 * @returns {Promise<Object>} The update data payload to write to Firestore.
 */
async function sendConfirmationWhatsApp(appointmentId, phone, customerName, appointmentTime, customMessage) {
  const { client, isMock, fromNumber } = getTwilioClient();
  const formattedTime = formatDateTime(appointmentTime);
  const messageBody = customMessage || "Your appointment has been successfully scheduled and confirmed.";

  const body = `✅ *Appointment Confirmed*\n\nHello *${customerName}*,\n\n${messageBody}\n\n📅 *Scheduled Time:*\n${formattedTime}\n\nIf you need to reschedule or cancel, please contact us directly.\n\n— Appointment Manager`;

  if (isMock) {
    await writeAuditLog(
      appointmentId,
      "whatsapp_simulation",
      `SIMULATING confirmation WhatsApp to: ${phone}`,
      { to: phone, from: fromNumber }
    );

    return {
      confirmationSent: true,
      confirmationSentAt: FieldValue.serverTimestamp(),
      whatsappStatus: "sent",
      retryCount: 1,
      errorMessage: ""
    };
  }

  await writeAuditLog(appointmentId, "whatsapp_sending", `Sending confirmation WhatsApp to ${phone} via Twilio.`);

  const sendFn = async () => {
    const msg = await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${phone}`,
      body: body
    });
    return msg;
  };

  try {
    const result = await retryWithBackoff(sendFn, appointmentId, "confirmation", 3, 1000);
    await writeAuditLog(appointmentId, "whatsapp_sent_success", `WhatsApp sent successfully. SID: ${result.data.sid}`);

    return {
      confirmationSent: true,
      confirmationSentAt: FieldValue.serverTimestamp(),
      whatsappStatus: "sent",
      retryCount: result.attemptCount,
      errorMessage: ""
    };
  } catch (errorObj) {
    const error = errorObj.originalError || errorObj;
    const attemptCount = errorObj.attemptCount || 3;
    const errorMessage = error.message || "Failed after maximum retries";
    await writeAuditLog(
      appointmentId,
      "whatsapp_max_retries_reached",
      `Failed to send WhatsApp after max retries: ${errorMessage}`
    );

    return {
      confirmationSent: false,
      whatsappStatus: "failed",
      retryCount: attemptCount,
      errorMessage: `Twilio API error: ${errorMessage}`
    };
  }
}

/**
 * Sends a reminder WhatsApp message.
 * @param {string} appointmentId
 * @param {string} phone
 * @param {string} customerName
 * @param {Object} appointmentTime
 * @param {string} customMessage
 * @returns {Promise<Object>} The update data payload to write to Firestore.
 */
async function sendReminderWhatsApp(appointmentId, phone, customerName, appointmentTime, customMessage) {
  const { client, isMock, fromNumber } = getTwilioClient();
  const formattedTime = formatDateTime(appointmentTime);
  const messageBody = customMessage || "This is a friendly reminder that your upcoming appointment is scheduled to start in 1 hour.";

  const body = `⏰ *Appointment Reminder*\n\nHello *${customerName}*,\n\n${messageBody}\n\n📅 *Scheduled Time:*\n${formattedTime}\n\nPlease make sure to arrive on time. We look forward to seeing you.\n\n— Appointment Manager`;

  if (isMock) {
    await writeAuditLog(
      appointmentId,
      "whatsapp_simulation",
      `SIMULATING reminder WhatsApp to: ${phone}`,
      { to: phone, from: fromNumber }
    );

    return {
      reminderSent: true,
      reminderSentAt: FieldValue.serverTimestamp(),
      whatsappStatus: "sent",
      retryCount: 1,
      errorMessage: ""
    };
  }

  await writeAuditLog(appointmentId, "whatsapp_sending", `Sending reminder WhatsApp to ${phone} via Twilio.`);

  const sendFn = async () => {
    const msg = await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${phone}`,
      body: body
    });
    return msg;
  };

  try {
    const result = await retryWithBackoff(sendFn, appointmentId, "reminder", 3, 1000);
    await writeAuditLog(appointmentId, "whatsapp_sent_success", `Reminder WhatsApp sent successfully. SID: ${result.data.sid}`);

    return {
      reminderSent: true,
      reminderSentAt: FieldValue.serverTimestamp(),
      whatsappStatus: "sent",
      retryCount: result.attemptCount,
      errorMessage: ""
    };
  } catch (errorObj) {
    const error = errorObj.originalError || errorObj;
    const attemptCount = errorObj.attemptCount || 3;
    const errorMessage = error.message || "Failed after maximum retries";
    await writeAuditLog(
      appointmentId,
      "whatsapp_max_retries_reached",
      `Failed to send reminder WhatsApp after max retries: ${errorMessage}`
    );

    return {
      reminderSent: false,
      whatsappStatus: "failed",
      retryCount: attemptCount,
      errorMessage: `Twilio API error: ${errorMessage}`
    };
  }
}

module.exports = {
  sendConfirmationWhatsApp,
  sendReminderWhatsApp
};
