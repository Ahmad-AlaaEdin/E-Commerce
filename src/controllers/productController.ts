import { Request, Response } from "express";
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

export const getAllProducts = async (req: Request, res: Response) => {
  const query = req.query.search as string | undefined;

  const products: Product[] = await prisma.product.findMany({
    where: {
      name: query
        ? {
            contains: query,
            mode: "insensitive" as const,
          }
        : undefined,
    },
  });

  res.status(200).json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const product: Product | null = await prisma.product.findUnique({
    where: { id: req.params.id },
  });
  if (!product) throw new AppError("Product not found", 404);
  res.status(200).json(product);
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
