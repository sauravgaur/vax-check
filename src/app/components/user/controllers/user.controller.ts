import { Request, Response } from "express";
import {httpError} from "../../../core/errorHandler/http.error.handler"
import { IProfile } from "../../../interfaces/record.interface";
import { IUser } from "../../../interfaces/user.interface";
import { BatchService } from "../../records/services/batch.service";
import { UserService } from "../services/user.service";
export class UserCtrl{
    constructor(){}
    async login(req: Request, res: Response) {
        try{
            // console.log("req-->",req.body)
            let user=req.body as IUser
            // console.log("res-->",res)
            if(!user.email){
                return httpError(res,422,"email is missing",{desc:`mandatory fields are "email" and "password"`})
            }
            if(!user.password){
                return httpError(res,422,"password is missing",{desc:`mandatory fields are "email" and "password"`})
            }
            let userService= new UserService()
            const {status,response}= await userService.login(user)
            return res.status(status).send(response)
        }catch(err){
            return res.status(500).send(err)
        }
    }
    async loginEmployeeViaOtp(req: Request, res: Response) {
        try{
            // console.log("req-->",req.body)
            let {email_address,org_id}=req.body as IProfile
            // console.log("res-->",res)
            if(!email_address){
                return httpError(res,422,"email_address is missing",{desc:`mandatory fields are "email_address" and "org_id"`})
            }
            if(!org_id){
                return httpError(res,422,"org_id is missing",{desc:`mandatory fields are "email_address" and "org_id"`})
            }
            let userService= new UserService()
            const {status,response}= await userService.loginEmployeeViaOtp(email_address,org_id)
            return res.status(status).send(response)
        }catch(err){
            return res.status(500).send(err)
        }
    }

    async verifyOtp(req: Request, res: Response){
        try{
            const {otp} = req.params;

            let batchService= new BatchService();
            let userService= new UserService()
            let {status,response} =await userService.verifyOtp(otp);
            //let {status,response}= await batchService.patientById(userResponse.response.skyflow_id)
            return res.status(status).send(response)
        }catch(err){
            return res.status(500).send(err)
        }
    }
    async signup(req: Request, res: Response) {
        try{
            console.log("req-->",req.body)
            let user=req.body as IUser
            console.log("res-->",res)
            if(!user.first_name){
                return httpError(res,422,"first_name is missing",{desc:`mandatory fields are "first_name","last_name","role","email" and "password"`})
            }
            if(!user.last_name){
                return httpError(res,422,"last_name is missing",{desc:`mandatory fields are "first_name","last_name","role","email" and "password"`})
            }
            if(!user.role){
                return httpError(res,422,"role is missing",{desc:`mandatory fields are "first_name","last_name","role","email" and "password"`})
            }
            if(!user.email){
                return httpError(res,422,"email is missing",{desc:`mandatory fields are "first_name","last_name","role","email" and "password"`})
            }
            if(!user.password){
                return httpError(res,422,"password is missing",{desc:`mandatory fields are "first_name","last_name","role","email" and "password"`})
            }
            let userService= new UserService()
            const {status,response}= await userService.createUser(user)
            return res.status(status).send(response)
        }catch(err){
            console.log('signup err-->',err);
            res.status(500).send(err)
        }
    }
    async changePassword(req: Request, res: Response) {
        try{
            console.log("req-->",req.body)
            let user=req.body
            console.log("res-->",res)
            if(!user.skyflow_id){
                return httpError(res,422,"first_name is missing",{desc:`mandatory fields are "first_name","last_name","role","email" and "password"`})
            }
            if(!user.password){
                return httpError(res,422,"password is missing",{desc:`mandatory fields are "first_name","last_name","role","email" and "password"`})
            }
            let userService= new UserService()
            const {status,response}= await userService.changePassword(user,user.newPassword);
            
            return res.status(status).send(response)
        }catch(err){
            console.log('signup err-->',err);
            res.status(500).send(err)
        }
    }
    
    
    async getById(req: Request, res: Response) {
        return res.send("get By id..")
    }
}

