import prisma from "../config/prisma";
import AppError from "../utils/appError";
import { Request, Response, CookieOptions } from "express";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
const signToken = (userID: Number) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};
const sendToken = (user: User, statusCode: number, res: Response) => {
  const token = signToken(user.id);
  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "30") *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
  };
  console.log("sendToken");
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  const { password: userPassword, ...safeUser } = user;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      safeUser,
    },
  });
};
export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (user) {
    throw new AppError("User already exists", 400);
  }
  const newUser = await prisma.user.create({ data: { email, password, name } });

  sendToken(newUser, 201, res);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Incorrect  Email or Password", 401);
  }
  sendToken(user, 200, res);
};
