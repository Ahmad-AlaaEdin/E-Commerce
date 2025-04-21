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
exports.upsertAddress = exports.getMyAddress = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
// Get current user's address
const getMyAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    const address = yield prisma_1.default.address.findUnique({ where: { userId: req.user.id } });
    res.status(200).json({ status: "success", data: { address } });
});
exports.getMyAddress = getMyAddress;
// Update or create address
const upsertAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return next(new appError_1.default("You are not logged in", 401));
    const { street, city, zip } = req.body;
    const address = yield prisma_1.default.address.upsert({
        where: { userId: req.user.id },
        update: { street, city, zip },
        create: { userId: req.user.id, street, city, zip },
    });
    res.status(200).json({ status: "success", data: { address } });
});
exports.upsertAddress = upsertAddress;
