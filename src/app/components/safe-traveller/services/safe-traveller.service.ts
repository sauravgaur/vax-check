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
            const query=`select * from patients where name='${name}' and date_of_birth='${dateOfBirth}'`
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