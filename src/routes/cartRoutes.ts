import express from "express";
import { protect } from "../controllers/authController";
import {
  getMyCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem
} from "../controllers/cartController";

const router = express.Router();

router.use(protect);
router.route("/").get(getMyCart).post(addToCart).delete(clearCart);
router.route("/:itemId").delete(removeFromCart).patch(updateCartItem);

export default router;
