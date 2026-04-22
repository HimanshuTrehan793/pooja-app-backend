import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { sendResponse } from "../utils/sendResponse";
import { sendBroadcastNotification } from "../services/notification.service";

export const broadcastNotification = async (req: Request, res: Response) => {
  const { title, body, data } = req.body as {
    title: string;
    body: string;
    data?: Record<string, string>;
  };

  await sendBroadcastNotification(title, body, data || {});

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.OK,
    message: "Broadcast notification queued successfully",
    data: { queued: true },
  });
};
