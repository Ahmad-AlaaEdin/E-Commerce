import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Product } from "@prisma/client";

export const createProduct = async (req: Request, res: Response) => {
  const product: Product = await prisma.product.create(req.body);
  res.json(product);
};
