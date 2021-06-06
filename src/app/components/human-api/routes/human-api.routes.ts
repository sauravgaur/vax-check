import { Router } from "express";
import { HumanApiCtrl } from "../controllers/human-api.controller"

const router = Router()

export function routesConfig(): Router {
    const humanApiCtrl = new HumanApiCtrl()
    console.log("enter into router--->")
    router.post('/humanapi/create-token', humanApiCtrl.createToken);
    router.post('/humanapi/create-access-token', humanApiCtrl.createAcessToken);
    router.post('/humanapi/create-user-access-token', humanApiCtrl.createUserAcessToken);

    return router
}
