import { OrderDetail } from "../models/orderDetail.model";

/**
 * Each order status maps to a Fast2SMS WhatsApp template (created + approved
 * in the Fast2SMS dashboard) and a list of variable values that fill the
 * {{1}}, {{2}}, ... placeholders in template body, in order.
 *
 * Template IDs are read from env vars so different environments
 * (staging / prod) can use different templates without code changes.
 */

export type WhatsAppOrderStatus =
  | "accepted"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rejected"
  | "returned"
  | "refunded";

interface BuiltTemplate {
  templateId: string;
  variables: string[];
}

type TemplateBuilder = (order: OrderDetail) => BuiltTemplate;

const orderNumber = (order: OrderDetail) => String(order.order_number + 1000);
const customerName = (order: OrderDetail) =>
  order.user?.first_name?.trim() || "Customer";

export const whatsappOrderStatusTemplates: Record<
  WhatsAppOrderStatus,
  TemplateBuilder
> = {
  accepted: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_ACCEPTED || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  processing: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_PROCESSING || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  packed: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_PACKED || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  shipped: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_SHIPPED || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  out_for_delivery: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_OUT_FOR_DELIVERY || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  delivered: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_DELIVERED || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  cancelled: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_CANCELLED || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  rejected: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_REJECTED || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  returned: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_RETURNED || "",
    variables: [customerName(order), orderNumber(order)],
  }),

  refunded: (order) => ({
    templateId: process.env.FAST2SMS_TPL_ORDER_REFUNDED || "",
    variables: [customerName(order), orderNumber(order)],
  }),
};
