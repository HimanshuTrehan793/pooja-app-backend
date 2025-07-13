import { Request, Response } from "express";
import { parseQueryParams } from "../utils/parseQueryParams";
import {
  CreateOrderBody,
  GetAllOrdersQuery,
  getAllOrdersQuerySchema,
  getOrderQuerySchema,
  OrderIdParam,
  OrderQueryParams,
  UpdateOrderStatusBody,
  VerifyPaymentBody,
} from "../validations/order.validation";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { db } from "../models";
import { calculatePagination } from "../utils/pagination";
import { sendResponse } from "../utils/sendResponse";
import { runInTransaction } from "../utils/transaction";
import {
  createRazorpayOrder,
  getRazorpayOrder,
  getRazorpayPayment,
} from "../services/payment.service";
import { getEnvVar } from "../utils/getEnvVar";
import { createHmac } from "crypto";
import { Includeable, Op, Order, WhereOptions } from "sequelize";
import { sendEmail } from "../services/email.service";
import { downloadInvoicePdf } from "../services/pdf.service";

const validateOrderItems = async (items: CreateOrderBody["items"]) => {
  const quantityMap = new Map(
    items.map((item) => [item.product_variant_id, item.quantity])
  );
  const productVariantIds = Array.from(quantityMap.keys());

  const productVariants = await db.ProductVariant.findAll({
    where: { id: productVariantIds },
  });

  if (productVariants.length !== productVariantIds.length) {
    throw new ApiError(
      "Invalid product variants",
      HttpStatusCode.BAD_REQUEST,
      "Some products do not exist. Please refresh your cart."
    );
  }

  const validatedItems = productVariants.map((variant) => {
    const quantity = quantityMap.get(variant.id)!;

    if (variant.out_of_stock || variant.total_available_quantity < quantity) {
      throw new ApiError(
        "Insufficient stock",
        HttpStatusCode.BAD_REQUEST,
        `"${variant.name}" is out of stock or the requested quantity is unavailable.`
      );
    }

    if (
      quantity < variant.min_quantity ||
      (variant.max_quantity && quantity > variant.max_quantity)
    ) {
      throw new ApiError(
        "Invalid quantity",
        HttpStatusCode.BAD_REQUEST,
        `Invalid quantity for "${variant.name}".`
      );
    }

    return {
      ...variant.toJSON(),
      quantity: quantity,
    };
  });

  return validatedItems;
};

