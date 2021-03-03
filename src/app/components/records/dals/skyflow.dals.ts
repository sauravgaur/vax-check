// import axios from "axios";
import * as axiosObj from "axios"
import { sign } from "jsonwebtoken"
import { promises } from "fs"
import { IRecord } from "../../../interfaces/record.interface"

export class SkyflowDal {
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
    private async getBearerToken() {
        const { signedJWT, creds } = await this.signedJwtToken()
        let body = {
            'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion': signedJWT,
        }
        const tokenURI = creds["tokenURI"]
        let resp = await axiosObj.default.post(tokenURI, body)
        console.log("resp-->", JSON.stringify(resp.data))
        return { accessToken: resp.data["accessToken"], tokenType: resp.data["tokenType"] }
    }
    transformRecordsForBatch(records: any[]) {
        let arr: any = []
        records.forEach(record => {
            for (let key in record) {
                let obj: any = {}
                obj["tableName"] = key
                obj["method"] = "POST"
                obj["fields"] = record[key]
                arr.push(obj)
            }
        });

        return arr
    }
    async uploadBatch(records: IRecord[]):Promise<any> {
        let { accessToken, tokenType } = await this.getBearerToken()

        this.setHeader(accessToken, tokenType)
        let data = {
            records: this.transformRecordsForBatch(records)
        }
        console.log("records-->",JSON.stringify(data))

        // let data = {
        //     "records": [
        //         {
        //             "tableName": "patients",
        //             "method": "POST",
        //             "fields": {
        //                 "name": "Clementia Christos Benoix",
        //                 "unique_identifier": "$2b$10$ZqAk8XMlrDJb9w5st8CP.OQtmL30jbgaAB5miPg5yuIIpEyLthfkq",
        //                 "address": {
        //                     "country": "US",
        //                     "county": "San Francisco County",
        //                     "county_fips": "12345-67890",
        //                     "state": "ID",
        //                     "street_address": "123 Fake St",
        //                     "zip_code": "12345-7890"
        //                 },
        //                 "age": 5,
        //                 "date_of_birth": "2015-10-21",
        //                 "employed_in_healthcare": {
        //                     "occupation": "NURSE_COMPLEX_CASE_MANAGER",
        //                     "value": "YES"
        //                 },
        //                 "phone_number": "1(678)774-9220",
        //                 "residence_in_congregate_care": {
        //                     "care_type": "HOSPITAL",
        //                     "value": "YES"
        //                 },
        //                 "sex": "OTHER"
        //             }
        //         },
        //         {
        //             "tableName": "metadata_records",
        //             "method": "POST",
        //             "fields": {
        //                 "created_timestamp": "1234567890",
        //                 "status": {
        //                     "state": "UNSUBMITTED"
        //                 }
        //             }
        //         },
        //         {
        //             "tableName": "vaccinations",
        //             "method": "POST",
        //             "fields": {
        //                 // "skyflow_id": "1234567890",
        //                 // "patients_skyflow_id": "1234567890",
        //                 "created_timestamp": "02/23/2021",
        //                 "updated_timestamp": "02/23/2021",
        //                 "vax_event_id": "id_19",
        //                 "admin_date": "02/23/2021",
        //                 "vax_effective": "02/23/2021",
        //                 "cvx": "cvx_code",
        //                 "ndc": "ndc_code",
        //                 "mvx": "mvx_code",
        //                 "lot_number": "lot_15",
        //                 "vax_expiration": "04/23/2021",
        //                 "vax_admin_site": "VAXADMINSITE_LT",
        //                 "vax_route": "VAXROUTE_C38238",
        //                 "dose_num": "DOSENUM_THREE",
        //                 "vax_series_complete": "VAXSERIESCOMPLETE_YES",
        //                 "responsible_org": "resp org",
        //                 "admin_name": "admin name",
        //                 "admin_type": "ADMINTYPE_PO",
        //                 "admin_address": {
        //                     "street_address": "123 Fake St",
        //                     "state": "ID",
        //                     "country": "US",
        //                     "zip_code": "12345-7890",
        //                     "county": "San Francisco County",
        //                     "county_fips": "12345-67890"
        //                 },
        //                 "vax_prov_suffix": "VAXPROVSUFFIX_PA",
        //                 "vax_refusal": "VAXREFUSAL_YES",
        //                 "cmorbid_status": "CMORBIDSTATUS_UNK",
        //                 "recip_missed_appt": "RECPMISSEDAPPT_YES",
        //                 "serology": "SEROLOGY_NO",
        //                 "extract_type": "EXTRACTTYPE_D",
        //                 "pprl_id": "1234567890"
        //             }
        //         },
        //         {
        //             "tableName": "tests",
        //             "method": "POST",
        //             "fields": {
        //                 "ordered": "LOINC: 94558-4: SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratoryspecimen byRapid immunoassay",
        //                 "result": {
        //                     "date": "20200716",
        //                     "test": "LOINC: 94558-4: SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratoryspecimen byRapid immunoassay",
        //                     "value": "DETECTED"
        //                 },
        //                 "report_date": "20200716",
        //                 "device_identifier": "01234567891011",
        //                 "ordering_provider": {
        //                     "name": "1234567899",
        //                     "address": {
        //                         "street_address": "Number Street",
        //                         "zip_code": "20993",
        //                         "city": "city",
        //                         "state": "HI",
        //                         "county": "county"
        //                     },
        //                     "phone_number": "(123) 456-7890"
        //                 },
        //                 "specimen_source": "MID_TURBINTE_NASAL_SWAB",
        //                 "first_test": {
        //                     "value": "YES",
        //                     "previous_test_and_result": {
        //                         "previous_result": "KNOWN",
        //                         "type": "ANTIGEN",
        //                         "conclusion": "DETECTED"
        //                     },
        //                     "previous_test_date": ""
        //                 },
        //                 "symptomatic": {
        //                     "value": "YES",
        //                     "date": "20200716",
        //                     "symptom": ["COUGH", "NEW_LOSS_OF_TASTE", "DIARRHEA"]
        //                 },
        //                 "pregnant": "UNKNOWN",
        //                 "zip_code": "20993",
        //                 "state": "HI",
        //                 "county": "county",
        //                 "consent_given": false,
        //                 "test_image": "some_url"
        //             }
        //         }
        //     ]
        // }
        try {
            let resp = await axiosObj.default.post(`${this.skyflowBaseUrl}`, data, this.httpConfig)
            console.log(JSON.stringify(resp.data));
            return resp.data
        } catch (err) {
            console.log("err-->", JSON.stringify(err))
            throw err
        }
    }

    async testUrl() {
        let { accessToken, tokenType } = await this.getBearerToken()

        this.setHeader(accessToken, tokenType)
        let data = {
            "query": "select count(*) FROM patients"
        }
        try {
            let resp = await axiosObj.default.post(`${this.skyflowBaseUrl}/query`, data, this.httpConfig)
            console.log("resp-->", resp)
        } catch (err) {
            console.log("err-->", err)
            throw err
        }

    }
}