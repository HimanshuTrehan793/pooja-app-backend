import express, { Router } from "express";
import { getAllProducts } from "../controller/product.controller";

const router = express.Router();

router.get("/",getAllProducts)


export default router;
