import { Request, Response } from "express";
import { generateHash } from "../../../core/encryptor/hash.encryptor";
import {httpError} from "../../../core/errorHandler/http.error.handler"
import {BatchService} from "../services/batch.service"
import {SkyflowDal} from "../dals/skyflow.dals"
import { IBatch, IMATADATARECORDS, IPatientAddress, IProfile, IRecord, ISourceProvider, IDiagnosticReports, IVaccinations, IMedia } from "../../../interfaces/record.interface";
import { IPasswordOptions, PasswordGenerator } from "../../../core/passwordGenerator/password.generate";
import { VaxCheckService } from "../services/vax-check.service";
import { IHTTPResponse } from "../../../interfaces/http-response.interface";
import { VaccinationService } from "../services/vaccination.service";
import { PaymentService } from "../../payment/services/payment.service";
import { Skyflow } from "../../../core";
import { ISkyflowConfig } from "../../../interfaces/skyflow-config.interface";
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
            let skyflow=new Skyflow({} as ISkyflowConfig)
            let resp=await skyflow.signedJwtTokenWorkspace()
            return res.send(resp)
        }catch(err){
            console.log("err-->",err)
            return res.status(500).send(err)
        }
    }
    async saveVaxProfile(req: Request, res: Response){
        try{
            let profile=req.body.profiles as IProfile;
            let vaccination=req.body.vaccination as IVaccinations;
            let diagnostic_reports=req.body.diagnostic_reports as IDiagnosticReports;
            let media=req.body.media as IMedia[]
            let vaxCheckService= new VaxCheckService();
            console.log("profile-->",profile);
            console.log("vaccination-->",vaccination);
            console.log("diagnostic_reports-->",diagnostic_reports);
            console.log("media-->",media);
            let resp= await vaxCheckService.saveVaxProfile(profile,vaccination,diagnostic_reports,media)
            vaxCheckService.sendInProcessEmail(profile.email_address!, profile.name.first_name);
            if(resp.status && resp.status===422){
                return res.status(422).send({msg:resp.msg})
            }
            return res.send(resp)
            
        }catch(err){
            console.log("err-->",err)
            return res.status(500).send(err)
        }
    }
    async patientStatusUpdate(req: Request, res: Response){
        try{
            let {profiles_skyflow_id,vaccinations_skyflow_id,verification_status,verification_source,evedence_path}=req.body;
            if(!profiles_skyflow_id){
                return httpError(res,422,"id is missing",{desc:`mandatory fields are "id","verification_status" and "verification_source"`})
            }
            if(!verification_status){
                return httpError(res,422,"verification_status is missing",{desc:`mandatory fields are "id","verification_status" and "verification_source"`})
            }
            if(!verification_source){
                return httpError(res,422,"verification_source is missing",{desc:`mandatory fields are "id","verification_status" and "verification_source"`})
            }
            let vaxCheckService= new VaxCheckService();
            let batchService = new BatchService();
            // patientById
            let resp= await vaxCheckService.patientStatusUpdate(profiles_skyflow_id,verification_status,verification_source,evedence_path,vaccinations_skyflow_id)
            if(verification_status==="VERIFIED"){
                const {name,email_address,org_id,verification_source,verification_status,access_code}=await batchService.patientDetailForMail(profiles_skyflow_id);
                vaxCheckService.sendVerifiedEmail(email_address, name.first_name, access_code);
            }
            return res.send(resp)
            
        }catch(err){
            console.log("err-->",err)
            return res.status(500).send(err)
        }
    }
    async updateVaccinationNotes(req: Request, res: Response){
        try{
            let {verification_notes,profiles_skyflow_id}=req.body;
            if(!verification_notes){
                return httpError(res,422,"verification_notes is missing",{desc:`mandatory fields are "verification_notes" and "profiles_skyflow_id"`})
            }
            if(!profiles_skyflow_id){
                return httpError(res,422,"profiles_skyflow_id is missing",{desc:`mandatory fields are "verification_notes" and "profiles_skyflow_id"`})
            }
            
            let vaccinationService= new VaccinationService();
            let resp= await vaccinationService.updateVaccinationNotes(verification_notes,profiles_skyflow_id)
            return res.send(resp)
            
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
            let vaxCheckService= new VaxCheckService();
            let profile:IProfile={
                name:{
                    first_name:firstName,
                    middle_name:middleName,
                    last_name:lastName,
                },
                date_of_birth:dateOfBirth
            }
            let response= await vaxCheckService.checkUserExist(profile)
            return res.status(200).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }
    async paymentStatus(req: Request, res: Response){
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
            let vaxCheckService= new VaxCheckService();
            let profile:IProfile={
                name:{
                    first_name:firstName,
                    middle_name:middleName,
                    last_name:lastName,
                },
                date_of_birth:dateOfBirth
            }
            let {response,status}= await vaxCheckService.paymentStatus(profile)
            console.log("response-->",response);
            console.log("status-->",status);
            return res.status(status).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }

    async checkPatientExist(req: Request, res: Response){
        try{
            let {firstName,middleName,lastName,dateOfBirth,email_address,org_id,mobile_number} = req.body;
            if(!firstName){
                return httpError(res,422,"firstName is missing",{desc:`mandatory fields are "firstName","lastName","email_address","org_id" and "mobile_number"`})
            }
            if(!email_address){
                return httpError(res,422,"email_address is missing",{desc:`mandatory fields are "firstName","lastName","email_address","org_id" and "mobile_number"`})
            }
            if(!lastName){
                return httpError(res,422,"lastName is missing",{desc:`mandatory fields are "firstName","lastName","email_address","org_id" and "mobile_number"`})
            }
            // if(!org_id){
            //     return httpError(res,422,"org_id is missing",{desc:`mandatory fields are "firstName","lastName","email_address","org_id" and "mobile_number"`})
            // }
            if(!mobile_number){
                return httpError(res,422,"mobile_number is missing",{desc:`mandatory fields are "firstName","lastName","email_address","org_id" and "mobile_number"`})
            }
            let vaxCheckService= new VaxCheckService();
            let profile:IProfile={
                name:{
                    first_name:firstName,
                    middle_name:middleName,
                    last_name:lastName,
                },
                email_address,
                org_id,
                mobile_number,
                date_of_birth:dateOfBirth
            }
            let {response,status}= await vaxCheckService.paymentStatus(profile)
            console.log("response-->",response);
            console.log("status-->",status);
            return res.status(status).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }
    
    async unverifiedPatient(req: Request, res: Response){
        try{
            let batchService= new BatchService();
            let {status,response}= await batchService.unverifiedPatients()
            return res.status(status).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }
    async allPatient(req: Request, res: Response){
        try{
            let batchService= new BatchService();
            let {status,response}= await batchService.allPatient()
            return res.status(status).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }
    async allEmployees(req: Request, res: Response){
        try{
            let batchService= new BatchService();
            let {org_id}= req.params
            let limit=req.query.limit as string;
            let offset=req.query.offset as string;
            
            let {status,response}= await batchService.allPatient(org_id,limit,offset)
            return res.status(status).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }
    async allEmployeesCount(req: Request, res: Response){
        try{
            let batchService= new BatchService();
            let {org_id}= req.params
            let {status,response}= await batchService.allPatientCount(org_id)
            return res.status(status).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }
    
    async patientById(req: Request, res: Response){
        try{
            let batchService= new BatchService();
            let {id} = req.params
            let {status,response}= await batchService.patientById(id)
            return res.status(status).send(response)
            
        }catch(err){
            return httpError(res,500,"Internal server error",{desc:err})
        }
    }
    
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
                profiles:patients,
                diagnostic_reports:this.getdiagnoReportFromJSON(jsonObj),
                vaccinations:this.getVaccinationFromJSON(jsonObj)
            } 
            return record
        })
        ); 
    }
    getMetadataFromJSON(jsonObj:any):IMATADATARECORDS{
        // console.log("enter into getMetadataFromJSON")
        return {
            created_timestamp:jsonObj["created_timestamp"],
            status:{
                state:jsonObj["meta_status_state"]
            }
        } as IMATADATARECORDS;
    }
    getVaccinationFromJSON(jsonObj:any):IVaccinations{
        // console.log("enter into getVaccinationFromJSON")
        return {
            vaccination_event_identifier:jsonObj["vaccination_event_identifier"],
            vaccination_certification_status:jsonObj["vaccination_certification_status"],
            vaccination_issuer_type:jsonObj["vaccination_issuer_type"],
            ordered_date:jsonObj["ordered_date"],
            administered_date:jsonObj["administered_date"],
            effective_date:jsonObj["effective_date"],
            expiration_date:jsonObj["expiration_date"],
            vaccine_name:jsonObj["vaccine_name"],
            vaccine_cvx_code:jsonObj["vaccine_cvx_code"],
            vaccine_product_code:jsonObj["vaccine_product_code"],
            vaccine_manufacturer_name:jsonObj["vaccine_manufacturer_name"],
            lot_number:jsonObj["lot_number"],
            site:jsonObj["site"],
            route:jsonObj["route"],
            dose_number:jsonObj["dose_number"],
            series_complete:jsonObj["series_complete"],
            series_doses:jsonObj["series_doses"],
            vaccine_refusal:jsonObj["vaccine_refusal"],
            recipient_comorbidity_status:jsonObj["recipient_comorbidity_status"],
            recipient_missed_appt:jsonObj["recipient_missed_appt"],
            serology:jsonObj["serology"],
            extract_type:jsonObj["extract_type"],
            master_id:jsonObj["master_id"],
            reference_id:jsonObj["reference_id"],
            reference_system:jsonObj["reference_system"],
            verification_source:jsonObj["verification_source"],
            verification_status:jsonObj["verification_status"],
            travel_date:jsonObj["travel_date"],
            access_code:jsonObj["access_code"],
            supporting_doc:jsonObj["supporting_doc"],
            traveler_type:jsonObj["traveler_type"],
            service_availed:jsonObj["service_availed"],
            recipient:jsonObj["recipient"],
            performer:jsonObj["performer"],

        } as IVaccinations;
    }
    async getPatientFromJSON(jsonObj:any):Promise<IProfile>{
        const batch_id= await this.getBatchId()
        let age=jsonObj["age"] && !isNaN(jsonObj["age"])?parseInt(jsonObj["age"]):0;
        return {
            name:{
                first_name:jsonObj["first_name"],
                last_name:jsonObj["last_name"],
                middle_name:jsonObj["middle_name"]
            },
            unique_identifier:batch_id,
            address:this.getAddressFromJSON(jsonObj),
            email_address:jsonObj["email"],
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
        } as IProfile
    }
    getdiagnoReportFromJSON(jsonObj:any):IDiagnosticReports{
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
        } as IDiagnosticReports
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

