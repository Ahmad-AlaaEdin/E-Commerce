"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const cartController_1 = require("../controllers/cartController");
const router = express_1.default.Router();
// Public routes (accessible to both guests and logged-in users)
router.route("/")
    .get(cartController_1.getMyCart)
    .post(cartController_1.addToCart)
    .delete(cartController_1.clearCart);
router.route("/:itemId").delete(cartController_1.removeFromCart);
// Protected routes (only for logged-in users)
router.use(authController_1.isLoggedIn);
router.post("/merge", cartController_1.mergeGuestCart);
exports.default = router;
