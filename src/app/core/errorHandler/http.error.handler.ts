import { Request, Response } from "express";
export function httpError(res:Response,code:number,message:string,responseData:any){
    res.status(code).send({...responseData,message})
}