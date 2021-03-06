import { Request, Response } from "express";
import {httpError} from "../../../core/errorHandler/http.error.handler"
import {SafeTravellerService} from "../services/safe-traveller.service"
export class SafeTravellerCtrl{
    
    constructor(){
    }
    async verifyAccessCode(req: Request, res: Response) {
        console.log("req-->",req.body)
        let safeTravellerService:SafeTravellerService=  new SafeTravellerService()
        let { firstName, middleName, dateOfBirth, accessCode, lastName}=req.body
        // firstName:string,middleName:string,dateOfBirth:Date,accessCode:string,lastName?:string
        console.log("res-->",res)
        if(!firstName){
            return httpError(res,422,"firstName is missing",{desc:`mandatory fields are "firstName","dateOfBirth","accessCode"  and "lastName"`})
        }
        if(!dateOfBirth){
            return httpError(res,422,"dateOfBirth is missing",{desc:`mandatory fields are "firstName","dateOfBirth","accessCode"  and "lastName"`})
        }
        if(!accessCode || accessCode.length===0){
            return httpError(res,422,"accessCode is missing",{desc:`mandatory fields are "firstName","dateOfBirth","accessCode"  and "lastName"`})
        }
        if(!lastName){
            return httpError(res,422,"lastName is missing",{desc:`mandatory fields are "firstName","dateOfBirth","accessCode"  and "lastName"`})
        }
        let {status,response}= await safeTravellerService.verifyAccessCode(firstName,lastName,dateOfBirth,accessCode,middleName)
        return res.status(status).send(response)
    }
    async getById(req: Request, res: Response) {
        return res.send("get By id..")
    }
}