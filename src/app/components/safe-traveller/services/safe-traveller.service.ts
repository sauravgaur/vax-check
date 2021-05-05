import {Skyflow} from "../../../core"
import { IHTTPResponse } from "../../../interfaces/http-response.interface";

export class SafeTravellerService{
    constructor(){}
    async verifyAccessCode(firstName:string,lastName:string,dateOfBirth:string,accessCode:string,middleName?:string):Promise<IHTTPResponse> {
        let skyflow= new Skyflow(null,null,"f9e68956780e11eba8a08295107109db",null)
        try{
            let resp:IHTTPResponse={
                response:null,
                status:200
            };
             
            const name=middleName?`${firstName} ${middleName} ${lastName}`:`${firstName} ${lastName}`
            const query=`select patients.skyflow_id,redaction(patients.name,'PLAIN_TEXT'),patients.date_of_birth,
            vaccinations.cvx,vaccinations.vax_expiration from patients 
            LEFT JOIN vaccinations on patients.skyflow_id=vaccinations.patients_skyflow_id 
            WHERE patients.name='${name}' and patients.date_of_birth='${dateOfBirth}' and vaccinations.cvx='${accessCode}'`;
            console.log('query-->',query)
            resp.response= await skyflow.skyflowQueryWrapper(query)
            if(resp.response && resp.response.records.length==0){
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