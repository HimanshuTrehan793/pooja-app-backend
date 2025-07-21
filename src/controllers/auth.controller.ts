import { Request, Response } from "express";
import { sendSMS } from "../services/sms.service";
import { compareOtp, hashOtp } from "../utils/hash";
import { generateOtp } from "../utils/generateOtp";
import { getEnvVar } from "../utils/getEnvVar";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { sendResponse } from "../utils/sendResponse";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { db } from "../models";
import { runInTransaction } from "../utils/transaction";

const otpExpiryMinutes = parseInt(getEnvVar("OTP_EXPIRES_IN_MINUTES"));

export const sendOtpHandler = async (req: Request, res: Response) => {
  const { phone_number } = req.body;

  const otpCode = "111111";
  const hashedOtp = await hashOtp(otpCode);

  const message = `Your login OTP is ${otpCode}. It is valid for ${otpExpiryMinutes} minutes.`;

  // await sendSMS(phone_number, message);

  await db.Otp.upsert({
    contact: phone_number,
    contact_type: "phone",
    otp_code: hashedOtp,
  });

  sendResponse({
    res,
    message: "OTP sent successfully",
  });

  return;
};

export const verifyOtpHandler = async (req: Request, res: Response) => {
  const { phone_number, otp_code } = req.body;

  const existingOtp = await db.Otp.findOne({
    where: { contact: phone_number, contact_type: "phone" },
  });
  
  if (!existingOtp) {
    throw new ApiError(
      "OTP not found. Please request a new one.",
      HttpStatusCode.NOT_FOUND,
      "Verification Failed"
    );
  }

  const now = new Date();
  const expiryTime = new Date(existingOtp.updated_at);
  expiryTime.setMinutes(expiryTime.getMinutes() + otpExpiryMinutes);

  if (now > expiryTime) {
    throw new ApiError(
      "OTP has expired",
      HttpStatusCode.GONE,
      "Verification Failed"
    );
  }

  const isValid = await compareOtp(otp_code, existingOtp.otp_code);
  if (!isValid) {
    throw new ApiError(
      "Incorrect OTP code. Please try again.",
      HttpStatusCode.UNAUTHORIZED,
      "Verification Failed"
    );
  }

  const { accessToken, refreshToken } = await runInTransaction(async (tx) => {
    await existingOtp.destroy({ transaction: tx });

    const [user] = await db.User.findOrCreate({
      where: { phone_number },
      defaults: { phone_number },
      transaction: tx,
    });

    const accessToken = generateAccessToken(user.id, phone_number, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await user.update({ refresh_token: refreshToken }, { transaction: tx });

    return { accessToken, refreshToken };
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: getEnvVar("NODE_ENV") === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  sendResponse({
    res,
    message: "OTP verified successfully",
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });

  return;
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies?.refresh_token;
  const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const refreshToken = tokenFromCookie || tokenFromHeader;

  if (!refreshToken) {
    throw new ApiError(
      "Refresh token not provided",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await db.User.findByPk(payload.sub);

  if (!user || user.refresh_token !== refreshToken) {
    throw new ApiError(
      "Refresh token mismatch or user not found",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const accessToken = generateAccessToken(
    user.id,
    user.phone_number,
    user.role
  );
  const newRefreshToken = generateRefreshToken(user.id);

  await user.update({ refresh_token: newRefreshToken });

  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: getEnvVar("NODE_ENV") === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendResponse({
    res,
    message: "Access token refreshed successfully",
    data: {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    },
  });

  return;
};

export const logoutHandler = async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies?.refresh_token;
  const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const refreshToken = tokenFromCookie || tokenFromHeader;

  if (!refreshToken) {
    throw new ApiError(
      "Refresh token missing",
      HttpStatusCode.UNAUTHORIZED,
      "Logout Failed"
    );
  }

  const payload = verifyRefreshToken(refreshToken);

  const user = await db.User.findByPk(payload.sub);
  if (user) {
    await user.update({ refresh_token: null });
  }

  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: getEnvVar("NODE_ENV") === "production",
    sameSite: "strict",
  });

  sendResponse({
    res,
    message: "Logged out successfully",
  });

  return;
};
