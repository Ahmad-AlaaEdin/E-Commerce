"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
// Webhook route needs raw body, so it should be before any body parsers
// This route should be handled differently
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), paymentController_1.webhookCheckout);
// Protected routes
router.use(authController_1.protect);
// Get checkout session
router.get('/checkout-session/:cartId', paymentController_1.getCheckoutSession);
// Payment success page
router.get('/success', paymentController_1.paymentSuccess);
// Pay for an existing order
router.post('/', paymentController_1.payOrder);
exports.default = router;
