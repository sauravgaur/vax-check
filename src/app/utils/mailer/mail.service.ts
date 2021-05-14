import { IEmail, IEmailTrackResponse } from "./mail.interface";
import { PauboxService } from "./paubox.service";

const DEFAULT_MAILER_CONFIG = {
    from: process.env.PAUBOX_DEFAULT_MAIL,
    subject: process.env.PAUBOX_DEFAULT_SUBJECT,
    attachments: [],
    cc: [],
    bcc: []
}

export class MailService {
    private initConfig(emailOption: IEmail) {
        emailOption.from = emailOption.from || DEFAULT_MAILER_CONFIG.from;
        emailOption.subject = emailOption.subject || DEFAULT_MAILER_CONFIG.subject;
        emailOption.attachments = emailOption.attachments || DEFAULT_MAILER_CONFIG.attachments;
        emailOption.cc = emailOption.cc || DEFAULT_MAILER_CONFIG.cc;
        emailOption.bcc = emailOption.bcc || DEFAULT_MAILER_CONFIG.bcc;
        return emailOption;
    }

    async sendMail(emailOption: IEmail) {
        try {
            console.log('in Send Mail method');
            const emailOptionNew = this.initConfig(emailOption);
            const pauboxService = new PauboxService();
            return await pauboxService.send(emailOptionNew);
        } catch (err) {
            throw err;
        }
    }

    async pauboxMailStatus(sourceTrackingId: string): Promise<IEmailTrackResponse> {
        try {
            const pauboxService = new PauboxService();
            return await pauboxService.checkMailStatus(sourceTrackingId)
        } catch (err) {
            throw err;
        }
    }
}