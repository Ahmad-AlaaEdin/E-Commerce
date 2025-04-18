import AppError from "../utils/appError";
//import multer from "multer";
//import cloudinary from "../config/cloudinary";
import {    Request,Response, NextFunction } from "express";
import prisma from "../config/prisma";
import  "../types/express"


const filterObj = (obj: Record<string, any>, ...allowedFields: string[]): Record<string, any> => {
    const newObj: Record<string, any> = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) {
        newObj[el] = obj[el];
      }
    });
  
    return newObj;
  };
  

// const multerStorage = multer.diskStorage({
// destination: (req, file, cb) => {
// cb(null, 'public/img/users');
// },
// filename: (req, file, cb) => {
// const ext = file.mimetype.split('/')[1];

// cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
// },
// });
/*
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not An Image! Please Upload Only Images ', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
export const uploadUserPhoto = upload.single('photo');
*/
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.file);
  console.log(req.body);

  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates, use /updatePassword',
        400,
      ),
    );

  const filteredBody = filterObj(req.body, 'name', 'email');
 // if (req.file) filteredBody.photo = req.file.filename;
if(!req.user) return next(new AppError('You are not logged in', 401))
  // Update user in DB using Prisma
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: filteredBody,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
};

export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.user) return next(new AppError('You are not logged in', 401))
  await prisma.user.update({
    where: { id: req.user.id },
    data: { active: false },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};



export const getMe = (req: Request, res: Response, next: NextFunction) => {
    if(!req.user) return next(new AppError('You are not logged in', 401))
  req.params.id = req.user.id.toString();
  next();
};
/*
export const uploadToCloudinary = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}`;

  // Process image with sharp
  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();

  const streamUpload = () =>
    new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'Natours/users',
            public_id: req.file.filename,
            access_mode: 'public',
            overwrite: true,
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new AppError('Error uploading file to cloudinary', 500));
            }
          },
        )
        .end(buffer);
    });
  try {
    const result: any = await streamUpload();
    req.file.filename = result.secure_url;
    next();
  } catch (err) {
    next(err);
  }
};*/

// Get a single user by ID
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({ status: "success", data: { user } });
};

// Get all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  const users = await prisma.user.findMany();
  res.status(200).json({ status: "success", results: users.length, data: { users } });
};

// Update a user by ID
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json({ status: "success", data: { user } });
};

// Delete a user by ID
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  await prisma.user.delete({
    where: { id: (req.params.id) },
  });
  res.status(204).json({ status: "success", data: null });
};
