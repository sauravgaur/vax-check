import { Request, Response } from "express";
import Stripe from 'stripe';
import sendMail = require('../../../utils/mailer/index');

const publishableKey = 'pk_test_51IllDFIoULcjF60KfMk1Jbb3COmYyAbZ1QLxLRMugIk3WU6p2k2nWp5YgCPTswBQqhbLjQspbDeONmOmh7z8r1hv00LOfVmm6o';
const secretKey = 'sk_test_51IllDFIoULcjF60KqXjT9U91x3LkH8s1q82izKZKGbgKnyg84mYb03c1z9pZ35r9Mw35gKqwfvV684Sl3mgUNR9f00BmGfTleU';

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

    async createSession(req: Request, res: Response) {
        const {
            successUrl,
            cancelUrl,
            orderAmount,
            masterId,
            travelerEmail,
        }: {
            successUrl: string;
            cancelUrl: string;
            orderAmount: number;
            masterId: string;
            travelerEmail: string;
        } = req.body;

        try {
            let session: Stripe.Checkout.Session;
            if (successUrl && cancelUrl && orderAmount && masterId && travelerEmail) {
                const params: Stripe.Checkout.SessionCreateParams = {
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                    mode: 'payment',
                    payment_method_types: ['card'],
                    billing_address_collection: 'required',
                    customer_email: travelerEmail,
                    line_items: [
                        {
                            price_data: {
                                product: 'prod_JRb2gUDrev91kL',
                                currency: 'usd',
                                unit_amount: 2000,
                            },
                            quantity: 1,
                            tax_rates: ['txr_1IohtoIoULcjF60K3AxkpKbl']
                        }
                    ],
                    allow_promotion_codes: true,
                };

                session = await stripe.checkout.sessions.create(params);
                // TODO: Assign sessionId to Traveler
                res.send({ sessionId: session.id });
                return;
            }

            res.send({ error: 'Unkown errror' });
        } catch (e) {
            res.send({ error: e.message });
        }
    }

    async validatePayment(req: Request, res: Response) {
        const {
            travelerEmail,
            sessionId,
        }: {
            travelerEmail: string;
            sessionId: string;
        } = req.body;

        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (session.payment_status === 'paid') {
                // TODO: Update payment status of Traveler
                // TODO: Update mail config and body
                // TODO: Fetch Email address from DB to send email
                await sendMail.sendMail(travelerEmail, 'Payment completed');
            }

            res.send({ payment_status: session.payment_status });
        } catch (e) {
            res.send({ error: e.message });
        }
    }

    async webHook(req: Request, res: Response) {
        console.log('webHook: ', req.body);
        res.send(200);
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
