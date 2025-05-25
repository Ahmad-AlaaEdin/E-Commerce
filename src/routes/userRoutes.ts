import express from "express";
import {
  signup,
  login,
  logout,
isLoggedIn,
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
import passport from "passport";

const userRoutes = express.Router();
userRoutes.get('/auth/google',passport.authenticate('google'))
userRoutes.post("/signup", uploadUserPhoto, signup);
userRoutes.post("/login", login);
userRoutes.get("/logout", logout);
userRoutes.post("/forgotPassword", forgotPassword);
userRoutes.patch("/resetPassword/:token", resetPassword);

userRoutes.use(isLoggedIn);

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
