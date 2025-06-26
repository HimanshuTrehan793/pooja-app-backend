import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { getAddressFromLatLng, getMapSearchResults } from "../controllers/map.controller";

const router = express.Router();

router.route("/search").get(catchAsync(getMapSearchResults));
router.route("/location").get(catchAsync(getAddressFromLatLng))

export default router;
