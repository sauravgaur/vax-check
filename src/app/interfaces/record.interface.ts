export interface IProfile {
    unique_identifier: string
    age?: number
    date_of_birth?: string
    race?: string
    race2?: string
    race3?: string
    ethnicity?: string
    travel_date?: string
    traveler_type?: string,
    access_code?: string
    sex?: 'MALE' | 'FEMALE' | 'OTHER'
    mobile_number?: string
    mobile_number2?: string
    email_address?: string
    name: {
        first_name: string,
        middle_name: string,
        last_name: string
    },
    address?: IPatientAddress
    healthcare_employee?: {
        value?: 'YES' | 'NO'
        role?: string
        npi?: string
    }
    congregate_residency_status?: {
        value?: 'YES' | 'NO'
        care_type?: string
    }
    consent?: {
        given?: boolean
        timestamp?: Date
    },
    created_timestamp?: string | Date,
    updated_timestamp?: string | Date
}

export interface IDiagnosticReports {
    profiles_skyflow_id?:string
    diagnostic_event_identifier?:string
    diagnostic_test_ordered?:string
    diagnostic_test_type?:'ANTIBODY'|'ANTIGEN'|'MOLECULAR'
    diagnostic_test_code?:string
    diagnostic_certificate_status?:string
    device_identifier?:string
    specimen_source?:string
    specimen_number?:string
    administration_date?:string
    test_image?:string
    pregnant?:string
    report_date?:Date
    consent?: {
        given?: boolean
        timestamp?: Date
    },
    ordering_provider?:{
        name?:string,
        phone_number?:string
        address?:{
            street_address?:string,
            street_address2?:string,
            city?:string
            state?:string
            country?:string
            zip_code?:string
            county?:string
            county_fips?:string
            island?:string
        },
        npi?:{
            value?:string
        }
    },
    first_test?:{
        value?:string,
        previous_test_date?:string
        previous_test_and_result?:{
            previous_result?:string,
            type?:string,
            conclusion?:string
        }
    },
    symptomatic?:{
        value?:string,
        date?:string,
        symptom?:string
    },
    conclusion?:{
        date?:string,
        test?:string,
        value?:string
    },
    recipient?:{
        unique_identifier?:string
        phone_number?:string
        email_address?:string
        date_of_birth?:string
        sex?:string
        race?:string
        race2?:string
        race3?:string
        ethnicity?:string
        name?:{
            prefix?:string
            first_name?:string
            middle_name?:string
            last_name?:string
            use?:string
            suffix?:string
        },
        address?:{
            street_address?:string,
            street_address2?:string
            city?:string
            state?:string
            country?:string
            zip_code?:string
            county?:string
            county_fips?:string
            island?:string
        }
    },
    performer?:{
        performer_org_name?:string,
        performer_name?:string,
        performer_type?:string,
        performer_npi?:string,
        performer_address?:{
            street_address?:string,
            street_address2?:string,
            city?:string,
            state?:string,
            country?:string,
            zip_code?:string,
            county?:string,
            county_fips?:string,
            island?:string
        }
    }

}

export interface IMATADATA_RECORDS {
    created_timestamp?: string
    status?: {
        state?: string
    }
}

export interface IVaccinations {
    skyflow_id?: string
    profiles_skyflow_id?: string
    created_timestamp?: string | Date
    updated_timestamp?: string | Date
    vaccination_event_identifier?: string
    vaccination_certification_status?: string
    vaccination_issuer_type?: string
    ordered_date?: string
    administered_date?: string
    effective_date?: string
    expiration_date?: string
    vaccine_name?: string
    vaccine_cvx_code?: string
    vaccine_product_code?: string
    vaccine_manufacturer_name?: string
    lot_number?: string
    site?: string
    route?: string
    dose_number?: string
    series_complete?: string
    series_doses?: number
    provider_suffix?: string
    vaccine_refusal?: string
    recipient_comorbidity_status?: string
    recipient_missed_appt?: string
    serology?: string
    extract_type?: string
    master_id?: string
    reference_id?: string
    reference_system?: string
    verification_source?: string
    verification_status?: string
    access_code?: string
    travel_date?: string
    supporting_doc?: string
    traveler_type?: string
    service_availed?: string
    recipient?: {
        unique_identifier?: string,
        phone_number?: string,
        email_address?: string,
        date_of_birth?: string,
        sex?: string,
        race?: string,
        ethnicity?: string,
        name?: {
            first_name?: string,
            last_name?: string
        },
    },
    performer?: {
        performer_org_name?: string,
        performer_name?: string,
        performer_type?: string,
        performer_npi?: string,
        performer_address?: IPatientAddress
    }
}

// export interface IPatientAddress{
//     street_address?:string
//     street_address2?:string
//     state?:string
//     country?:string
//     zip_code?:string
//     county?:string
//     county_fips?:string
// }

export interface IPatientAddress {
    street_address?: string
    street_address2?: string
    state?: string
    country?: string
    zip_code?: string
    city?: string
}

export interface IRecord {
    profiles?: IProfile
    diagnostic_reports?: IDiagnosticReports
    metadata_records?: IMATADATA_RECORDS
    vaccinations?: IVaccinations
}

export interface ISourceProvider {
    id?: string | null,
    name?: string
}

export interface IBatch {
    no_of_records: number
    source?: ISourceProvider
    upload_start_at: Date
    upload_end_at?: Date
    status: 'PENDING' | 'SUCCESS' | 'FAIL'
    batch_id: string
    records: IRecord[]
}