import Stripe from 'stripe';
import { Skyflow } from '../../../core';
import { IStripeSessionRequest, IStripeSessionResponse, IStripeSessionValidateRequest } from "../../../interfaces/payment.interface";
import { IProfile, IVaccinations } from '../../../interfaces/record.interface';
import { ISkyflowConfig, ITokens } from '../../../interfaces/skyflow-config.interface';
import { MailService } from '../../../utils/mailer/mail.service';
import { DEFAULT_VAULT } from '../../../vaults';

const secretKey = process.env.STRIPE_SECRET_KEY || 'Not-Defined';

const stripe = new Stripe(secretKey, {
    apiVersion: "2020-08-27",
    typescript: true
});

export class PaymentService {
    async paymentSucceedIntent(session: Stripe.Checkout.Session){
        try{
            if(session.metadata){
                let profiles_skyflow_id=session.metadata.profiles_skyflow_id
                let skyflowConfig:ISkyflowConfig=DEFAULT_VAULT;
                let skyflow=new Skyflow(skyflowConfig);
                let tokens:ITokens= await skyflow.getBearerToken();
                await skyflow.skyflowUpdateWrapper({
                    stripe_session_id:session.id,
                } as IProfile,"profiles",profiles_skyflow_id,tokens)
                let vaccination_id=await skyflow.getVaccinationId(profiles_skyflow_id,tokens);
                await skyflow.skyflowUpdateWrapper({
                    service_availed:'VerifyFull'
                }as IVaccinations,"vaccinations",vaccination_id,tokens)
            }

        }catch(err){
            console.log("paymentSucceedIntent err-->",err)
            throw err;
        }
    }
    async createSession(sessionRequest: IStripeSessionRequest): Promise<IStripeSessionResponse> {
        const response: IStripeSessionResponse = {
            sessionId: null,
            paymentStatus: null,
            error: null
        };

        try {
            // stripe.prices.list({
            //     active:true,
            //     currency:'usd'
            // })
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
                    profiles_skyflow_id:sessionRequest.profiles_skyflow_id
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
