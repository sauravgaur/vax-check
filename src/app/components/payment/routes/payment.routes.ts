import { Router } from "express";
import { PaymentCtrl } from "../controllers/payment.controller"

const router = Router()

export function routesConfig(): Router {
    const paymentCtrl = new PaymentCtrl()
    console.log("enter into router--->")
    router.get('/stripe/key', paymentCtrl.stripeKey);
    router.post('/stripe/session/create', paymentCtrl.createSession);
    router.post('/stripe/session/validate', paymentCtrl.validatePayment);
    router.post('/stripe/webhook', paymentCtrl.webHook);

    return router
}
