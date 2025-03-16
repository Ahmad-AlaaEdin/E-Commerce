import { Router } from "express";
import { createProduct } from "../controllers/productController";


const productRoutes:Router = Router();


productRoutes.post('/product', createProduct);




export default productRoutes;