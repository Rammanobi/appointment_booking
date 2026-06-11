require('dotenv').config();
const twilio = require('twilio');

async function testTwilio() {
  console.log("Loading credentials from .env:");
  console.log("Account SID:", process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.substring(0, 5) + "..." : "MISSING");
  console.log("Auth Token length:", process.env.TWILIO_AUTH_TOKEN ? process.env.TWILIO_AUTH_TOKEN.length : 0);
  console.log("From Number:", process.env.TWILIO_WHATSAPP_NUMBER);
  
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.includes("REPLACE_WITH")) {
    console.error("ERROR: The .env file still has placeholder credentials!");
    return;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const toPhone = "+918520845152";
    const fromPhone = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
    
    console.log(`\nAttempting to send WhatsApp from whatsapp:${fromPhone} to whatsapp:${toPhone}...`);
    
    const msg = await client.messages.create({
      from: `whatsapp:${fromPhone}`,
      to: `whatsapp:${toPhone}`,
      body: "Test message from debugging script!"
    });
    
    console.log("✅ SUCCESS!");
    console.log("Message SID:", msg.sid);
    console.log("Message Status:", msg.status);
    console.log("Error Code:", msg.errorCode);
    console.log("Error Message:", msg.errorMessage);
  } catch (error) {
    console.error("❌ FAILED!");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("Full Error:", error);
  }
}

testTwilio();
