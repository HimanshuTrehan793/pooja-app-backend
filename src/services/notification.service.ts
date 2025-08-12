import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getEnvVar } from "../utils/getEnvVar";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { orderStatusTemplates } from "../constants/notificationTemplates";
import { OrderDetail } from "../models/orderDetail.model";

const sqsClient = new SQSClient({
  region: getEnvVar("AWS_REGION"),
  credentials: {
    accessKeyId: getEnvVar("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnvVar("AWS_SECRET_ACCESS_KEY"),
  },
});

const queueUrl = getEnvVar("AWS_SQS_QUEUE_URL");

export const sendMessageToQueue = async (message: string) => {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: message,
  };

  try {
    const command = new SendMessageCommand(params);
    await sqsClient.send(command);
  } catch (e) {
    console.error("Failed to send message to SQS. Original Error:", e);

    throw new ApiError(
      "failed to send message to SQS",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "SQS Error"
    );
  }
};

type OrderStatus = keyof typeof orderStatusTemplates;

export const dispatchOrderStatusNotification = async (
  userId: string,
  status: OrderStatus,
  order: OrderDetail
) => {
  const templateBuilder = orderStatusTemplates[status];

  if (!templateBuilder) {
    console.log(`No notification template found for order status: "${status}"`);
    return;
  }

  const message = templateBuilder(order.order_number);

  const notificationJob = {
    userId: userId,
    message: message,
    data: {
      orderId: order.id,
      screen: "OrderDetails",
    },
  };

  await sendMessageToQueue(JSON.stringify(notificationJob));
};
