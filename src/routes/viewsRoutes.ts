import express from "express";
import {
  getLoginForm,
  getSignupForm,
  getOverview,
  getAccount,
  getCategoryProducts,
  getSubCategoryProducts 
} from "../controllers/viewsController";
import { protect } from "../controllers/authController";
const viewsRouter = express.Router();

viewsRouter.get("/signup", getSignupForm);
viewsRouter.get("/login", getLoginForm);
viewsRouter.get("/", getOverview);
viewsRouter.get("/:slug", getCategoryProducts);
viewsRouter.get("/:category/:slug", getSubCategoryProducts); 
viewsRouter.get("/me", protect, getAccount);

export default viewsRouter;
