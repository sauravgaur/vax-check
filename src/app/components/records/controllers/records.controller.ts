import { Request, Response } from "express";
import { generateHash } from "../../../core/encryptor/hash.encryptor";
import {httpError} from "../../../core/errorHandler/http.error.handler"
import {BatchService} from "../services/batch.service"
import {SkyflowDal} from "../dals/skyflow.dals"
import { IBatch, IMATADATA_RECORDS, IPatientAddress, IPatients, IRecord, ISourceProvider, ITests, IVaccinations } from "../../../interfaces/record.interface";
import { IPasswordOptions, PasswordGenerator } from "../../../core/passwordGenerator/password.generate";
export class RecordsCtrl{
    constructor(){
    }
    async getAllBatchMeta(req: Request, res: Response){
        try{
            let batchService=new BatchService()
            let response=await batchService.getAllBatchMeta()
            return res.send({response:response.recordset})
        }catch(err){
            console.log("err-->",err)
            return res.status(500).send(err)
        }
        
    }
    async testTurl(req: Request, res: Response){
        try{
            let skyflowDal=new SkyflowDal(null,null,null,null)
            let response=await skyflowDal.testUrl()
            return res.send({response})
        }catch(err){
            console.log("err-->",err)
            return res.status(500).send(err)
        }
    }
    async addPatientVax(req: Request, res: Response){
        try{
            let jsonObjs=req.body;
            let accessCodeGenrator= new PasswordGenerator({
                alphabets:true,
                digits: true,
                specialChars:false,
                upperCase:false
            } as IPasswordOptions)
            jsonObjs["cvx"]=accessCodeGenrator.generate(32)
            let batchCtrl=new BatchCtrl([jsonObjs],{
                id:null,
                name:"Vax-card form"
            } as ISourceProvider)
            let batch:IBatch =await batchCtrl.generateBatch()
            let batchService= new BatchService(undefined,null,null,"f9e68956780e11eba8a08295107109db",null);
            let resp=await batchService.addPatientVax(batch);
            console.log("resp-->",resp);
            return res.send({resp})
        }catch(err){
            console.log("err-->",err)
            return res.status(500).send(err)
        }
    }
    async checkUserExists(req: Request, res: Response){
        try{
            let {firstName,middleName,lastName,dateOfBirth} = req.body;
            if(!firstName){
                return httpError(res,422,"firstName is missing",{desc:`mandatory fields are "firstName","dateOfBirth" and "lastName"`})
            }
            if(!dateOfBirth){
                return httpError(res,422,"dateOfBirth is missing",{desc:`mandatory fields are "firstName","dateOfBirth" and "lastName"`})
            }
            if(!lastName){
                return httpError(res,422,"lastName is missing",{desc:`mandatory fields are "firstName","dateOfBirth"  and "lastName"`})
            }
            let batchService= new BatchService(undefined,null,null,"f9e68956780e11eba8a08295107109db",null);
            let {status,response}= await batchService.checkUserExist(firstName,middleName,lastName,dateOfBirth)
            return res.status(status).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }
    // async unverifiedPatient(req: Request, res: Response){
    //     try{
    //         let batchService= new BatchService(undefined,null,null,"f9e68956780e11eba8a08295107109db",null);
    //         let {status,response}= await batchService.checkUserExist(firstName,middleName,lastName,dateOfBirth)
    //         return res.status(status).send(response)
            
    //     }catch(err){
    //         return httpError(res,500,"Internal server error",{desc:err})
    //     }
    // }
}

export class BatchCtrl{
    // private batch:IBatch
    private jsonObjs:any[]
    private sourceProvider:ISourceProvider
    constructor(jsonObjs:any[],sourceProvider:ISourceProvider){
        this.jsonObjs=jsonObjs
        this.sourceProvider=sourceProvider
    }
    async generateBatch():Promise<IBatch>{
        // console.log("enter into generate batch")
        let batch_id=await this.getBatchId()
        return{
            batch_id: batch_id,
            no_of_records:this.jsonObjs.length,
            source:this.sourceProvider,
            status:'PENDING',
            upload_start_at:new Date(),
            records:await this.getRecords(this.jsonObjs)
        } as IBatch
    }
    getRecords(jsonObjs:any[]):Promise<IRecord[]>{
        // console.log("enter into getRecords")
        return Promise.all(jsonObjs.map(async jsonObj=>{
            const patients = await this.getPatientFromJSON(jsonObj)
            const record:IRecord={
                metadata_records:this.getMetadataFromJSON(jsonObj),
                patients:patients,
                tests:this.getTestFromJSON(jsonObj),
                vaccinations:this.getVaccinationFromJSON(jsonObj)
            } 
            return record
        })
        ); 
    }
    getMetadataFromJSON(jsonObj:any):IMATADATA_RECORDS{
        // console.log("enter into getMetadataFromJSON")
        return {
            created_timestamp:jsonObj["created_timestamp"],
            status:{
                state:jsonObj["meta_status_state"]
            }
        } as IMATADATA_RECORDS;
    }
    getVaccinationFromJSON(jsonObj:any):IVaccinations{
        // console.log("enter into getVaccinationFromJSON")
        return {
            // skyflow_id:jsonObj["skyflow_id"],
            admin_address:{
                country:jsonObj["country"],
                county:jsonObj["county"],
                county_fips:jsonObj["county_fips"],
                state:jsonObj["state"],
                street_address:jsonObj["street_address"],
                zip_code:jsonObj["zip_code"]
            },
            admin_date:jsonObj["admin_date"],
            admin_name:jsonObj["admin_name"],
            admin_type:jsonObj["admin_type"],
            cmorbid_status:jsonObj["cmorbid_status"],
            created_timestamp:jsonObj["created_timestamp"],
            cvx:jsonObj["cvx"],
            dose_num:jsonObj["dose_num"],
            extract_type:jsonObj["extract_type"],
            lot_number:jsonObj["lot_number"],
            mvx:jsonObj["mvx"],
            ndc:jsonObj["ndc"],
            // patients_skyflow_id:jsonObj["patients_skyflow_id"],
            pprl_id:jsonObj["pprl_id"],
            recip_missed_appt:jsonObj["recip_missed_appt"],
            responsible_org:jsonObj["responsible_org"],
            serology:jsonObj["serology"],
            updated_timestamp:jsonObj["updated_timestamp"],
            vax_admin_site:jsonObj["vax_admin_site"],
            vax_effective:jsonObj["vax_effective"],
            vax_event_id:jsonObj["vax_event_id"],
            vax_expiration:jsonObj["vax_expiration"],
            vax_prov_suffix:jsonObj["vax_prov_suffix"],
            vax_refusal:jsonObj["vax_refusal"],
            vax_route:jsonObj["vax_route"],
            vax_series_complete:jsonObj["vax_series_complete"]
        } as IVaccinations;
    }
    async getPatientFromJSON(jsonObj:any):Promise<IPatients>{
        const batch_id= await this.getBatchId()
        let age=jsonObj["age"] && !isNaN(jsonObj["age"])?parseInt(jsonObj["age"]):0;
        return {
            name:jsonObj["name"],
            unique_identifier:batch_id,
            address:this.getAddressFromJSON(jsonObj),
            age:age,
            // consent:{
            //     timestamp:jsonObj["patient_consent_timestamp"],
            //     given:jsonObj["patient_consent_given"].toLowerCase()==="true"
            // },
            date_of_birth:jsonObj["date_of_birth"],
            employed_in_healthcare:{
                occupation:jsonObj["employed_in_healthcare_occupation"],
                value:jsonObj["employed_in_healthcare_value"]
            },
            // ethnicity:jsonObj["ethnicity"],
            phone_number:jsonObj["phone_number"],
            // race:jsonObj["race"],
            residence_in_congregate_care:{
                care_type:jsonObj["residence_in_congregate_care_type"],
                value:jsonObj["residence_in_congregate_care_value"]
            },
            sex:jsonObj["sex"]
        } as IPatients
    }
    getTestFromJSON(jsonObj:any):ITests{
        // console.log("enter into getTestFromJSON")
        return {
            ordered:jsonObj["ordered"],
            result:{
                date:jsonObj["test_result_date"],
                test:jsonObj["test_result_test"],
                value:jsonObj["test_result_value"]
            },
            report_date:jsonObj["test_reported_date"],
            consent_given:jsonObj["test_consent_given"] && jsonObj["test_consent_given"].toLowerCase()=="true"?true:false,
            county:jsonObj["test_county"],
            device_identifier:jsonObj["device_identifier"],
            ordering_provider:{
                address:this.getAddressFromJSON(jsonObj),
                name:jsonObj["ordering_provider_name"],
                phone_number:jsonObj["ordering_provider_phone_number"]
            },
            specimen_source:jsonObj["test_specimen_source"],
            first_test:{
                value:jsonObj["first_test_value"],
                previous_test_and_result:{
                    conclusion:jsonObj["previous_test_and_result_conclusion"],
                    previous_result:jsonObj["previous_result"],
                    type:jsonObj["previous_test_and_result_type"]
                },
                previous_test_date:jsonObj["previous_test_date"]
            },
            symptomatic:{
                date:jsonObj["symptomatic_date"],
                value:jsonObj["symptomatic_value"],
                symptom:jsonObj["symptom"].split('|')
            },
            pregnant:jsonObj["pregnant"],
            state:jsonObj["state"],
            test_image:"",
            zip_code:jsonObj["zip_code"]
        } as ITests
    }
    getAddressFromJSON(jsonObj:any):IPatientAddress{
        // console.log("enter into getAddressFromJSON")
        return {
            country:jsonObj["country"],
            county:jsonObj["county"],
            county_fips:jsonObj["county_fips"],
            state:jsonObj["state"],
            street_address:jsonObj["street_address"],
            zip_code:jsonObj["zip_code"]
        } as IPatientAddress
    }
    async getBatchId():Promise<string>{
        console.log("enter into getBatchId")
        let dt=new Date()
        return await generateHash(dt.getTime().toString(),10)
        
    }
}

