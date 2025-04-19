import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import AppError from "../utils/appError";

// Get current user's cart
export const getMyCart = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { 
      items: { 
        include: { 
          product: true 
        } 
      } 
    },
  });
  res.status(200).json({ status: "success", data: { cart } });
};

// Add item to cart
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  const { productId, quantity } = req.body;
  if (!productId || !quantity) return next(new AppError("Product and quantity required", 400));

  // Find or create cart
  let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: req.user.id } });
  }

  // Check if item exists in cart
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  let cartItem;
  if (existingItem) {
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  res.status(200).json({ status: "success", data: { cartItem } });
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  const { itemId } = req.params;
  await prisma.cartItem.delete({ where: { id:itemId } });
  res.status(204).json({ status: "success", data: null });
};

// Clear cart
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  res.status(204).json({ status: "success", data: null });
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  
  const { itemId } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }
  
  try {
    const cartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true }
    });
    
    res.status(200).json({
      status: "success",
      data: { cartItem }
    });
  } catch (error) {
    return next(new AppError("Cart item not found", 404));
  }
};