import prisma from "../config/prisma";
import AppError from "../utils/appError";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import {  createPasswordResetToken } from "../utils/auth";
import Email from "../utils/email";
import crypto from "crypto";
import passport from "../config/passport";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("local", (err:Error, user:User, info:any) => {
    console.log("Login attempt:", { err, user, info }); // Add this line
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ status: "fail", message: info?.message || "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        status: "success",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    });
  })(req, res, next);
};

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

export const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("google", {
    failureRedirect: "/error",
    successRedirect: "/",
  })(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, passwordConfirm } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (user) {
    throw new AppError("User already exists", 400);
  }
  if (password !== passwordConfirm) {
    throw new AppError("Passwords do not match", 400);
  }
  const newUser = await prisma.user.create({ data: { email, password, name } });
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    status: "success",
    data: {
      user: safeUser,
    },
  });
};

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }else{
    return next(new AppError("You are not logged in", 401));
  }
};

// Update the restrictTo function
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists and has a role property
    if (!req.user || !req.user.role) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    if (!roles.includes(req.user.role as string)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Get user based on POSTed email
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = createPasswordResetToken(user);
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordResetToken: user.passwordResetToken,
      passwordResetExpiresAt: user.passwordResetExpiresAt,
    },
  });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });
    console.log(err);
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get user based on Token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(hashedToken);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: {
        gt: new Date(), // equivalent to `$gt: Date.now()` in MongoDB
      },
    },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: req.body.password,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
};

// Update the updatePassword function
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get user from collection
    if (!req.user || !req.user.id) {
      return next(new AppError("You are not logged in", 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id as string },
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }
    if (user.provider !== "System" || !user.password)
      return next(new AppError("Please Login With System Account", 401));
    // 2) Check if POSTed current password is correct
    if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
      return next(new AppError("Your current password is wrong", 401));
    }

    // 3) If so, update password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    await prisma.user.update({
      where: { id: req.user.id as string },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // 4) Log user in, send JWT
    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
