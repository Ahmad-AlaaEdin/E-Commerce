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
exports.getMyOrders = exports.placeOrder = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
// Place an order from the current user's cart
const placeOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    const cart = yield prisma_1.default.cart.findUnique({
        where: { userId: req.user.id },
        include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0)
        return next(new appError_1.default("Cart is empty", 400));
    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const order = yield prisma_1.default.order.create({
        data: {
            userId: req.user.id,
            total,
            orderItems: {
                create: cart.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
            },
        },
        include: { orderItems: true },
    });
    // Clear the cart
    yield prisma_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.status(201).json({ status: "success", data: { order } });
});
exports.placeOrder = placeOrder;
// Get current user's orders
const getMyOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    console.log(req.user);
    const orders = yield prisma_1.default.order.findMany({
        where: { userId: req.user.id },
        include: { orderItems: true },
    });
    res.status(200).json({ status: "success", data: { orders } });
});
exports.getMyOrders = getMyOrders;