const validateCouponCodeForUser = async (
  offer_codes: string[] | undefined,
  user_id: string,
  totalAmount: number
) => {
  if (!offer_codes || offer_codes.length === 0) {
    return;
  }

  const coupons = await db.Coupon.findAll({
    where: {
      offer_code: offer_codes,
    },
  });

  if (coupons.length !== offer_codes.length) {
    const foundCodes = new Set(coupons.map((c) => c.offer_code));
    const invalidCodes = offer_codes.filter((code) => !foundCodes.has(code));
    throw new ApiError(
      "Invalid coupon codes",
      HttpStatusCode.BAD_REQUEST,
      `The following coupon codes are invalid: ${invalidCodes.join(", ")}`
    );
  }

  let isNewUser = true;
  const requiresNewUserCheck = coupons.some(
    (coupon) => coupon.offer_type === "new_user"
  );
  if (requiresNewUserCheck && user_id) {
    const orderCount = await db.OrderDetail.count({ where: { user_id } });
    if (orderCount > 0) {
      isNewUser = false;
    }
  }

  let totalCouponDiscount = 0;
  const validatedCoupons = [];

  const couponIds = coupons.map((coupon) => coupon.id);

  const usageCounts = (await db.OrderCoupon.findAll({
    attributes: ["coupon_id", [db.sequelize.fn("COUNT", "id"), "count"]],
    where: {
      user_id,
      coupon_id: couponIds,
    },
    group: ["coupon_id"],
    raw: true,
  })) as unknown as { coupon_id: string; count: string }[];

  const usageCountMap = new Map(
    usageCounts.map((uc) => [uc.coupon_id, parseInt(uc.count, 10)])
  );

  for (const coupon of coupons) {
    if (!coupon.is_active) {
      throw new ApiError(
        "Inactive coupon",
        HttpStatusCode.BAD_REQUEST,
        `Coupon "${coupon.offer_code}" is not active.`
      );
    }

    if (coupon.min_order_value > totalAmount) {
      throw new ApiError(
        "Minimum order value not met",
        HttpStatusCode.BAD_REQUEST,
        `Coupon "${coupon.offer_code}" requires a minimum order value of ${coupon.min_order_value}.`
      );
    }

    if (coupon.offer_type === "new_user" && !isNewUser) {
      throw new ApiError(
        "Coupon not applicable for existing users",
        HttpStatusCode.BAD_REQUEST,
        `Coupon "${coupon.offer_code}" is only valid for new users.`
      );
    }

    const now = new Date();
    if (coupon.start_date > now || coupon.end_date < now) {
      throw new ApiError(
        "Coupon not valid for current date",
        HttpStatusCode.BAD_REQUEST,
        `Coupon "${coupon.offer_code}" is expired or not yet active.`
      );
    }

    if (coupon.usage_limit_per_user && coupon.usage_limit_per_user > 0) {
      const usageCount = usageCountMap.get(coupon.id) || 0;
      if (usageCount >= coupon.usage_limit_per_user) {
        throw new ApiError(
          "Coupon usage limit exceeded",
          HttpStatusCode.BAD_REQUEST,
          `You have already used coupon "${coupon.offer_code}" the maximum number of times.`
        );
      }
    }

    let discountForThisCoupon = 0;
    if (coupon.discount_type === "percentage") {
      discountForThisCoupon = (totalAmount * coupon.discount_value) / 100;
      if (coupon.max_discount_value) {
        discountForThisCoupon = Math.min(
          discountForThisCoupon,
          coupon.max_discount_value
        );
      }
    } else if (coupon.discount_type === "fixed") {
      discountForThisCoupon = coupon.discount_value;
    }

    const finalDiscountForThisCoupon =
      Math.round(discountForThisCoupon * 100) / 100;
    totalCouponDiscount += finalDiscountForThisCoupon;

    validatedCoupons.push({
      ...coupon.toJSON(),
      discount_amount: finalDiscountForThisCoupon,
    });
  }

  totalCouponDiscount = Math.min(totalAmount, totalCouponDiscount);

  return {
    validatedCoupons: validatedCoupons,
    totalCouponDiscount: Math.round(totalCouponDiscount * 100) / 100,
  };
};

export const getUserAllOrders = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;

  const { page, limit } = parseQueryParams(
    getOrderQuerySchema,
    req.query
  ) as OrderQueryParams;

  const offset = (page - 1) * limit;

  const { count, rows: orders } = await db.OrderDetail.findAndCountAll({
    where: {
      user_id,
      "$payment_details.status$": {
        [Op.not]: "created",
      },
    },
    include: [
      {
        model: db.OrderItem,
        as: "order_items",
        attributes: ["quantity", "price", "mrp", "product_variant_id"],
        include: [
          {
            model: db.ProductVariant,
            as: "product_variant",
            attributes: ["name", "images", "display_label"],
          },
        ],
      },
      {
        model: db.PaymentDetail,
        as: "payment_details",
        attributes: ["status", "amount", "currency", "method"],
        required: true,
      },
    ],
    offset,
    limit,
    order: [["createdAt", "DESC"]],
    distinct: true,
    subQuery: false,
  });

  const meta = calculatePagination(count, page, limit);

  sendResponse({
    res,
    message: "Orders fetched successfully",
    data: orders,
    meta,
  });

  return;
};

