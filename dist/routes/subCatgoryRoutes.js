"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subCategoryController_1 = require("../controllers/subCategoryController");
const subCategoryRoutes = (0, express_1.Router)({ mergeParams: true });
subCategoryRoutes.get("/", subCategoryController_1.getSubCategories);
subCategoryRoutes.post("/", subCategoryController_1.createSubCategory);
subCategoryRoutes
    .route("/:id")
    .get(subCategoryController_1.getSubCategory)
    .delete(subCategoryController_1.deleteSubCategory)
    .patch(subCategoryController_1.updateSubCategory);
exports.default = subCategoryRoutes;
