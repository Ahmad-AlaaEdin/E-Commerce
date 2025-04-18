import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import AppError from "../utils/appError";

// Mark an order as paid (mock implementation)
export const payOrder = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  const { orderId, paymentMethod, transactionId } = req.body;
  const order = await prisma.order.findUnique({ where: { id: orderId, userId: req.user.id } });
  if (!order) return next(new AppError("Order not found", 404));

  const payment = await prisma.payment.create({
    data: {
      orderId,
      paymentMethod,
      transactionId,
      status: "COMPLETED",
    },
  });

  res.status(200).json({ status: "success", data: { payment } });
};