export const createOrder = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { items, address_id, offer_codes, charges }: CreateOrderBody = req.body;

  const validatedAddress = await db.Address.findOne({
    where: { id: address_id, user_id },
  });
  if (!validatedAddress) {
    throw new ApiError(
      "Invalid address",
      HttpStatusCode.BAD_REQUEST,
      "Address not found or does not belong to the user"
    );
  }

  const validatedProducts = await validateOrderItems(items);
  const totalAmount = validatedProducts.reduce(
    (sum, variant) => sum + variant.price * variant.quantity,
    0
  );

  const couponsData = await validateCouponCodeForUser(
    offer_codes,
    user_id,
    totalAmount
  );

  const configData = await db.Configuration.findOne({
    where: { id: 1 },
  });

  if (!configData) {
    throw new ApiError(
      "Configuration not found",
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      "Please contact support"
    );
  }

  const totalCouponDiscount = couponsData?.totalCouponDiscount ?? 0;
  const totalCharges = charges
    ? charges.reduce((acc, cv) => {
        return acc + cv.amount;
      }, 0)
    : 0;
  const finalAmount = Math.max(
    0,
    totalAmount - totalCouponDiscount + totalCharges
  );

  const RazorpayOrder = await createRazorpayOrder(finalAmount, "INR");

  await runInTransaction(async (tx) => {
    const orderDetail = await db.OrderDetail.create(
      {
        user_id,
        status: "pending",
        expected_delivery_date: new Date(
          Date.now() + (configData?.delivery_time ?? 3) * 24 * 60 * 60 * 1000
        ),
      },
      { transaction: tx }
    );

    if (charges) {
      await db.OrderCharge.bulkCreate(
        charges.map((charge) => ({ ...charge, order_id: orderDetail.id })),
        { transaction: tx }
      );
    }

    await db.OrderItem.bulkCreate(
      validatedProducts.map((variant) => {
        const requestedItem = items.find(
          (item) => item.product_variant_id === variant.id
        );

        if (!requestedItem) {
          throw new ApiError(
            "Invalid order item",
            HttpStatusCode.BAD_REQUEST,
            `${variant.name} not found in order items`
          );
        }

        return {
          order_id: orderDetail.id,
          product_variant_id: variant.id,
          product_id: variant.product_id,
          quantity: variant.quantity,
          price: variant.price,
          mrp: variant.mrp,
        };
      }),
      { transaction: tx }
    );

    await db.OrderAddress.create(
      {
        order_id: orderDetail.id,
        name: validatedAddress.name,
        phone_number: validatedAddress.phone_number,
        city: validatedAddress.city,
        pincode: validatedAddress.pincode,
        state: validatedAddress.state,
        address_line1: validatedAddress.address_line1,
        address_line2: validatedAddress.address_line2,
        lat: validatedAddress.lat,
        lng: validatedAddress.lng,
        landmark: validatedAddress.landmark,
      },
      { transaction: tx }
    );

    if (couponsData) {
      await db.OrderCoupon.bulkCreate(
        couponsData.validatedCoupons.map((coupon) => ({
          order_id: orderDetail.id,
          user_id,
          coupon_id: coupon.id,
          discount_amount: coupon.discount_amount,
          offer_code: coupon.offer_code,
          discount_type: coupon.discount_type,
        })),
        { transaction: tx }
      );
    }

    await db.PaymentDetail.create(
      {
        status: "created",
        order_id: orderDetail.id,
        amount: finalAmount,
        currency: "INR",
        razorpay_order_id: RazorpayOrder.id,
      },
      { transaction: tx }
    );

    await db.OrderHistory.create(
      {
        order_id: orderDetail.id,
        status: "pending",
        comment: "Order created successfully",
        updated_by: "system",
      },
      { transaction: tx }
    );

    return RazorpayOrder;
  });

  sendResponse({
    res,
    message: "Order created successfully",
    data: RazorpayOrder,
  });
  return;
};

export const verifyPayment = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: VerifyPaymentBody = req.body;

  const expectedSignature = createHmac(
    "sha256",
    getEnvVar("RAZORPAY_KEY_SECRET")
  )
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(
      "Invalid signature",
      HttpStatusCode.BAD_REQUEST,
      "Payment verification failed. Signature mismatch."
    );
  }

  const razorpayOrder = await getRazorpayOrder(razorpay_order_id);
  const razorpayPayment = await getRazorpayPayment(razorpay_payment_id);

  if (
    razorpayOrder.status !== "paid" ||
    razorpayPayment.status !== "captured"
  ) {
    throw new ApiError(
      "Payment not captured",
      HttpStatusCode.BAD_REQUEST,
      "Payment verification failed. Razorpay order or payment status is not valid."
    );
  }

  await runInTransaction(async (tx) => {
    const paymentDetail = await db.PaymentDetail.findOne({
      where: { razorpay_order_id },
      transaction: tx,
    });

    if (!paymentDetail) {
      throw new ApiError(
        "Payment not found",
        HttpStatusCode.NOT_FOUND,
        "Payment details not found for the provided order"
      );
    }

    if (paymentDetail.status === "captured") {
      throw new ApiError(
        "Payment already captured",
        HttpStatusCode.BAD_REQUEST,
        "This payment has already been captured."
      );
    }

    paymentDetail.status = "captured";
    paymentDetail.razorpay_signature = razorpay_signature;
    paymentDetail.razorpay_payment_id = razorpay_payment_id;
    paymentDetail.method = razorpayPayment.method;

    await paymentDetail.save({ transaction: tx });

    await db.CartItem.destroy({
      where: { user_id },
      transaction: tx,
    });
  });

  sendResponse({
    res,
    message: "Payment verified successfully",
  });

  return;
};

