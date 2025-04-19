import express from "express";
import { protect } from "../controllers/authController";
import { getCheckoutSession, paymentSuccess, webhookCheckout, payOrder } from "../controllers/paymentController";

const router = express.Router();

// Webhook route needs raw body, so it should be before any body parsers
// This route should be handled differently
router.post('/webhook', express.raw({ type: 'application/json' }), webhookCheckout);

// Protected routes
router.use(protect);

// Get checkout session
router.get('/checkout-session/:cartId', getCheckoutSession);

// Payment success page
router.get('/success', paymentSuccess);

// Pay for an existing order
router.post('/', payOrder);

export default router;
