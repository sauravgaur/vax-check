import { Request, Response } from "express";
import Stripe from 'stripe';

const publishableKey = 'pk_TODO';
const secretKey = 'sk_TODO';

const stripe = new Stripe(secretKey, {
    apiVersion: "2020-08-27",
    typescript: true
});

export class PaymentCtrl {

    async sourcetoken(req: Request, res: Response) {
        const {
            token,
            orderAmount,
        }: {
            token: string;
            orderAmount: number;
        } = req.body;

        try {

            let charge: Stripe.Charge;
            if (token) {
                const params: Stripe.ChargeCreateParams = {
                    amount: Math.round(orderAmount * 100),
                    currency: 'USD',
                    source: token,
                };

                charge = await stripe.charges.create(params);

                // TODO: Update traveler's payment status
                res.send(charge);
                return;
            }

            res.send({ error: 'Unkown errror' });
        } catch (e) {
            res.send({ error: e.message });
        }
    }

    async stripeKey(req: Request, res: Response) {
        res.send({ publishableKey });
    }

    async charge(req: Request, res: Response) {
        const {
            paymentMethodId,
            paymentIntentId,
            orderAmount,
        }: {
            paymentMethodId: string;
            paymentIntentId: string;
            orderAmount: number;
        } = req.body;

        try {

            let intent: Stripe.PaymentIntent;
            if (paymentMethodId) {
                const params: Stripe.PaymentIntentCreateParams = {
                    amount: Math.round(orderAmount * 100),
                    confirm: true,
                    confirmation_method: "manual",
                    currency: 'USD',
                    payment_method: paymentMethodId,
                };

                intent = await stripe.paymentIntents.create(params);
                // TODO: Update traveler's payment status
                res.send(generateResponse(intent));
                return;
            } else if (paymentIntentId) {

                intent = await stripe.paymentIntents.confirm(paymentIntentId);
                // TODO: Update traveler's payment status
                res.send(generateResponse(intent));
                return;
            }

            res.send({ error: 'Unkown errror' });
        } catch (e) {
            res.send({ error: e.message });
        }
    }
}

const generateResponse = (intent: Stripe.PaymentIntent) => {
    switch (intent.status) {
        case "requires_action":
            return {
                clientSecret: intent.client_secret,
                requiresAction: true
            };
        case "requires_payment_method":
            return {
                error: "Your card was denied, please provide a new payment method"
            };
        case "succeeded":
            return { clientSecret: intent.client_secret };
    }
}
