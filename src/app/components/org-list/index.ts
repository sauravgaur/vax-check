import { Router } from "express";
import { routesConfigInner } from "./routes/orglist.route";

let router = Router()

export function routesConfig(): Router {
    router.use('/json', routesConfigInner())
    return router
}