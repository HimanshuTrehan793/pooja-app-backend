import express from "express";
import { schemaValidate } from "../middlewares/schemaValidate";
import { catchAsync } from "../utils/catchAsync";
import {
  createAddress,
  deleteAddressById,
  getAddressById,
  getUserAddresses,
} from "../controllers/address.controller";
import { authenticate } from "../middlewares/auth.middleware";
import {
  addressIdParamsSchema,
  createAddressSchema,
} from "../validations/address.validation";

const router = express.Router();

// router.route("/").get(catchAsync(getSuggestedResults));

// router.route("/current-location").get(catchAsync(getAddressFromCoordinates));

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
    schemaValidate(createAddressSchema),
    catchAsync(createAddress)
  )
  .delete(
    catchAsync(authenticate),
    schemaValidate(addressIdParamsSchema, "params"),
    catchAsync(deleteAddressById)
  );

export default router;
