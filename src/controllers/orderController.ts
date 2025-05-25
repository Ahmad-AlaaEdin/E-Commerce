import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import AppError from "../utils/appError";

// Place an order from the current user's cart
export const placeOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0)
    return next(new AppError("Cart is empty", 400));

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      total,
      orderItems: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: { orderItems: true },
  });

  // Clear the cart
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.status(201).json({ status: "success", data: { order } });
};

// Get current user's orders
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  console.log(req.user);
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { orderItems: true },
  });
  res.status(200).json({ status: "success", data: { orders } });
};
