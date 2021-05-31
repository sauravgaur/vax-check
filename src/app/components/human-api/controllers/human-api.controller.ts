import { Request, Response } from "express";
import request from 'request';

const authUrl = "https://auth.humanapi.co/v1/connect/token"
const requestBodyenForSEssionCreate = {
    client_id: "fdbdd13332663d8c814f87b6af52f5b4550547b9",
    client_user_id: "gagan.singh@firstvitals.com",
    client_user_email: "gagan.singh@firstvitals.com",
    client_secret: "0310fd181e6721db436bcaf0c0d6bd1cf20aa025",
    type: "session"
};

const requestBodyForAccessTok = {
    client_id: "fdbdd13332663d8c814f87b6af52f5b4550547b9",
    client_user_id: "gagan.singh@firstvitals.com",
    client_secret: "0310fd181e6721db436bcaf0c0d6bd1cf20aa025",
    type: "access" // replace this value with "access" or "id_token"
};

export class HumanApiCtrl {

    async createToken(req: Request, res: Response) {
        request({
            url: authUrl,
            method: "POST",
            json: true,
            body: requestBodyenForSEssionCreate
        }, (error, resp, body) => {
            if (error) {
                throw error;
            }
            if (resp.statusCode >= 400) {
                console.error("Server returned error status");
            }

            res.json(resp.body)
        })
    }

    async createAcessToken(req: Request, res: Response) {
        request({
            url: authUrl,
            method: "POST",
            json: true,
            body: requestBodyForAccessTok
        }, (error, resp, body) => {
            if (error) {
                throw error;
            }
            if (res.statusCode >= 400) {
                console.error("Server returned error status", resp.statusCode);
            }

            console.log(resp.body)
            res.send({
                "access_token": "<your access token>",
                "expires_in": 86400,
                "token_type": "Bearer",
                "refresh_token": "atrt-zr5-gTJD8kWiwsNSWwhX2PhQA5-Rz0MpkCQVmdeDkZ3"
            })
        })
    }
}