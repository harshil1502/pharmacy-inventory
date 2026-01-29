import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+14702768533';

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local');
  }
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

/**
 * Send an SMS via Twilio
 */
export async function sendSMS(to: string, body: string) {
  // Ensure phone number has country code (default to +1 for Canada/US)
  const formattedTo = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

  const twilioClient = getClient();
  const message = await twilioClient.messages.create({
    body,
    to: formattedTo,
    from: fromNumber,
  });

  console.log(`[Twilio] SMS sent to ${formattedTo}: SID ${message.sid}`);
  return message;
}
