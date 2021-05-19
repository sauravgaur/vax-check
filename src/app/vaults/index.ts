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
    },
    "first_vitals_passport33789":{
        accountName:'firstvitals',
        orgName:'sb1',
        vaultId:'xbf08db4b27211eb908b3684a705a083',
        accountId:"f8cbab96751311eb8a60cefd4e5eec22",
        desc:"The Passport vault provides the ability to store protected health records pertaining to the COVID-19 test and vaccination results of patientsfirst_vitals_passport in dev region",
        vaultName:"first_vitals_passport33789",
        skyflowCredPath:join(VAULT_BASE_PATH,"credentials","first_vitals_passport33789.json")
    },
    "first_vitals_passport27350":{
        accountName:'firstvitals',
        orgName:'sb1',
        vaultId:'v2a90900b5d411eb8023f248d4615f56',
        accountId:"f8cbab96751311eb8a60cefd4e5eec22",
        desc:"The Passport vault provides the ability to store protected health records pertaining to the COVID-19 test and vaccination results of patientsfirst_vitals_passport in dev region",
        vaultName:"first_vitals_passport27350",
        skyflowCredPath:join(VAULT_BASE_PATH,"credentials","first_vitals_passport27350.json")
    },
    "first_vitals_passport33269":{
        accountName:'firstvitals',
        orgName:'sb1',
        vaultId:'m653f591b65311eb8023f248d4615f56',
        accountId:"f8cbab96751311eb8a60cefd4e5eec22",
        desc:"The Passport vault provides the ability to store protected health records pertaining to the COVID-19 test and vaccination results of patientsfirst_vitals_passport in dev region",
        vaultName:"first_vitals_passport33269",
        skyflowCredPath:join(VAULT_BASE_PATH,"credentials","first_vitals_passport33269.json")
    },
    "FirstVitals_dev":{
        accountName:'firstvitals',
        orgName:'sb1',
        vaultId:'r87eb83fb70311eb908b3684a705a083',
        accountId:"f8cbab96751311eb8a60cefd4e5eec22",
        desc:"The Passport vault provides the ability to store protected health records pertaining to the COVID-19 test and vaccination results of patientsfirst_vitals_passport in dev region",
        vaultName:"first_vitals_passport33269",
        skyflowCredPath:join(VAULT_BASE_PATH,"credentials","FirstVitals_dev.json")
    }
}

export const DEFAULT_VAULT=VAULT_CONFIGS[process.env.DEFAULT_VAULT_NAME as string]