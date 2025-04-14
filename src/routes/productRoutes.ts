import { Router } from "express";
import { createProduct,getAllProducts,getProductById,updateProduct,deleteProduct} from "../controllers/productController";


const productRoutes:Router = Router();

productRoutes.route('/').post(createProduct).get(getAllProducts)

productRoutes.route('/:id').get(getProductById).patch(updateProduct).delete(deleteProduct);




export default productRoutes;