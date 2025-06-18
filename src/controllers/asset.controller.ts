import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { uploadFileToS3 } from "../utils/s3";
import { sendResponse } from "../utils/sendResponse";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";

export const uploadAssetController = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(
      "No file provided",
      HTTP_STATUS_CODES.BAD_REQUEST,
      "validation_error"
    );
  }
  const url = await uploadFileToS3(req.file);

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.CREATED,
    message: "File uploaded successfully",
    data: { url },
  });
};
