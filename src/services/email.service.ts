import nodemailer from "nodemailer";
import { getEnvVar } from "../utils/getEnvVar";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";

const transporter = nodemailer.createTransport({
  host: getEnvVar("EMAIL_HOST"),
  port: parseInt(getEnvVar("EMAIL_PORT")),
  secure: getEnvVar("EMAIL_SECURE") === "true",
  auth: {
    user: getEnvVar("EMAIL_USER"),
    pass: getEnvVar("EMAIL_PASS"),
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"Shubhlabh Pooja Samagri" ${getEnvVar("EMAIL_USER")}`,
      to,
      subject,
      html,
    });
  } catch (e) {
    throw new ApiError(
      "Failed to send email",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Email Service Error"
    );
  }
};
