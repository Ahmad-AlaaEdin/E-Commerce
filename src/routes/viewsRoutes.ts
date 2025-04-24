import express from "express";
import {
  getLoginForm,
  getSignupForm,
  getOverview,
  getAccount,
  getCategoryProducts,
  getSubCategoryProducts,
  getProduct,
} from "../controllers/viewsController";
import { protect, isLoggedIn } from "../controllers/authController";
import { paymentSuccess } from "../controllers/paymentController";
import { getCheckout } from "../controllers/viewsController";

const viewsRouter = express.Router();
// Payment routes
viewsRouter.get("/checkout", protect, getCheckout);
viewsRouter.get("/payment-success", protect, paymentSuccess);

viewsRouter.get("/signup", getSignupForm);
viewsRouter.get("/login", getLoginForm);
viewsRouter.get("/", isLoggedIn, getOverview);
viewsRouter.get("/profile", protect, getAccount);
viewsRouter.get("/product/:id", isLoggedIn, getProduct);
viewsRouter.get("/:slug", isLoggedIn, getCategoryProducts);
viewsRouter.get("/:category/:slug", isLoggedIn, getSubCategoryProducts);

export default viewsRouter;
