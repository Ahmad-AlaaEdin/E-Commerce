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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_local_1 = require("passport-local");
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email)
            return done(new Error('No email found in Google profile'));
        let user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            user = yield prisma_1.default.user.create({
                data: {
                    email,
                    name: profile.displayName,
                    role: 'USER',
                    provider: 'google',
                },
            });
        }
        done(null, user);
    }
    catch (error) {
        done(error);
    }
})));
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email' }, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return done(null, false, { message: 'Incorrect email.' });
        if (!user.password)
            return done(null, false, { message: 'No password set, please use OAuth.' });
        const isValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isValid)
            return done(null, false, { message: 'Incorrect password.' });
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
})));
exports.default = passport_1.default;
