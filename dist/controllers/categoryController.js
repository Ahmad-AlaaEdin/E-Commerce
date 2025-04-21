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
exports.updateCategory = exports.deleteCategory = exports.getCategory = exports.getCategories = exports.createCategory = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const slugify_1 = __importDefault(require("slugify"));
const appError_1 = __importDefault(require("../utils/appError"));
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    req.body.slug = (0, slugify_1.default)(req.body.name, { lower: true, strict: true });
    const category = yield prisma_1.default.category.create({ data: req.body });
    res.status(201).json(category);
});
exports.createCategory = createCategory;
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield prisma_1.default.category.findMany();
    res.json(categories);
});
exports.getCategories = getCategories;
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield prisma_1.default.category.findUnique({
        where: { id: id },
        include: { subCategories: true },
    });
    if (!category)
        throw new appError_1.default("Category not found.", 404);
    res.json(category);
});
exports.getCategory = getCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
});
exports.deleteCategory = deleteCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const category = yield prisma_1.default.category.update({
        where: { id: id },
        data: req.body
    });
    res.status(200).json({ message: "Updated successfully", data: category });
});
exports.updateCategory = updateCategory;
