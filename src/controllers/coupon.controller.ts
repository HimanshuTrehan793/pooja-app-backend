import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { db } from "../models";
import { sendResponse } from "../utils/sendResponse";
import { Op } from "sequelize";
import {
  CouponIdParamsSchema,
  CreateCouponSchema,
  UpdateCouponSchema,
} from "../validations/coupon.validation";

export const getAllCoupons = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  if (req.user.role == "admin") {
    const coupons = await db.Coupon.findAll();

    sendResponse({
      res,
      message: "Coupons fetched successfully",
      data: coupons,
    });

    return;
  }

  const now = new Date();

  // TODO: We need to add logic for usage_limit_per_user
  const userCoupons = await db.Coupon.findAll({
    where: {
      is_active: true,
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now },
    },
  });

  sendResponse({
    res,
    message: "Coupons fetched successfully",
    data: userCoupons,
  });

  return;
};

export const createCoupon = async (req: Request, res: Response) => {
  const coupon: CreateCouponSchema = req.body;

  const existingCoupon = await db.Coupon.findOne({
    where: { offer_code: coupon.offer_code },
  });

  if (existingCoupon) {
    throw new ApiError(
      "Coupon with this offer code already exists",
      HttpStatusCode.CONFLICT,
      "Coupon Creation Failed"
    );
  }

  const newCoupon = await db.Coupon.create(coupon);

  sendResponse({
    res,
    message: "Coupon created successfully",
    data: newCoupon,
    statusCode: HttpStatusCode.CREATED,
  });

  return;
};

export const deleteAllCoupons = async (_req: Request, res: Response) => {
  await db.Coupon.destroy({ where: {} });

  sendResponse({
    res,
    message: "All coupons deleted successfully",
  });

  return;
};

export const getCouponById = async (req: Request, res: Response) => {
  const { id } = req.params as CouponIdParamsSchema;

  const coupon = await db.Coupon.findByPk(id);

  if (!coupon) {
    throw new ApiError(
      "Coupon not found",
      HttpStatusCode.NOT_FOUND,
      "not found"
    );
  }

  sendResponse({
    res,
    message: "Coupon fetched successfully",
    data: coupon,
  });

  return;
};

export const updateCoupon = async (req: Request, res: Response) => {
  const { id } = req.params as CouponIdParamsSchema;
  const updates: UpdateCouponSchema = req.body;

  const coupon = await db.Coupon.findByPk(id);

  if (!coupon) {
    throw new ApiError(
      "Coupon not found",
      HttpStatusCode.NOT_FOUND,
      "not found"
    );
  }

  if (updates.discount_type !== coupon.discount_type) {
    throw new ApiError(
      "Cannot change discount type of an existing coupon",
      HttpStatusCode.BAD_REQUEST,
      "Validation Error"
    );
  }

  if (updates.start_date && !updates.end_date) {
    if (updates.start_date >= coupon.end_date) {
      throw new ApiError(
        "Start date must be before the existing end date",
        HttpStatusCode.BAD_REQUEST,
        "Validation Error"
      );
    }
  }

  if (updates.end_date && !updates.start_date) {
    if (updates.end_date <= coupon.start_date) {
      throw new ApiError(
        "End date must be after the existing start date",
        HttpStatusCode.BAD_REQUEST,
        "Validation Error"
      );
    }
  }

  if (
    updates.discount_type == "percentage" &&
    updates.min_discount_value !== undefined &&
    updates.max_discount_value == undefined
  ) {
    if (updates.min_discount_value > (coupon.max_discount_value ?? 0)) {
      throw new ApiError(
        "min_discount_value cannot be greater than max_discount_value",
        HttpStatusCode.BAD_REQUEST,
        "Validation Error"
      );
    }
  }

  if (
    updates.discount_type == "percentage" &&
    updates.max_discount_value !== undefined &&
    updates.min_discount_value == undefined
  ) {
    if (updates.max_discount_value < (coupon.min_discount_value ?? 0)) {
      throw new ApiError(
        "max_discount_value cannot be less than min_discount_value",
        HttpStatusCode.BAD_REQUEST,
        "Validation Error"
      );
    }
  }

  await coupon.update(updates);

  sendResponse({
    res,
    message: "Coupon updated successfully",
    data: coupon,
  });

  return;
};

export const deletCouponById = async (req: Request, res: Response) => {
  const { id } = req.params as CouponIdParamsSchema;

  const coupon = await db.Coupon.findByPk(id);

  if (!coupon) {
    throw new ApiError(
      "Coupon not found",
      HttpStatusCode.NOT_FOUND,
      "not found"
    );
  }

  await coupon.destroy();

  sendResponse({
    res,
    message: "Coupon deleted successfully",
  });

  return;
};
