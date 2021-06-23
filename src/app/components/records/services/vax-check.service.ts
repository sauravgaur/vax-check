import { ISkyflowConfig, ITokens } from "../../../interfaces/skyflow-config.interface";
import { RecordsDal } from "../dals/records.dals";
import { config } from "mssql"
import { DEFAULT_VAULT } from "../../../vaults";
import { IDiagnosticReports, IMedia, IProfile, IRecord, IVaccinations } from "../../../interfaces/record.interface";
import { IPasswordOptions, PasswordGenerator } from "../../../core/passwordGenerator/password.generate";
import { Skyflow } from "../../../core/skyflow-adapter/skyflow.adapter";
import { generateHash } from "../../../core";
import { IHTTPResponse } from "../../../interfaces/http-response.interface";
import { MailService } from "../../../utils/mailer/mail.service";
import { vaccinationInProcessEmail, vaccinationVerifiedEmail } from "../../../utils/mailer/mail-template/email.html";

export class VaxCheckService {
    recordDals: RecordsDal
    vaultConfig: ISkyflowConfig
    mailService: MailService
    resp:IHTTPResponse
    constructor(config?: config, vaultConfig?: ISkyflowConfig) {
        console.log('DEFAULT_VAULT-->', DEFAULT_VAULT);
        this.vaultConfig = vaultConfig || DEFAULT_VAULT
        this.recordDals = new RecordsDal(config);
        this.resp={
            response:null,
            status:200
        }
        this.mailService = new MailService();
    }
    private async updateProfileMeta(profile: IProfile): Promise<IProfile> {
        let accessCodeGenrator = new PasswordGenerator({
            alphabets: true,
            digits: true,
            specialChars: false,
            upperCase: false
        } as IPasswordOptions)
        // let unixTimestamp = (new Date()).toISOString()
        if(!profile.skyflow_id){
            profile.unique_identifier = await generateHash(JSON.stringify(profile));
            profile.access_code = accessCodeGenrator.generate(32);
        }
        profile.name.first_name=profile.name.first_name.toLowerCase();
        profile.name.middle_name=profile.name.middle_name?profile.name.middle_name.toLowerCase():null;
        profile.name.last_name=profile.name.last_name.toLowerCase();
        profile.email_address=profile.email_address?.toLowerCase();
        // profile.created_timestamp = unixTimestamp;
        // profile.updated_timestamp = unixTimestamp;

        return profile;
    }

    private updateVaccinationMeta(profiles_skyflow_id: string, vaccination: IVaccinations): IVaccinations {
        // let unixTimestamp = (new Date()).toString()
        vaccination.profiles_skyflow_id=profiles_skyflow_id;
        vaccination.verification_status = "PENDING";
        // vaccination.created_timestamp= unixTimestamp;
        // vaccination.updated_timestamp=unixTimestamp;
        return vaccination;
    }
    private updateDiagnoMeta(profiles_skyflow_id: string, diagnostic_reports: IDiagnosticReports): IDiagnosticReports {
        // let unixTimestamp = (new Date()).toString()
        diagnostic_reports.profiles_skyflow_id=profiles_skyflow_id;
        // diagnostic_reports.created_timestamp= unixTimestamp;
        // diagnostic_reports.updated_timestamp=unixTimestamp;
        return diagnostic_reports;
    }
    private updateMediaMeta(profiles_skyflow_id: string, medias: IMedia[]): IMedia[] {
        return medias.map(media=>{
            media.profiles_skyflow_id=profiles_skyflow_id
            return media
        })
    }

    async checkUserExist(profile: IProfile,skyflow?:Skyflow):Promise<boolean>{
        try{
            if(!skyflow){
                skyflow=new Skyflow(this.vaultConfig)
            }
            let query=`select count(*) as numb from profiles
                where name->'first_name' = to_json('${profile.name.first_name.toLowerCase()}'::text) AND name->'last_name' = to_json('${profile.name.last_name.toLowerCase()}'::text) and date_of_birth='${profile.date_of_birth}' and sex='${profile.sex}' 
            `;
            if(profile.name.middle_name){
                query+=` and name->'middle_name' = to_json('${profile.name.middle_name.toLowerCase()}'::text)`
            }
            console.log('query-->',query);
            // as of now only 2 attributes... "isTravelerExists" and "isPaymentDone"
            let resp=await skyflow.skyflowQueryWrapper(query)
            return parseInt(resp.records[0].fields.numb)>0;;
        }catch(err){
            throw err;
        }
    }
    
