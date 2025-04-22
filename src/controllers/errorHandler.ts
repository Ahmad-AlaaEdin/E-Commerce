import AppError from "../utils/appError";
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

// Handle Prisma validation errors
const handlePrismaValidationError = (err: Prisma.PrismaClientValidationError) => {
  const message = `Validation error: ${err.message.split('\n').pop()}`;
  return new AppError(message, 400);
};

// Handle Prisma known request errors
const handlePrismaKnownRequestError = (err: Prisma.PrismaClientKnownRequestError) => {
  // Handle unique constraint violations (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target as string[];
    const field = target ? target.join(', ') : 'field';
    return new AppError(`Duplicate ${field} value. Please use another value!`, 400);
  }
  
  // Handle record not found (P2001)
  if (err.code === 'P2001') {
    return new AppError(`Record not found: ${err.meta?.model_name || 'record'}`, 404);
  }
  
  // Handle foreign key constraint failures (P2003)
  if (err.code === 'P2003') {
    const field = err.meta?.field_name as string;
    return new AppError(`Related ${field} not found.`, 400);
  }
  
  // Handle other Prisma errors
  return new AppError(`Database error: ${err.message}`, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: any, req: Request, res: Response) => {
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

const sendErrorProd = (err: any, req: Request, res: Response) => {
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
  return res.status(err.statusCode).render('error', {
    title: 'Error',
    msg: 'Something went wrong!', // <-- ensure 'msg' is passed
    user: req.user
  });
};

export const globalErrorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
console.log("Global error handler");
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      error = handlePrismaKnownRequestError(err);
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      error = handlePrismaValidationError(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};
