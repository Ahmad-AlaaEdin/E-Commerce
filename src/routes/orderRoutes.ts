import express from "express";
import { protect } from "../controllers/authController";
import { placeOrder, getMyOrders } from "../controllers/orderController";

const router = express.Router();

router.use(protect);

router.post("/", placeOrder);
router.get("/", getMyOrders);

export default router;
