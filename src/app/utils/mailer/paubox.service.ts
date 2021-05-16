import request from 'request';
import { IEmailResponse, IEmailTrackResponse, IEmail } from './mail.interface';

export class PauboxService {

  private getPauboxToken(): string | undefined {
    return process.env.PAUBOX_TOKEN;
  }

  public async send(emailOption: IEmail): Promise<IEmailResponse> {
    try {
      const options = {
        method: 'POST',
        url: `${process.env.PAUBOX_BASE_API}/messages.json`,
        headers:
        {
          authorization: `Token token=${this.getPauboxToken()}`,
          'content-type': 'application/json'
        },
        body:
        {
          data:
          {
            message:
            {
              recipients: [emailOption.to],
              bcc: emailOption.bcc,
              cc: emailOption.cc,
              headers:
              {
                subject: emailOption.subject,
                from: emailOption.from
              },
              content:
              {
                'text/html': emailOption.html
              },
              attachments: emailOption.attachments
            }
          }
        },
        json: true
      };
      return new Promise((resolve, reject) => {
        request(options, (error: any, response: any, body: any) => {
          if (error) reject(error as IEmailResponse);

          console.log("paubox response-->", body)
          resolve(body as IEmailResponse);
        });
      });
    } catch (err) {
      return {
        errors: [
          {
            "code": 400,
            "title": err.message,
          }
        ]
      };
    }
  }

  public async checkMailStatus(sourceTrackingId: string): Promise<IEmailTrackResponse> {
    const url = `${process.env.PAUBOX_BASE_API}/message_receipt?sourceTrackingId=${sourceTrackingId}`
    const options = {
      method: 'GET',
      url,
      headers:
      {
        authorization: `Token token=${this.getPauboxToken()}`,
        'content-type': 'application/json'
      },
      json: true
    };
    return new Promise((resolve, reject) => {
      request(options, (error: any, response: any, body: any) => {
        if (error) reject(error as IEmailTrackResponse);
        resolve(body as IEmailTrackResponse);
      });
    });
  }
}