    async paymentStatus(profile: IProfile,skyflow?:Skyflow,token?:ITokens):Promise<IHTTPResponse>{
        try{
            if(!skyflow)
                skyflow=new Skyflow(this.vaultConfig)
            let isTravelerExists=false, isPaymentDone=false,profiles_skyflow_id=null,vaccination_skyflow_id=null,media_ids=[];
            let query=`select redaction(vaccinations.service_availed, 'PLAIN_TEXT'),profiles.skyflow_id from profiles
                LEFT JOIN vaccinations ON profiles.skyflow_id=vaccinations.profiles_skyflow_id
                where name->'first_name' = to_json('${profile.name.first_name.toLowerCase()}'::text) AND name->'last_name' = to_json('${profile.name.last_name.toLowerCase()}'::text) `;
            if(profile.name.middle_name){
                query+=` and name->'middle_name' = to_json('${profile.name.middle_name.toLowerCase()}'::text)`
            }
            if(profile.date_of_birth){
                query+=` and date_of_birth='${profile.date_of_birth}'`
            }
            if(profile.email_address){
                query+=` and email_address='${profile.email_address.toLowerCase()}'`
            }
            if(profile.org_id){
                query+=` and org_id='${profile.org_id}'`
            }
            if(profile.mobile_number){
                query+=` and mobile_number='${profile.mobile_number}'`
            }
            console.log('query-->',query);
            // as of now only 2 attributes... "isTravelerExists" and "isPaymentDone"
            if(!token)
                token= await skyflow.getBearerToken()
            let resp=await skyflow.skyflowQueryWrapper(query,token)
            console.log('ssss',JSON.stringify(resp))
            if(resp.records.length>0){
                isTravelerExists=true;
                profiles_skyflow_id=resp.records[0].fields.skyflow_id;
                let queryVaccination=`select redaction(vaccinations.skyflow_id, 'PLAIN_TEXT') from vaccinations where profiles_skyflow_id= '${profiles_skyflow_id}'`
                let respVaccination=await skyflow.skyflowQueryWrapper(queryVaccination,token)
                if(respVaccination.records.length>0){
                    vaccination_skyflow_id=respVaccination.records[0].fields.skyflow_id
                }
                let queryMedia=`select 
                redaction(media.skyflow_id, 'PLAIN_TEXT'),
                redaction(media.document_type, 'PLAIN_TEXT') from media where profiles_skyflow_id= '${profiles_skyflow_id}'`
                let respMedia=await skyflow.skyflowQueryWrapper(queryMedia,token)
                if(respMedia.records.length>0){
                    media_ids=respMedia.records.map((data:any)=>{
                        return {
                            skyflow_id:data.fields.skyflow_id,
                            document_type:data.fields.document_type
                        }
                    })
                }
                if(resp.records[0].fields.service_availed==='VerifyFull'|| 
                resp.records[0].fields.service_availed==='VerifyRef' || 
                resp.records[0].fields.service_availed==='VerifyPromo'){
                    isPaymentDone=true
                }
            }
            console.log('ssss',JSON.stringify({isTravelerExists,isPaymentDone}))
            console.log('this.resp',JSON.stringify(this.resp))
            this.resp.response={isTravelerExists:isTravelerExists,isPaymentDone:isPaymentDone,profiles_skyflow_id,vaccination_skyflow_id,media_ids}
            return this.resp
        }catch(err){
            throw err;
        }
    }
    async saveVaxProfile(profile: IProfile, vaccination: IVaccinations,diagnostic_reports:IDiagnosticReports,medias?: IMedia[]) {
        try {
            profile = await this.updateProfileMeta(profile);
            
            let skyflow = new Skyflow(this.vaultConfig)
            let token=await skyflow.getBearerToken();
            if(!profile.skyflow_id && await this.checkUserExist(profile,skyflow)){
                return {msg:"user is already exist.",status:422}
            }
            console.log("saveVaxProfilesaveVaxProfilesaveVaxProfile-->", JSON.stringify(profile));
            let profiles_skyflow_id = null
            if(profile.skyflow_id){
                profiles_skyflow_id=profile.skyflow_id;
                delete profile.skyflow_id;
                console.log("if--->",profile);
                await skyflow.skyflowUpdateWrapper(profile,"profiles",profiles_skyflow_id as string,token)
            }else{
                profiles_skyflow_id= (await skyflow.uploadBatch([{ profiles: profile }])).responses[0].records[0].skyflow_id
            }
            
            let records:IRecord[]=[]
            if(vaccination){
                if(!vaccination.skyflow_id){
                    vaccination= this.updateVaccinationMeta(profiles_skyflow_id,vaccination)
                    records.push({
                        vaccinations: vaccination,
                   })
                }
                else{
                    const vaccination_id=vaccination.skyflow_id
                    delete vaccination.skyflow_id
                    delete vaccination.profiles_skyflow_id
                    await skyflow.skyflowUpdateWrapper(vaccination,"vaccinations",vaccination_id as string,token)
                }
            }
            
            if(diagnostic_reports){
                diagnostic_reports=this.updateDiagnoMeta(profiles_skyflow_id,diagnostic_reports)
                records.push({diagnostic_reports:diagnostic_reports})
            }
            if(medias && medias.length>0){
                let newMedia=[];
                for(let i=0; i<medias.length;i++){
                    if(medias[i].skyflow_id){
                        const media_skyflow_id=medias[i].skyflow_id
                        delete medias[i].skyflow_id;
                        delete medias[i].profiles_skyflow_id;
                        await skyflow.skyflowUpdateWrapper(medias[i],"media",media_skyflow_id as string,token)
                    }else{
                        newMedia.push(medias[i])
                    }
                }
                newMedia=this.updateMediaMeta(profiles_skyflow_id,newMedia)
                if(newMedia.length>0){
                    records.push({media:newMedia})
                }
            }
            let vaccincationResponse=null
            // console.log('\n\n\n\n\n records--->',records)
            if(records.length>0){
                console.log("if records.length>0---->")
                vaccincationResponse = await skyflow.uploadBatch(records)
            }
                
            // if(medias && medias.length>0){
            //     await Promise.all(medias.map(async (media) => await skyflow.uploadBatch([{ media: media}])));
            // }

            // return { "profileResponse", vaccincationResponse }
            return { msg:"save/update successfully executed" }
        } catch (err) {
            throw err;
        }
    }
    async patientStatusUpdate(profiles_skyflow_id:string,verification_status:string,verification_source:string,evedence_path:string,vaccinations_skyflow_id?:string) {
        try {
            let skyflow = new Skyflow(this.vaultConfig)
            const tokens:ITokens= await skyflow.getBearerToken();
            vaccinations_skyflow_id=vaccinations_skyflow_id || await skyflow.getVaccinationId(profiles_skyflow_id,tokens);
            let vaccinationResp=await skyflow.skyflowUpdateWrapper({
                verification_status,verification_source
            } as IVaccinations,"vaccinations",vaccinations_skyflow_id,tokens);

            let mediaResp= await skyflow.uploadBatch([{
                media:[{
                    document_type:'EVIDENCE',
                    file_path:evedence_path,
                    profiles_skyflow_id:profiles_skyflow_id
                }]
            }])

            return {vaccinationResp,mediaResp};
        } catch (err) {
            throw err;
        }
    }

    async sendInProcessEmail(travelerEmail: string, firstNm?: string) {
        const firstName = firstNm ? firstNm : 'First Name';
        await this.mailService.sendMail(
            {
                // from: 'vaxcheckservice@vaxcheck.us',
                to: travelerEmail,
                subject: 'Your vaccination verification is in progress',
                html: vaccinationInProcessEmail(firstName)
            }
        );
    }

    async sendVerifiedEmail(travelerEmail: string, firstNm: string, accessCode: string) {
        const firstName = firstNm ? firstNm : 'First Name';
        // const accessCode = '3A899SK@72939@183#2';
        await this.mailService.sendMail(
            {
                // from: 'vaxcheckservice@vaxcheck.us',
                to: travelerEmail,
                subject: 'Your vaccination information has been verified',
                html: vaccinationVerifiedEmail(accessCode, firstName)
            }
        );
    }
}
