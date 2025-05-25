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
import {
  logout,
  isLoggedIn,
  googleAuth,
  googleCallback,
} from "../controllers/authController";
import { paymentSuccess } from "../controllers/paymentController";
import { getCheckout } from "../controllers/viewsController";

const viewsRouter = express.Router();

viewsRouter.get("/auth/google", googleAuth);
viewsRouter.get("/auth/google/callback", googleCallback);

// Payment routes
viewsRouter.get("/checkout", isLoggedIn, getCheckout);
viewsRouter.get("/payment-success", isLoggedIn, paymentSuccess);

// Add orders route
viewsRouter.get("/orders", isLoggedIn, (req, res) => {
  res.status(200).render("orders", {
    title: "My Orders",
  });
});
viewsRouter.get("/logout", logout);
viewsRouter.get("/signup", getSignupForm);
viewsRouter.get("/login", getLoginForm);
viewsRouter.get("/", getOverview);
viewsRouter.get("/profile", isLoggedIn, getAccount);
viewsRouter.get("/product/:id", getProduct);
viewsRouter.get("/:slug", getCategoryProducts);
viewsRouter.get("/:category/:slug", getSubCategoryProducts);

export default viewsRouter;
