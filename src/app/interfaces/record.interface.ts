export interface IPatients{
    unique_identifier:string
    name:string
    date_of_birth?:string
    age?:number
    race?:string
    ethnicity?:string
    sex?:'MALE'|'FEMALE'|'OTHER'
    address?:IPatientAddress
    phone_number?:string
    employed_in_healthcare?:{
        value?:'YES'|'NO'
        occupation?:string
    }
    residence_in_congregate_care?:{
        value?:'YES'|'NO'
        care_type?:string
    }
    consent?:{
        given?:boolean
        timestamp:Date
    }
}

export interface ITests{
    ordered?:string
    result?:{
        date?:string
        test?:string
        value?:string
    }
    report_date?:string
    device_identifier?:string
    ordering_provider?:{
        name?:string
        address?:IPatientAddress
        phone_number?:string
    }
    specimen_source?:string
    first_test?:{
        value?:'YES'|'NO'
        previous_test_and_result?:{
            previous_result?:string
            type?:string
            conclusion?:string
        }
        previous_test_date?:string
    }
    symptomatic?:{
        value?:'YES'|'NO'
        date?:string
        symptom?:string[]
    }
    pregnant?:string
    zip_code?:string
    state?:string
    county?:string
    consent_given?:boolean
    test_image?:string|null
}

export interface IMATADATA_RECORDS{
    created_timestamp?:string
    status?:{
        state?:string
    }
}

export interface IVaccinations{
    skyflow_id:string
    patients_skyflow_id?:string
    created_timestamp?:string
    updated_timestamp?:string
    vax_event_id?:string
    admin_date?:string
    vax_effective?:string
    cvx?:string
    ndc?:string
    mvx?:string
    lot_number?:string
    vax_expiration?:string
    vax_admin_site?:string
    vax_route?:string
    dose_num?:string
    vax_series_complete?:string
    responsible_org?:string
    admin_name?:string
    admin_type?:string
    admin_address?:IPatientAddress
    vax_prov_suffix?:string
    vax_refusal?:string
    cmorbid_status?:string
    recip_missed_appt?:string
    serology?:string
    extract_type?:string
    pprl_id?:string
}

export interface IPatientAddress{
    street_address?:string
    state?:string
    country?:string
    zip_code?:string
    county?:string
    county_fips?:string
}

export interface IRecord{
    patients?:IPatients
    tests?:ITests
    metadata_records?:IMATADATA_RECORDS
    vaccinations?:IVaccinations
}

export interface ISourceProvider{
    id?:string,
    name?:string
}

export interface IBatch{
    no_of_records:number
    source?:ISourceProvider
    upload_start_at:Date
    upload_end_at?:Date
    status:'PENDING'|'SUCCESS'|'FAIL'
    batch_id:string
    records:IRecord[]
}