import { Request, Response,NextFunction } from "express";
import AppError from "../utils/appError";


export const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response
  ,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const status = "error";

  res.status(statusCode).json({
    status,
    message: error.message || "Internal Server Error",
  });
};
