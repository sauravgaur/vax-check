import { Request, Response } from "express";
import request from 'request';

const authUrl = "https://auth.humanapi.co/v1/connect/token"
const requestBodyenForSEssionCreate = {
    client_id: "fdbdd13332663d8c814f87b6af52f5b4550547b9",
    client_user_id: "Human_881952156",
    client_user_email: "gagan.singh@firstvitals.com",
    client_secret: "0310fd181e6721db436bcaf0c0d6bd1cf20aa025",
    type: "session"
};

const requestBodyForAccessTok = {
    client_id: "fdbdd13332663d8c814f87b6af52f5b4550547b9",
    client_user_id: "Human_881952156",
    client_secret: "0310fd181e6721db436bcaf0c0d6bd1cf20aa025",
    type: "id" // replace this value with "access" or "id_token"
};

const requestBodyForUserAccessTok = {
    client_id: "fdbdd13332663d8c814f87b6af52f5b4550547b9",
    client_user_id: "Human_881952156",
    client_secret: "0310fd181e6721db436bcaf0c0d6bd1cf20aa025",
    type: "access" // replace this value with "access" or "id_token"
};

export class HumanApiCtrl {

    async createToken(req: Request, res: Response) {
        console.log('in create token')
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
        console.log('In create access token')
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
                console.error("Server returned error status", resp);
            }

            console.log(resp.body)
            res.json(resp.body)
        })
    }

    async createUserAcessToken(req: Request, res: Response) {
        console.log('In create access token')
        request({
            url: authUrl,
            method: "POST",
            json: true,
            body: requestBodyForUserAccessTok
        }, (error, resp, body) => {
            if (error) {
                throw error;
            }
            if (res.statusCode >= 400) {
                console.error("Server returned error status", resp);
            }
            console.log(resp.body)
            res.json(resp.body)
        })
    }
}
