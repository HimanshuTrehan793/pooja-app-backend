import { getEnvVar } from "../utils/getEnvVar";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { ApiError } from "../utils/apiError";

const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

const apiKey = getEnvVar("FAST2SMS_API_KEY");
const senderId = getEnvVar("FAST2SMS_SENDER_ID"); // e.g. "SHBLBP"
const otpMessageId = getEnvVar("FAST2SMS_OTP_MESSAGE_ID");

/**
 * Fast2SMS expects 10-digit Indian mobile numbers without the country code.
 * Accepts inputs like "+919000057702", "919000057702", or "9000057702"
 * and returns "9000057702".
 */
function toLocalIndianNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

interface Fast2SmsResponse {
  return?: boolean;
  request_id?: string;
  message?: string | string[];
}

/**
 * Generic Fast2SMS DLT sender. Use for any DLT-approved template.
 *
 * @param phone      Phone number in any common format (E.164, with or without +91)
 * @param messageId  Fast2SMS-assigned numeric ID of the approved DLT template
 * @param variables  Values to substitute into the template's {#var#} placeholders,
 *                   in the same order they appear in the template.
 * @returns Fast2SMS request_id on success
 */
export async function sendSMS(
  phone: string,
  messageId: string,
  variables: string[] = []
): Promise<string> {
  const numbers = toLocalIndianNumber(phone);
  const variables_values = variables.join("|");
  const payload = {
    route: "dlt",
    sender_id: senderId,
    message: messageId,
    variables_values,
    numbers,
    flash: 0,
  };

  try {
    console.log("Fast2SMS payload:", payload);

    const response = await fetch(FAST2SMS_URL, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as Fast2SmsResponse;

    if (!response.ok || data.return !== true) {
      const msg = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
      throw new Error(msg || `Fast2SMS failed (HTTP ${response.status})`);
    }

    return data.request_id ?? "";
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send SMS.";

    throw new ApiError(
      errorMessage,
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Fast2SMS Error"
    );
  }
}

/**
 * Convenience wrapper for OTP sends. Uses the approved OTP DLT template
 * (ID in FAST2SMS_OTP_MESSAGE_ID) which has a single {#var#} for the OTP code.
 */
export async function sendOtp(
  phone: string,
  otpCode: string
): Promise<string> {
  return sendSMS(phone, otpMessageId, [otpCode]);
}
