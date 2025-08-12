import { Request, Response } from "express";
import { DeactivateDeviceSchema, RegisterDeviceSchema } from "../validations/device.validation";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { db } from "../models";
import { sendResponse } from "../utils/sendResponse";

export const registerDevice = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { device_token, device_type }: RegisterDeviceSchema = req.body;
  const userId = req.user.id;

  const [userDevice, created] = await db.UserDevice.findOrCreate({
    where: { device_token },
    defaults: {
      user_id: userId,
      device_token,
      device_type: device_type,
      is_active: true,
    },
  });

  if (!created) {
    userDevice.user_id = userId;
    userDevice.is_active = true;
    await userDevice.save();
  }

  sendResponse({
    res,
    message: "Device registered successfully",
    data: userDevice,
  });
};

export const deactivateDevice = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { device_token }: DeactivateDeviceSchema = req.body;
  const userId = req.user.id;

  const userDevice = await db.UserDevice.findOne({
    where: { device_token, user_id: userId },
  });

  if (!userDevice) {
    throw new ApiError(
      "Device not found",
      HttpStatusCode.NOT_FOUND,
      "not found"
    );
  }

  userDevice.is_active = false;
  await userDevice.save();

  sendResponse({
    res,
    message: "Device deactivated successfully",
    data: userDevice,
  });
};
