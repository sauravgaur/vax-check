import { join } from 'path'
import {ISkyflowConfig} from '../interfaces/skyflow-config.interface'

const VAULT_BASE_PATH= join(".","src","app","vaults")

export const VAULT_CONFIGS: Record<string,ISkyflowConfig>={
    "Covid19TestingAndVaccination91411":{
        accountName:'firstvitals',
        orgName:'sb1',
        vaultId:'f9e68956780e11eba8a08295107109db',
        accountId:"f8cbab96751311eb8a60cefd4e5eec22",
        desc:"The COVID-19 vault provides the ability to store protected health records pertaining to the COVID-19 test and vaccination results of patients",
        vaultName:"Covid19TestingAndVaccination91411",
        skyflowCredPath:join(VAULT_BASE_PATH,"credentials","Covid19TestingAndVaccination91411.json")
    },
    "first_vitals_passport_dev":{
        accountName:'firstvitals',
        orgName:'sb1',
        vaultId:'daa6ae1eb03611eb931422b1a4977926',
        accountId:"f8cbab96751311eb8a60cefd4e5eec22",
        desc:"The Passport vault provides the ability to store protected health records pertaining to the COVID-19 test and vaccination results of patientsfirst_vitals_passport in dev region",
        vaultName:"first_vitals_passport_dev",
        skyflowCredPath:join(VAULT_BASE_PATH,"credentials","first_vitals_passport_dev.json")
    }
}

export const DEFAULT_VAULT=VAULT_CONFIGS[process.env.DEFAULT_VAULT_NAME as string]