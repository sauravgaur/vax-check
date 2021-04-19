const companies=[{
    productName:"Moderna",
    matchingLabel:["mo"],
    dose:{
        numberOfDose:2,
        expired_in:70,
        effective_in:14
    }
},{
    productName:"Pfizer",
    matchingLabel:["pf"],
    dose:{
        numberOfDose:2,
        expired_in:70,
        effective_in:14
    }
},{
    productName:"AstraZeneca",
    matchingLabel:["AZ","As"],
    dose:{
        numberOfDose:2,
        expired_in:70,
        effective_in:14
    }
},{
    productName:"J&J",
    matchingLabel:["J&J"],
    dose:{
        numberOfDose:1,
        expired_in:70,
        effective_in:10
    }
}];
export class VaxCardService{
    constructor(){
    }
    calcuateEffectiveNExpiry(text:any){
        let data={...text}
        data.isVaXCompleted=false;
        data.vaxMsg= `Unable to provide Expiry or Effective date due to either Dose Series incomplete or activation time period hasn't lapsed.`;
        let firstDoseDate=data["firstDoseDate"]
        if(!firstDoseDate){
            return data;
        }
        let effectiveDate1=new Date(firstDoseDate)
        let expireDate1=new Date(firstDoseDate)
        effectiveDate1.setDate(effectiveDate1.getDate()+1);
        expireDate1.setDate(effectiveDate1.getDate()+1);
        let company = companies.find(company=>{
            let isMatchFound= false;
            if(
                company.productName.toLowerCase()===data["firstDose"].toLowerCase() ||
                data["firstDose"].toLowerCase().indexOf(company.productName.toLowerCase()) > -1 ||
                company.matchingLabel.findIndex(label=>data["firstDose"].toLowerCase().indexOf(label.toLowerCase())>-1)>-1
            ){
                isMatchFound =true; 
            }
            return isMatchFound
        })
        if(company){
            if(company.dose.numberOfDose===1){
                effectiveDate1.setDate(company.dose.effective_in)
                expireDate1.setDate(company.dose.expired_in);
                data["firstDoseEffectiveDate"]=effectiveDate1
                data["firstDoseExpireDate"]=expireDate1;
                data.isVaXCompleted=true;
                data.vaxMsg= `Vax card verified`;
            }
            else{
                let secondtDoseDate=data["secondDoseDate"]
                if(!secondtDoseDate){
                    return data;
                }
                let effectiveDate2=new Date(secondtDoseDate)
                let expireDate2=new Date(secondtDoseDate)
                effectiveDate2.setDate(effectiveDate2.getDate()+1);
                expireDate2.setDate(effectiveDate2.getDate()+1);
                company = companies.find(company=>{
                    let isMatchFound= false;
                    if(
                        company.productName.toLowerCase()===data["secondDose"].toLowerCase() ||
                        data["secondDose"].toLowerCase().indexOf(company.productName.toLowerCase()) > -1 ||
                        company.matchingLabel.findIndex(label=>data["secondDose"].toLowerCase().indexOf(label.toLowerCase())>-1)>-1
                    ){
                        isMatchFound =true; 
                    }
                    return isMatchFound
                })
                if(company){
                    effectiveDate2.setDate(company.dose.effective_in)
                    expireDate2.setDate(company.dose.expired_in)
                    data["secondDoseEffectiveDate"]=effectiveDate2
                    data["secondDoseExpireDate"]=expireDate2
                    data.isVaXCompleted=true;
                    data.vaxMsg= `Vax card verified`;
                }
            }
            
        }

        return data;
    }
}