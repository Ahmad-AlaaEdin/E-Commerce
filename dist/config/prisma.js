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
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateSlug = (name) => (0, slugify_1.default)(name, { lower: true, strict: true });
const prisma = new client_1.PrismaClient().$extends({
    query: {
        category: {
            create(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                    if (args.data.name)
                        args.data.slug = generateSlug(args.data.name);
                    return query(args);
                });
            },
            update(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                    if (args.data.name)
                        args.data.slug = generateSlug(args.data.name);
                    return query(args);
                });
            },
        },
        user: {
            create(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                    if (args.data.password) {
                        args.data.password = yield bcrypt_1.default.hash(args.data.password, 12);
                    }
                    args.data.passwordChangedAt = new Date();
                    console.log("hashed");
                    return query(args);
                });
            },
            update(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                    if (args.data.password && typeof args.data.password === 'string') {
                        const hashedPassword = yield bcrypt_1.default.hash(args.data.password, 12);
                        args.data.password = hashedPassword;
                        console.log("hashed");
                    }
                    return query(args);
                });
            },
        },
    },
});
exports.default = prisma;
