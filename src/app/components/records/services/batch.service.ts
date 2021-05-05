import { config } from "mssql"
import { IBatch, IRecord, IVaccinations } from "../../../interfaces/record.interface"
import {RecordsDal} from "../dals/records.dals"
import { SkyflowDal } from "../dals/skyflow.dals"

export class BatchService{
    recordDals:RecordsDal
    orgName:string|null
    accountName:string|null
    vaultId:string|null
    skyflowCredPath:string|null
    constructor(config?:config,orgName?:string|null,accountName?:string|null,vaultId?:string|null,skyflowCredPath?:string|null){
        this.orgName=orgName || null;
        this.accountName=accountName || null;
        this.vaultId=vaultId || null;
        this.skyflowCredPath=skyflowCredPath || null;
        this.recordDals=new RecordsDal(config)
    }
    async getAllBatchMeta():Promise<any>{
        await this.recordDals.openConnection()
        let data= await this.recordDals.getAllBatchMeta()
        console.log(data)
        await this.recordDals.closeConnection()
        return data;
    }
    async addPatientVax(batch:IBatch):Promise<any>{
        let skyflowDal=new SkyflowDal(this.orgName,this.accountName,this.vaultId,this.skyflowCredPath)
        batch.records=await this.uploadPatientBatch(batch.records)
        let batchUploadResponse= await skyflowDal.uploadBatch(batch.records)
    }
    async uploadPatientBatch(records:IRecord[]):Promise<IRecord[]>{
        let skyflowDal=new SkyflowDal(this.orgName,this.accountName,this.vaultId,this.skyflowCredPath)
        const patientBatch=records.map(record=>{
            return {patients:record.patients}
        });
        const patientResponse=await skyflowDal.uploadBatch(patientBatch)
        for(let index=0;index<patientResponse.responses.length;index++){
            (records[index].vaccinations as IVaccinations).patients_skyflow_id=patientResponse.responses[index].records[0].skyflow_id
            delete records[index].patients;
        }
        return records
    }
}