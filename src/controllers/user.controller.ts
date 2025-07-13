import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { db } from "../models";
import { sendResponse } from "../utils/sendResponse";
import {
  getAllUserQuerySchema,
  GetAllUsersQuery,
  UpdateEmailBodySchema,
  UpdateUserBodySchema,
} from "../validations/user.validation";
import { generateOtp } from "../utils/generateOtp";
import { getEnvVar } from "../utils/getEnvVar";
import { compareOtp, hashOtp } from "../utils/hash";
import { sendEmail } from "../services/email.service";
import { runInTransaction } from "../utils/transaction";
import { calculatePagination } from "../utils/pagination";
import { parseQueryParams } from "../utils/parseQueryParams";
import { Op, WhereOptions } from "sequelize";

const otpExpiryMinutes = parseInt(getEnvVar("OTP_EXPIRES_IN_MINUTES"));

export const getUserDetails = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const user = await db.User.findByPk(req.user.id, {
    attributes: [
      "id",
      "phone_number",
      "first_name",
      "last_name",
      "gender",
      "email",
    ],
  });

  sendResponse({
    res,
    data: user,
    message: "User details retrieved successfully",
  });
};

export const updateUserDetails = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { ...updates }: UpdateUserBodySchema = req.body;

  const user = await db.User.findByPk(req.user.id, {
    attributes: [
      "id",
      "phone_number",
      "first_name",
      "last_name",
      "gender",
      "email",
    ],
  });
  if (!user) {
    throw new ApiError("User not found", HttpStatusCode.NOT_FOUND, "not found");
  }

  const updatedUser = await user.update(updates);

  sendResponse({
    res,
    data: updatedUser,
    message: "User details updated successfully",
  });
};

export const sendOtpToUpdateEmail = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { email } = req.body;
  const otpCode = generateOtp();
  const hashedOtp = await hashOtp(otpCode);

  const subject = "Your OTP Verification Code";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; line-height: 1.6;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">

        <div style="padding: 32px 24px;">
          <div style="color: #1f2937; font-size: 16px; margin-bottom: 8px;">Hi,</div>
          <div style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Greetings from our team!</div>
          
          <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <div style="color: #374151; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Your OTP Code</div>
            <div style="color: #1f2937; font-size: 28px; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 2px; margin-bottom: 12px;"><strong>${otpCode}</strong></div>
            <div style="color: #ef4444; font-size: 13px; font-weight: 500;">Expires in ${otpExpiryMinutes} minutes</div>
          </div>
          
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <div style="color: #374151; font-size: 14px; margin-bottom: 4px;">Best Regards,</div>
            <div style="color: #6b7280; font-size: 13px;">Team Shubhlabh</div>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-top: 20px; font-size: 12px; color: #92400e;">
            <strong>Note:</strong> Keep this OTP confidential and don't share it with anyone.
          </div>
        </div>
      </div>
    </div>
  `;

  await sendEmail(email, subject, html);

  await db.Otp.upsert({
    contact: email,
    contact_type: "email",
    otp_code: hashedOtp,
  });

  sendResponse({
    res,
    message: "OTP sent successfully ",
  });

  return;
};

export const updateUserEmail = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const user = await db.User.findByPk(req.user.id, {
    attributes: [
      "id",
      "phone_number",
      "first_name",
      "last_name",
      "gender",
      "email",
    ],
  });

  if (!user) {
    throw new ApiError(
      "User not found!",
      HttpStatusCode.NOT_FOUND,
      "not found"
    );
  }

  const { email, otp_code }: UpdateEmailBodySchema = req.body;

  const existingOtp = await db.Otp.findOne({
    where: { contact: email, contact_type: "email" },
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

  await runInTransaction(async (tx) => {
    await existingOtp.destroy({ transaction: tx });
    user.email = email;
    await user.save({ transaction: tx });
  });

  sendResponse({
    res,
    data: user,
    message: "Email updated successfully",
  });
};

export const getAllusers = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authorized",
      HttpStatusCode.FORBIDDEN,
      "You do not have permission to access this resource"
    );
  }

  const { page, limit, phone_number } = parseQueryParams(
    getAllUserQuerySchema,
    req.query
  ) as GetAllUsersQuery;

  const where: WhereOptions = {};
  const offset = (page - 1) * limit;

  if (phone_number) {
    where.phone_number = { [Op.iLike]: `%${phone_number}%` };
  }

  const { count, rows: users } = await db.User.findAndCountAll({
    where,
    distinct: true,
    limit: Number(limit),
    offset,
    attributes: [
      "id",
      "phone_number",
      "first_name",
      "last_name",
      "gender",
      "email",
    ],
  });

  const meta = calculatePagination(count, page, limit);

  sendResponse({
    res,
    message: "Orders fetched successfully",
    data: users,
    meta,
  });
};
