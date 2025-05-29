import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import AppError from "../utils/appError";

const prisma = new PrismaClient();

type PrismaModelName = keyof Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// Options interface for more flexibility
interface FactoryOptions {
  idField?: string;
  searchFields?: string[];
  populateFields?: Record<string, any>;
}

export const getAll = (
  model: PrismaModelName,
  options: FactoryOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Build filter from query params
      const filter: Record<string, any> = {};

      // Add search functionality if searchFields provided
      if (options.searchFields && req.query.search) {
        const searchTerm = req.query.search as string;
        filter.OR = options.searchFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        }));
      }

      // @ts-ignore - Dynamic access to Prisma models
      const docs = await prisma[model].findMany({
        where: filter,
        ...(options.populateFields && { include: options.populateFields }),
      });

      res.status(200).json({
        status: "success",
        results: docs.length,
        data: {
          [model]: docs,
        },
      });
    } catch (err) {
      next(err);
    }
  };
};

export const getOne = (
  model: PrismaModelName,
  includeOptions?: Record<string, any>,
  options: FactoryOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idField = options.idField || "id";
      const id = req.params.id;

      // @ts-ignore - Dynamic access to Prisma models
      const doc = await prisma[model].findUnique({
        where: { [idField]: id },
        ...(includeOptions && { include: includeOptions }),
      });

      if (!doc) {
        return next(
          new AppError(`No ${model.toString} found with that ID`, 404)
        );
      }

      res.status(200).json({
        status: "success",
        data: {
          [model]: doc,
        },
      });
    } catch (err) {
      next(err);
    }
  };
};

export const createOne = (
  model: PrismaModelName,
  options: FactoryOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - Dynamic access to Prisma models
      const doc = await prisma[model].create({
        data: req.body,
        ...(options.populateFields && { include: options.populateFields }),
      });

      res.status(201).json({
        status: "success",
        data: {
          [model]: doc,
        },
      });
    } catch (err) {
      next(err);
    }
  };
};

export const updateOne = (
  model: PrismaModelName,
  options: FactoryOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idField = options.idField || "id";
      const id = req.params.id;

      // @ts-ignore - Dynamic access to Prisma models
      const doc = await prisma[model].update({
        where: { [idField]: id },
        data: req.body,
        ...(options.populateFields && { include: options.populateFields }),
      });

      res.status(200).json({
        status: "success",
        data: {
          [model]: doc,
        },
      });
    } catch (err) {
      next(err);
    }
  };
};

export const deleteOne = (
  model: PrismaModelName,
  options: FactoryOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idField = options.idField || "id";
      const id = req.params.id;

      // @ts-ignore - Dynamic access to Prisma models
      const doc = await prisma[model].delete({
        where: { [idField]: id },
      });

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  };
};

export const getAllWithFilters = (
  model: PrismaModelName,
  filterFields: string[] = [],
  options: FactoryOptions = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1) Build the filter object
      const filter: Record<string, any> = {};

      filterFields.forEach((field) => {
        if (req.query[field]) {
          filter[field] = req.query[field];
        }
      });

      // Add search functionality if searchFields provided
      if (options.searchFields && req.query.search) {
        const searchTerm = req.query.search as string;
        filter.OR = options.searchFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        }));
      }

      // 2) Pagination
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const skip = (page - 1) * limit;

      // 3) Execute query
      // @ts-ignore - Dynamic access to Prisma models
      const docs = await prisma[model].findMany({
        where: filter,
        skip,
        take: limit,
        ...(req.query.sort && {
          orderBy: {
            [req.query.sort as string]: req.query.order || "asc",
          },
        }),
        ...(options.populateFields && { include: options.populateFields }),
      });

      // 4) Get total count for pagination
      // @ts-ignore - Dynamic access to Prisma models
      const total = await prisma[model].count({ where: filter });

      res.status(200).json({
        status: "success",
        results: docs.length,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
        data: {
          [model]: docs,
        },
      });
    } catch (err) {
      next(err);
    }
  };
};
