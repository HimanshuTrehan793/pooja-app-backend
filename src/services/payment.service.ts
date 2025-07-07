import Razorpay from "razorpay";
import { getEnvVar } from "../utils/getEnvVar";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";

const razorpay = new Razorpay({
  key_id: getEnvVar("RAZORPAY_KEY_ID"),
  key_secret: getEnvVar("RAZORPAY_KEY_SECRET"),
});

export const createRazorpayOrder = async (amount: number, currency: string) => {
  try {
    const options = {
      amount: amount * 100,
      currency,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch {
    throw new ApiError(
      "Failed to create Razorpay order",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Razorpay Error"
    );
  }
};
