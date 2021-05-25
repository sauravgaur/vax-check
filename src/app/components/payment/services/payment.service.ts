import Stripe from 'stripe';
import { IStripeSessionRequest, IStripeSessionResponse, IStripeSessionValidateRequest } from "../../../interfaces/payment.interface";
import { MailService } from '../../../utils/mailer/mail.service';

const secretKey = process.env.STRIPE_SECRET_KEY || 'Not-Defined';

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
                metadata: {
                    masterId: sessionRequest.masterId,
                },
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

            console.log('email start');
            this.sendTempEmails(sessionRequest.travelerEmail);
            console.log('email end');
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
                console.log('emailResponse', emailResponse);
            }

            response.sessionId = session.id;
            response.paymentStatus = session.payment_status;
        } catch (e) {
            response.error = e.message;
        }

        return response;
    }

    async paymentSuccessEmail(sessionRequest: IStripeSessionValidateRequest) {
        try {
            // TODO: Update payment status of Traveler
            // TODO: Update mail config and body
            // TODO: Fetch Email address from DB to send email
            // const mailService = new MailService();
            // const emailResponse = await mailService.sendMail({ to: sessionRequest.travelerEmail, html: 'Payment completed' });
            // console.log('emailResponse', emailResponse);
        } catch (e) {
            console.log('paymentSuccessEmail', e);
        }
    }

    async sendTempEmails(travelerEmail: string) {
        setTimeout(async () => {
            const mailService = new MailService();
            await mailService.sendMail(
                {
                    // from: 'vaxcheckservice@vaxcheck.us',
                    to: travelerEmail,
                    subject: 'Your vaccination verification is in progress',
                    html: 'Your vaccination verification is in progress'
                }
            );

            setTimeout(async () => {
                await mailService.sendMail(
                    {
                        // from: 'vaxcheckservice@vaxcheck.us',
                        to: travelerEmail,
                        subject: 'Your vaccination information has been verified',
                        html: 'Your vaccination information has been verified'
                    }
                );
            }, 120000);
        }, 1000);
    }
}
