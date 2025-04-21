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
exports.updateSubCategory = exports.deleteSubCategory = exports.getSubCategory = exports.getSubCategories = exports.createSubCategory = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
const slugify_1 = __importDefault(require("slugify"));
const createSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.slug = (0, slugify_1.default)(req.body.name, { lower: true, strict: true });
    req.body.categoryId = Number(req.params.categoryId);
    const category = yield prisma_1.default.subCategory.create({
        data: req.body,
    });
    res.status(201).json(category);
});
exports.createSubCategory = createSubCategory;
const getSubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield prisma_1.default.subCategory.findMany({
        where: { categoryId: req.params.categoryId },
    });
    res.json(categories);
});
exports.getSubCategories = getSubCategories;
const getSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield prisma_1.default.subCategory.findUnique({
        where: { id: id },
    });
    if (!category)
        throw new appError_1.default("SubCategory not found.", 404);
    res.json(category);
});
exports.getSubCategory = getSubCategory;
const deleteSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.subCategory.delete({ where: { id: req.params.id } });
    res.status(204).send();
});
exports.deleteSubCategory = deleteSubCategory;
const updateSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (req.body.name)
        req.body.slug = (0, slugify_1.default)(req.body.name, { lower: true, strict: true });
    const category = yield prisma_1.default.subCategory.update({
        where: { id: id },
        data: req.body,
    });
    res.status(200).json({ message: "Updated successfully", data: category });
});
exports.updateSubCategory = updateSubCategory;
