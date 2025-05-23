import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductPhoto,
} from "../controllers/productController";

const productRoutes: Router = Router();

productRoutes
  .route("/")
  .post(uploadProductPhoto, createProduct)
  .get(getAllProducts);

productRoutes
  .route("/:id")
  .get(getProductById)
  .patch(uploadProductPhoto, updateProduct)
  .delete(deleteProduct);

export default productRoutes;
