import express from "express";
import {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/authController";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  deleteMe,
} from "../controllers/userController";

//const multer = require('multer');

//const upload = multer({ dest: 'public/img/users' });

const userRoutes = express.Router();

userRoutes.post("/signup", signup);
userRoutes.post("/login", login);
//userRouter.get('/logout', logout);
userRoutes.post("/forgotPassword", forgotPassword);
userRoutes.patch("/resetPassword/:token", resetPassword);

userRoutes.use(protect);

userRoutes.patch(
  "/updatePassword",

  updatePassword
);

userRoutes.get(
  "/me",

  getMe,
  getUser
);
userRoutes.patch(
  "/updateMe",

  updateMe
);
userRoutes.delete("/deleteMe", deleteMe);

userRoutes.use(restrictTo("admin"));

userRoutes.route("/").get(getAllUsers);

userRoutes.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRoutes;
