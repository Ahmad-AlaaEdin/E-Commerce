"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.deleteCategory = exports.getCategory = exports.getCategories = exports.createCategory = void 0;
const factoryHandler_1 = require("../controllers/factoryHandler");
exports.createCategory = (0, factoryHandler_1.createOne)("category");
exports.getCategories = (0, factoryHandler_1.getAll)("category");
exports.getCategory = (0, factoryHandler_1.getOne)("category", { subCategories: true });
exports.deleteCategory = (0, factoryHandler_1.deleteOne)("category");
exports.updateCategory = (0, factoryHandler_1.updateOne)("category");
