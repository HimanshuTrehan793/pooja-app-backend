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
  } catch (error: unknown) {
    const errorMessage =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as any).message === "string"
        ? (error as { message: string }).message
        : "Failed to send SMS.";

    throw new ApiError(
      errorMessage,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Twilio Error"
    );
  }
}
