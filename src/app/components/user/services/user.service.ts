import { IHTTPResponse } from "../../../interfaces/http-response.interface";
import { ISkyflowConfig } from "../../../interfaces/skyflow-config.interface";
import { DEFAULT_VAULT } from "../../../vaults";
import { config } from "mssql"
import { IUser } from "../../../interfaces/user.interface";
import { generateHash, Skyflow,compareHash } from "../../../core/index";
import { sign } from "jsonwebtoken";
const secretKey=`b3PpYbuZefSBHJabnf3VtJ3pjyvZZbsH`
export class UserService {
    vaultConfig: ISkyflowConfig
    resp:IHTTPResponse
    constructor(config?: config, vaultConfig?: ISkyflowConfig) {
        console.log('config-->', config);
        this.vaultConfig = vaultConfig || DEFAULT_VAULT
        this.resp={
            response:null,
            status:200
        }
    }
    async checkUserExist(user: IUser,skyflow?:Skyflow):Promise<any>{
        try{
            if(!skyflow){
                skyflow=new Skyflow(this.vaultConfig)
            }
            let query=`select 
            redaction(users.email, 'PLAIN_TEXT'), 
            redaction(users.first_name, 'PLAIN_TEXT'), 
            redaction(users.middle_name, 'PLAIN_TEXT'), 
            redaction(users.last_name, 'PLAIN_TEXT'), 
            redaction(users.org_id, 'PLAIN_TEXT'), 
            redaction(users.role, 'PLAIN_TEXT'), 
            redaction(users.password, 'PLAIN_TEXT') 
            from users
                where email='${user.email}' 
            `;
            if(user.first_name){
                query+=` and first_name='${user.first_name}'`
            }
            if(user.middle_name){
                query+=` and middle_name='${user.middle_name}'`
            }
            if(user.last_name){
                query+=` and last_name='${user.last_name}'`
            }
            console.log('query-->',query);
            // as of now only 2 attributes... "isTravelerExists" and "isPaymentDone"
            let resp=await skyflow.skyflowQueryWrapper(query)
            return resp.records;
        }catch(err){
            throw err;
        }
    }
    async login(user:IUser):Promise<IHTTPResponse>{
        try{
            const skyflow = new Skyflow(this.vaultConfig)
            let userProfile= await this.checkUserExist(user,skyflow)
            console.log('userProfile--.',userProfile)
            if(userProfile.length===0){
                this.resp={response:"user doesn't exist.",status:422}
                return this.resp
            }
            userProfile=userProfile[0].fields;
            const passwordMatched=await compareHash(user.password as string,userProfile.password)
            if(!passwordMatched){
                this.resp={response:"Password doesn't matched",status:422}
                return this.resp
            }
            delete userProfile.password;
            const signedJWT=sign({
                data:userProfile,
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
            },secretKey)
            this.resp.response=signedJWT;
            return this.resp
        }catch(err){
            console.log("createUser err-->",err);
            throw err
        }
    }
    async createUser(user:IUser):Promise<IHTTPResponse>{
        try{
            const skyflow = new Skyflow(this.vaultConfig)
            const userProfile= await this.checkUserExist(user,skyflow)
            console.log(userProfile);
            if(userProfile.length>0){
                this.resp={response:"user is already exist.",status:422}
                return this.resp
            }
            user.password= await generateHash(user.password as string);
            console.log("saveVaxProfilesaveVaxProfilesaveVaxProfile-->", JSON.stringify(user));
            const userResponse = await skyflow.uploadBatch([{ users: user }])
            this.resp.response=userResponse;
            return this.resp
        }catch(err){
            console.log("createUser err-->",err);
            throw err
        }
        
    }
    // private async updateProfileMeta(profile: IProfile): Promise<IProfile> {
    //     let accessCodeGenrator = new PasswordGenerator({
    //         alphabets: true,
    //         digits: true,
    //         specialChars: false,
    //         upperCase: false
    //     } as IPasswordOptions)
    //     // let unixTimestamp = (new Date()).toISOString()

    //     profile.unique_identifier = await generateHash(JSON.stringify(profile));
    //     profile.access_code = accessCodeGenrator.generate(32);
    //     // profile.created_timestamp = unixTimestamp;
    //     // profile.updated_timestamp = unixTimestamp;

    //     return profile;
    // }
}