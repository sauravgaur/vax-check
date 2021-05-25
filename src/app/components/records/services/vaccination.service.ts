import { ISkyflowConfig, ITokens } from "../../../interfaces/skyflow-config.interface";
import { RecordsDal } from "../dals/records.dals";
import { config } from "mssql"
import { DEFAULT_VAULT } from "../../../vaults";
import { IDiagnosticReports, IMedia, IProfile, IRecord, IVaccinations } from "../../../interfaces/record.interface";
import { IPasswordOptions, PasswordGenerator } from "../../../core/passwordGenerator/password.generate";
import { Skyflow } from "../../../core/skyflow-adapter/skyflow.adapter";
import { generateHash } from "../../../core";
import { IHTTPResponse } from "../../../interfaces/http-response.interface";
import { VaxCheckService } from "./vax-check.service";

export class VaccinationService {
    recordDals: RecordsDal
    vaultConfig: ISkyflowConfig
    recordDatConfig?:config
    resp:IHTTPResponse
    constructor(config?: config, vaultConfig?: ISkyflowConfig) {
        console.log('DEFAULT_VAULT-->', DEFAULT_VAULT);
        this.vaultConfig = vaultConfig || DEFAULT_VAULT
        this.recordDatConfig=config
        this.recordDals = new RecordsDal(config);
        this.resp={
            response:null,
            status:200
        }
    }
    
    async updateVaccinationNotes(verification_notes:string,profiles_skyflow_id:string):Promise<IHTTPResponse>{
        try{
            const vaxCheckService= new VaxCheckService(this.recordDatConfig,this.vaultConfig)
            let skyflow = new Skyflow(this.vaultConfig)
            const tokens:ITokens= await skyflow.getBearerToken();
            const vaccinations_skyflow_id=await vaxCheckService.getVaccinationId(profiles_skyflow_id,skyflow,tokens);
            let updateResponse=await skyflow.skyflowUpdateWrapper({
                verification_notes
            } as IVaccinations,"vaccinations",vaccinations_skyflow_id,tokens);
            this.resp.response=updateResponse
            return this.resp
        
        }catch(err){
            throw err
        }
    }
    
}