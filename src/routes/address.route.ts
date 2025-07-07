import express from "express";
import { schemaValidate } from "../middlewares/schemaValidate";
import { catchAsync } from "../utils/catchAsync";
import {
  createAddress,
  deleteAddressById,
  getAddressById,
  getUserAddresses,
  updateAddress,
} from "../controllers/address.controller";
import { authenticate } from "../middlewares/auth.middleware";
import {
  addressIdParamsSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validations/address.validation";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(authenticate), catchAsync(getUserAddresses))
  .post(
    catchAsync(authenticate),
    schemaValidate(createAddressSchema),
    catchAsync(createAddress)
  );

router
  .route("/:id")
  .get(
    catchAsync(authenticate),
    schemaValidate(addressIdParamsSchema, "params"),
    catchAsync(getAddressById)
  )
  .patch(
    catchAsync(authenticate),
    schemaValidate(addressIdParamsSchema, "params"),
    schemaValidate(updateAddressSchema),
    catchAsync(updateAddress)
  )
  .delete(
    catchAsync(authenticate),
    schemaValidate(addressIdParamsSchema, "params"),
    catchAsync(deleteAddressById)
  );

export default router;
