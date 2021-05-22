import * as axiosObj from "axios"
import { IEmailResponse, IEmailTrackResponse, IEmail } from './mail.interface';

export class PauboxService {

  private getPauboxToken(): string | undefined {
    return process.env.PAUBOX_TOKEN;
  }

  private getHeaders(): any {
    return {
      Authorization: `Token token=${this.getPauboxToken()}`,
      'Content-Type': 'application/json'
    };
  }

  public async send(emailOption: IEmail): Promise<IEmailResponse> {
    try {
      const httpConfig: axiosObj.AxiosRequestConfig = {
        url: `${process.env.PAUBOX_BASE_API}/messages`,
        method: 'POST',
        headers: this.getHeaders(),
        responseType: 'json',
        data: {
          data: {
            message: {
              recipients: [emailOption.to],
              bcc: emailOption.bcc,
              cc: emailOption.cc,
              headers: {
                subject: emailOption.subject,
                from: emailOption.from
              },
              content: {
                'text/html': emailOption.html
              },
              attachments: emailOption.attachments
            }
          }
        }
      };

      const response = await axiosObj.default.request<IEmailResponse>(httpConfig);
      return response.data;
    } catch (err) {
      return this.handlePauboxError(err) as IEmailResponse;
    }
  }

  public async checkMailStatus(sourceTrackingId: string): Promise<IEmailTrackResponse> {
    try {
      const httpConfig: axiosObj.AxiosRequestConfig = {
        url: `${process.env.PAUBOX_BASE_API}/message_receipt?sourceTrackingId=${sourceTrackingId}`,
        method: 'GET',
        headers: this.getHeaders(),
        responseType: 'json',
      };
      const response = await axiosObj.default.request<IEmailTrackResponse>(httpConfig);
      return response.data;
    } catch (err) {
      return this.handlePauboxError(err) as IEmailTrackResponse;
    }
  }

  private handlePauboxError(err: any): any {
    if (err.isAxiosError) {
      console.log('Paubox mail error: ', err.response.data);
      return err.response.data;
    }

    console.error('Paubox mail unknown error: ', err.message);

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
