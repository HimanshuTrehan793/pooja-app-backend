import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { deleteAccount } from "../controllers/account.controller";

const router = express.Router();

router.route("/delete").post(catchAsync(deleteAccount));

export default router;
