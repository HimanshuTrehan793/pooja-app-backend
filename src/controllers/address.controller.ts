import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { db } from "../models";
import { sendResponse } from "../utils/sendResponse";
import {
  AddressIdParamsSchema,
  createAddressSchema,
  UpdateAddressSchema,
} from "../validations/address.validation";
import { runInTransaction } from "../utils/transaction";

export const getUserAddresses = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;

  const addresses = await db.Address.findAll({
    where: {
      user_id: user_id,
    },
  });

  sendResponse({
    res,
    message: "Addresses fetched successfully",
    data: addresses,
  });

  return;
};

export const createAddress = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;

  const address: createAddressSchema = req.body;

  const newAddress = await runInTransaction(async (tx) => {
    if (address.is_default) {
      await db.Address.update(
        { is_default: false },
        { where: { user_id: user_id, is_default: true }, transaction: tx }
      );
    }

    const newAddress = await db.Address.create(
      { ...address, user_id },
      { transaction: tx }
    );

    return newAddress;
  });

  sendResponse({
    res,
    message: "Address added successfully",
    data: newAddress,
  });

  return;
};

export const getAddressById = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { id } = req.params as AddressIdParamsSchema;

  const address = await db.Address.findOne({
    where: {
      id: id,
      user_id: user_id,
    },
  });

  if (!address) {
    throw new ApiError(
      "Address not found",
      HttpStatusCode.NOT_FOUND,
      "Address Not Found"
    );
  }

  sendResponse({
    res,
    message: "Address fetched successfully",
    data: address,
  });

  return;
};

export const updateAddress = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { id } = req.params as AddressIdParamsSchema;
  const updates: UpdateAddressSchema = req.body;

  const updatedAddress = await runInTransaction(async (tx) => {
    const address = await db.Address.findOne({
      where: {
        id: id,
        user_id: user_id,
      },
    });

    if (!address) {
      throw new ApiError(
        "Address not found",
        HttpStatusCode.NOT_FOUND,
        "Address Not Found"
      );
    }

    if (updates.is_default) {
      await db.Address.update(
        { is_default: false },
        { where: { user_id: user_id, is_default: true }, transaction: tx }
      );
    }

    await address.update(updates, { transaction: tx });

    return address;
  });

  sendResponse({
    res,
    message: "Address updated successfully",
    data: updatedAddress,
  });

  return;
};

export const deleteAddressById = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { id } = req.params as AddressIdParamsSchema;

  const address = await db.Address.findOne({
    where: {
      id: id,
      user_id: user_id,
    },
  });

  if (!address) {
    throw new ApiError(
      "Address not found",
      HttpStatusCode.NOT_FOUND,
      "Address Not Found"
    );
  }

  await address.destroy();

  sendResponse({
    res,
    message: "Address deleted successfully",
  });

  return;
};
