import { Request, Response } from "express";
import prisma from "../config/prisma";
import { Category } from "@prisma/client";
import slugify from "slugify";
import AppError from "../utils/appError";

export const createCategory = async (req: Request, res: Response) => {
  console.log(req.body);
  req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  const category: Category = await prisma.category.create({ data: req.body });
  res.status(201).json(category);
};

export const getCategories = async (req: Request, res: Response) => {
  const categories: Category[] = await prisma.category.findMany();
  res.json(categories);
};

export const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category: Category | null = await prisma.category.findUnique({
    where: { id: id},
    include: { subCategories: true },
  });
  if (!category) throw new AppError("Category not found.",404);

  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
    await prisma.category.delete({where:{id:req.params.id}});
    res.status(204).send();
}

export const updateCategory = async (req: Request, res: Response) => {

    const {id} = req.params;
    const category: Category = await prisma.category.update({
        where:{id:id},
        data:req.body
    });
    res.status(200).json({ message: "Updated successfully", data: category });

}