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
exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.getUser = exports.getMe = exports.deleteMe = exports.updateMe = exports.uploadUserPhoto = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const prisma_1 = __importDefault(require("../config/prisma"));
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
exports.uploadUserPhoto = upload.single("photo");
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};
const updateMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.file);
    console.log(req.body);
    if (req.file) {
        const fileBuffer = req.file.buffer;
        const imageUrl = yield (0, cloudinary_1.default)(fileBuffer, "users");
        req.body.photo = imageUrl;
    }
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm)
        return next(new appError_1.default("This route is not for password updates, use /updatePassword", 400));
    const filteredBody = filterObj(req.body, "name", "phone", "photo");
    // if (req.file) filteredBody.photo = req.file.filename;
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    // Update user in DB using Prisma
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: req.user.id },
        data: filteredBody,
    });
    res.status(200).json({
        status: "success",
        data: { user: updatedUser },
    });
});
exports.updateMe = updateMe;
const deleteMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    yield prisma_1.default.user.update({
        where: { id: req.user.id },
        data: { active: false },
    });
    res.status(204).json({
        status: "success",
        data: null,
    });
});
exports.deleteMe = deleteMe;
const getMe = (req, res, next) => {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    req.params.id = req.user.id.toString();
    next();
};
exports.getMe = getMe;
// Get a single user by ID
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: req.params.id },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 404));
    }
    res.status(200).json({ status: "success", data: { user } });
});
exports.getUser = getUser;
// Get all users
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_1.default.user.findMany();
    res
        .status(200)
        .json({ status: "success", results: users.length, data: { users } });
});
exports.getAllUsers = getAllUsers;
// Update a user by ID
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.status(200).json({ status: "success", data: { user } });
});
exports.updateUser = updateUser;
// Delete a user by ID
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.user.delete({
        where: { id: req.params.id },
    });
    res.status(204).json({ status: "success", data: null });
});
exports.deleteUser = deleteUser;
