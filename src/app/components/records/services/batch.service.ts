import { config } from "mssql"
import { Skyflow } from "../../../core/skyflow-adapter/skyflow.adapter"
import { IHTTPResponse } from "../../../interfaces/http-response.interface"
import { IBatch, IMedia, IRecord, IVaccinations } from "../../../interfaces/record.interface"
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
    async allPatient(org_id?:string):Promise<IHTTPResponse>{
        try{
            let skyFlow= new Skyflow(this.vaultConfig)
            let query=`select redaction(vaccinations.profiles_skyflow_id, 'PLAIN_TEXT'),redaction(profiles.created_timestamp, 'PLAIN_TEXT') , redaction(profiles.name, 'PLAIN_TEXT'),redaction(vaccinations.expiration_date, 'PLAIN_TEXT'),redaction(vaccinations.effective_date, 'PLAIN_TEXT'), redaction(profiles.date_of_birth, 'PLAIN_TEXT'), redaction(profiles.age, 'PLAIN_TEXT') , redaction(vaccinations.site, 'PLAIN_TEXT'), redaction(profiles.travel_date, 'PLAIN_TEXT'), redaction(profiles.traveler_type, 'PLAIN_TEXT'), redaction(profiles.address, 'PLAIN_TEXT'), 
            redaction(profiles.mobile_number, 'PLAIN_TEXT'), 
            redaction(profiles.mobile_number2, 'PLAIN_TEXT'), 
            redaction(profiles.emp_id, 'PLAIN_TEXT'), 
            redaction(profiles.work_location, 'PLAIN_TEXT'), 
            redaction(vaccinations.verification_status, 'PLAIN_TEXT'), 
            redaction(profiles.email_address, 'PLAIN_TEXT')
            from profiles 
            LEFT JOIN vaccinations ON profiles.skyflow_id=vaccinations.profiles_skyflow_id `;
            if(org_id){
                query+=`where profiles.org_id ='${org_id}'`
            }
            console.log("\n\n\n\n\n\n\n\n\n Query--->",query)
            this.resp.response=await skyFlow.skyflowQueryWrapper(query)
            this.resp.response.records=this.resp.response.records.map((data:any)=>{
                let record:IRecord={
                    profiles:{
                        name:data.fields.name,
                        created_timestamp:data.fields.created_timestamp,
                        date_of_birth:data.fields.date_of_birth,
                        age:data.fields.age,
                        travel_date:data.fields.travel_date,
                        traveler_type:data.fields.traveler_type,
                        address:data.fields.address,
                        email_address:data.fields.email_address,
                        mobile_number:data.fields.mobile_number,
                        mobile_number2:data.fields.mobile_number2,
                        emp_id:data.fields.emp_id,
                        work_location:data.fields.work_location,
                    },
                    vaccinations:{
                        profiles_skyflow_id:data.fields.profiles_skyflow_id,
                        expiration_date:data.fields.expiration_date,
                        effective_date:data.fields.effective_date,
                        site:data.fields.site,
                        verification_status:data.fields.verification_status,
                    }
                };
                return record;
            })
            return this.resp;
        }catch(err){
            throw err
        }
    }
    // access_code

    async patientDetailForMail(id:string):Promise<any>{
        try{
            let skyFlow= new Skyflow(this.vaultConfig);
            let query=`select 
                redaction(profiles.email_address, 'PLAIN_TEXT'),
                redaction(profiles.name, 'PLAIN_TEXT'),
                redaction(profiles.org_id, 'PLAIN_TEXT'),
                redaction(profiles.access_code, 'PLAIN_TEXT'),
                
            
                redaction(vaccinations.verification_source, 'PLAIN_TEXT'), 
                redaction(vaccinations.verification_status, 'PLAIN_TEXT'), 
                redaction(vaccinations.verification_expiry_date, 'PLAIN_TEXT'), 
                redaction(vaccinations.verification_notes, 'PLAIN_TEXT'),
            
                profiles.created_timestamp
                from profiles 
                LEFT JOIN vaccinations ON profiles.skyflow_id=vaccinations.profiles_skyflow_id 
                where profiles.skyflow_id= '${id}'`;
                console.log('query-->',query);
            const response=await skyFlow.skyflowQueryWrapper(query);
            console.log("response-->", JSON.stringify(response))
            if(response.records.length===0){
                throw Error("No record found");
            }
            return {
                ...response.records[0].fields
            }
        }catch(err){
            console.log(err);
            throw err;
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
            redaction(profiles.name, 'PLAIN_TEXT'),
            redaction(profiles.address, 'PLAIN_TEXT'),
            redaction(profiles.healthcare_employee, 'PLAIN_TEXT'),
            redaction(profiles.org_id, 'PLAIN_TEXT'),
            redaction(profiles.residency_state, 'PLAIN_TEXT'),
            redaction(profiles.consent, 'PLAIN_TEXT'),
           
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
            redaction(vaccinations.verification_notes, 'PLAIN_TEXT'),
            redaction(vaccinations.vaccine_dose_1, 'PLAIN_TEXT'),
            redaction(vaccinations.vaccine_dose_2, 'PLAIN_TEXT'),
            redaction(vaccinations.provider, 'PLAIN_TEXT'),
            redaction(vaccinations.appointment_email_confirmation, 'PLAIN_TEXT'),
            
            profiles.created_timestamp
            from profiles 
            LEFT JOIN vaccinations ON profiles.skyflow_id=vaccinations.profiles_skyflow_id 
            where profiles.skyflow_id= '${id}'`;

            const mediaQuery=`
            select 
            redaction(media.profiles_skyflow_id, 'PLAIN_TEXT'),
            redaction(media.skyflow_id, 'PLAIN_TEXT'),
            redaction(media.document_type, 'PLAIN_TEXT'),
            redaction(media.file_path, 'PLAIN_TEXT')
            from media
            where profiles_skyflow_id= '${id}'
            `;
            const token = await skyFlow.getBearerToken()
            this.resp.response=await skyFlow.skyflowQueryWrapper(query,token)
            const mediaResponse=await skyFlow.skyflowQueryWrapper(mediaQuery,token)
            let media=mediaResponse.records.map((data:any)=>{
                return {...data.fields} as IMedia
            })
            this.resp.response.records=this.resp.response.records.map((data:any)=>{
                let record:IRecord={
                    profiles:{
                        age:data.fields.age,
                        date_of_birth:data.fields.date_of_birth,
                        race:data.fields.race,
                        ethnicity:data.fields.ethnicity,
                        sex:data.fields.sex,
                        mobile_number:data.fields.mobile_number,
                        mobile_number2:data.fields.mobile_number2,
                        email_address:data.fields.email_address,
                        travel_date:data.fields.travel_date,
                        traveler_type:data.fields.traveler_type,
                        name:data.fields.name,
                        address:data.fields.address,
                        healthcare_employee:data.fields.healthcare_employee,
                        residency_state:data.fields.residency_state,
                        org_id:data.fields.org_id,
                        consent:data.fields.consent
                    },
                    media:media,
                    vaccinations:{
                        vaccination_event_identifier:data.fields.vaccination_event_identifier,
                        vaccination_certification_status:data.fields.vaccination_certification_status,
                        vaccination_issuer_type:data.fields.vaccination_issuer_type,
                        ordered_date:data.fields.ordered_date,
                        administered_date:data.fields.administered_date,
                        effective_date:data.fields.effective_date,
                        expiration_date:data.fields.expiration_date,
                        vaccine_name:data.fields.vaccine_name,
                        vaccine_cvx_code:data.fields.vaccine_cvx_code,
                        vaccine_product_code:data.fields.vaccine_product_code,
                        vaccine_manufacturer_name:data.fields.vaccine_manufacturer_name,
                        lot_number:data.fields.lot_number,
                        site:data.fields.site,
                        route:data.fields.route,
                        dose_number:data.fields.dose_number,
                        series_complete:data.fields.series_complete,
                        series_doses:data.fields.series_doses,
                        provider_suffix:data.fields.provider_suffix,
                        vaccine_refusal:data.fields.vaccine_refusal,
                        recipient_comorbidity_status:data.fields.recipient_comorbidity_status,
                        recipient_missed_appt:data.fields.recipient_missed_appt,
                        serology:data.fields.serology,
                        extract_type:data.fields.extract_type,
                        master_id:data.fields.master_id,
                        reference_id:data.fields.reference_id,
                        reference_system:data.fields.reference_system,
                        verification_source:data.fields.verification_source,
                        verification_status:data.fields.verification_status,
                        verification_expiry_date:data.fields.verification_expiry_date,
                        service_availed:data.fields.service_availed,
                        verification_notes:data.fields.verification_notes,
                        vaccine_dose_1:data.fields.vaccine_dose_1,
                        vaccine_dose_2:data.fields.vaccine_dose_2,
                        provider:data.fields.provider,
                        appointment_email_confirmation:data.fields.appointment_email_confirmation
                        
                    }
                };
                return record;
            })
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