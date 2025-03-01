import prisma from "../config/prisma";


export class Factory <T>{

    private model:any
    constructor(model:any){
        this.model = model
    }


    async create(data:T){
        
            await this.model.create({
                data
            })
    
       
    }
}