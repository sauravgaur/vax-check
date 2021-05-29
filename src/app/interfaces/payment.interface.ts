export interface IStripeSessionRequest {
    successUrl: string;
    cancelUrl: string;
    orderAmount: number;
    masterId: string;
    travelerEmail: string;
    profiles_skyflow_id:string
}

export interface IStripeSessionValidateRequest {
    travelerEmail: string;
    sessionId: string;
}

export interface IStripeSessionResponse {
    sessionId: string | null;
    paymentStatus: string | null;
    error: string | null;
}
