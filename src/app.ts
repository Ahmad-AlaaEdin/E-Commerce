import express,{Request,Response} from "express"
import { PrismaClient } from '@prisma/client';



const app = express();
const prisma = new PrismaClient();

app.get("/api/v1/users", async(req:Request , res:Response) => {
    try{
        await prisma.user.create({
            data:{
                name:"Alice",
                email:"alyx@gmail.com",
                password:"123",
        
        }})
    }
    catch(err){
        console.log(err)
    }
    


    res.send("Hello World");
});








export default app;