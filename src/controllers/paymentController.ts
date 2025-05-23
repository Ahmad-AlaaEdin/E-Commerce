import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import prisma from "../config/prisma";
import AppError from "../utils/appError";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const getCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get the cart
    const { cartId } = req.params;

    if (!req.user) {
      return next(new AppError("You must be logged in to checkout", 401));
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return next(new AppError("No cart found with that ID", 404));
    }

    if (cart.userId !== req.user.id) {
      return next(
        new AppError("You do not have permission to checkout this cart", 403)
      );
    }

    // 2) Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    // 3) Create checkout session
    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.description || undefined,
          images: item.product.image ? [item.product.image] : undefined,
        },
        unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${req.protocol}://${req.get(
        "host"
      )}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get("host")}/cart`,
      customer_email: req.user.email,
      client_reference_id: cart.id,
      line_items: lineItems,
    });

    // 4) Create order in pending status
    await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        status: "PENDING",
        paymentIntentId: session.payment_intent as string,
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    // 5) Send response
    res.status(200).json({
      status: "success",
      session,
    });
  } catch (err) {
    next(err);
  }
};

export const webhookCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const signature = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    res.status(400).send(`Webhook error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Update order status to paid
    await prisma.order.update({
      where: { paymentIntentId: session.payment_intent as string },
      data: { status: "PAID" },
    });

    // Clear the cart
    if (session.client_reference_id) {
      await prisma.cartItem.deleteMany({
        where: { cartId: session.client_reference_id },
      });
    }
  }

  res.status(200).json({ received: true });
};

export const paymentSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return next(new AppError("No session ID provided", 400));
    }

    const session = await stripe.checkout.sessions.retrieve(
      session_id as string
    );

    if (!session) {
      return next(new AppError("Invalid session ID", 400));
    }

    const order = await prisma.order.findFirst({
      where: { paymentIntentId: session.payment_intent as string },
      include: { orderItems: true },
    });

    if (!order) {
      return next(new AppError("No order found for this session", 404));
    }

    res.status(200).render("payment-success", {
      title: "Payment Successful",
      order,
    });
  } catch (err) {
    next(err);
  }
};

export const payOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(
        new AppError("You must be logged in to pay for an order", 401)
      );
    }

    const { orderId } = req.body;

    if (!orderId) {
      return next(new AppError("Order ID is required", 400));
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return next(
        new AppError("Order not found or does not belong to you", 404)
      );
    }

    // Create line items for Stripe
    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.description || undefined,
          images: item.product.image ? [item.product.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/orders`,
      cancel_url: `${req.protocol}://${req.get("host")}/orders`,
      customer_email: req.user.email,
      client_reference_id: order.id,
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        userId: req.user.id,
      },
    });

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentIntentId: session.payment_intent as string,
      },
    });

    // Send response
    res.status(200).json({
      status: "success",
      session,
    });
  } catch (err) {
    next(err);
  }
};
