import { Router } from "express";
import { PaymentCtrl } from "../controllers/payment.controller"

const router = Router()

export function routesConfig(): Router {
    const paymentCtrl = new PaymentCtrl()
    console.log("enter into router--->")
    router.post('/stripe/payment', paymentCtrl.charge);
    router.get('/stripe/key', paymentCtrl.stripeKey);

    return router
}
