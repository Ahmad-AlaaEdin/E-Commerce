"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const subCatgoryRoutes_1 = __importDefault(require("./subCatgoryRoutes"));
const categoryRoutes = (0, express_1.Router)();
categoryRoutes.post('/', categoryController_1.createCategory);
categoryRoutes.get('/:id', categoryController_1.getCategory);
categoryRoutes.get('/', categoryController_1.getCategories);
categoryRoutes.delete('/:id', categoryController_1.deleteCategory);
categoryRoutes.patch('/:id', categoryController_1.updateCategory);
categoryRoutes.use('/:categoryId/subCategory', subCatgoryRoutes_1.default);
exports.default = categoryRoutes;
