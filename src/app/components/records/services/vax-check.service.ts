import { ISkyflowConfig, ITokens } from "../../../interfaces/skyflow-config.interface";
import { RecordsDal } from "../dals/records.dals";
import { config } from "mssql"
import { DEFAULT_VAULT } from "../../../vaults";
import { IDiagnosticReports, IMedia, IProfile, IRecord, IVaccinations } from "../../../interfaces/record.interface";
import { IPasswordOptions, PasswordGenerator } from "../../../core/passwordGenerator/password.generate";
import { Skyflow } from "../../../core/skyflow-adapter/skyflow.adapter";
import { generateHash } from "../../../core";
import { IHTTPResponse } from "../../../interfaces/http-response.interface";

export class VaxCheckService {
    recordDals: RecordsDal
    vaultConfig: ISkyflowConfig
    resp:IHTTPResponse
    constructor(config?: config, vaultConfig?: ISkyflowConfig) {
        console.log('DEFAULT_VAULT-->', DEFAULT_VAULT);
        this.vaultConfig = vaultConfig || DEFAULT_VAULT
        this.recordDals = new RecordsDal(config);
        this.resp={
            response:null,
            status:200
        }
    }
    private async updateProfileMeta(profile: IProfile): Promise<IProfile> {
        let accessCodeGenrator = new PasswordGenerator({
            alphabets: true,
            digits: true,
            specialChars: false,
            upperCase: false
        } as IPasswordOptions)
        // let unixTimestamp = (new Date()).toISOString()

        profile.unique_identifier = await generateHash(JSON.stringify(profile));
        profile.access_code = accessCodeGenrator.generate(32);
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
                where name->'first_name' = to_json('${profile.name.first_name}'::text) AND name->'last_name' = to_json('${profile.name.last_name}'::text) and date_of_birth='${profile.date_of_birth}' and sex='${profile.sex}' 
            `;
            if(profile.name.middle_name){
                query+=` and name->'middle_name' = to_json('${profile.name.middle_name}'::text)`
            }
            console.log('query-->',query);
            // as of now only 2 attributes... "isTravelerExists" and "isPaymentDone"
            let resp=await skyflow.skyflowQueryWrapper(query)
            return parseInt(resp.records[0].fields.numb)>0;;
        }catch(err){
            throw err;
        }
    }
    
    async paymentStatus(profile: IProfile):Promise<IHTTPResponse>{
        try{
            let skyflow=new Skyflow(this.vaultConfig)
            let isTravelerExists=false, isPaymentDone=false,profiles_skyflow_id=null;
            let query=`select redaction(vaccinations.service_availed, 'PLAIN_TEXT'),profiles.skyflow_id from profiles
                LEFT JOIN vaccinations ON profiles.skyflow_id=vaccinations.profiles_skyflow_id
                where name->'first_name' = to_json('${profile.name.first_name}'::text) AND name->'last_name' = to_json('${profile.name.last_name}'::text) `;
            if(profile.name.middle_name){
                query+=` and name->'middle_name' = to_json('${profile.name.middle_name}'::text)`
            }
            if(profile.date_of_birth){
                query+=` and date_of_birth='${profile.date_of_birth}'`
            }
            if(profile.email_address){
                query+=` and email_address='${profile.email_address}'`
            }
            if(profile.org_id){
                query+=` and org_id='${profile.org_id}'`
            }
            if(profile.mobile_number){
                query+=` and mobile_number='${profile.mobile_number}'`
            }
            console.log('query-->',query);
            // as of now only 2 attributes... "isTravelerExists" and "isPaymentDone"
            let resp=await skyflow.skyflowQueryWrapper(query)
            console.log('ssss',JSON.stringify(resp))
            if(resp.records.length>0){
                isTravelerExists=true;
                profiles_skyflow_id=resp.records[0].fields.skyflow_id;
                if(resp.records[0].fields.service_availed==='VerifyFull'|| 
                resp.records[0].fields.service_availed==='VerifyRef' || 
                resp.records[0].fields.service_availed==='VerifyPromo'){
                    isPaymentDone=true
                }
            }
            console.log('ssss',JSON.stringify({isTravelerExists,isPaymentDone}))
            console.log('this.resp',JSON.stringify(this.resp))
            this.resp.response={isTravelerExists:isTravelerExists,isPaymentDone:isPaymentDone,profiles_skyflow_id}
            return this.resp
        }catch(err){
            throw err;
        }
    }
    async saveVaxProfile(profile: IProfile, vaccination: IVaccinations,diagnostic_reports:IDiagnosticReports,medias?: IMedia[]) {
        try {
            profile = await this.updateProfileMeta(profile);
            
            let skyflow = new Skyflow(this.vaultConfig)
            if(await this.checkUserExist(profile,skyflow)){
                return {msg:"user is already exist.",status:422}
            }
            console.log("saveVaxProfilesaveVaxProfilesaveVaxProfile-->", JSON.stringify(profile));
            let profileResponse = await skyflow.uploadBatch([{ profiles: profile }])
            let profiles_skyflow_id = profileResponse.responses[0].records[0].skyflow_id
            
            let records:IRecord[]=[]
            if(vaccination){
                vaccination= this.updateVaccinationMeta(profiles_skyflow_id,vaccination)
                records.push({
                    vaccinations: vaccination,
                   })
            }
            if(diagnostic_reports){
                diagnostic_reports=this.updateDiagnoMeta(profiles_skyflow_id,diagnostic_reports)
                records.push({diagnostic_reports:diagnostic_reports})
            }
            if(medias && medias.length>0){
                medias=this.updateMediaMeta(profiles_skyflow_id,medias)
                records.push({media:medias})
            }
            let vaccincationResponse=null
            if(records.length>0)
                vaccincationResponse = await skyflow.uploadBatch(records)
            // if(medias && medias.length>0){
            //     await Promise.all(medias.map(async (media) => await skyflow.uploadBatch([{ media: media}])));
            // }
            return { profileResponse, vaccincationResponse }
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
    
}