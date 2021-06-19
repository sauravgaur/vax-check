import { Router } from "express";
import {OrgListController } from "../controllers/orglist.controller";

let router=Router()

export function routesConfigInner():Router {
    let orgListController=new OrgListController()
    router.post('/orgList/:state',orgListController.defaultResponse);
    return router
 }