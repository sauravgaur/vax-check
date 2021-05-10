export interface IProfile{
    unique_identifier:string
    age?:number
    date_of_birth?:string
    race?:string
    race2?:string
    race3?:string
    ethnicity?:string
    sex?:'MALE'|'FEMALE'|'OTHER'
    mobile_number?:string
    email_address?:string
    name:Record<"First Name"|"Last Name"|"Middle Name",string>,
    address?:IPatientAddress
    healthcare_employee?:{
        value?:'YES'|'NO'
        role?:string
        npi?:string
    }
    congregate_residency_status?:{
        value?:'YES'|'NO'
        care_type?:string
    }
    consent?:{
        given?:boolean
        timestamp?:Date
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
    profiles_skyflow_id?:string
    created_timestamp?:string
    updated_timestamp?:string
    vaccination_event_identifier?:string
    vaccination_certification_status?:string
    vaccination_issuer_type?:string
    ordered_date?:string
    administered_date?:string
    effective_date?:string
    expiration_date?:string
    vaccine_name?:string
    vaccine_cvx_code?:string
    vaccine_product_code?:string
    vaccine_manufacturer_name?:string
    lot_number?:string
    site?:string
    route?:string
    dose_number?:string
    series_complete?:string
    series_doses?:number
    provider_suffix?:string
    vaccine_refusal?:string
    recipient_comorbidity_status?:string
    recipient_missed_appt?:string
    serology?:string
    extract_type?:string
    master_id?:string
    reference_id?:string
    reference_system?:string
    verification_source?:string
    verification_status?:string
    access_code?:string
    travel_date?:string
    supporting_doc?:string
    traveler_type?:string
    service_availed?:string
    recipient?:{
        unique_identifier?:string,
        phone_number?:string,
        email_address?:string,
        date_of_birth?:string,
        sex?:string,
        Race?:string,
        Ethnicity?:string,
        name?:Record<"Prefix"|"First Name"|"Last Name"|"Middle Name",string>,
    },
    performer?:{
        performer_org_name?:string,
        performer_name?:string,
        performer_type?:string,
        performer_npi?:string,
        performer_address?:IPatientAddress
    }
}

export interface IPatientAddress{
    street_address?:string
    street_address2?:string
    state?:string
    country?:string
    zip_code?:string
    county?:string
    county_fips?:string
}

export interface IRecord{
    profiles?:IProfile
    tests?:ITests
    metadata_records?:IMATADATA_RECORDS
    vaccinations?:IVaccinations
}

export interface ISourceProvider{
    id?:string|null,
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