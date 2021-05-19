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
    resp:IHTTPResponse
    constructor(config?:config,vaultConfig?:ISkyflowConfig){
        console.log('DEFAULT_VAULT-->',DEFAULT_VAULT);
        this.vaultConfig=vaultConfig ||DEFAULT_VAULT
        this.recordDals=new RecordsDal(config)
        this.resp={
            response:null,
            status:200
        }
    }
    async checkUserExist(firstName:string,middleName:string,lastName:string,dateOfBirth:string):Promise<IHTTPResponse>{
        
        try{
            let skyFlow= new Skyflow(this.vaultConfig)
            const name=middleName?`${firstName} ${middleName} ${lastName}`:`${firstName} ${lastName}`
            let query=`select * from patients where name='${name}' and date_of_birth='${dateOfBirth}'`;
            this.resp.response=await skyFlow.skyflowQueryWrapper(query)
            if(this.resp.response && this.resp.response.records.length==0){
                this.resp.response["isUserExist"]=false;
            }
            else{
                this.resp.response["isUserExist"]=true;
            }
            return this.resp;
        }catch(err){
            throw err
        }
        
    }
    async unverifiedPatients():Promise<IHTTPResponse>{
        
        try{
            let skyFlow= new Skyflow(this.vaultConfig)
            let query=`select vaccinations.patients_skyflow_id,vaccinations.skyflow_id,patients.age,redaction(patients.name,'PLAIN_TEXT'),patients.date_of_birth,
            vaccinations.cvx,vaccinations.vax_expiration,vaccinations.vax_effective,vaccinations.created_timestamp from vaccinations left JOIN patients on patients.skyflow_id=vaccinations.patients_skyflow_id where vaccinations.cvx=null or vaccinations.cvx='cvx' or vaccinations.cvx='cvx_code' `;
            this.resp.response=await skyFlow.skyflowQueryWrapper(query)
            this.resp.response.records=this.resp.response.records.map((record:any)=>record.fields)
            return this.resp;
        }catch(err){
            throw err
        }
    }
    async allPatient():Promise<IHTTPResponse>{
        
        try{
            let skyFlow= new Skyflow(this.vaultConfig)
            let query=`select redaction(vaccinations.profiles_skyflow_id, 'PLAIN_TEXT'),redaction(profiles.created_timestamp, 'PLAIN_TEXT') , redaction(profiles.name, 'PLAIN_TEXT'),redaction(vaccinations.expiration_date, 'PLAIN_TEXT'),redaction(vaccinations.effective_date, 'PLAIN_TEXT'), redaction(profiles.date_of_birth, 'PLAIN_TEXT'), redaction(profiles.age, 'PLAIN_TEXT') , redaction(vaccinations.site, 'PLAIN_TEXT'), redaction(profiles.travel_date, 'PLAIN_TEXT'), redaction(profiles.traveler_type, 'PLAIN_TEXT'), redaction(profiles.address, 'PLAIN_TEXT'), redaction(profiles.email_address, 'PLAIN_TEXT')
            from profiles 
            LEFT JOIN vaccinations ON profiles.skyflow_id=vaccinations.profiles_skyflow_id `;
            this.resp.response=await skyFlow.skyflowQueryWrapper(query)
            this.resp.response.records=this.resp.response.records.map((record:any)=>record.fields)
            return this.resp;
        }catch(err){
            throw err
        }
    }

    async patientById(id:string):Promise<IHTTPResponse>{
        
        try{
            let skyFlow= new Skyflow(this.vaultConfig)
            let query=`select 
            redaction(profiles.age, 'PLAIN_TEXT'),
            redaction(profiles.date_of_birth, 'PLAIN_TEXT'),
            redaction(profiles.race, 'PLAIN_TEXT'),
            redaction(profiles.ethnicity, 'PLAIN_TEXT'),
            redaction(profiles.sex, 'PLAIN_TEXT'),
            redaction(profiles.mobile_number, 'PLAIN_TEXT'),
            redaction(profiles.mobile_number2, 'PLAIN_TEXT'),
            redaction(profiles.email_address, 'PLAIN_TEXT'),
            redaction(profiles.travel_date, 'PLAIN_TEXT'),
            redaction(profiles.traveler_type, 'PLAIN_TEXT'),
            redaction(profiles.traveler_type, 'PLAIN_TEXT'),
            redaction(profiles.name, 'PLAIN_TEXT'),
            redaction(profiles.address, 'PLAIN_TEXT'),
            redaction(profiles.healthcare_employee, 'PLAIN_TEXT'),
           
            redaction(vaccinations.vaccination_event_identifier, 'PLAIN_TEXT'), 
            redaction(vaccinations.vaccination_certification_status, 'PLAIN_TEXT'), 
            redaction(vaccinations.vaccination_issuer_type, 'PLAIN_TEXT'), 
            redaction(vaccinations.ordered_date, 'PLAIN_TEXT'), 
            redaction(vaccinations.administered_date, 'PLAIN_TEXT'), 
            redaction(vaccinations.effective_date, 'PLAIN_TEXT'), 
            redaction(vaccinations.expiration_date, 'PLAIN_TEXT'), 
            redaction(vaccinations.vaccine_name, 'PLAIN_TEXT'), 
            redaction(vaccinations.vaccine_cvx_code, 'PLAIN_TEXT'), 
            redaction(vaccinations.vaccine_product_code, 'PLAIN_TEXT'), 
            redaction(vaccinations.vaccine_manufacturer_name, 'PLAIN_TEXT'), 
            redaction(vaccinations.lot_number, 'PLAIN_TEXT'), 
            redaction(vaccinations.site, 'PLAIN_TEXT'), 
            redaction(vaccinations.route, 'PLAIN_TEXT'), 
            redaction(vaccinations.dose_number, 'PLAIN_TEXT'), 
            redaction(vaccinations.series_complete, 'PLAIN_TEXT'), 
            redaction(vaccinations.series_doses, 'PLAIN_TEXT'), 
            redaction(vaccinations.provider_suffix, 'PLAIN_TEXT'), 
            redaction(vaccinations.vaccine_refusal, 'PLAIN_TEXT'), 
            redaction(vaccinations.recipient_comorbidity_status, 'PLAIN_TEXT'), 
            redaction(vaccinations.recipient_missed_appt, 'PLAIN_TEXT'), 
            redaction(vaccinations.serology, 'PLAIN_TEXT'), 
            redaction(vaccinations.extract_type, 'PLAIN_TEXT'), 
            redaction(vaccinations.master_id, 'PLAIN_TEXT'), 
            redaction(vaccinations.reference_id, 'PLAIN_TEXT'), 
            redaction(vaccinations.reference_system, 'PLAIN_TEXT'), 
            redaction(vaccinations.verification_source, 'PLAIN_TEXT'), 
            redaction(vaccinations.verification_status, 'PLAIN_TEXT'), 
            redaction(vaccinations.verification_expiry_date, 'PLAIN_TEXT'), 
            redaction(vaccinations.service_availed, 'PLAIN_TEXT'),
           
            profiles.created_timestamp
            from profiles 
            LEFT JOIN vaccinations ON profiles.skyflow_id=vaccinations.profiles_skyflow_id 
            where profiles.skyflow_id= '${id}'`;
            this.resp.response=await skyFlow.skyflowQueryWrapper(query)
            this.resp.response.records=this.resp.response.records.map((record:any)=>record.fields)
            return this.resp;
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