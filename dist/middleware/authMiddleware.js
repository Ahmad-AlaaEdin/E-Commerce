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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // 1) Get token from header
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        else if ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt) {
            token = req.cookies.jwt;
        }
        if (!token) {
            return next(new appError_1.default("Please log in to access this resource", 401));
        }
        // 2) Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 3) Check if user still exists
        const user = yield prisma_1.default.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return next(new appError_1.default("The user belonging to this token no longer exists", 401));
        }
        // 4) Check if user changed password after token was issued
        if (user.passwordChangedAt) {
            const changedTimestamp = user.passwordChangedAt.getTime() / 1000;
            if (decoded.iat < changedTimestamp) {
                return next(new appError_1.default("User recently changed password! Please log in again", 401));
            }
        }
        // Grant access to protected route
        req.user = user;
        next();
    }
    catch (error) {
        next(new appError_1.default("Invalid token. Please log in again", 401));
    }
});
exports.protect = protect;
