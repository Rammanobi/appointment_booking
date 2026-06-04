const { getGmailClient } = require("../utils/gmailClient");
const { getConfirmationEmail, getReminderEmail } = require("./templateService");
const { writeAuditLog } = require("./logService");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Encodes an email into a base64url raw MIME message.
 */
function makeRawMessage(to, from, subject, html, text) {
  const boundary = "__boundary_string__";
  const emailLines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    html,
    "",
    `--${boundary}--`
  ].join("\r\n");

  return Buffer.from(emailLines)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Runs a task with retry limits and exponential backoff.
 */
async function retryWithBackoff(fn, appointmentId, emailType, retries = 3, delay = 1000) {
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
        "email_attempt_failed",
        `Email attempt ${attempt} of ${retries} failed: ${errorMessage}`,
        { attempt, maxRetries: retries, error: errorMessage }
      );

      if (attempt === retries) {
        throw { originalError: error, attemptCount: attempt };
      }
      
      console.warn(`[RETRY] Email send attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

/**
 * Sends a confirmation email.
 * @param {string} appointmentId 
 * @param {string} email 
 * @param {string} customerName 
 * @param {Object} appointmentTime 
 * @returns {Promise<Object>} The update data payload to write to Firestore.
 */
async function sendConfirmationEmail(appointmentId, email, customerName, appointmentTime, customMessage) {
  const { gmail, isMock, senderEmail } = getGmailClient();
  const { subject, html, text } = getConfirmationEmail(customerName, appointmentTime, customMessage);

  if (isMock) {
    await writeAuditLog(
      appointmentId,
      "email_simulation",
      `SIMULATING confirmation email sending to: ${email}`,
      { to: email, from: senderEmail, subject }
    );
    
    return {
      confirmationSent: true,
      confirmationSentAt: FieldValue.serverTimestamp(),
      emailStatus: "sent",
      retryCount: 1,
      errorMessage: ""
    };
  }

  // Live Gmail send with Retries
  await writeAuditLog(appointmentId, "email_sending", `Sending confirmation email to ${email} via Gmail API.`);
  
  const sendFn = async () => {
    const raw = makeRawMessage(email, senderEmail, subject, html, text);
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw }
    });
    return res.data;
  };

  try {
    const result = await retryWithBackoff(sendFn, appointmentId, "confirmation", 3, 1000);
    await writeAuditLog(appointmentId, "email_sent_success", `Email sent successfully. Message ID: ${result.data.id}`);
    
    return {
      confirmationSent: true,
      confirmationSentAt: FieldValue.serverTimestamp(),
      emailStatus: "sent",
      retryCount: result.attemptCount,
      errorMessage: ""
    };
  } catch (errorObj) {
    const error = errorObj.originalError || errorObj;
    const attemptCount = errorObj.attemptCount || 3;
    const errorMessage = error.message || "Failed after maximum retries";
    await writeAuditLog(
      appointmentId,
      "email_max_retries_reached",
      `Failed to send email after max retries: ${errorMessage}`
    );
    
    return {
      confirmationSent: false,
      emailStatus: "failed",
      retryCount: attemptCount,
      errorMessage: `Gmail API error: ${errorMessage}`
    };
  }
}

/**
 * Sends a reminder email (to support Phase 5).
 * @param {string} appointmentId 
 * @param {string} email 
 * @param {string} customerName 
 * @param {Object} appointmentTime 
 * @returns {Promise<Object>} The update data payload to write to Firestore.
 */
async function sendReminderEmail(appointmentId, email, customerName, appointmentTime, customMessage) {
  const { gmail, isMock, senderEmail } = getGmailClient();
  const { subject, html, text } = getReminderEmail(customerName, appointmentTime, customMessage);

  if (isMock) {
    await writeAuditLog(
      appointmentId,
      "email_simulation",
      `SIMULATING reminder email sending to: ${email}`,
      { to: email, from: senderEmail, subject }
    );
    
    return {
      reminderSent: true,
      reminderSentAt: FieldValue.serverTimestamp(),
      emailStatus: "sent",
      retryCount: 1,
      errorMessage: ""
    };
  }

  await writeAuditLog(appointmentId, "email_sending", `Sending reminder email to ${email} via Gmail API.`);

  const sendFn = async () => {
    const raw = makeRawMessage(email, senderEmail, subject, html, text);
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw }
    });
    return res.data;
  };

  try {
    const result = await retryWithBackoff(sendFn, appointmentId, "reminder", 3, 1000);
    await writeAuditLog(appointmentId, "email_sent_success", `Reminder email sent successfully. Message ID: ${result.data.id}`);
    
    return {
      reminderSent: true,
      reminderSentAt: FieldValue.serverTimestamp(),
      emailStatus: "sent",
      retryCount: result.attemptCount,
      errorMessage: ""
    };
  } catch (errorObj) {
    const error = errorObj.originalError || errorObj;
    const attemptCount = errorObj.attemptCount || 3;
    const errorMessage = error.message || "Failed after maximum retries";
    await writeAuditLog(
      appointmentId,
      "email_max_retries_reached",
      `Failed to send reminder email after max retries: ${errorMessage}`
    );
    
    return {
      reminderSent: false,
      emailStatus: "failed",
      retryCount: attemptCount,
      errorMessage: `Gmail API error: ${errorMessage}`
    };
  }
}

module.exports = {
  sendConfirmationEmail,
  sendReminderEmail
};
