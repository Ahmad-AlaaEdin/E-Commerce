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
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.restrictTo = exports.isLoggedIn = exports.signup = exports.logout = exports.googleCallback = exports.googleAuth = exports.login = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const appError_1 = __importDefault(require("../utils/appError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../utils/auth");
const email_1 = __importDefault(require("../utils/email"));
const crypto_1 = __importDefault(require("crypto"));
const passport_1 = __importDefault(require("../config/passport"));
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate("local", (err, user, info) => {
        console.log("Login attempt:", { err, user, info }); // Add this line
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).json({ status: "fail", message: (info === null || info === void 0 ? void 0 : info.message) || "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err)
                return next(err);
            return res.status(200).json({
                status: "success",
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                }
            });
        });
    })(req, res, next);
});
exports.login = login;
const googleAuth = (req, res, next) => {
    passport_1.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};
exports.googleAuth = googleAuth;
const googleCallback = (req, res, next) => {
    passport_1.default.authenticate("google", {
        failureRedirect: "/error",
        successRedirect: "/",
    })(req, res, next);
};
exports.googleCallback = googleCallback;
const logout = (req, res, next) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            res.json({ message: "Logged out" });
        });
    });
};
exports.logout = logout;
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
    const { password: _ } = newUser, safeUser = __rest(newUser, ["password"]);
    res.status(201).json({
        status: "success",
        data: {
            user: safeUser,
        },
    });
});
exports.signup = signup;
const isLoggedIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        return next(new appError_1.default("You are not logged in", 401));
    }
});
exports.isLoggedIn = isLoggedIn;
// Update the restrictTo function
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user exists and has a role property
        if (!req.user || !req.user.role) {
            return next(new appError_1.default("You do not have permission to perform this action", 403));
        }
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.default("You do not have permission to perform this action", 403));
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
    yield prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            password: req.body.password,
            passwordResetToken: null,
            passwordResetExpiresAt: null,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Password updated successfully",
    });
});
exports.resetPassword = resetPassword;
// Update the updatePassword function
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Get user from collection
        if (!req.user || !req.user.id) {
            return next(new appError_1.default("You are not logged in", 401));
        }
        const user = yield prisma_1.default.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            return next(new appError_1.default("User not found", 404));
        }
        if (user.provider !== "System" || !user.password)
            return next(new appError_1.default("Please Login With System Account", 401));
        // 2) Check if POSTed current password is correct
        if (!(yield bcrypt_1.default.compare(req.body.currentPassword, user.password))) {
            return next(new appError_1.default("Your current password is wrong", 401));
        }
        // 3) If so, update password
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 12);
        yield prisma_1.default.user.update({
            where: { id: req.user.id },
            data: {
                password: hashedPassword,
                passwordChangedAt: new Date(),
            },
        });
        // 4) Log user in, send JWT
        res.status(200).json({
            status: "success",
            message: "Password updated successfully",
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updatePassword = updatePassword;
