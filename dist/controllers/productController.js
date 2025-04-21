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
exports.updateProduct = exports.deleteProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = exports.uploadProductPhoto = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multerStorage = multer_1.default.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    }
    else {
        cb(new appError_1.default("Not An Image! Please Upload Only Images ", 400));
    }
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
});
exports.uploadProductPhoto = upload.single("photo");
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        const fileBuffer = req.file.buffer;
        const imageUrl = yield (0, cloudinary_1.default)(fileBuffer, "products");
        req.body.image = imageUrl;
    }
    req.body.price = Number(req.body.price);
    const product = yield prisma_1.default.product.create({ data: req.body });
    res.status(201).json(product);
});
exports.createProduct = createProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield prisma_1.default.product.findMany();
    res.status(200).json(products);
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield prisma_1.default.product.findUnique({
        where: { id: req.params.id },
    });
    if (!product)
        throw new appError_1.default("Product not found", 404);
    res.status(200).json(product);
});
exports.getProductById = getProductById;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.product.delete({
        where: { id: req.params.id },
    });
    res.status(204).json({});
});
exports.deleteProduct = deleteProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        const fileBuffer = req.file.buffer;
        const imageUrl = yield (0, cloudinary_1.default)(fileBuffer, "products");
        req.body.image = imageUrl;
    }
    if (req.body.price)
        req.body.price = Number(req.body.price);
    const product = yield prisma_1.default.product.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.status(200).json(product);
});
exports.updateProduct = updateProduct;
