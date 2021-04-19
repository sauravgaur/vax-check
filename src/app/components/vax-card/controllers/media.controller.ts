import { Request, Response } from "express";
import {readText} from '../../../core/imageProcessing/index'
import { VaxCardService } from "../services/vax-card.service";
export class MediaController{
    constructor(){}
    async uploadSnapshot(req: Request, res: Response){
        const path = req.file.path;
        try{
           let text =await readText(path)
           let vaxCardService = new VaxCardService();
            text.responseObj = vaxCardService.calcuateEffectiveNExpiry(text.responseObj);
        //    console.log('text-->',text);
           return res.send({msg:"success",text:text});
        }catch(err){
            return res.status(500).send({msg:"Issue in image reading"})
        }
    }
}