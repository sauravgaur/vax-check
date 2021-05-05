var otpGenerator = require('otp-generator');

export interface IPasswordOptions{
    digits: boolean,
    alphabets: boolean,
    upperCase: boolean,
    specialChars: boolean
}
export class PasswordGenerator{
    private defaultOptions:IPasswordOptions={
        digits:true,
        alphabets:true,
        upperCase:false,
        specialChars:false
    }
    options:IPasswordOptions;
    constructor(option?:IPasswordOptions){
        this.options=option?option:this.defaultOptions
    }
    generate(length:number):string{
        return otpGenerator.generate(length,this.options)
    }
}