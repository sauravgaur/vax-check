import { Router } from "express";
import { routesConfigInner } from "./routes/media.route";

let router=Router()

export function routesConfig():Router {
    // router.use('/st-service',isAuthenticated,isAuthorized({hasRole:[],allowSameUser:true}),routesConfigInner())
    router.use('/media',routesConfigInner())
    return router
 }