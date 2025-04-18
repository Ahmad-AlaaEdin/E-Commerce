import express from "express";
import { protect } from "../controllers/authController";
import { payOrder } from "../controllers/paymentController";

const router = express.Router();

router.use(protect);

router.post("/", payOrder);

export default router;
