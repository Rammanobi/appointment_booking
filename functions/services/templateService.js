/**
 * Formats a Date/Timestamp into a beautiful, human-readable string.
 * @param {Object|string|Date} appointmentTime 
 * @returns {string} e.g. "Wednesday, June 10, 2026 at 10:00 AM"
 */
function formatDateTime(appointmentTime) {
  if (!appointmentTime) return "";
  
  let date;
  if (typeof appointmentTime.toDate === 'function') {
    date = appointmentTime.toDate();
  } else {
    date = new Date(appointmentTime);
  }

  if (isNaN(date.getTime())) return "";

  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeString = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return `${dateString} at ${timeString}`;
}

/**
 * Builds HTML wrapper aligned with Monochrome Precision brand tokens.
 * @param {string} title 
 * @param {string} contentHtml 
 * @returns {string} Complete HTML document.
 */
function monochromeWrapper(title, contentHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background-color: #f9f9f9;
      color: #1a1c1c;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }
    .header {
      border-bottom: 1px solid #eeeeee;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header h2 {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: #000000;
      letter-spacing: -0.01em;
    }
    .content {
      font-size: 14px;
      line-height: 22px;
      color: #444748;
    }
    .footer {
      border-top: 1px solid #eeeeee;
      padding-top: 20px;
      margin-top: 28px;
      text-align: center;
      font-size: 11px;
      color: #747878;
      font-weight: 500;
    }
    .highlight-box {
      background-color: #f4f3f3;
      border-left: 3px solid #000000;
      padding: 16px;
      margin: 20px 0;
      font-family: monospace;
      font-size: 13px;
      border-radius: 4px;
      color: #1a1c1c;
    }
  </style>
</head>
<body>
  <div class="container">
    ${contentHtml}
  </div>
</body>
</html>
  `;
}

/**
 * Builds the confirmation email subject and body.
 * @param {string} customerName 
 * @param {Object} appointmentTime 
 * @returns {Object} { subject, html, text }
 */
function getConfirmationEmail(customerName, appointmentTime, customMessage) {
  const formattedTime = formatDateTime(appointmentTime);
  const subject = "Appointment Confirmed";
  const messageBody = customMessage || "Your appointment has been successfully scheduled and confirmed.";
  
  const content = `
    <div class="header">
      <h2>Appointment Confirmed</h2>
    </div>
    <div class="content">
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>${messageBody} Here are your booking details:</p>
      <div class="highlight-box">
        <strong>Scheduled Time:</strong><br/>
        ${formattedTime}
      </div>
      <p>If you need to reschedule or cancel your appointment, please contact us directly.</p>
      <p>Thank you,</p>
      <p><strong>Appointment Manager</strong></p>
    </div>
    <div class="footer">
      This is an automated notification. Please do not reply directly to this email.
    </div>
  `;

  const text = `Hello ${customerName},\n\n${messageBody}\n\nAppointment Time:\n${formattedTime}\n\nThank you.`;

  return {
    subject,
    html: monochromeWrapper(subject, content),
    text
  };
}

/**
 * Builds the reminder email subject and body.
 * @param {string} customerName 
 * @param {Object} appointmentTime 
 * @returns {Object} { subject, html, text }
 */
function getReminderEmail(customerName, appointmentTime, customMessage) {
  const formattedTime = formatDateTime(appointmentTime);
  const subject = "Appointment Reminder";
  const messageBody = customMessage || "This is a friendly reminder that your upcoming appointment is scheduled to start in 1 hour.";

  const content = `
    <div class="header">
      <h2>Appointment Reminder</h2>
    </div>
    <div class="content">
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>${messageBody}</p>
      <div class="highlight-box">
        <strong>Scheduled Time:</strong><br/>
        ${formattedTime}
      </div>
      <p>Please make sure to arrive on time. We look forward to seeing you.</p>
      <p>Thank you,</p>
      <p><strong>Appointment Manager</strong></p>
    </div>
    <div class="footer">
      This is an automated notification. Please do not reply directly to this email.
    </div>
  `;

  const text = `Hello ${customerName},\n\n${messageBody}\n\nAppointment Time:\n${formattedTime}\n\nThank you.`;

  return {
    subject,
    html: monochromeWrapper(subject, content),
    text
  };
}

module.exports = {
  getConfirmationEmail,
  getReminderEmail
};
