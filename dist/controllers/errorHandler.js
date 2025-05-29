"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const client_1 = require("@prisma/client");
// Handle Prisma validation errors
const handlePrismaValidationError = (err) => {
    const message = `Validation error: ${err.message.split('\n').pop()}`;
    return new appError_1.default(message, 400);
};
// Handle Prisma known request errors
const handlePrismaKnownRequestError = (err) => {
    var _a, _b, _c;
    // Handle unique constraint violations (P2002)
    if (err.code === 'P2002') {
        const target = (_a = err.meta) === null || _a === void 0 ? void 0 : _a.target;
        const field = target ? target.join(', ') : 'field';
        return new appError_1.default(`Duplicate ${field} value. Please use another value!`, 400);
    }
    // Handle record not found (P2001)
    if (err.code === 'P2001') {
        return new appError_1.default(`Record not found: ${((_b = err.meta) === null || _b === void 0 ? void 0 : _b.model_name) || 'record'}`, 404);
    }
    // Handle foreign key constraint failures (P2003)
    if (err.code === 'P2003') {
        const field = (_c = err.meta) === null || _c === void 0 ? void 0 : _c.field_name;
        return new appError_1.default(`Related ${field} not found.`, 400);
    }
    // Handle other Prisma errors
    return new appError_1.default(`Database error: ${err.message}`, 400);
};
const handleJWTError = () => new appError_1.default('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new appError_1.default('Your token has expired! Please log in again.', 401);
const sendErrorDev = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // B) RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
};
const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // A) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
    // B) RENDERED WEBSITE
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message, // <-- ensure 'msg' is passed
            user: req.user
        });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('pages/error', {
        title: 'Error',
        msg: 'Something went wrong!', // <-- ensure 'msg' is passed
        user: req.user
    });
};
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    console.log("Global error handler");
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = Object.assign({}, err);
        error.message = err.message;
        // Handle Prisma errors
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            error = handlePrismaKnownRequestError(err);
        }
        else if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            error = handlePrismaValidationError(err);
        }
        else if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        else if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }
        sendErrorProd(error, req, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
