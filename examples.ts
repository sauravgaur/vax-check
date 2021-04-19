// async testUrl() {
//     let { accessToken, tokenType } = await this.getBearerToken()

//     this.setHeader(accessToken, tokenType)
//     // let data = {
//     //     "record": {
//     //         "fields": {
//     //             "phone_number": "+14085550096"
//     //         }
//     //     }
//     // }
//     // https://{URL}/v1/vaults/{VAULT_ID}/persons/{SKYFLOW_ID}
//     try {
//         // let resp = await axiosObj.default.put(`https://sb1.firstvitals.vault.skyflowapis.com/v1/vaults/f9e68956780e11eba8a08295107109db/patients/32149942-578a-4d5c-8c0d-629e84760c4f`, data, this.httpConfig)
//         // return resp.data

//         // https://sb1.firstvitals.vault.skyflowapis.com/v1/vaults/f9e68956780e11eba8a08295107109db/query
//         // {
//         //     "query":"select redaction (patients.phone_number, 'PLAIN_TEXT'), redaction (patient.name, 'PLAIN_TEXT'), skyflow_id from patients"
//         // }
//         let resp = await axiosObj.default.get(`https://sb1.firstvitals.vault.skyflowapis.com/v1/vaults/f9e68956780e11eba8a08295107109db/patients/32149942-578a-4d5c-8c0d-629e84760c4f?dlp=PLAIN_TEXT`, this.httpConfig)
//         return resp.data
//     } catch (err) {
//         console.log("err-->", JSON.stringify(err.data))
//         throw err
//     }


// }