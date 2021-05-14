export interface IEmail {
    from?: string;
    to: string;
    html: string;
    subject?: string;
    attachments?: any[];
    cc?: string[];
    bcc?: string[];
}

export interface IEmailResponse {
    sourceTrackingId?: string;
    data?: string;
    errors: IEmailError[];
}

export interface IEmailError {
    code: number;
    title: string;
    details?: string;
}

export interface IEmailTrackResponse {
    sourceTrackingId?: string;
    data?: IEmailTrackData;
    errors?: IEmailError[];
}

export interface IEmailTrackData {
    message: {
        id: string;
        message_deliveries: IEmailTrackDelivery[];
    }
}

export interface IEmailTrackDelivery {
    recipient: string;
    status: {
        deliveryStatus: string;
        deliveryTime: string;
        openedStatus: string;
        openedTime: string;
    }
}