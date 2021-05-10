import { ISkyflowConfig } from "../../../interfaces/skyflow-config.interface";
import { RecordsDal } from "../dals/records.dals";
import { config } from "mssql"
import { DEFAULT_VAULT } from "../../../vaults";
import { IProfile, IVaccinations } from "../../../interfaces/record.interface";
import { IPasswordOptions, PasswordGenerator } from "../../../core/passwordGenerator/password.generate";
import { Skyflow } from "../../../core/skyflow-adapter/skyflow.adapter";

export class VaxCheckService{
    recordDals:RecordsDal
    vaultConfig:ISkyflowConfig
    constructor(config?:config,vaultConfig?:ISkyflowConfig){
        console.log('DEFAULT_VAULT-->',DEFAULT_VAULT);
        this.vaultConfig=vaultConfig ||DEFAULT_VAULT
        this.recordDals=new RecordsDal(config)
    }
    async saveVaxProfile(profile:IProfile,vaccination:IVaccinations){
        try{
            let accessCodeGenrator= new PasswordGenerator({
                alphabets:true,
                digits: true,
                specialChars:false,
                upperCase:false
            } as IPasswordOptions)
            vaccination.access_code=accessCodeGenrator.generate(32)
            vaccination.verification_status="PENDING";
            let skyflow=new Skyflow(this.vaultConfig)
            console.log("saveVaxProfilesaveVaxProfilesaveVaxProfile-->",JSON.stringify(profile));
            let profileResponse=await skyflow.uploadBatch([{profiles:profile}])
            vaccination.profiles_skyflow_id= profileResponse.responses[0].records[0].skyflow_id
            let vaccincationResponse= await skyflow.uploadBatch([{vaccinations:vaccination}])
            return {profileResponse,vaccincationResponse}
        }catch(err){
            throw err;
        }
        
    }
}