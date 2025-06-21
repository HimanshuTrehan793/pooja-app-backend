import { Router } from "express";
import { uploadAssetController } from "../controllers/asset.controller";
import { catchAsync } from "../utils/catchAsync";
import { handleFileUpload } from "../middlewares/fileUpload";

const router = Router();

router
  .route("/upload")
  .post(handleFileUpload, catchAsync(uploadAssetController));

export default router;
