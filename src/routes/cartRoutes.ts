import express from "express";
import { protect } from "../controllers/authController";
import {
  getMyCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController";

const router = express.Router();

router.use(protect);

router.get("/", getMyCart);
router.post("/add", addToCart);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

export default router;