export const getOrderById = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { id: orderId } = req.params as { id: string };

  const where: WhereOptions = { id: orderId };
  if (req.user.role == "user") {
    where.user_id = user_id;
  }

  const includeOptions: Includeable[] = [
    {
      model: db.OrderItem,
      as: "order_items",
      attributes: ["quantity", "price", "mrp", "product_variant_id"],
      include: [
        {
          model: db.ProductVariant,
          as: "product_variant",
          attributes: ["name", "images", "display_label"],
        },
      ],
    },
    {
      model: db.PaymentDetail,
      as: "payment_details",
      attributes: ["status", "amount", "currency", "method"],
    },
    {
      model: db.OrderAddress,
      as: "order_address",
      attributes: [
        "name",
        "phone_number",
        "city",
        "pincode",
        "state",
        "address_line1",
        "address_line2",
        "landmark",
        "lat",
        "lng",
      ],
    },
    {
      model: db.OrderHistory,
      as: "order_histories",
      attributes: ["status", "comment", "updated_by", "createdAt"],
      order: [["createdAt", "DESC"]],
    },
    {
      model: db.OrderCoupon,
      as: "order_coupons",
      attributes: [
        "offer_code",
        "discount_amount",
        "discount_type",
        "createdAt",
      ],
    },
    {
      model: db.OrderCharge,
      as: "order_charges",
      attributes: ["name", "amount"],
    },
  ];

  if (req.user.role === "admin") {
    includeOptions.push({
      model: db.User,
      as: "user",
      attributes: ["id", "first_name", "last_name", "email", "phone_number"],
    });
  }

  const order = await db.OrderDetail.findOne({
    where,
    include: includeOptions,
  });

  if (!order) {
    throw new ApiError(
      "Order not found",
      HttpStatusCode.NOT_FOUND,
      `Order with ID ${orderId} not found for the user`
    );
  }

  sendResponse({
    res,
    message: "Order fetched successfully",
    data: order,
  });

  return;
};

