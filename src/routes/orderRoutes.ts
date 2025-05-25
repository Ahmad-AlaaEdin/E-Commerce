import express from "express";
import { isLoggedIn } from "../controllers/authController";
import { placeOrder, getMyOrders } from "../controllers/orderController";

const router = express.Router();

router.use(isLoggedIn);

router.post("/", placeOrder);
router.get("/", getMyOrders);

export default router;
