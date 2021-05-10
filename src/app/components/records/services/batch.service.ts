import { config } from "mssql"
import { Skyflow } from "../../../core/skyflow-adapter/skyflow.adapter"
import { IHTTPResponse } from "../../../interfaces/http-response.interface"
import { IBatch, IRecord, IVaccinations } from "../../../interfaces/record.interface"
import {RecordsDal} from "../dals/records.dals"
// import { skyflow } from "../dals/skyflow.dals"
import {DEFAULT_VAULT} from "../../../vaults/index"
import { ISkyflowConfig } from "../../../interfaces/skyflow-config.interface"

export class BatchService{
    recordDals:RecordsDal
    vaultConfig:ISkyflowConfig
    constructor(config?:config,vaultConfig?:ISkyflowConfig){
        console.log('DEFAULT_VAULT-->',DEFAULT_VAULT);
        this.vaultConfig=vaultConfig ||DEFAULT_VAULT
        this.recordDals=new RecordsDal(config)
    }
    async checkUserExist(firstName:string,middleName:string,lastName:string,dateOfBirth:string):Promise<IHTTPResponse>{
        let resp:IHTTPResponse={
            response:null,
            status:200
        };
        try{
            let skyFlow= new Skyflow(this.vaultConfig)
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
            let skyFlow= new Skyflow(this.vaultConfig)
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
        let skyflow=new Skyflow(this.vaultConfig)
        batch.records=await this.uploadPatientBatch(batch.records)
        let batchUploadResponse= await skyflow.uploadBatch(batch.records)
    }
    async uploadPatientBatch(records:IRecord[]):Promise<IRecord[]>{
        let skyflow=new Skyflow(this.vaultConfig)
        const patientBatch=records.map(record=>{
            return {profiles:record.profiles}
        });
        const patientResponse=await skyflow.uploadBatch(patientBatch)
        for(let index=0;index<patientResponse.responses.length;index++){
            (records[index].vaccinations as IVaccinations).profiles_skyflow_id=patientResponse.responses[index].records[0].skyflow_id
            delete records[index].profiles;
        }
        return records
    }
}