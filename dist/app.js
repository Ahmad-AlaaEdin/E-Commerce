"use strict";
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
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.set("view engine", "ejs");
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use("/", viewsRoutes_1.default);
app.use("/api/v1/product", productRoutes_1.default);
app.use("/api/v1/category", categoryRoutes_1.default);
app.use("/api/v1/subcategory", subCatgoryRoutes_1.default);
app.use("/api/v1/users", userRoutes_1.default);
app.use("/api/v1/cart", cartRoutes_1.default);
app.use("/api/v1/orders", orderRoutes_1.default);
app.use("/api/v1/payments", paymentRoutes_1.default);
app.use("/api/v1/address", addressRoutes_1.default);
app.use('/api/v1/payments/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
app.use((req, res) => {
    res.status(404).json({
        status: "fail",
        message: "Invalid Endpoint",
    });
});
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
