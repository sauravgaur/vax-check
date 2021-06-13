export interface IUser{
    skyflow_id?:string,
    first_name?:string,
    middle_name?:string,
    last_name?:string,
    email?:string,
    password?:string,
    phone?:string,
    org_id?:string,
    otp?:string,
    role?:'GENERAL'|'CORPORATE'|'HR'|'ADMIN'|'SUPER_ADMIN'
}