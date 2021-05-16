import { Request, Response } from "express";
import { IStripeSessionRequest, IStripeSessionResponse, IStripeSessionValidateRequest } from "../../../interfaces/payment.interface";
import { PaymentService } from "../services/payment.service";

const publishableKey = process.env.STRIPE_PUBLIC_KEY || 'Not-Defined';

export class PaymentCtrl {

    async stripeKey(req: Request, res: Response) {
        res.send({ publishableKey });
    }

    async createSession(req: Request, res: Response) {
        const sessionRequest: IStripeSessionRequest = req.body;
        let response: IStripeSessionResponse = {
            sessionId: null,
            paymentStatus: null,
            error: null,
        }

        if (sessionRequest.successUrl && sessionRequest.cancelUrl && sessionRequest.orderAmount && sessionRequest.masterId && sessionRequest.travelerEmail) {
            const paymentService = new PaymentService();
            response = await paymentService.createSession(sessionRequest);
        } else {
            response.sessionId = null;
            response.error = 'Required parameters missing';
        }

        if (response.error) {
            res.status(400).send(response);
        } else {
            res.send(response);
        }
    }

    async validatePayment(req: Request, res: Response) {
        const validateRequest: IStripeSessionValidateRequest = req.body;

        let response: IStripeSessionResponse = {
            sessionId: null,
            paymentStatus: null,
            error: null,
        }

        if (validateRequest.sessionId && validateRequest.travelerEmail) {
            const paymentService = new PaymentService();
            response = await paymentService.validateSessionPayment(validateRequest);
        } else {
            response.sessionId = null;
            response.error = 'Required parameters missing';
        }

        if (response.error) {
            res.status(400).send(response);
        } else {
            res.send(response);
        }
    }

    async webHook(req: Request, res: Response) {
        console.log('webHook: ', req.body);
        res.send(200);
    }
}
