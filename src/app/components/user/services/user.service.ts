import { IHTTPResponse } from "../../../interfaces/http-response.interface";
import { ISkyflowConfig, ITokens } from "../../../interfaces/skyflow-config.interface";
import { DEFAULT_VAULT } from "../../../vaults";
import { config } from "mssql"
import { IUser } from "../../../interfaces/user.interface";
import { generateHash, Skyflow,compareHash, PasswordGenerator } from "../../../core/index";
import { sign } from "jsonwebtoken";
import { MailService } from "../../../utils/mailer/mail.service";
import { loginOtpEmail } from "../../../utils/mailer/mail-template/email.html";
import { IProfile } from "../../../interfaces/record.interface";
const secretKey=`b3PpYbuZefSBHJabnf3VtJ3pjyvZZbsH`
export class UserService {
    vaultConfig: ISkyflowConfig
    resp:IHTTPResponse
    mailService:MailService
    constructor(config?: config, vaultConfig?: ISkyflowConfig) {
        console.log('config-->', config);
        this.vaultConfig = vaultConfig || DEFAULT_VAULT
        this.resp={
            response:null,
            status:200
        }
        this.mailService= new MailService()
    }
    async checkUserExist(user: IUser,skyflow?:Skyflow,token?:ITokens):Promise<any>{
        try{
            if(!skyflow){
                skyflow=new Skyflow(this.vaultConfig);
            }
            if(!token){
                token=  await skyflow.getBearerToken();
            }
            let query=`select 
            redaction(users.email, 'PLAIN_TEXT'), 
            redaction(users.skyflow_id, 'PLAIN_TEXT'), 
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
            let resp=await skyflow.skyflowQueryWrapper(query,token)
            return resp.records;
        }catch(err){
            throw err;
        }
    }
    async generateUserOTP():Promise<IHTTPResponse>{
        try{
            return this.resp;
        }catch(err){
            console.log(err);
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
    async verifyOtp(otp:string):Promise<IHTTPResponse>{
        try{
            const skyflow = new Skyflow(this.vaultConfig)
            const token= await skyflow.getBearerToken();
            let queryOtp=`
            select 
            redaction(profiles.skyflow_id, 'PLAIN_TEXT'), 
            redaction(profiles.otp, 'PLAIN_TEXT'),
            redaction(profiles.name, 'PLAIN_TEXT') 
            from profiles 
            where profiles.otp='${otp}'
            `
            let employeeResp=await skyflow.skyflowQueryWrapper(queryOtp,token)
            if(!employeeResp.records || employeeResp.records.length===0){
                this.resp.status=403
                this.resp.response={
                    msg:"User not found"
                }
                return this.resp;
            }
            employeeResp=employeeResp.records[0].fields;
            let userOtp:IProfile={
                otp:'0',
                name:employeeResp.name
            }
            await skyflow.skyflowUpdateWrapper(userOtp,"profiles",employeeResp.skyflow_id,token);
            this.resp.response={
                skyflow_id:employeeResp.skyflow_id
            }
            return this.resp;
        }catch(err){
            console.log("err-->",err);
            throw err
        }
    }
    async loginEmployeeViaOtp(email:string,org_id:string):Promise<IHTTPResponse>{
        try{
            const skyflow = new Skyflow(this.vaultConfig)
            const token= await skyflow.getBearerToken();
            let queryUser=`select 
            redaction(profiles.email_address, 'PLAIN_TEXT'), 
            redaction(profiles.org_id, 'PLAIN_TEXT'), 
            redaction(profiles.name, 'PLAIN_TEXT'), 
            redaction(profiles.org_name, 'PLAIN_TEXT'), 
            redaction(profiles.org_name, 'PLAIN_TEXT'), 
            redaction(profiles.skyflow_id, 'PLAIN_TEXT'), 
            redaction(profiles.emp_id, 'PLAIN_TEXT')
            from profiles 
            where profiles.email_address='${email}' 
            and profiles.org_id='${org_id}'
            `;
            console.log("queryUser-->",queryUser,"\n\n\n\n");
            let employeeResp=await skyflow.skyflowQueryWrapper(queryUser,token)
            if(!employeeResp.records || employeeResp.records.length===0){
                this.resp.status=403
                this.resp.response={
                    msg:"User not found"
                }
                return this.resp;
            }
            employeeResp=employeeResp.records[0].fields;
            console.log("employeeResp-->",employeeResp,"\n\n\n")
            let skyflow_id=employeeResp.skyflow_id
            const passwordGenerator = new PasswordGenerator({
                alphabets:false,
                digits:true,
                specialChars:false,
                upperCase:false
            });
            const otp= passwordGenerator.generate(6);
            let userOtp:IProfile={
                otp:otp,
                name:employeeResp.name
            }
            await skyflow.skyflowUpdateWrapper(userOtp,"profiles",skyflow_id,token);
            await this.mailService.sendMail(
                {
                    // from: 'vaxcheckservice@vaxcheck.us',
                    to: employeeResp.email_address,
                    subject: 'Your VAXCheck login otp',
                    html: loginOtpEmail(otp,employeeResp.name.first_name)
                }
            );
            this.resp.response={msg:"OTP is sent on your registered email."}
            return this.resp
            return this.resp;
        }catch(err){
            console.log(err);
            throw err;
        }
    }
    async loginViaOtp(user:IUser):Promise<IHTTPResponse>{
        try{
            const skyflow = new Skyflow(this.vaultConfig)
            const token= await skyflow.getBearerToken();
            let userProfile= await this.checkUserExist(user,skyflow,token)
            console.log('userProfile--.',userProfile)
            if(userProfile.length===0){
                this.resp={response:"user doesn't exist.",status:422}
                return this.resp
            }
            userProfile=userProfile[0].fields;
            const passwordGenerator = new PasswordGenerator({
                alphabets:false,
                digits:true,
                specialChars:false,
                upperCase:false
            });
            const otp= passwordGenerator.generate(6);
            let userOtp:IUser={
                otp:otp
            }
            await skyflow.skyflowUpdateWrapper(userOtp,"users",userProfile.skyflow_id,token);
            await this.mailService.sendMail(
                {
                    // from: 'vaxcheckservice@vaxcheck.us',
                    to: userProfile.email,
                    subject: 'Your VAXCheck login otp',
                    html: loginOtpEmail(otp,userProfile.first_name)
                }
            );
            this.resp.response={msg:"OTP is sent on your registered email."}
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