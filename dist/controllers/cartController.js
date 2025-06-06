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
exports.mergeGuestCart = exports.updateCartItem = exports.clearCart = exports.removeFromCart = exports.addToCart = exports.getMyCart = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
// Get current user's cart
const getMyCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // For guest users, cart will be handled client-side
        if (!req.user) {
            res.status(200).json({
                status: "success",
                data: {
                    cart: null,
                    isGuest: true,
                },
            });
            return;
        }
        const cart = yield prisma_1.default.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        // Calculate total
        const total = (cart === null || cart === void 0 ? void 0 : cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)) ||
            0;
        res.status(200).json({
            status: "success",
            data: {
                cart,
                total,
                isGuest: false,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyCart = getMyCart;
// Add item to cart
const addToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(200).json({
                status: "success",
                data: { isGuest: true },
            });
            return;
        }
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            next(new appError_1.default("Product and quantity required", 400));
            return;
        }
        // Check product exists and has enough stock
        const product = yield prisma_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            next(new appError_1.default("Product not found", 404));
            return;
        }
        if (product.stock < quantity) {
            next(new appError_1.default(`Only ${product.stock} items available`, 400));
            return;
        }
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
            // Check if total quantity exceeds stock
            if (existingItem.quantity + quantity > product.stock) {
                next(new appError_1.default(`Cannot add more items. Only ${product.stock} available`, 400));
                return;
            }
            cartItem = yield prisma_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity,
                    price: product.price, // Update price in case it changed
                },
                include: { product: true },
            });
        }
        else {
            cartItem = yield prisma_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    price: product.price,
                },
                include: { product: true },
            });
        }
        res.status(200).json({
            status: "success",
            data: {
                cartItem,
                isGuest: false,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addToCart = addToCart;
// Remove item from cart
const removeFromCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(200).json({
                status: "success",
                data: { isGuest: true },
            });
            return;
        }
        const { itemId } = req.params;
        // Verify the item belongs to the user's cart
        const cartItem = yield prisma_1.default.cartItem.findFirst({
            where: {
                id: itemId,
                cart: {
                    is: {
                        userId: req.user.id,
                    },
                },
            },
        });
        if (!cartItem) {
            next(new appError_1.default("Cart item not found or unauthorized", 404));
            return;
        }
        yield prisma_1.default.cartItem.delete({ where: { id: itemId } });
        const cart = yield prisma_1.default.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        console.log(cart);
        res.status(200).json({ status: "success", data: cart });
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromCart = removeFromCart;
// Clear cart
const clearCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(200).json({
                status: "success",
                data: { isGuest: true },
            });
            return;
        }
        const cart = yield prisma_1.default.cart.findUnique({
            where: { userId: req.user.id },
        });
        if (cart) {
            yield prisma_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        res.status(204).json({ status: "success", data: null });
    }
    catch (error) {
        next(error);
    }
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
    // Verify the item belongs to the user's cart and check stock
    const cartItem = yield prisma_1.default.cartItem.findFirst({
        where: {
            id: itemId,
            cart: {
                userId: req.user.id,
            },
        },
        include: { product: true },
    });
    if (!cartItem) {
        return next(new appError_1.default("Cart item not found or unauthorized", 404));
    }
    if (quantity > cartItem.product.stock) {
        return next(new appError_1.default(`Cannot update quantity. Only ${cartItem.product.stock} available`, 400));
    }
    try {
        const updatedCartItem = yield prisma_1.default.cartItem.update({
            where: { id: itemId },
            data: {
                quantity,
                price: cartItem.product.price, // Update price in case it changed
            },
            include: { product: true },
        });
        res.status(200).json({
            status: "success",
            data: { cartItem: updatedCartItem },
        });
    }
    catch (error) {
        return next(new appError_1.default("Failed to update cart item", 500));
    }
});
exports.updateCartItem = updateCartItem;
// Merge guest cart with user cart after login
const mergeGuestCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            next(new appError_1.default("You are not logged in", 401));
            return;
        }
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            next(new appError_1.default("Invalid cart items", 400));
            return;
        }
        // Process each item from the guest cart
        for (const item of items) {
            yield (0, exports.addToCart)(Object.assign(Object.assign({}, req), { body: {
                    productId: item.productId,
                    quantity: item.quantity,
                } }), res, next);
        }
        res.status(200).json({
            status: "success",
            message: "Guest cart merged successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.mergeGuestCart = mergeGuestCart;
