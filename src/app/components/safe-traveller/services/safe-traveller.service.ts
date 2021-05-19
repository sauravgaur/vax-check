import {Skyflow} from "../../../core"
import { IHTTPResponse } from "../../../interfaces/http-response.interface";
import { ISkyflowConfig } from "../../../interfaces/skyflow-config.interface";
import {DEFAULT_VAULT} from "../../../vaults/index"
export class SafeTravellerService{
    vaultConfig:ISkyflowConfig
    constructor(
        vaultConfig?:ISkyflowConfig
    ){
        this.vaultConfig=vaultConfig || DEFAULT_VAULT
    }
    async verifyAccessCode(firstName:string,lastName:string,dateOfBirth:string,accessCode:string,middleName?:string):Promise<IHTTPResponse> {
        let skyflow= new Skyflow(this.vaultConfig)
        try{
            let resp:IHTTPResponse={
                response:null,
                status:200
            };
            const name=middleName?`${firstName} ${middleName} ${lastName}`:`${firstName} ${lastName}`
            let query=`select profiles.skyflow_id, redaction(profiles.name, 'PLAIN_TEXT'),redaction(profiles.access_code, 'PLAIN_TEXT'),redaction(vaccinations.expiration_date, 'PLAIN_TEXT'),redaction(vaccinations.effective_date, 'PLAIN_TEXT'), redaction(profiles.date_of_birth, 'PLAIN_TEXT') from profiles 
            LEFT JOIN vaccinations ON profiles.skyflow_id=vaccinations.profiles_skyflow_id WHERE 
            profiles.name->'first_name' = to_json('${firstName}'::text) AND profiles.name->'last_name' = to_json('${lastName}'::text) and profiles.date_of_birth='${dateOfBirth}' and profiles.access_code='${accessCode}`;
            if(middleName){
                query+=` and profiles.name->'middle_name' = to_json('${middleName}'::text)`
            }
            console.log('query-->',query)
            resp.response= await skyflow.skyflowQueryWrapper(query)
            resp.response.records= resp.response.records.map((record:any)=>{
                return{
                    accessCode:record.fields.cvx,
                    date_of_birth:record.fields.date_of_birth,
                    name:record.fields.name,
                    vaxcheck_id:record.fields.skyflow_id,
                    // vax_expiration:record.fields.vax_expiration,
                    vax_effective:record.fields.vax_effective
                }
            })
            if(resp.response && resp.response.length==0){
                resp.response["accessStatus"]="NOT_VERIFIED";
                resp.status= 403
            }
            else{
                resp.response["accessStatus"]="VERIFIED";
            }
            // const query=`select * FROM patients`
            return resp
        }catch(err){
            throw err
        }
        
    }
}