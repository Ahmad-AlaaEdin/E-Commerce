import { Router } from "express";
import {signup,login,protect,updatePassword} from "../controllers/authController";
const userRoutes:Router = Router();


userRoutes.post('/signup',signup);
userRoutes.post("/login",login);
userRoutes.patch("/updatePsassword",protect,updatePassword)





export default userRoutes;