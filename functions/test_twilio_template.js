require('dotenv').config();
const twilio = require('twilio');

async function testTwilio() {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const toPhone = "+918520845152";
  const fromPhone = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
  
  try {
    const msg = await client.messages.create({
      from: `whatsapp:${fromPhone}`,
      to: `whatsapp:${toPhone}`,
      // MUST match Twilio Sandbox template exactly!
      body: "Your appointment is coming up on July 21 at 3PM" 
    });
    console.log("Template Message SID:", msg.sid);
  } catch (error) {
    console.error("Template failed:", error);
  }
}

testTwilio();
