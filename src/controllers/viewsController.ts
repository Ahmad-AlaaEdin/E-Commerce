import { Request, Response } from 'express';
import prisma from "../config/prisma";
import { Product } from "@prisma/client";



export const getLoginForm = (req:Request, res:Response) => {
    res.status(200).render('login', {
      title: 'Log into your account',
    });
  };
  export const getSignupForm = (req:Request, res:Response) => {
    res.status(200).render('signup', {
      title: 'Create Account',
    });
  };

  export const getOverview = async (req: Request, res: Response) => {
    const products = await prisma.product.findMany();
    const categories = await prisma.category.findMany({
      include: { subCategories: true }
    });
    res.status(200).render('home', {
      title: 'All Products',
      products,
      categories
    });
  };

  export const getAccount = (req: Request, res: Response) => {
    res.status(200).render('account', {
        title: 'Your account',
        user: req.user,
      });
  };
  export const getCategoryProducts = async (req: Request, res: Response) => {
    
    const { slug } = req.params;
    console.log(slug);
    const category = await prisma.category.findUnique({
      where: { slug },
    });
console.log(category);

    let products:Product[] = [];
    if (category) {
      products = await prisma.product.findMany({
        where: { categoryId: category.id },
      });
    }

    const categories = await prisma.category.findMany({
      include: { subCategories: true }
    });

    res.status(200).render('home', {
      title: category ? `${category.name} Products` : 'Products',
      products,
      categories,
      user: req.user,
    });
  };
  export const getSubCategoryProducts = async (req: Request, res: Response) => {
    const { category, slug } = req.params;
    // Find the parent category by slug
    const parentCategory = await prisma.category.findUnique({
      where: { slug: category },
    });

    // Find the subcategory by slug and parent category id
    const subCategory = await prisma.subCategory.findFirst({
      where: {
        slug: slug,
        categoryId: parentCategory ? parentCategory.id : undefined,
      },
    });

    let products: Product[] = [];
    if (subCategory) {
      products = await prisma.product.findMany({
        where: { subCategoryId: subCategory.id },
      });
    }

    const categories = await prisma.category.findMany({
      include: { subCategories: true }
    });

    res.status(200).render('home', {
      title: subCategory ? `${subCategory.name} Products` : 'Products',
      products,
      categories,
      user: req.user,
    });
  };