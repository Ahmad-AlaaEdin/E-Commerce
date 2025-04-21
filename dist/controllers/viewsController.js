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
exports.getCheckout = exports.getProduct = exports.getSubCategoryProducts = exports.getCategoryProducts = exports.getAccount = exports.getOverview = exports.getSignupForm = exports.getLoginForm = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
const getLoginForm = (req, res) => {
    res.status(200).render("login", {
        title: "Log into your account",
    });
};
exports.getLoginForm = getLoginForm;
const getSignupForm = (req, res) => {
    res.status(200).render("signup", {
        title: "Create Account",
    });
};
exports.getSignupForm = getSignupForm;
const getOverview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield prisma_1.default.product.findMany();
    const categories = yield prisma_1.default.category.findMany({
        include: { subCategories: true },
    });
    res.status(200).render("home", {
        title: "All Products",
        products,
        categories,
    });
});
exports.getOverview = getOverview;
const getAccount = (req, res) => {
    res.status(200).render("account", {
        title: "Your account",
        user: req.user,
    });
};
exports.getAccount = getAccount;
const getCategoryProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    console.log(slug);
    const category = yield prisma_1.default.category.findUnique({
        where: { slug },
    });
    console.log(category);
    let products = [];
    if (category) {
        products = yield prisma_1.default.product.findMany({
            where: { categoryId: category.id },
        });
    }
    const categories = yield prisma_1.default.category.findMany({
        include: { subCategories: true },
    });
    res.status(200).render("home", {
        title: category ? `${category.name} Products` : "Products",
        products,
        categories,
    });
});
exports.getCategoryProducts = getCategoryProducts;
const getSubCategoryProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, slug } = req.params;
    // Find the parent category by slug
    const parentCategory = yield prisma_1.default.category.findUnique({
        where: { slug: category },
    });
    // Find the subcategory by slug and parent category id
    const subCategory = yield prisma_1.default.subCategory.findFirst({
        where: {
            slug: slug,
            categoryId: parentCategory ? parentCategory.id : undefined,
        },
    });
    let products = [];
    if (subCategory) {
        products = yield prisma_1.default.product.findMany({
            where: { subCategoryId: subCategory.id },
        });
    }
    const categories = yield prisma_1.default.category.findMany({
        include: { subCategories: true },
    });
    res.status(200).render("home", {
        title: subCategory ? `${subCategory.name} Products` : "Products",
        products,
        categories,
    });
});
exports.getSubCategoryProducts = getSubCategoryProducts;
const getProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prisma_1.default.product.findUnique({
            where: { id },
            include: {
                category: true,
                subCategory: true
            }
        });
        if (!product) {
            return res.status(404).render("404", {
                title: "Product Not Found",
                message: "The product you are looking for does not exist."
            });
        }
        res.status(200).render("product", {
            title: product.name,
            product,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProduct = getProduct;
const getCheckout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    // Get the user's cart
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
    if (!cart || !cart.items.length) {
        return res.redirect('/');
    }
    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    res.status(200).render("checkout", {
        title: "Checkout",
        cart,
        total
    });
});
exports.getCheckout = getCheckout;
