import { ISkyflowConfig } from "../../../interfaces/skyflow-config.interface";
import { RecordsDal } from "../dals/records.dals";
import { config } from "mssql"
import { DEFAULT_VAULT } from "../../../vaults";
import { IDiagnosticReports, IProfile, IVaccinations } from "../../../interfaces/record.interface";
import { IPasswordOptions, PasswordGenerator } from "../../../core/passwordGenerator/password.generate";
import { Skyflow } from "../../../core/skyflow-adapter/skyflow.adapter";
import { generateHash } from "../../../core";

export class VaxCheckService {
    recordDals: RecordsDal
    vaultConfig: ISkyflowConfig
    constructor(config?: config, vaultConfig?: ISkyflowConfig) {
        console.log('DEFAULT_VAULT-->', DEFAULT_VAULT);
        this.vaultConfig = vaultConfig || DEFAULT_VAULT
        this.recordDals = new RecordsDal(config)
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
            let resp=await skyflow.skyflowQueryWrapper(query)
            return parseInt(resp.records[0].fields.numb)>0;
        }catch(err){
            throw err;
        }
    }
    async isPaymentDone(profile: IProfile,skyflow?:Skyflow){

    }
    async saveVaxProfile(profile: IProfile, vaccination: IVaccinations,diagnostic_reports:IDiagnosticReports) {
        try {
            profile = await this.updateProfileMeta(profile);
            
            let skyflow = new Skyflow(this.vaultConfig)
            if(await this.checkUserExist(profile,skyflow)){
                return {msg:"user is already exist."}
            }
            console.log("saveVaxProfilesaveVaxProfilesaveVaxProfile-->", JSON.stringify(profile));
            let profileResponse = await skyflow.uploadBatch([{ profiles: profile }])
            let profiles_skyflow_id = profileResponse.responses[0].records[0].skyflow_id
            vaccination= this.updateVaccinationMeta(profiles_skyflow_id,vaccination)
            diagnostic_reports=this.updateDiagnoMeta(profiles_skyflow_id,diagnostic_reports)
            let vaccincationResponse = await skyflow.uploadBatch([{ vaccinations: vaccination,diagnostic_reports:diagnostic_reports }])
            return { profileResponse, vaccincationResponse }
        } catch (err) {
            throw err;
        }
    }
    async patientStatusUpdate(id:string,verification_status:string,verification_source:string,evedence_path:string) {
        try {
            // let skyflow = new Skyflow(this.vaultConfig)
            // let vaccination:IVaccinations={verification_status,verification_source,tes}
        } catch (err) {
            throw err;
        }
    }
    
}