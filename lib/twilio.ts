import twilio from "twilio";

// Server-side Twilio client for SMS notifications.
export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;
