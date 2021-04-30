import {Skyflow} from "../../../core"

export class SafeTravellerService{
    constructor(){}
    async verifyAccessCode(firstName:string,middleName:string,dateOfBirth:string,accessCode:string,lastName?:string) {
        let skyflow= new Skyflow(null,null,"f9e68956780e11eba8a08295107109db",null)
        try{
            const name=lastName?`${firstName} ${middleName} ${lastName}`:`${firstName} ${middleName}`
            const query=`select * from patients where name='${name}' and date_of_birth='${dateOfBirth}'`
            console.log('query-->',query)
            // const query=`select * FROM patients`
            return await skyflow.skyflowQueryWrapper(query)
        }catch(err){
            throw err
        }
        
    }
}