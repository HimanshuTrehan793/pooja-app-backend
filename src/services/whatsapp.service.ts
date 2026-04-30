import axios from "axios";
import { getEnvVar } from "../utils/getEnvVar";
import {
  whatsappOrderStatusTemplates,
  type WhatsAppOrderStatus,
} from "../constants/whatsappTemplates";
import { OrderDetail } from "../models/orderDetail.model";

const FAST2SMS_BASE_URL =
  process.env.FAST2SMS_BASE_URL || "https://www.fast2sms.com/dev";
const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === "true";

const client = axios.create({
  baseURL: FAST2SMS_BASE_URL,
  // Fast2SMS WhatsApp can take 15-25s on first call. 30s is the sweet spot.
  timeout: 30_000,
});

export interface SendWhatsAppArgs {
  phone: string; // any format; we normalise below
  templateId: string;
  variables: string[];
}

/**
 * Strip "+91" / "91" prefix and any non-digits, return last 10 digits.
 * Fast2SMS expects raw 10-digit Indian numbers.
 */
const normaliseIndianPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
};

/**
 * Low-level send. Throws on Fast2SMS error so the caller can decide to
 * swallow or rethrow.
 */
export const sendWhatsApp = async ({
  phone,
  templateId,
  variables,
}: SendWhatsAppArgs): Promise<void> => {
  if (!WHATSAPP_ENABLED) {
    console.log(
      `[whatsapp] disabled (WHATSAPP_ENABLED!=true). Skipping send to ${phone}.`
    );
    return;
  }

  const apiKey = getEnvVar("FAST2SMS_API_KEY");
  const numbers = normaliseIndianPhone(phone);
  if (numbers.length !== 10) {
    console.warn(`[whatsapp] invalid phone "${phone}", skipping.`);
    return;
  }

  // Fast2SMS "Send WhatsApp Message" API:
  //   GET /dev/whatsapp
  //   query: authorization, message_id, phone_number_id, numbers, variables_values
  // Docs: https://docs.fast2sms.com/reference/sendwhatsappmessage
  //
  // `phone_number_id` is the WABA Phone Number ID — *not* the WhatsApp business
  // phone number itself. Find it in: Fast2SMS Dashboard → WhatsApp → Numbers
  // (or the API Documentation tab — it shows your account's exact value).
  const phoneNumberId = process.env.FAST2SMS_PHONE_NUMBER_ID;
  if (!phoneNumberId) {
    throw new Error(
      "FAST2SMS_PHONE_NUMBER_ID env var is required. Get it from Fast2SMS Dashboard → WhatsApp → Numbers."
    );
  }

  const params: Record<string, string> = {
    authorization: apiKey,
    message_id: templateId,
    phone_number_id: phoneNumberId,
    numbers,
  };
  if (variables.length > 0) {
    params.variables_values = variables.join("|");
  }

  try {
    const res = await client.get("/whatsapp", { params });
    console.log("[whatsapp] response", res.status, res.data);

    // Fast2SMS returns either {status: 200, message: "..."} (success) or
    // {return: false, errors: {...}} (failure).
    const ok = res.data?.status === 200 || res.data?.return === true;
    if (!ok) {
      throw new Error(
        `Fast2SMS WhatsApp send failed: ${JSON.stringify(res.data)}`
      );
    }
  } catch (err: any) {
    // Concise error — don't dump the full AxiosError; it's huge.
    if (err?.code === "ECONNABORTED") {
      throw new Error(
        `Fast2SMS timeout (>${client.defaults.timeout}ms). Check Fast2SMS API status / account quota.`
      );
    }
    if (err?.response) {
      throw new Error(
        `Fast2SMS HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
      );
    }
    throw err;
  }
};

/**
 * High-level helper: send the WhatsApp message that matches an order status.
 * Non-fatal — logs and swallows errors so the order flow never breaks because
 * the WhatsApp provider is down or the template is unapproved.
 */
export const dispatchOrderStatusWhatsApp = async (
  status: WhatsAppOrderStatus,
  order: OrderDetail
): Promise<void> => {
  const phone = order.user?.phone_number;
  if (!phone) {
    console.warn(
      `[whatsapp] no phone for order ${order.id}, skipping ${status} message.`
    );
    return;
  }

  const builder = whatsappOrderStatusTemplates[status];
  console.log("Builder", builder)
  if (!builder) {
    console.log(
      `[whatsapp] no template configured for status "${status}", skipping.`
    );
    return;
  }

  const tpl = builder(order);
  if (!tpl.templateId) {
    console.warn(
      `[whatsapp] template id missing for status "${status}". Set the env var.`
    );
    return;
  }

  try {
    await sendWhatsApp({
      phone,
      templateId: tpl.templateId,
      variables: tpl.variables,
    });
    console.log(
      `[whatsapp] sent ${status} to ${normaliseIndianPhone(phone)} for order ${order.order_number
      }`
    );
  } catch (err) {
    console.error(
      `[whatsapp] failed to send ${status} for order ${order.order_number}:`,
      err
    );
  }
};
