import { Application,Router } from "express";
import {isAuthenticated,isAuthorized} from '../../../../app/core/index'
import {SafeTravellerCtrl} from "../controllers/safeTraveller.controller"

let router=Router()


export function routesConfigInner():Router {
    let safeTravellerCtrl=new SafeTravellerCtrl()
    console.log("safe traveller enter into router--->")
    router.post('/verify-code',safeTravellerCtrl.verifyAccessCode);

    return router
 }