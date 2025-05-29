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
const express_1 = __importDefault(require("express"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const subCatgoryRoutes_1 = __importDefault(require("./routes/subCatgoryRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorHandler_1 = require("./controllers/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const viewsRoutes_1 = __importDefault(require("./routes/viewsRoutes"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
const prisma_1 = __importDefault(require("./config/prisma"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const connect_redis_1 = require("connect-redis");
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const app = (0, express_1.default)();
const redisClient = (0, redis_1.createClient)();
redisClient.connect().catch(console.error);
// View engine setup
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// EJS Layouts setup
app.use(express_ejs_layouts_1.default);
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    store: new connect_redis_1.RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
// Serialize/deserialize user
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from session
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (err) {
        done(err);
    }
}));
// Routes
app.use("/", viewsRoutes_1.default);
app.use("/api/v1/users", userRoutes_1.default);
app.use("/api/v1/product", productRoutes_1.default);
app.use("/api/v1/category", categoryRoutes_1.default);
app.use("/api/v1/subcategory", subCatgoryRoutes_1.default);
app.use("/api/v1/cart", cartRoutes_1.default);
app.use("/api/v1/orders", orderRoutes_1.default);
app.use("/api/v1/payments", paymentRoutes_1.default);
app.use("/api/v1/address", addressRoutes_1.default);
app.use("/api/v1/payments/webhook", express_1.default.raw({ type: "application/json" }));
// Error handling
app.use((req, res) => {
    res.status(404).render("pages/error", {
        title: "Not Found",
        message: "The page you are looking for does not exist."
    });
});
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
