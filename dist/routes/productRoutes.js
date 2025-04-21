"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const productRoutes = (0, express_1.Router)();
productRoutes.route('/').post(productController_1.uploadProductPhoto, productController_1.createProduct).get(productController_1.getAllProducts);
productRoutes.route('/:id').get(productController_1.getProductById).patch(productController_1.uploadProductPhoto, productController_1.updateProduct).delete(productController_1.deleteProduct);
exports.default = productRoutes;
