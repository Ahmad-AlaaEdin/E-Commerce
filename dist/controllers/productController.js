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
exports.updateProduct = exports.deleteProduct = exports.getProductDetails = exports.searchProducts = exports.getProductsBySubCategory = exports.getProductsByCategory = exports.getAllProducts = exports.createProduct = exports.uploadProductPhoto = void 0;
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
const ITEMS_PER_PAGE = 12;
// Helper function to parse pagination parameters
const getPaginationParams = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
// Helper function to get sort parameters
const getSortParams = (sortQuery) => {
    switch (sortQuery) {
        case 'price-asc':
            return { price: 'asc' };
        case 'price-desc':
            return { price: 'desc' };
        case 'name-asc':
            return { name: 'asc' };
        case 'name-desc':
            return { name: 'desc' };
        default:
            return { createdAt: 'desc' };
    }
};
// Get all products with pagination and sorting
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, skip } = getPaginationParams(req);
        const sort = getSortParams(req.query.sort);
        const [products, total] = yield Promise.all([
            prisma_1.default.product.findMany({
                skip,
                take: limit,
                orderBy: sort,
                include: {
                    category: true,
                    subCategory: true,
                },
            }),
            prisma_1.default.product.count(),
        ]);
        const totalPages = Math.ceil(total / limit);
        res.render('pages/products', {
            title: 'All Products',
            products,
            currentPage: page,
            totalPages,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProducts = getAllProducts;
// Get products by category
const getProductsByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const { page, limit, skip } = getPaginationParams(req);
        const sort = getSortParams(req.query.sort);
        const category = yield prisma_1.default.category.findUnique({
            where: { slug },
            include: { subCategories: true },
        });
        if (!category) {
            return next(new appError_1.default('Category not found', 404));
        }
        const [products, total] = yield Promise.all([
            prisma_1.default.product.findMany({
                where: { categoryId: category.id },
                skip,
                take: limit,
                orderBy: sort,
                include: {
                    category: true,
                    subCategory: true,
                },
            }),
            prisma_1.default.product.count({
                where: { categoryId: category.id },
            }),
        ]);
        const totalPages = Math.ceil(total / limit);
        res.render('pages/products', {
            title: category.name,
            category,
            products,
            currentPage: page,
            totalPages,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProductsByCategory = getProductsByCategory;
// Get products by subcategory
const getProductsBySubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categorySlug, subCategorySlug } = req.params;
        const { page, limit, skip } = getPaginationParams(req);
        const sort = getSortParams(req.query.sort);
        const category = yield prisma_1.default.category.findUnique({
            where: { slug: categorySlug },
        });
        if (!category) {
            return next(new appError_1.default('Category not found', 404));
        }
        const subCategory = yield prisma_1.default.subCategory.findFirst({
            where: {
                slug: subCategorySlug,
                categoryId: category.id,
            },
        });
        if (!subCategory) {
            return next(new appError_1.default('Subcategory not found', 404));
        }
        const [products, total] = yield Promise.all([
            prisma_1.default.product.findMany({
                where: { subCategoryId: subCategory.id },
                skip,
                take: limit,
                orderBy: sort,
                include: {
                    category: true,
                    subCategory: true,
                },
            }),
            prisma_1.default.product.count({
                where: { subCategoryId: subCategory.id },
            }),
        ]);
        const totalPages = Math.ceil(total / limit);
        res.render('pages/products', {
            title: `${subCategory.name} - ${category.name}`,
            category,
            subCategory,
            products,
            currentPage: page,
            totalPages,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProductsBySubCategory = getProductsBySubCategory;
// Search products
const searchProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = req.query.q;
        const { page, limit, skip } = getPaginationParams(req);
        const sort = getSortParams(req.query.sort);
        if (!searchQuery) {
            return res.redirect('/products');
        }
        const [products, total] = yield Promise.all([
            prisma_1.default.product.findMany({
                where: {
                    OR: [
                        { name: { contains: searchQuery, mode: 'insensitive' } },
                        { description: { contains: searchQuery, mode: 'insensitive' } },
                    ],
                },
                skip,
                take: limit,
                orderBy: sort,
                include: {
                    category: true,
                    subCategory: true,
                },
            }),
            prisma_1.default.product.count({
                where: {
                    OR: [
                        { name: { contains: searchQuery, mode: 'insensitive' } },
                        { description: { contains: searchQuery, mode: 'insensitive' } },
                    ],
                },
            }),
        ]);
        const totalPages = Math.ceil(total / limit);
        res.render('pages/products', {
            title: `Search Results: ${searchQuery}`,
            products,
            searchQuery,
            currentPage: page,
            totalPages,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.searchProducts = searchProducts;
// Get product details
const getProductDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const product = yield prisma_1.default.product.findUnique({
            where: { id },
            include: {
                category: true,
                subCategory: true,
            },
        });
        if (!product) {
            return next(new appError_1.default('Product not found', 404));
        }
        // Get related products from the same category
        const relatedProducts = yield prisma_1.default.product.findMany({
            where: {
                categoryId: product.categoryId,
                NOT: { id: product.id },
            },
            take: 4,
        });
        res.render('pages/product-details', {
            title: product.name,
            product,
            relatedProducts,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProductDetails = getProductDetails;
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
