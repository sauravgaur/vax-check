type YES_NO = 'YES' | 'NO';
type GENDER = 'MALE' | 'FEMALE' | 'OTHER';
type STATUS = 'PENDING' | 'SUCCESS' | 'FAIL';
type DIAGNOSTIC_TEST_TYPE = 'ANTIBODY' | 'ANTIGEN' | 'MOLECULAR';

export interface IProfile {
    unique_identifier?: string,
    age?: number,
    date_of_birth?: string,
    emp_id?:string,
    org_id?:string,
    work_location?:string,
    race?: string,
    stripe_session_id?:string,
    race2?: string,
    race3?: string,
    ethnicity?: string,
    travel_date?: string,
    traveler_type?: string,
    access_code?: string,
    sex?: GENDER,
    mobile_number?: string,
    mobile_number2?: string,
    email_address?: string,
    residency_state?:string,
    name: {
        first_name: string,
        middle_name: string,
        last_name: string
    },
    address?: IPatientAddress,
    healthcare_employee?: {
        value?: YES_NO
        role?: string
        npi?: string
    },
    congregate_residency_status?: {
        value?: YES_NO
        care_type?: string
    },
    consent?: {
        given?: boolean
        timestamp?: Date
    },
    created_timestamp?: string | Date,
    updated_timestamp?: string | Date,
}

export interface IVaccineDosing{
    date?:string,
    lot_number?:string,
    site_name?:string,
    site_address?:IAddress2
}

export interface IDiagnosticReports {
    profiles_skyflow_id?: string,
    diagnostic_event_identifier?: string,
    diagnostic_test_ordered?: string,
    diagnostic_test_type?: DIAGNOSTIC_TEST_TYPE,
    diagnostic_test_code?: string,
    diagnostic_certificate_status?: string,
    device_identifier?: string,
    specimen_source?: string,
    specimen_number?: string,
    administration_date?: string,
    test_image?: string,
    pregnant?: string,
    report_date?: Date,
    consent?: {
        given?: boolean
        timestamp?: Date
    },
    ordering_provider?: {
        name?: string,
        phone_number?: string
        address?: {
            street_address?: string,
            street_address2?: string,
            city?: string
            state?: string
            country?: string
            zip_code?: string
            county?: string
            county_fips?: string
            island?: string
        },
        npi?: {
            value?: string
        }
    },
    first_test?: {
        value?: string,
        previous_test_date?: string
        previous_test_and_result?: {
            previous_result?: string,
            type?: string,
            conclusion?: string
        }
    },
    symptomatic?: {
        value?: string,
        date?: string,
        symptom?: string
    },
    conclusion?: {
        date?: string,
        test?: string,
        value?: string
    },
    recipient?: {
        unique_identifier?: string
        phone_number?: string
        email_address?: string
        date_of_birth?: string
        sex?: string
        race?: string
        race2?: string
        race3?: string
        ethnicity?: string
        name?: {
            prefix?: string
            first_name?: string
            middle_name?: string
            last_name?: string
            use?: string
            suffix?: string
        },
        address?: {
            street_address?: string,
            street_address2?: string
            city?: string
            state?: string
            country?: string
            zip_code?: string
            county?: string
            county_fips?: string
            island?: string
        }
    },
    performer?: {
        performer_org_name?: string,
        performer_name?: string,
        performer_type?: string,
        performer_npi?: string,
        performer_address?: {
            street_address?: string,
            street_address2?: string,
            city?: string,
            state?: string,
            country?: string,
            zip_code?: string,
            county?: string,
            county_fips?: string,
            island?: string
        }
    },

}

export interface IMATADATARECORDS {
    created_timestamp?: string,
    status?: {
        state?: string
    },
}

export interface IProvider{
    provider_org_name?:string,
    provider_name?:string,
    provider_type?:string,
    provider_npi?:string,
    provider_email?: string,
    provider_address?:IAddress2
}

export interface IMedia{
    profiles_skyflow_id?:string,
    document_type?:'VAX_CARD'|'SUPPLEMENT_DOC'|'EVIDENCE'|'MISC1'|'MISC2'|'MISC3'|'DIAGNOSTIC_TEST',
    file_path?:string
}

export interface IVaccinations {
    skyflow_id?: string,
    profiles_skyflow_id?: string,
    created_timestamp?: string | Date,
    updated_timestamp?: string | Date,
    vaccination_event_identifier?: string,
    vaccination_certification_status?: string,
    vaccination_issuer_type?: string,
    ordered_date?: string,
    appointment_email_confirmation?: string,
    administered_date?: string,
    effective_date?: string,
    expiration_date?: string,
    vaccine_name?: string,
    vaccine_cvx_code?: string,
    vaccine_product_code?: string,
    vaccine_manufacturer_name?: string,
    lot_number?: string,
    site?: string,
    route?: string,
    dose_number?: string,
    series_complete?: string,
    series_doses?: number,
    provider_suffix?: string,
    vaccine_refusal?: string,
    recipient_comorbidity_status?: string,
    recipient_missed_appt?: string,
    serology?: string,
    extract_type?: string,
    master_id?: string,
    reference_id?: string,
    reference_system?: string,
    verification_source?: string,
    verification_status?: 'PENDING'|'VERIFIED'|'DECLINED'|'CONDITION_APPROVAL',
    access_code?: string,
    travel_date?: string,
    supporting_doc?: string,
    traveler_type?: string,
    service_availed?: string,
    verification_expiry_date?: string,
    vaccine_dose_1?:IVaccineDosing,
    vaccine_dose_2?:IVaccineDosing,
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
    verification_notes?:string,
    performer?: {
        performer_org_name?: string,
        performer_name?: string,
        performer_type?: string,
        performer_npi?: string,
        performer_address?: IPatientAddress,
    },
    provider?:IProvider
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
    street_address?: string,
    street_address2?: string,
    state?: string,
    country?: string,
    zip_code?: string,
    city?: string,
}

export interface IAddress2 {
    street_address?: string,
    street_address2?: string,
    state?: string,
    country?: string,
    zip_code?: string,
    city?: string,
    county?:string,
    county_fips?:string,
    island?:string
}

export interface IRecord {
    profiles?: IProfile,
    diagnostic_reports?: IDiagnosticReports,
    metadata_records?: IMATADATARECORDS,
    vaccinations?: IVaccinations,
    media?:IMedia[]
}

export interface ISourceProvider {
    id?: string | null,
    name?: string,
}

export interface IBatch {
    no_of_records: number,
    source?: ISourceProvider,
    upload_start_at: Date,
    upload_end_at?: Date,
    status: STATUS,
    batch_id: string,
    records: IRecord[],
}