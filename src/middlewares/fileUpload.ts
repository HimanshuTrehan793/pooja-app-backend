import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import { ApiError } from "../utils/apiError";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/svg+xml",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`
        )
      );
    }
  },
});

export const handleFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const multerSingle = upload.single("file");

  multerSingle(req, res, (err) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(
              "File size exceeds the 5MB limit",
              HTTP_STATUS_CODES.PAYLOAD_TOO_LARGE,
              "file too large"
            )
          );
        } else if (err.code == "LIMIT_UNEXPECTED_FILE") {
          return next(
            new ApiError(
              err.message,
              HTTP_STATUS_CODES.BAD_REQUEST,
              "Only one file is allowed to be uploaded at a time"
            )
          );
        } else {
          return next(
            new ApiError(
              err.message || "Error uploading file",
              HTTP_STATUS_CODES.BAD_REQUEST,
              "file upload error"
            )
          );
        }
      } else if (err.message && err.message.includes("Invalid file type")) {
        return next(
          new ApiError(
            err.message,
            HTTP_STATUS_CODES.UNSUPPORTED_MEDIA_TYPE,
            "file type not supported"
          )
        );
      } else {
        return next(
          new ApiError(
            err.message || "Error uploading file",
            HTTP_STATUS_CODES.BAD_REQUEST,
            "file_upload_error"
          )
        );
      }
    }
    next();
  });
};
