import prisma from "../config/prisma";
import AppError from "../utils/appError";
import { Request, Response, CookieOptions,NextFunction } from "express";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import {changedPasswordAfter,createPasswordResetToken} from "../utils/auth";
import Email from "../utils/email";
import crypto from "crypto";

const signToken = (userID: number) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET , {
    expiresIn: "30" ,
  });
};
const sendToken = (user: User, statusCode: number, res: Response) => {
  const token = signToken(user.id);
  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN! || "30") *
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
  const { name, email,password,passwordConfirm } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (user) {
    throw new AppError("User already exists", 400);
  }
  if(password !== passwordConfirm){
    throw new AppError("Passwords do not match", 400);
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

export const protect = async (req:Request, res:Response, next : NextFunction) => {
  // Check Token
  console.log('protect');
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    next(new AppError('You are not logged in', 401));
  }

  //Verification Token
const decoded =  jwt.verify(token, process.env.JWT_SECRET! ) as jwt.JwtPayload ;
  //Check if user still exist
  const user = await prisma.user.findUnique({ where: {
    id: decoded.id,
  },}) 
  
  if (!user)
    throw new AppError(
      'The User belonging to this token no longer exists.',
      401,
    );

  //Check if password changed after token was issued
  if (changedPasswordAfter(user,decoded.iat as number)) {
    throw new AppError(
      'User Recently Changed password! please log in again.',
      401,
    );
  }
  req.user = user;
  console.log('protect22');
  next();
};


exports.isLoggedIn = async (req:Request, res:Response, next:NextFunction) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded =  jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      ) as jwt.JwtPayload;

      // 2) Check if user still exists
      const currentUser = await prisma.user.findUnique({where: {
        id: decoded.id,
      },});
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (changedPasswordAfter(currentUser,decoded.iat as number)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

export const restrictTo = (...roles:string[]) => {
  return (req:Request, res:Response, next:NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(
          'You do not have a permission to perform this action',
          403,
        )
      
    }
    next();
  };
};

exports.forgotPassword = async (req:Request, res:Response, next:NextFunction) => {
  // 1) Get user based on POSTed email
  const user = await prisma.user.findUnique({where:{email: req.body.email}})
  
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
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
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordResetToken: null,
        passwordResetExpiresAt: null
      },
    });

    return next(
      new AppError('There was an error sending the email. Try again later!',500)
      
    );
  }
};

exports.resetPassword = async (req:Request, res:Response, next:NextFunction) => {
  //Get user based on Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
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
    return next(new AppError('Token is invalid or has expired', 400));
  }
  if(req.body.password!==req.body.passwordConfirm){
    return next(new AppError('Passwords do not match', 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: req.body.password,
      passwordResetToken: null,
      passwordResetExpiresAt: null
    }
  });


  sendToken(updatedUser, 200, res);
};

exports.logout = (req:Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

export const updatePassword = async (req:Request, res:Response, next:NextFunction) => {
  if (!req.user) {
    return next(new AppError('You are not logged in', 401));
  }
  if(!req.body.currentPassword || !req.body.password || !req.body.passwordConfirm){
    throw new AppError("Please provide current password, new password and confirm password", 400);
  }

  if ( !(await bcrypt.compare(req.body.currentPassword, req.user.password))) {
    throw new AppError("Incorrect  Email or Password", 401);
  }

  if(req.body.password!==req.body.passwordConfirm){
    throw new AppError("Passwords do not match", 400); 
  }
  

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      password: req.body.password,
      passwordResetToken: null,
      passwordResetExpiresAt: null
    }
  });

  sendToken(updatedUser, 200, res);
};