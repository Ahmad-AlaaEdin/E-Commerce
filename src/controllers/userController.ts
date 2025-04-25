import AppError from "../utils/appError";
import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import "../types/express";
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

export const uploadUserPhoto = upload.single("photo");

const filterObj = (
  obj: Record<string, any>,
  ...allowedFields: string[]
): Record<string, any> => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.file);
  console.log(req.body);
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const imageUrl = await uploadFromBuffer(fileBuffer, "users");
    req.body.photo = imageUrl;
  }
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route is not for password updates, use /updatePassword",
        400
      )
    );

  const filteredBody = filterObj(req.body, "name", "phone", "photo");
  // if (req.file) filteredBody.photo = req.file.filename;
  if (!req.user) return next(new AppError("You are not logged in", 401));
  // Update user in DB using Prisma
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: filteredBody,
  });

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
};

export const deleteMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  await prisma.user.update({
    where: { id: req.user.id },
    data: { active: false },
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
};

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError("You are not logged in", 401));
  req.params.id = req.user.id.toString();
  next();
};

// Get a single user by ID
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({ status: "success", data: { user } });
};

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await prisma.user.findMany();
  res
    .status(200)
    .json({ status: "success", results: users.length, data: { users } });
};

// Update a user by ID
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json({ status: "success", data: { user } });
};

// Delete a user by ID
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await prisma.user.delete({
    where: { id: req.params.id },
  });
  res.status(204).json({ status: "success", data: null });
};
