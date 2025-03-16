import {Router} from 'express'
import { createSubCategory, getSubCategories, getSubCategory, deleteSubCategory, updateSubCategory } from '../controllers/subCategoryController';



const subCategoryRoutes:Router = Router({mergeParams:true});

subCategoryRoutes.get('/',getSubCategories);
subCategoryRoutes.get('/:id',getSubCategory);
subCategoryRoutes.post('/',createSubCategory);
subCategoryRoutes.delete('/:id',deleteSubCategory);
subCategoryRoutes.patch('/:id',updateSubCategory);







export default subCategoryRoutes;