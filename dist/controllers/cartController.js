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
exports.updateCartItem = exports.clearCart = exports.removeFromCart = exports.addToCart = exports.getMyCart = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
// Get current user's cart
const getMyCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    const cart = yield prisma_1.default.cart.findUnique({
        where: { userId: req.user.id },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        },
    });
    res.status(200).json({ status: "success", data: { cart } });
});
exports.getMyCart = getMyCart;
// Add item to cart
const addToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    const { productId, quantity } = req.body;
    if (!productId || !quantity)
        return next(new appError_1.default("Product and quantity required", 400));
    // Find or create cart
    let cart = yield prisma_1.default.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
        cart = yield prisma_1.default.cart.create({ data: { userId: req.user.id } });
    }
    // Check if item exists in cart
    const existingItem = yield prisma_1.default.cartItem.findFirst({
        where: { cartId: cart.id, productId },
    });
    let cartItem;
    if (existingItem) {
        cartItem = yield prisma_1.default.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
        });
    }
    else {
        cartItem = yield prisma_1.default.cartItem.create({
            data: { cartId: cart.id, productId, quantity },
        });
    }
    res.status(200).json({ status: "success", data: { cartItem } });
});
exports.addToCart = addToCart;
// Remove item from cart
const removeFromCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    const { itemId } = req.params;
    yield prisma_1.default.cartItem.delete({ where: { id: itemId } });
    res.status(204).json({ status: "success", data: null });
});
exports.removeFromCart = removeFromCart;
// Clear cart
const clearCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    const cart = yield prisma_1.default.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
        yield prisma_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.status(204).json({ status: "success", data: null });
});
exports.clearCart = clearCart;
// Update cart item quantity
const updateCartItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
        return next(new appError_1.default("Quantity must be at least 1", 400));
    }
    try {
        const cartItem = yield prisma_1.default.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: { product: true }
        });
        res.status(200).json({
            status: "success",
            data: { cartItem }
        });
    }
    catch (error) {
        return next(new appError_1.default("Cart item not found", 404));
    }
});
exports.updateCartItem = updateCartItem;
