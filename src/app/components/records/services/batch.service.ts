import { config } from "mssql"
import { Skyflow } from "../../../core/skyflow-adapter/skyflow.adapter"
import { IHTTPResponse } from "../../../interfaces/http-response.interface"
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
    async checkUserExist(firstName:string,middleName:string,lastName:string,dateOfBirth:string):Promise<IHTTPResponse>{
        let resp:IHTTPResponse={
            response:null,
            status:200
        };
        try{
            let skyFlow= new Skyflow(this.orgName,this.accountName,this.vaultId,this.skyflowCredPath)
            const name=middleName?`${firstName} ${middleName} ${lastName}`:`${firstName} ${lastName}`
            let query=`select * from patients where name='${name}' and date_of_birth='${dateOfBirth}'`;
            resp.response=await skyFlow.skyflowQueryWrapper(query)
            if(resp.response && resp.response.records.length==0){
                resp.response["isUserExist"]=false;
            }
            else{
                resp.response["isUserExist"]=true;
            }
            return resp;
        }catch(err){
            throw err
        }
        
    }
    async unverifiedPatients():Promise<IHTTPResponse>{
        let resp:IHTTPResponse={
            response:null,
            status:200
        };
        try{
            let skyFlow= new Skyflow(this.orgName,this.accountName,this.vaultId,this.skyflowCredPath)
            let query=`select vaccinations.patients_skyflow_id,vaccinations.skyflow_id,patients.age,redaction(patients.name,'PLAIN_TEXT'),patients.date_of_birth,
            vaccinations.cvx,vaccinations.vax_expiration,vaccinations.vax_effective,vaccinations.created_timestamp from vaccinations left JOIN patients on patients.skyflow_id=vaccinations.patients_skyflow_id where vaccinations.cvx=null or vaccinations.cvx='cvx' or vaccinations.cvx='cvx_code' `;
            resp.response=await skyFlow.skyflowQueryWrapper(query)
            resp.response.records=resp.response.records.map((record:any)=>record.fields)
            return resp;
        }catch(err){
            throw err
        }
        
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