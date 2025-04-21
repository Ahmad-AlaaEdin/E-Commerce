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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.logout = exports.resetPassword = exports.forgotPassword = exports.restrictTo = exports.isLoggedIn = exports.protect = exports.login = exports.signup = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../utils/auth");
const email_1 = __importDefault(require("../utils/email"));
const crypto_1 = __importDefault(require("crypto"));
require("../types/express");
const signToken = (userID) => {
    console.log("signToken");
    return jsonwebtoken_1.default.sign({ id: userID }, process.env.JWT_SECRET || "", {
        expiresIn: "30d",
    });
};
const sendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(Date.now() +
            parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "30") *
                24 *
                60 *
                60 *
                1000),
        httpOnly: true,
    };
    console.log("sendToken");
    if (process.env.NODE_ENV === "production")
        cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    // Remove password from output
    const { password: userPassword } = user, safeUser = __rest(user, ["password"]);
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            safeUser,
        },
    });
};
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, passwordConfirm } = req.body;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
    });
    if (user) {
        throw new appError_1.default("User already exists", 400);
    }
    if (password !== passwordConfirm) {
        throw new appError_1.default("Passwords do not match", 400);
    }
    const newUser = yield prisma_1.default.user.create({ data: { email, password, name } });
    sendToken(newUser, 201, res);
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new appError_1.default("Please provide email and password", 400);
    }
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
    });
    if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
        throw new appError_1.default("Incorrect  Email or Password", 401);
    }
    sendToken(user, 200, res);
});
exports.login = login;
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Check Token
    console.log("protect");
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.default("You are not logged in", 401));
    }
    //Verification Token
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    //Check if user still exist
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: decoded.id,
        },
    });
    if (!user)
        throw new appError_1.default("The User belonging to this token no longer exists.", 401);
    //Check if password changed after token was issued
    if ((0, auth_1.changedPasswordAfter)(user, decoded.iat)) {
        throw new appError_1.default("User Recently Changed password! please log in again.", 401);
    }
    req.user = user;
    console.log("protect22");
    next();
});
exports.protect = protect;
const isLoggedIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = jsonwebtoken_1.default.verify(req.cookies.jwt, process.env.JWT_SECRET || "");
            // 2) Check if user still exists
            const currentUser = yield prisma_1.default.user.findUnique({
                where: {
                    id: decoded.id,
                },
            });
            if (!currentUser) {
                return next();
            }
            // 3) Check if user changed password after the token was issued
            if ((0, auth_1.changedPasswordAfter)(currentUser, decoded.iat)) {
                return next();
            }
            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        }
        catch (err) {
            return next();
        }
    }
    next();
});
exports.isLoggedIn = isLoggedIn;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new appError_1.default("You are not logged in", 401));
        }
        if (!roles.includes(req.user.role)) {
            throw new appError_1.default("You do not have a permission to perform this action", 403);
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Get user based on POSTed email
    const user = yield prisma_1.default.user.findUnique({
        where: { email: req.body.email },
    });
    if (!user) {
        return next(new appError_1.default("There is no user with email address.", 404));
    }
    // 2) Generate the random reset token
    const resetToken = (0, auth_1.createPasswordResetToken)(user);
    yield prisma_1.default.user.update({
        where: {
            id: user.id,
        },
        data: {
            passwordResetToken: user.passwordResetToken,
            passwordResetExpiresAt: user.passwordResetExpiresAt,
        },
    });
    // 3) Send it to user's email
    try {
        const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
        yield new email_1.default(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        });
    }
    catch (err) {
        yield prisma_1.default.user.update({
            where: {
                id: user.id,
            },
            data: {
                passwordResetToken: null,
                passwordResetExpiresAt: null,
            },
        });
        console.log(err);
        return next(new appError_1.default("There was an error sending the email. Try again later!", 500));
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //Get user based on Token
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    console.log(hashedToken);
    const user = yield prisma_1.default.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpiresAt: {
                gt: new Date(), // equivalent to `$gt: Date.now()` in MongoDB
            },
        },
    });
    if (!user) {
        return next(new appError_1.default("Token is invalid or has expired", 400));
    }
    if (req.body.password !== req.body.passwordConfirm) {
        return next(new appError_1.default("Passwords do not match", 400));
    }
    user.password = req.body.password;
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            password: req.body.password,
            passwordResetToken: null,
            passwordResetExpiresAt: null,
        },
    });
    sendToken(updatedUser, 200, res);
});
exports.resetPassword = resetPassword;
const logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};
exports.logout = logout;
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return next(new appError_1.default("You are not logged in", 401));
    }
    if (!req.body.currentPassword ||
        !req.body.password ||
        !req.body.passwordConfirm) {
        throw new appError_1.default("Please provide current password, new password and confirm password", 400);
    }
    if (!(yield bcrypt_1.default.compare(req.body.currentPassword, req.user.password))) {
        throw new appError_1.default("Incorrect  Email or Password", 401);
    }
    if (req.body.password !== req.body.passwordConfirm) {
        throw new appError_1.default("Passwords do not match", 400);
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: req.user.id },
        data: {
            password: req.body.password,
            passwordResetToken: null,
            passwordResetExpiresAt: null,
        },
    });
    sendToken(updatedUser, 200, res);
});
exports.updatePassword = updatePassword;
