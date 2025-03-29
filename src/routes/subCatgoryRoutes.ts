import { Router } from "express";
import {
  createSubCategory,
  getSubCategories,
  deleteSubCategory,
  updateSubCategory,
  getSubCategory,
} from "../controllers/subCategoryController";

const subCategoryRoutes: Router = Router({ mergeParams: true });

subCategoryRoutes.get("/", getSubCategories);
subCategoryRoutes.post("/", createSubCategory);

subCategoryRoutes
  .route("/:id")
  .get(getSubCategory)
  .delete(deleteSubCategory)
  .patch(updateSubCategory);

export default subCategoryRoutes;
