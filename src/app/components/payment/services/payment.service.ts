import Stripe from 'stripe';
import { IStripeSessionRequest, IStripeSessionResponse, IStripeSessionValidateRequest } from "../../../interfaces/payment.interface";
import { MailService } from '../../../utils/mailer/mail.service';

const secretKey = 'sk_test_51IllDFIoULcjF60KqXjT9U91x3LkH8s1q82izKZKGbgKnyg84mYb03c1z9pZ35r9Mw35gKqwfvV684Sl3mgUNR9f00BmGfTleU';

const stripe = new Stripe(secretKey, {
    apiVersion: "2020-08-27",
    typescript: true
});

export class PaymentService {

    async createSession(sessionRequest: IStripeSessionRequest): Promise<IStripeSessionResponse> {
        const response: IStripeSessionResponse = {
            sessionId: null,
            paymentStatus: null,
            error: null
        };

        try {
            let session: Stripe.Checkout.Session;
            const params: Stripe.Checkout.SessionCreateParams = {
                success_url: sessionRequest.successUrl,
                cancel_url: sessionRequest.cancelUrl,
                mode: 'payment',
                payment_method_types: ['card'],
                billing_address_collection: 'required',
                customer_email: sessionRequest.travelerEmail,
                line_items: [
                    {
                        price_data: {
                            product: 'prod_JRb2gUDrev91kL',
                            currency: 'usd',
                            unit_amount: 2000,
                        },
                        quantity: 1,
                        tax_rates: ['txr_1Ir8J3IoULcjF60KTZk4cML7']
                    }
                ],
                allow_promotion_codes: true,
            };

            session = await stripe.checkout.sessions.create(params);
            // TODO: Assign sessionId to Traveler
            response.sessionId = session.id;
        } catch (e) {
            response.error = e.message;
        }

        return response;
    }

    async validateSessionPayment(sessionRequest: IStripeSessionValidateRequest): Promise<IStripeSessionResponse> {
        const response: IStripeSessionResponse = {
            sessionId: null,
            paymentStatus: null,
            error: null
        };

        try {
            const session = await stripe.checkout.sessions.retrieve(sessionRequest.sessionId);

            if (session.payment_status === 'paid') {
                // TODO: Update payment status of Traveler
                // TODO: Update mail config and body
                // TODO: Fetch Email address from DB to send email
                const mailService = new MailService();
                const emailResponse = await mailService.sendMail({ to: sessionRequest.travelerEmail, html: 'Payment completed' });
            }

            response.sessionId = session.id;
            response.paymentStatus = session.payment_status;
        } catch (e) {
            response.error = e.message;
        }

        return response;
    }
}
