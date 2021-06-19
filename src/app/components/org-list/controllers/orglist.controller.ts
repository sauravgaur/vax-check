import { Request, Response } from "express";
import fs from 'fs';
const DIR = './state-wise-org-list/'
export class OrgListController {
    constructor() { }
    async defaultResponse(req: Request, res: Response) {
        try {
            const { state } = req.params
            const file = fs.readFileSync(`${DIR}/${state}.json`).toString();
            return res.send({ msg: "success", data: JSON.parse(file) });
        } catch (err) {
            return res.send({ msg: "No file present", data: [] })
        }
    }
}