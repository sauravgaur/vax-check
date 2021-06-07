import { Request, Response } from "express";
import fs from 'fs';
const DIR = './faq/'
const FAQ_ACCESS_CODE = '7890';

export class FaqController {

    async getAllFaq(req: Request, res: Response) {
        try {
            const { accessCode } = req.body;
            if (accessCode === FAQ_ACCESS_CODE) {
                const file = fs.readFileSync(`${DIR}/faq.json`).toString();
                return res.send({ msg: "success", data: JSON.parse(file) });
            } else {
                res.status(400).send({ msg: "Invalid access code", data: [] });
            }
        } catch (err) {
            console.log("err-->", err);
            return res.send({ msg: "No file present", data: [] })
        }
    }
}
