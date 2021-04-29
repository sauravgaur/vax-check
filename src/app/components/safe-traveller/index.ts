import {Router} from "express";
import {routesConfigInner} from "./routes/safe-traveller.routes"
import {isAuthenticated,isAuthorized} from '../../../app/core/index'

let router=Router()

export function routesConfig():Router {
    // router.use('/st-service',isAuthenticated,isAuthorized({hasRole:[],allowSameUser:true}),routesConfigInner())
    router.use('/st-service',routesConfigInner())
    return router
 }