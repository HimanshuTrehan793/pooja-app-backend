// src/services/sms.service.ts

import { Twilio } from "twilio";
import { getEnvVar } from "../utils/getEnvVar";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { ApiError } from "../utils/apiError";

const accountSid = getEnvVar("TWILIO_ACCOUNT_SID");
const authToken = getEnvVar("TWILIO_AUTH_TOKEN");
const twilioNumber = getEnvVar("TWILIO_PHONE_NUMBER");

const client = new Twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string): Promise<string> {
  try {
    const response = await client.messages.create({
      from: twilioNumber,
      to,
      body: message,
    });

    return response.sid;
  } catch (error) {
    throw new ApiError(
      "SMS service failed",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Twilio Error"
    );
  }
}
