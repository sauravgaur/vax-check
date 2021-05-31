import { Request, Response } from "express";
import Stripe from "stripe";
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

        if (sessionRequest.successUrl && sessionRequest.cancelUrl && sessionRequest.orderAmount && sessionRequest.profiles_skyflow_id && sessionRequest.travelerEmail) {
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
        const event = req.body;
        // Handle the event
        console.log(`Event Type: ${event.type}`);
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                // session.metadata.profiles_skyflow_id
                const request: IStripeSessionValidateRequest = {
                    travelerEmail: session.customer_email ? session.customer_email : '',
                    sessionId: session.id,
                }
                const paymentService = new PaymentService();
                paymentService.paymentSuccessEmail(request);
                break;
            case 'checkout.session.async_payment_failed':
                break;
        }
        res.send(200);
    }
}
