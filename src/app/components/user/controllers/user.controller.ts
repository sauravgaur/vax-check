import { Request, Response } from "express";
import {httpError} from "../../../core/errorHandler/http.error.handler"
export class UserCtrl{
    constructor(){}
    async login(req: Request, res: Response) {
        console.log("req-->",req.body)
        let { username, password}=req.body
        console.log("res-->",res)
        if(!username){
            return httpError(res,422,"username is missing",{desc:`mandatory fields are "username" and "password"`})
        }
        if(!password){
            return httpError(res,422,"password is missing",{desc:`mandatory fields are "username" and "password"`})
        }
        return res.send("login functionality..")
    }
    async getById(req: Request, res: Response) {
        return res.send("get By id..")
    }
}

