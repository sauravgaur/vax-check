import { config } from "mssql"
import {RecordsDal} from "../dals/records.dals"

export class BatchService{
    recordDals:RecordsDal
    constructor(config?:config){
        this.recordDals=new RecordsDal(config)
    }
    async getAllBatchMeta():Promise<any>{
        await this.recordDals.openConnection()
        let data= await this.recordDals.getAllBatchMeta()
        console.log(data)
        await this.recordDals.closeConnection()
        return data;
    }
}