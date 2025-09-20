import { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";
import { db } from "../models";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";

export const deleteAccount = async (req: Request, res: Response) => {
  const { phone_number } = req.body;

  const user = await db.User.findOne({ where: { phone_number } });

  if (!user) {
    throw new ApiError(
      "User not found",
      HttpStatusCode.NOT_FOUND,
      "Account Deletion Failed"
    );
  }

  sendResponse({
    res,
    message: "Account deleted successfully",
  });
};
