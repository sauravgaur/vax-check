
import * as axiosObj from "axios"
import { promises } from "fs"
import { sign } from "jsonwebtoken"

export class Skyflow{
    private skyflowBaseUrl: string
    private httpConfig: axiosObj.AxiosRequestConfig
    private skyflowCredPath: string
    constructor(orgName: string | null, accountName: string | null, vaultId: string | null, skyflowCredPath: string | null) {
        orgName = orgName || process.env.SKYFLOW_ORG_NAME as string;
        accountName = accountName || process.env.SKYFLOW_ACCOUNT_NAME as string;
        vaultId = vaultId || process.env.SKYFLOW_VAULT_ID as string;
        this.skyflowCredPath = skyflowCredPath || process.env.SKYFLOW_CRED_PATH as string;

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
            }
            const signedJWT = sign(claims, creds["privateKey"], { algorithm: 'RS256' })
            return { signedJWT, creds }
        } catch (err) {
            console.log("err-->", err)
            throw err;
        }
    }
    public async getBearerToken() {
        const { signedJWT, creds } = await this.signedJwtToken()
        let body = {
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion': signedJWT,
        }
        const tokenURI = creds["tokenURI"]
        let resp = await axiosObj.default.post(tokenURI, body)
        console.log("resp-->", JSON.stringify(resp.data))
        console.log("accessToken-->", JSON.stringify(resp.data["accessToken"]))
        return { accessToken: resp.data["accessToken"], tokenType: resp.data["tokenType"] }
    }
    async skyflowQueryWrapper(query:string){
        const url = `${this.skyflowBaseUrl}/query`;
        // {
        //     "query": "select count(*) FROM patients"
        //   }
        const data = {query}
        try{
            let { accessToken, tokenType } = await this.getBearerToken()
            this.setHeader(accessToken, tokenType)
            const response = await axiosObj.default.post(url,data,this.httpConfig)
            return response.data
        }catch(err){
            console.log("err-->", JSON.stringify(err))
            throw err
        }
        
    }
}