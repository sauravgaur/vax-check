export interface IStripeSessionRequest {
    successUrl: string;
    cancelUrl: string;
    orderAmount: number;
    travelerEmail: string;
    skyflow_id:string
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
