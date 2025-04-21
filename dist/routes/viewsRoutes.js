"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const viewsController_1 = require("../controllers/viewsController");
const authController_1 = require("../controllers/authController");
const paymentController_1 = require("../controllers/paymentController");
const viewsController_2 = require("../controllers/viewsController");
const viewsRouter = express_1.default.Router();
// Payment routes
viewsRouter.get(
  "/checkout",
  authController_1.protect,
  viewsController_2.getCheckout
);
viewsRouter.get(
  "/payment-success",
  authController_1.protect,
  paymentController_1.paymentSuccess
);
viewsRouter.get("/signup", viewsController_1.getSignupForm);
viewsRouter.get("/login", viewsController_1.getLoginForm);
viewsRouter.get(
  "/",
  authController_1.isLoggedIn,
  viewsController_1.getOverview
);
viewsRouter.get("/me", authController_1.protect, viewsController_1.getAccount);
viewsRouter.get(
  "/product/:id",
  authController_1.isLoggedIn,
  viewsController_1.getProduct
);
viewsRouter.get(
  "/:slug",
  authController_1.isLoggedIn,
  viewsController_1.getCategoryProducts
);
viewsRouter.get(
  "/:category/:slug",
  authController_1.isLoggedIn,
  viewsController_1.getSubCategoryProducts
);
exports.default = viewsRouter;
