import { Router } from "express";
import {
  getAllProducts,
  getProductsByCategory,
  getProductsBySubCategory,
  searchProducts,
  getProductDetails,
} from "../controllers/productController";

const router = Router();

// Search products
router.get("/search", searchProducts);

// Get all products
router.get("/", getAllProducts);

// Get product details
router.get("/details/:id", getProductDetails);

// Get products by category
router.get("/:slug", getProductsByCategory);

// Get products by subcategory
router.get("/:categorySlug/:subCategorySlug", getProductsBySubCategory);

export default router;
