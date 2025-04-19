import express from "express";
import {
  signup,
  login,
  logout,
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
  uploadUserPhoto,
} from "../controllers/userController";

const userRoutes = express.Router();

userRoutes.post("/signup", uploadUserPhoto, signup);
userRoutes.post("/login", login);
userRoutes.get("/logout", logout);
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
userRoutes.patch("/updateMe", uploadUserPhoto, updateMe);
userRoutes.delete("/deleteMe", deleteMe);

userRoutes.use(restrictTo("admin"));

userRoutes.route("/").get(getAllUsers);

userRoutes.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRoutes;
