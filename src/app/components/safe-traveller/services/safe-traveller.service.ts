import {Skyflow} from "../../../core"

export class SafeTravellerService{
    constructor(){}
    async verifyAccessCode(firstName:string,middleName:string,dateOfBirth:string,accessCode:string,lastName?:string) {
        let skyflow= new Skyflow(null,null,null,null)
        try{
            const name=lastName?`${firstName} ${middleName} ${lastName}`:`${firstName} ${middleName}`
            // const query=`select * from patients where name='${name}' and date_of_birth=${dateOfBirth}`
            const query=`select count(*) FROM patients`
            return await skyflow.skyflowQueryWrapper(query)
        }catch(err){
            throw err
        }
        
    }
}