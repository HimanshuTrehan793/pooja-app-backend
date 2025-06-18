import express from "express";
import { schemaValidate } from "../middlewares/schemaValidate";
import { catchAsync } from "../utils/catchAsync";
import { updateConfigurationSchema } from "../validations/configuration.validation";
import { addUserAddress, getAddressFromCoordinates, getLatandLngFromAddress, getSuggestedResults, getUserAddresses } from "../controllers/address.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { createAddressSchema } from "../validations/address.validation";

const router = express.Router();

router.route("/").get(catchAsync(getSuggestedResults));

router.route("/current-location").get(catchAsync(getAddressFromCoordinates));

router.route("/user").get(catchAsync(getUserAddresses)).post(schemaValidate(createAddressSchema),catchAsync(addUserAddress))

export default router;
