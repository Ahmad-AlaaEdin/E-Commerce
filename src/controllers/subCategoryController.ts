import { Request, Response } from "express";
import prisma from "../config/prisma";
import { SubCategory } from "@prisma/client";
import AppError from "../utils/appError";

export const createSubCategory = async (req: Request, res: Response) => {
  const category: SubCategory = await prisma.subCategory.create({
    data: req.body,
  });
  res.status(201).json(category);
};

export const getCategories = async (req: Request, res: Response) => {
  const categories: SubCategory[] = await prisma.subCategory.findMany();
  res.json(categories);
};
export const getSubCategories = async (req: Request, res: Response) => {
  const categories: SubCategory[] = await prisma.subCategory.findMany();
  res.json(categories);
};
export const getSubCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category: SubCategory | null = await prisma.subCategory.findUnique({
    where: { id: Number(id) },
  });
  if (!category) throw new AppError("SubCategory not found.", 404);

  res.json(category);
};

export const deleteSubCategory = async (req: Request, res: Response) => {
  await prisma.subCategory.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
};

export const updateSubCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category: SubCategory = await prisma.subCategory.update({
    where: { id: Number(id) },
    data: req.body,
  });
  res.status(200).json({ message: "Updated successfully", data: category });
};
