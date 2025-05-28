import { Request, Response } from "express";
import { Otp } from "../models/otp.model";
import { sendSMS } from "../services/sms.service";
import { hashOtp } from "../utils/hash";
import { generateOtp } from "../utils/generateOtp";
import { getEnvVar } from "../utils/getEnvVar";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { sendResponse } from "../utils/sendResponse";

const otpExpiryMinutes = parseInt(getEnvVar("OTP_EXPIRES_IN_MINUTES"));

export const sendOtpHandler = async (req: Request, res: Response) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    throw new ApiError(
      "Phone number is required",
      HttpStatusCode.BAD_REQUEST,
      "Bad Request"
    );
  }

  if (!/^\+\d{1,3}\d{9,15}$/.test(phone_number)) {
    throw new ApiError(
      "Invalid phone number format",
      HttpStatusCode.BAD_REQUEST,
      "Bad Request"
    );
  }
  
  const otpCode = generateOtp();
  const hashedOtp = hashOtp(otpCode);

  const message = `Your login OTP is ${otpCode}. It is valid for ${otpExpiryMinutes} minutes.`;

  await sendSMS(phone_number, message);

  const existingOtp = await Otp.findOne({ where: { phone_number } });

  if (existingOtp) {
    await existingOtp.update({
      otp_code: hashedOtp,
      updated_at: new Date(),
    });
  } else {
    await Otp.create({
      phone_number,
      otp_code: hashedOtp,
    });
  }

  sendResponse({
    res,
    message: "OTP sent successfully",
  });
};
