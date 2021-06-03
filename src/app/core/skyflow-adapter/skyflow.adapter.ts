
import * as axiosObj from "axios"
import { PathLike } from "fs"
import { promises } from "fs"
import { sign } from "jsonwebtoken"
import { IMATADATARECORDS, IProfile, IRecord, IDiagnosticReports, IVaccinations } from "../../interfaces/record.interface"
import { ISkyflowConfig, ITokens } from "../../interfaces/skyflow-config.interface"

export class Skyflow {
    private skyflowBaseUrl: string
    private httpConfig: axiosObj.AxiosRequestConfig
    private skyflowCredPath: PathLike | promises.FileHandle
    constructor(skyflowConfig: ISkyflowConfig) {
        const { orgName, accountName, vaultId, skyflowCredPath } = skyflowConfig;
        this.skyflowCredPath = skyflowCredPath;

        this.skyflowBaseUrl = `https://${orgName}.${accountName}.vault.skyflowapis.com/v1/vaults/${vaultId}`
        this.httpConfig = {

            baseURL: this.skyflowBaseUrl,
            headers: {
                "Content-Type": "application/json",
                'cache-control': 'no-cache',
                'accept': `application/json, text/plain */*`
            }
        }
    }
    private setHeader(accessToken: string, tokenType: string) {
        this.httpConfig.headers["authorization"] = `${tokenType} ${accessToken}`
    }

    private async signedJwtToken() {
        try {
            let creds = JSON.parse(await promises.readFile(this.skyflowCredPath, { encoding: 'utf8' }))
            let currrentTimeStamp = Math.floor((new Date()).getTime() / 1000)
            let claims = {
                "iss": creds["clientID"],
                "key": creds["keyID"],
                "aud": creds["tokenURI"],
                "exp": currrentTimeStamp + (3600),
                "sub": creds["clientID"],
                "iat":0
            }
            const signedJWT = sign(claims, creds["privateKey"], { algorithm: 'RS256' })
            // console.log("signedJWT-->",signedJWT);
            let resp:any=await new Promise((resolve,reject)=>{
                return setTimeout(()=>{
                    resolve({ signedJWT, creds })
                },1000)
            })
            return {signedJWT:resp.signedJWT,creds}
        } catch (err) {
            console.log("err-->", err)
            throw err;
        }
    }
    public async getBearerToken():Promise<ITokens> {
        const { signedJWT, creds } = await this.signedJwtToken()
        let body = {
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion': signedJWT,
        }
        const tokenURI = creds["tokenURI"]
        let resp = await axiosObj.default.post(tokenURI, body)
        // console.log("resp-->", JSON.stringify(resp.data))
        // console.log("accessToken-->", JSON.stringify(resp.data["accessToken"]))
        return { accessToken: resp.data["accessToken"], tokenType: resp.data["tokenType"] }
    }
    async skyflowQueryWrapper(query: string,tokens?:ITokens) {
        const url = `${this.skyflowBaseUrl}/query`;
        const data = { query }
        try {
            let { accessToken, tokenType } = tokens || await this.getBearerToken()
            this.setHeader(accessToken, tokenType)
            const response = await axiosObj.default.post(url, data, this.httpConfig)
            return response.data
        } catch (err) {
            console.log("err.response.data.error.message-->", err.response.data.error.message)
            throw err.response.data.error
        }

    }
    async skyflowUpdateWrapper(fields: IProfile|IVaccinations|IMATADATARECORDS|IDiagnosticReports, tableName: string, skyflowId: string,tokens?:ITokens) {
        const url = `${this.skyflowBaseUrl}/${tableName}/${skyflowId}`;
        let data = {
            "record": {
                "fields": fields
            }
        }
        try {
            let { accessToken, tokenType } = tokens || await this.getBearerToken()
            this.setHeader(accessToken, tokenType)
            const response = await axiosObj.default.put(url, data, this.httpConfig)
            return response.data
        } catch (err) {
            console.log('err-->',JSON.stringify(err));
            console.log("err.response.data.error.message-->", err.response.data.error.message)
            throw err.response.data.error
        }

    }
    // let data = {
    //     "record": {
    //         "fields": {
    //             "vax_expiration": "Mon, 26 Apr 2021 08:26:24 GMT"
    //         }
    //     }
    // }
    // let data=this.updateVaccination()
    // https://{URL}/v1/vaults/{VAULT_ID}/persons/{SKYFLOW_ID}
    transformRecordsForBatch(records: any[]) {
        let arr: any = []
        records.forEach(record => {
            for (let key in record) {
                if(Array.isArray(record[key])){
                    record[key].forEach((elem:any)=>{
                        let obj: any = {}
                        obj["tableName"] = key
                        obj["method"] = "POST"
                        obj["fields"] = elem
                        arr.push(obj)
                    })
                }else{
                    let obj: any = {}
                    obj["tableName"] = key
                    obj["method"] = "POST"
                    obj["fields"] = record[key]
                    arr.push(obj)
                }
            }
        });

        return arr
    }
    async getVaccinationId(profiles_skyflow_id:string,tokens?:ITokens):Promise<string>{
        try{
            let { accessToken, tokenType } = tokens || await this.getBearerToken()
            let query=`select redaction(vaccinations.skyflow_id, 'PLAIN_TEXT'),redaction(vaccinations.profiles_skyflow_id, 'PLAIN_TEXT') 
             from vaccinations WHERE vaccinations.profiles_skyflow_id='${profiles_skyflow_id}'`;
            let resp=await this.skyflowQueryWrapper(query,tokens)
            if(resp.records.length>0)
                return resp.records[0].fields.skyflow_id
        throw new Error("Incorrect profile Id")

        }catch(err){
            throw err
        }
    }

    async uploadBatch(records: IRecord[],tokens?:ITokens): Promise<any> {
        let { accessToken, tokenType } = tokens || await this.getBearerToken()

        this.setHeader(accessToken, tokenType)
        let data = {
            records: this.transformRecordsForBatch(records)
        }
        // console.log("records-->", JSON.stringify(data))
        try {
            let resp = await axiosObj.default.post(`${this.skyflowBaseUrl}`, data, this.httpConfig)
            // console.log(JSON.stringify(resp.data));
            return resp.data
        } catch (err) {
            // console.log("err-->", JSON.stringify(err))
            console.log("err.response.data.error.message-->", err.response.data.error.message)

            throw err.response.data.error
        }
    }
}