"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payOrder = exports.paymentSuccess = exports.webhookCheckout = exports.getCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "");
const getCheckoutSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Get the cart
        const { cartId } = req.params;
        if (!req.user) {
            return next(new appError_1.default("You must be logged in to checkout", 401));
        }
        const cart = yield prisma_1.default.cart.findUnique({
            where: { id: cartId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!cart) {
            return next(new appError_1.default("No cart found with that ID", 404));
        }
        if (cart.userId !== req.user.id) {
            return next(new appError_1.default("You do not have permission to checkout this cart", 403));
        }
        // 2) Calculate total
        const total = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
        // 3) Create checkout session
        const lineItems = cart.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.product.name,
                    description: item.product.description || undefined,
                    images: item.product.image ? [item.product.image] : undefined,
                },
                unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        }));
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${req.protocol}://${req.get("host")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get("host")}/cart`,
            customer_email: req.user.email,
            client_reference_id: cart.id,
            line_items: lineItems,
        });
        // 4) Create order in pending status
        yield prisma_1.default.order.create({
            data: {
                userId: req.user.id,
                total,
                status: "PENDING",
                paymentIntentId: session.payment_intent,
                orderItems: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                },
            },
        });
        // 5) Send response
        res.status(200).json({
            status: "success",
            session,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getCheckoutSession = getCheckoutSession;
const webhookCheckout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const signature = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
    }
    catch (err) {
        res.status(400).send(`Webhook error: ${err.message}`);
        return;
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        // Update order status to paid
        yield prisma_1.default.order.update({
            where: { paymentIntentId: session.payment_intent },
            data: { status: "PAID" },
        });
        // Clear the cart
        if (session.client_reference_id) {
            yield prisma_1.default.cartItem.deleteMany({
                where: { cartId: session.client_reference_id },
            });
        }
    }
    res.status(200).json({ received: true });
});
exports.webhookCheckout = webhookCheckout;
const paymentSuccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { session_id } = req.query;
        if (!session_id) {
            return next(new appError_1.default("No session ID provided", 400));
        }
        const session = yield stripe.checkout.sessions.retrieve(session_id);
        if (!session) {
            return next(new appError_1.default("Invalid session ID", 400));
        }
        const order = yield prisma_1.default.order.findFirst({
            where: { paymentIntentId: session.payment_intent },
            include: { orderItems: true },
        });
        if (!order) {
            return next(new appError_1.default("No order found for this session", 404));
        }
        res.status(200).render("payment-success", {
            title: "Payment Successful",
            order,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.paymentSuccess = paymentSuccess;
const payOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default("You must be logged in to pay for an order", 401));
        }
        const { orderId } = req.body;
        if (!orderId) {
            return next(new appError_1.default("Order ID is required", 400));
        }
        // Find the order
        const order = yield prisma_1.default.order.findUnique({
            where: {
                id: orderId,
                userId: req.user.id,
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!order) {
            return next(new appError_1.default("Order not found or does not belong to you", 404));
        }
        // Create line items for Stripe
        const lineItems = order.orderItems.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.product.name,
                    description: item.product.description || undefined,
                    images: item.product.image ? [item.product.image] : undefined,
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        }));
        // Create checkout session
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${req.protocol}://${req.get("host")}/orders`,
            cancel_url: `${req.protocol}://${req.get("host")}/orders`,
            customer_email: req.user.email,
            client_reference_id: order.id,
            line_items: lineItems,
            metadata: {
                orderId: order.id,
                userId: req.user.id,
            },
        });
        // Update order with payment intent ID
        yield prisma_1.default.order.update({
            where: { id: order.id },
            data: {
                paymentIntentId: session.payment_intent,
            },
        });
        // Send response
        res.status(200).json({
            status: "success",
            session,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.payOrder = payOrder;
