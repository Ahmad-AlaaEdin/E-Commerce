"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// Search products
router.get("/search", productController_1.searchProducts);
// Get all products
router.get("/", productController_1.getAllProducts);
// Get product details
router.get("/details/:id", productController_1.getProductDetails);
// Get products by category
router.get("/:slug", productController_1.getProductsByCategory);
// Get products by subcategory
router.get("/:categorySlug/:subCategorySlug", productController_1.getProductsBySubCategory);
exports.default = router;
