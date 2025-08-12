export const orderStatusTemplates = {
  accepted: (orderNumber: number) => ({
    title: "✅ Order Accepted!",
    body: `Your order #${
      orderNumber + 1000
    } has been accepted and will be processed shortly.`,
  }),

  processing: (orderNumber: number) => ({
    title: "👩‍🍳 Your order is being prepared",
    body: `We've started preparing your order #${orderNumber + 1000}.`,
  }),

  packed: (orderNumber: number) => ({
    title: "📦 Your order has been packed!",
    body: `Your order #${
      orderNumber + 1000
    } is now packed and ready for shipment.`,
  }),

  shipped: (orderNumber: number) => ({
    title: "🚚 Your order has shipped!",
    body: `Great news! Your order #${orderNumber + 1000} is on its way.`,
  }),

  out_for_delivery: (orderNumber: number) => ({
    title: "🏠 It's arriving today!",
    body: `Your order #${orderNumber + 1000} is out for delivery.`,
  }),

  delivered: (orderNumber: number) => ({
    title: "🎉 Order Delivered!",
    body: `Your order #${
      orderNumber + 1000
    } has been successfully delivered. Enjoy!`,
  }),

  cancelled: (orderNumber: number) => ({
    title: "❌ Order Cancelled",
    body: `As requested, your order #${orderNumber + 1000} has been cancelled.`,
  }),

  rejected: (orderNumber: number) => ({
    title: "❗️ Important Update on Your Order",
    body: `Unfortunately, we were unable to process your order #${
      orderNumber + 1000
    }.`,
  }),

  returned: (orderNumber: number) => ({
    title: "↩️ Return Processed",
    body: `We have successfully processed the return for your order #${
      orderNumber + 1000
    }.`,
  }),

  refunded: (orderNumber: number) => ({
    title: "💸 Refund Issued",
    body: `A refund has been issued for your order #${
      orderNumber + 1000
    }. It should reflect in your account shortly.`,
  }),
};
