"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
router.use(authController_1.isLoggedIn);
router.post("/", orderController_1.placeOrder);
router.get("/", orderController_1.getMyOrders);
exports.default = router;
