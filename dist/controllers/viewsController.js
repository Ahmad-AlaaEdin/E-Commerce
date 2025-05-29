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
const getLoginForm = (req, res) => {
    res.render("pages/login", {
        title: "Login"
    });
};
exports.getLoginForm = getLoginForm;
const getSignupForm = (req, res) => {
    res.render("pages/signup", {
        title: "Sign Up"
    });
};
exports.getSignupForm = getSignupForm;
const getOverview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get recent products instead of featured ones
        const recentProducts = yield prisma_1.default.product.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 8
        });
        // Get all categories
        const categories = yield prisma_1.default.category.findMany({
            include: {
                _count: {
                    select: {
                        products: true
                    }
                }
            }
        });
        res.render("pages/home", {
            title: "Home",
            featuredProducts: recentProducts,
            categories
        });
    }
    catch (error) {
        console.error("Error in getOverview:", error);
        res.status(500).render("pages/error", {
            title: "Error",
            message: "Something went wrong!"
        });
    }
});
exports.getOverview = getOverview;
const getAccount = (req, res) => {
    res.render("pages/account", {
        title: "My Account",
        user: req.user
    });
};
exports.getAccount = getAccount;
const getCategoryProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield prisma_1.default.category.findUnique({
            where: {
                slug: req.params.slug
            },
            include: {
                products: true,
                subCategories: true
            }
        });
        if (!category) {
            return res.status(404).render("pages/error", {
                title: "Not Found",
                message: "Category not found!"
            });
        }
        res.render("pages/category", {
            title: category.name,
            category
        });
    }
    catch (error) {
        console.error("Error in getCategoryProducts:", error);
        res.status(500).render("pages/error", {
            title: "Error",
            message: "Something went wrong!"
        });
    }
});
exports.getCategoryProducts = getCategoryProducts;
const getSubCategoryProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subCategory = yield prisma_1.default.subCategory.findFirst({
            where: {
                slug: req.params.slug,
                category: {
                    slug: req.params.category
                }
            },
            include: {
                products: true,
                category: true
            }
        });
        if (!subCategory) {
            return res.status(404).render("pages/error", {
                title: "Not Found",
                message: "Subcategory not found!"
            });
        }
        res.render("pages/subcategory", {
            title: subCategory.name,
            subCategory
        });
    }
    catch (error) {
        console.error("Error in getSubCategoryProducts:", error);
        res.status(500).render("pages/error", {
            title: "Error",
            message: "Something went wrong!"
        });
    }
});
exports.getSubCategoryProducts = getSubCategoryProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield prisma_1.default.product.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                category: true,
                subCategory: true
            }
        });
        if (!product) {
            return res.status(404).render("pages/error", {
                title: "Not Found",
                message: "Product not found!"
            });
        }
        // Get related products
        const relatedProducts = yield prisma_1.default.product.findMany({
            where: {
                categoryId: product.categoryId,
                NOT: {
                    id: product.id
                }
            },
            take: 4
        });
        res.render("pages/product", {
            title: product.name,
            product,
            relatedProducts
        });
    }
    catch (error) {
        console.error("Error in getProduct:", error);
        res.status(500).render("error", {
            title: "Error",
            message: "Something went wrong!"
        });
    }
});
exports.getProduct = getProduct;
const getCheckout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.redirect("/login");
        }
        const cart = yield prisma_1.default.cart.findUnique({
            where: {
                userId: req.user.id
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
        if (!cart || cart.items.length === 0) {
            return res.redirect("/cart");
        }
        res.render("pages/checkout", {
            title: "Checkout",
            cart
        });
    }
    catch (error) {
        console.error("Error in getCheckout:", error);
        res.status(500).render("error", {
            title: "Error",
            message: "Something went wrong!"
        });
    }
});
exports.getCheckout = getCheckout;
