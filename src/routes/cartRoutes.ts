import express from "express";
import { isLoggedIn } from "../controllers/authController";
import {
  getMyCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeGuestCart
} from "../controllers/cartController";

const router = express.Router();

// Public routes (accessible to both guests and logged-in users)
router.route("/")
  .get(getMyCart)
  .post(addToCart)
  .delete(clearCart);

router.route("/:itemId").delete(removeFromCart);

// Protected routes (only for logged-in users)
router.use(isLoggedIn);
router.post("/merge", mergeGuestCart);

export default router;
