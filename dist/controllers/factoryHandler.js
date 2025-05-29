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
exports.getAllWithFilters = exports.deleteOne = exports.updateOne = exports.createOne = exports.getOne = exports.getAll = void 0;
const client_1 = require("@prisma/client");
const appError_1 = __importDefault(require("../utils/appError"));
const prisma = new client_1.PrismaClient();
const getAll = (model, options = {}) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Build filter from query params
            const filter = {};
            // Add search functionality if searchFields provided
            if (options.searchFields && req.query.search) {
                const searchTerm = req.query.search;
                filter.OR = options.searchFields.map(field => ({
                    [field]: { contains: searchTerm, mode: 'insensitive' }
                }));
            }
            // @ts-ignore - Dynamic access to Prisma models
            const docs = yield prisma[model].findMany(Object.assign({ where: filter }, (options.populateFields && { include: options.populateFields })));
            res.status(200).json({
                status: "success",
                results: docs.length,
                data: {
                    [model]: docs,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
};
exports.getAll = getAll;
const getOne = (model, includeOptions, options = {}) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idField = options.idField || 'id';
            const id = req.params.id;
            // @ts-ignore - Dynamic access to Prisma models
            const doc = yield prisma[model].findUnique(Object.assign({ where: { [idField]: id } }, (includeOptions && { include: includeOptions })));
            if (!doc) {
                return next(new appError_1.default(`No ${model.toString} found with that ID`, 404));
            }
            res.status(200).json({
                status: "success",
                data: {
                    [model]: doc,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
};
exports.getOne = getOne;
const createOne = (model, options = {}) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // @ts-ignore - Dynamic access to Prisma models
            const doc = yield prisma[model].create(Object.assign({ data: req.body }, (options.populateFields && { include: options.populateFields })));
            res.status(201).json({
                status: "success",
                data: {
                    [model]: doc,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
};
exports.createOne = createOne;
const updateOne = (model, options = {}) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idField = options.idField || 'id';
            const id = req.params.id;
            // @ts-ignore - Dynamic access to Prisma models
            const doc = yield prisma[model].update(Object.assign({ where: { [idField]: id }, data: req.body }, (options.populateFields && { include: options.populateFields })));
            res.status(200).json({
                status: "success",
                data: {
                    [model]: doc,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
};
exports.updateOne = updateOne;
const deleteOne = (model, options = {}) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const idField = options.idField || 'id';
            const id = req.params.id;
            // @ts-ignore - Dynamic access to Prisma models
            const doc = yield prisma[model].delete({
                where: { [idField]: id },
            });
            res.status(204).json({
                status: "success",
                data: null,
            });
        }
        catch (err) {
            next(err);
        }
    });
};
exports.deleteOne = deleteOne;
const getAllWithFilters = (model, filterFields = [], options = {}) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // 1) Build the filter object
            const filter = {};
            filterFields.forEach(field => {
                if (req.query[field]) {
                    filter[field] = req.query[field];
                }
            });
            // Add search functionality if searchFields provided
            if (options.searchFields && req.query.search) {
                const searchTerm = req.query.search;
                filter.OR = options.searchFields.map(field => ({
                    [field]: { contains: searchTerm, mode: 'insensitive' }
                }));
            }
            // 2) Pagination
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const skip = (page - 1) * limit;
            // 3) Execute query
            // @ts-ignore - Dynamic access to Prisma models
            const docs = yield prisma[model].findMany(Object.assign(Object.assign({ where: filter, skip, take: limit }, (req.query.sort && {
                orderBy: {
                    [req.query.sort]: req.query.order || 'asc'
                }
            })), (options.populateFields && { include: options.populateFields })));
            // 4) Get total count for pagination
            // @ts-ignore - Dynamic access to Prisma models
            const total = yield prisma[model].count({ where: filter });
            res.status(200).json({
                status: "success",
                results: docs.length,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit
                },
                data: {
                    [model]: docs,
                },
            });
        }
        catch (err) {
            next(err);
        }
    });
};
exports.getAllWithFilters = getAllWithFilters;
