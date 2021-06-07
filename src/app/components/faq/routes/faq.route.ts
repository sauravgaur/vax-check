import { Router } from "express";
import { FaqController } from "../controllers/faq.controller";

const router = Router()

export function routesConfig(): Router {
    const faqController = new FaqController()
    router.post('/faq', faqController.getAllFaq);
    return router
}
