require('dotenv').config();
const twilio = require('twilio');

async function checkStatus() {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    const message = await client.messages('SMef12518ab1dc6d4dd75d4464945ceb7f').fetch();
    console.log("Message Status:", message.status);
    console.log("Error Code:", message.errorCode);
    console.log("Error Message:", message.errorMessage);
  } catch (e) {
    console.error(e);
  }
}
checkStatus();
