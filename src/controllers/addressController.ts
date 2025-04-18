import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import AppError from "../utils/appError";

// Get current user's address
export const getMyAddress = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  const address = await prisma.address.findUnique({ where: { userId: req.user.id } });
  res.status(200).json({ status: "success", data: { address } });
};

// Update or create address
export const upsertAddress = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  const { street, city, zip } = req.body;
  const address = await prisma.address.upsert({
    where: { userId: req.user.id },
    update: { street, city, zip },
    create: { userId: req.user.id, street, city, zip },
  });
  res.status(200).json({ status: "success", data: { address } });
};