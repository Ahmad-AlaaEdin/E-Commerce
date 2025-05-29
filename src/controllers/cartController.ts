import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import AppError from "../utils/appError";

// Get current user's cart
export const getMyCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // For guest users, cart will be handled client-side
    if (!req.user) {
      res.status(200).json({ 
        status: "success", 
        data: { 
          cart: null,
          isGuest: true
        } 
      });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    // Calculate total
    const total = cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    
    res.status(200).json({ 
      status: "success", 
      data: { 
        cart,
        total,
        isGuest: false
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(200).json({ 
        status: "success",
        data: { isGuest: true }
      });
      return;
    }

    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      next(new AppError("Product and quantity required", 400));
      return;
    }

    // Check product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      next(new AppError("Product not found", 404));
      return;
    }

    if (product.stock < quantity) {
      next(new AppError(`Only ${product.stock} items available`, 400));
      return;
    }

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
      // Check if total quantity exceeds stock
      if (existingItem.quantity + quantity > product.stock) {
        next(new AppError(`Cannot add more items. Only ${product.stock} available`, 400));
        return;
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + quantity,
          price: product.price // Update price in case it changed
        },
        include: { product: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { 
          cartId: cart.id, 
          productId, 
          quantity,
          price: product.price 
        },
        include: { product: true }
      });
    }

    res.status(200).json({ 
      status: "success", 
      data: { 
        cartItem,
        isGuest: false 
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(200).json({ 
        status: "success",
        data: { isGuest: true }
      });
      return;
    }

    const { itemId } = req.params;

    // Verify the item belongs to the user's cart
    const cartItem = await prisma.cartItem.findFirst({
      where: { 
        id: itemId,
        cart: {
          userId: req.user.id
        }
      }
    });

    if (!cartItem) {
      next(new AppError("Cart item not found or unauthorized", 404));
      return;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(200).json({ 
        status: "success",
        data: { isGuest: true }
      });
      return;
    }

    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));

  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  // Verify the item belongs to the user's cart and check stock
  const cartItem = await prisma.cartItem.findFirst({
    where: { 
      id: itemId,
      cart: {
        userId: req.user.id
      }
    },
    include: { product: true }
  });

  if (!cartItem) {
    return next(new AppError("Cart item not found or unauthorized", 404));
  }

  if (quantity > cartItem.product.stock) {
    return next(new AppError(`Cannot update quantity. Only ${cartItem.product.stock} available`, 400));
  }

  try {
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { 
        quantity,
        price: cartItem.product.price // Update price in case it changed
      },
      include: { product: true },
    });

    res.status(200).json({
      status: "success",
      data: { cartItem: updatedCartItem },
    });
  } catch (error) {
    return next(new AppError("Failed to update cart item", 500));
  }
};

// Merge guest cart with user cart after login
export const mergeGuestCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("You are not logged in", 401));
      return;
    }

    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      next(new AppError("Invalid cart items", 400));
      return;
    }

    // Process each item from the guest cart
    for (const item of items) {
      await addToCart({
        ...req,
        body: {
          productId: item.productId,
          quantity: item.quantity
        }
      } as Request, res, next);
    }

    res.status(200).json({
      status: "success",
      message: "Guest cart merged successfully"
    });
  } catch (error) {
    next(error);
  }
};
