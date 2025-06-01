import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { Product } from "@prisma/client";
import AppError from "../utils/appError";
import multer from "multer";
import { FileFilterCallback } from "multer";
import uploadFromBuffer from "../config/cloudinary";

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not An Image! Please Upload Only Images ", 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
export const uploadProductPhoto = upload.single("photo");

export const createProduct = async (req: Request, res: Response) => {
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const imageUrl = await uploadFromBuffer(fileBuffer, "products");
    req.body.image = imageUrl;
  }
  req.body.price = Number(req.body.price);
  const product: Product = await prisma.product.create({ data: req.body });
  res.status(201).json(product);
};

const ITEMS_PER_PAGE = 12;

// Helper function to parse pagination parameters
const getPaginationParams = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = ITEMS_PER_PAGE;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Helper function to get sort parameters
const getSortParams = (sortQuery: string | undefined) => {
  switch (sortQuery) {
    case 'price-asc':
      return { price: 'asc' as const };
    case 'price-desc':
      return { price: 'desc' as const };
    case 'name-asc':
      return { name: 'asc' as const };
    case 'name-desc':
      return { name: 'desc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
};

// Get all products with pagination and sorting
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req.query.sort as string);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: sort,
        include: {
          category: true,
          subCategory: true,
        },
      }),
      prisma.product.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render('pages/products', {
      title: 'All Products',
      products,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// Get products by category
export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req.query.sort as string);

    const category = await prisma.category.findUnique({
      where: { slug },
      include: { subCategories: true },
    });

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: category.id },
        skip,
        take: limit,
        orderBy: sort,
        include: {
          category: true,
          subCategory: true,
        },
      }),
      prisma.product.count({
        where: { categoryId: category.id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render('pages/products', {
      title: category.name,
      category,
      products,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// Get products by subcategory
export const getProductsBySubCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categorySlug, subCategorySlug } = req.params;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req.query.sort as string);

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    const subCategory = await prisma.subCategory.findFirst({
      where: {
        slug: subCategorySlug,
        categoryId: category.id,
      },
    });

    if (!subCategory) {
      return next(new AppError('Subcategory not found', 404));
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { subCategoryId: subCategory.id },
        skip,
        take: limit,
        orderBy: sort,
        include: {
          category: true,
          subCategory: true,
        },
      }),
      prisma.product.count({
        where: { subCategoryId: subCategory.id },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render('pages/products', {
      title: `${subCategory.name} - ${category.name}`,
      category,
      subCategory,
      products,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchQuery = req.query.q as string;
    const { page, limit, skip } = getPaginationParams(req);
    const sort = getSortParams(req.query.sort as string);

    if (!searchQuery) {
      return res.redirect('/products');
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        skip,
        take: limit,
        orderBy: sort,
        include: {
          category: true,
          subCategory: true,
        },
      }),
      prisma.product.count({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.render('pages/products', {
      title: `Search Results: ${searchQuery}`,
      products,
      searchQuery,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// Get product details
export const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
      },
    });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: product.id },
      },
      take: 4,
    });

    res.render('pages/product-details', {
      title: product.name,
      product,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  await prisma.product.delete({
    where: { id: req.params.id },
  });
  res.status(204).json({});
};
export const updateProduct = async (req: Request, res: Response) => {
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const imageUrl = await uploadFromBuffer(fileBuffer, "products");
    req.body.image = imageUrl;
  }
  if (req.body.price) req.body.price = Number(req.body.price);
  const product: Product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json(product);
};
