import { Router } from "express";
import { createCategory,getCategories,getCategory,deleteCategory,updateCategory } from "../controllers/categoryController";
import subCategoryRoutes from "./subCatgoryRoutes";

const categoryRoutes:Router = Router();


categoryRoutes.post('/', createCategory);
categoryRoutes.get('/:id', getCategory);
categoryRoutes.get('/', getCategories);
categoryRoutes.delete('/:id', deleteCategory);
categoryRoutes.patch('/:id', updateCategory);
categoryRoutes.all('/:id/subCategory',subCategoryRoutes)




export default categoryRoutes;