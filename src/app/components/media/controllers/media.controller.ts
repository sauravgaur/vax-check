import { Request, Response } from "express";

export class MediaController{
    constructor(){}
    async defaultResponse(req: Request, res: Response){
        try{
            return res.send({msg:"success",path:req.file.path});
         }catch(err){
             console.log("err-->",err);
             return res.status(500).send({msg:"Issue in doc upload"})
         }
    }
}