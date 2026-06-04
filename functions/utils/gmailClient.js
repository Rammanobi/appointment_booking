const { google } = require("googleapis");

/**
 * Checks if the configured environment variables are mock placeholders.
 * @returns {boolean}
 */
function isConfiguredWithPlaceholders() {
  const vars = [
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REFRESH_TOKEN,
    process.env.GMAIL_SENDER_EMAIL
  ];

  return vars.some(v => 
    !v || 
    v.includes("REPLACE_WITH") || 
    v.includes("your_") || 
    v.trim() === ""
  );
}

/**
 * Initializes and returns the Gmail API client or marks it as mock mode.
 * @returns {Object} { gmail, isMock: boolean, senderEmail: string }
 */
function getGmailClient() {
  const senderEmail = process.env.GMAIL_SENDER_EMAIL || "simulated-sender@example.com";
  
  if (isConfiguredWithPlaceholders()) {
    console.warn("Gmail API client initialized in SIMULATION/MOCK mode due to missing/placeholder credentials.");
    return {
      gmail: null,
      isMock: true,
      senderEmail
    };
  }

  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const gmail = google.gmail({
      version: "v1",
      auth: oAuth2Client
    });

    return {
      gmail,
      isMock: false,
      senderEmail
    };
  } catch (error) {
    console.error("Failed to initialize Gmail API client, falling back to mock mode:", error);
    return {
      gmail: null,
      isMock: true,
      senderEmail
    };
  }
}

module.exports = {
  getGmailClient
};
