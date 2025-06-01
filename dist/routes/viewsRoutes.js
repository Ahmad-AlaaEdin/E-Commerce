"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const viewsController_1 = require("../controllers/viewsController");
const authController_1 = require("../controllers/authController");
const paymentController_1 = require("../controllers/paymentController");
const viewsController_2 = require("../controllers/viewsController");
const viewsRouter = express_1.default.Router();
viewsRouter.get("/auth/google", authController_1.googleAuth);
viewsRouter.get("/auth/google/callback", authController_1.googleCallback);
// Payment routes
viewsRouter.get("/checkout", authController_1.isLoggedIn, viewsController_2.getCheckout);
viewsRouter.get("/payment-success", authController_1.isLoggedIn, paymentController_1.paymentSuccess);
// Add orders route
viewsRouter.get("/orders", authController_1.isLoggedIn, (req, res) => {
    res.status(200).render("orders", {
        title: "My Orders",
    });
});
viewsRouter.get("/logout", authController_1.logout);
viewsRouter.get("/signup", viewsController_1.getSignupForm);
viewsRouter.get("/login", viewsController_1.getLoginForm);
viewsRouter.get("/products", viewsController_1.getAllProducts);
viewsRouter.get("/", viewsController_1.getOverview);
viewsRouter.get("/profile", authController_1.isLoggedIn, viewsController_1.getAccount);
viewsRouter.get("/product/:id", viewsController_1.getProduct);
viewsRouter.get("/:slug", viewsController_1.getCategoryProducts);
viewsRouter.get("/:category/:slug", viewsController_1.getSubCategoryProducts);
exports.default = viewsRouter;
