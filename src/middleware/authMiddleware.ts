import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import AppError from "../utils/appError";


export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError("Please log in to access this resource", 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      iat: number;
    };

    // 3) Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401)
      );
    }

    // 4) Check if user changed password after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = user.passwordChangedAt.getTime() / 1000;
      if (decoded.iat < changedTimestamp) {
        return next(
          new AppError("User recently changed password! Please log in again", 401)
        );
      }
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Invalid token. Please log in again", 401));
  }
}; 