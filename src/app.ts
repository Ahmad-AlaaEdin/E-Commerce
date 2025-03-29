import express,{Request,Response,NextFunction} from "express"

import morgan from 'morgan';
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import subCategoryRoutes from "./routes/subCatgoryRoutes";
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use((req:Request,res:Response,next:NextFunction)=>{
    console.log(req.url);
    next();
})

app.use("/api/v1/product",productRoutes);
app.use("/api/v1/category",categoryRoutes);
app.use("/api/v1/subcategory",subCategoryRoutes);
app.use((error:Error,req:Request,res:Response,next:NextFunction)=>{
console.log(error);
res.json({message:"Internal Server Error"});
})




export default app;