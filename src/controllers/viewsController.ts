import { Request, Response } from "express";
import prisma from "../config/prisma";
import { User } from "@prisma/client";

interface AuthRequest extends Request {
  user?: User;
}

export const getLoginForm = (req: Request, res: Response) => {
  res.render("pages/login", {
    title: "Login",
  });
};

export const getSignupForm = (req: Request, res: Response) => {
  res.render("pages/signup", {
    title: "Sign Up",
  });
};

export const getOverview = async (req: Request, res: Response) => {
  try {
    // Get recent products instead of featured ones
    const recentProducts = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    res.render("pages/home", {
      title: "Home",
      featuredProducts: recentProducts,
      categories,
    });
  } catch (error) {
    console.error("Error in getOverview:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Something went wrong!",
    });
  }
};

export const getAccount = (req: Request, res: Response) => {
  res.render("pages/account", {
    title: "My Account",
    user: req.user,
  });
};

export const getCategoryProducts = async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: {
        slug: req.params.slug,
      },
      include: {
        products: true,
        subCategories: true,
      },
    });

    if (!category) {
      return res.status(404).render("pages/error", {
        title: "Not Found",
        message: "Category not found!",
      });
    }

    res.render("pages/category", {
      title: category.name,
      category,
    });
  } catch (error) {
    console.error("Error in getCategoryProducts:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Something went wrong!",
    });
  }
};

export const getSubCategoryProducts = async (req: Request, res: Response) => {
  try {
    const subCategory = await prisma.subCategory.findFirst({
      where: {
        slug: req.params.slug,
        category: {
          slug: req.params.category,
        },
      },
      include: {
        products: true,
        category: true,
      },
    });

    if (!subCategory) {
      return res.status(404).render("pages/error", {
        title: "Not Found",
        message: "Subcategory not found!",
      });
    }

    res.render("pages/subcategory", {
      title: subCategory.name,
      subCategory,
    });
  } catch (error) {
    console.error("Error in getSubCategoryProducts:", error);
    res.status(500).render("pages/error", {
      title: "Error",
      message: "Something went wrong!",
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        category: true,
        subCategory: true,
      },
    });

    if (!product) {
      return res.status(404).render("pages/error", {
        title: "Not Found",
        message: "Product not found!",
      });
    }

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: {
          id: product.id,
        },
      },
      take: 4,
    });

    res.render("pages/product", {
      title: product.name,
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error("Error in getProduct:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Something went wrong!",
    });
  }
};

export const getCheckout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect("/login");
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.redirect("/cart");
    }

    res.render("pages/checkout", {
      title: "Checkout",
      cart,
    });
  } catch (error) {
    console.error("Error in getCheckout:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Something went wrong!",
    });
  }
};