export const getAllOrders = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authorized",
      HttpStatusCode.FORBIDDEN,
      "You do not have permission to access this resource"
    );
  }

  const { page, limit, status, user_id, order_number, phone_number } =
    parseQueryParams(getAllOrdersQuerySchema, req.query) as GetAllOrdersQuery;

  const offset = (page - 1) * limit;

  const where: WhereOptions = {};
  let order: Order = [["createdAt", "DESC"]];

  if (status) {
    where.status = { [Op.in]: status };
  }
  if (user_id) {
    where.user_id = user_id;
  }
  if (phone_number) {
    where["$user.phone_number$"] = { [Op.like]: `%${phone_number}%` };
  }
  if (order_number) {
    where.order_number = db.sequelize.where(
      db.sequelize.cast(db.sequelize.col("order_number"), "TEXT"),
      { [Op.iLike]: `${order_number}%` }
    );

    order = [["order_number", "ASC"]];
  }

  const { count, rows: orders } = await db.OrderDetail.findAndCountAll({
    where,
    include: [
      {
        model: db.PaymentDetail,
        as: "payment_details",
        attributes: ["status", "amount", "currency", "method"],
      },
      {
        model: db.User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email", "phone_number"],
      },
    ],
    offset,
    limit,
    order,
    distinct: true,
  });

  const meta = calculatePagination(count, page, limit);

  sendResponse({
    res,
    message: "Orders fetched successfully",
    data: orders,
    meta,
  });

  return;
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: orderId } = req.params as OrderIdParam;
  const { status, comment }: UpdateOrderStatusBody = req.body;

  const order = await db.OrderDetail.findOne({
    where: { id: orderId },
    include: [
      {
        model: db.User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email", "phone_number"],
      },
    ],
  });

  if (!order) {
    throw new ApiError(
      "Order not found",
      HttpStatusCode.NOT_FOUND,
      `Order with ID ${orderId} not found`
    );
  }

  if (order.status === status) {
    throw new ApiError(
      "No status change",
      HttpStatusCode.BAD_REQUEST,
      `Order is already in "${status}" status`
    );
  }

  await runInTransaction(async (tx) => {
    order.status = status;

    if (status === "delivered") {
      order.delivered_at = new Date();
    } else if (status === "cancelled" || status === "rejected") {
      order.cancellation_reason = comment ?? null;
    }

    await order.save({ transaction: tx });

    await db.OrderHistory.create(
      {
        order_id: order.id,
        status,
        comment: comment ?? null,
        updated_by: "admin",
      },
      { transaction: tx }
    );
  });

  if (order.user?.email) {
    const subject = `Update on your order #${order.order_number}`;
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 580px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        
        <h1 style="font-size: 22px; margin-top: 0;">Order Status Update</h1>
        
        <p>Hi ${order.user.first_name || "Valued Customer"},</p>
        
        <p>Your order <strong>#${
          order.order_number + 1000
        }</strong> has been updated.</p>
        
        <p><strong>New Status:</strong> ${
          status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
        }</p>
        
        ${
          comment
            ? `
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 4px; margin-top: 15px;">
            <p style="margin: 0;"><strong>A note from our team:</strong><br>${comment}</p>
          </div>
        `
            : ""
        }
        
        <p style="margin-top: 25px;">Thank you for shopping with us!</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="font-size: 12px; color: #888;">
          If you have any questions, please reply to this email.
          <br>
          &copy; ${new Date().getFullYear()} Your Company Name
        </p>
        
      </div>
    </div>
  `;

    await sendEmail(order.user.email, subject, html);
  }

  sendResponse({
    res,
    message: `Order status updated to "${status}" successfully`,
  });

  return;
};

export const downloadInvoice = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { id: orderId } = req.params as { id: string };

  const where: WhereOptions = { id: orderId };
  where.user_id = user_id;

  where.user_id = user_id;
  const includeOptions: Includeable[] = [
    {
      model: db.OrderItem,
      as: "order_items",
      attributes: ["quantity", "price", "mrp", "product_variant_id"],
      include: [
        {
          model: db.ProductVariant,
          as: "product_variant",
          attributes: ["name", "images", "display_label"],
        },
      ],
    },
    {
      model: db.PaymentDetail,
      as: "payment_details",
      attributes: ["status", "amount", "currency", "method"],
    },
    {
      model: db.OrderAddress,
      as: "order_address",
      attributes: [
        "name",
        "phone_number",
        "city",
        "pincode",
        "state",
        "address_line1",
        "address_line2",
        "landmark",
        "lat",
        "lng",
      ],
    },
    {
      model: db.OrderHistory,
      as: "order_histories",
      attributes: ["status", "comment", "updated_by", "createdAt"],
      order: [["createdAt", "DESC"]],
    },
    {
      model: db.OrderCoupon,
      as: "order_coupons",
      attributes: [
        "offer_code",
        "discount_amount",
        "discount_type",
        "createdAt",
      ],
    },
    {
      model: db.OrderCharge,
      as: "order_charges",
      attributes: ["name", "amount"],
    },
  ];

  includeOptions.push({
    model: db.User,
    as: "user",
    attributes: ["id", "first_name", "last_name", "email", "phone_number"],
  });

  const order = await db.OrderDetail.findOne({
    where,
    include: includeOptions,
  });

  if (!order) {
    throw new ApiError(
      "Order not found",
      HttpStatusCode.NOT_FOUND,
      `Failed to Download Pdf`
    );
  }

  await downloadInvoicePdf(res, order);
};
