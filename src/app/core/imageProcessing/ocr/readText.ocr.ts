import Tesseract from 'tesseract.js';
import { ImageAnnotatorClient, } from '@google-cloud/vision'
// import {TranslationServiceClient} from '@google-cloud/translate'
const { Translate } = require('@google-cloud/translate').v2;

const CARD_LABELS = {
  HEADER_LABEL: 'COVID - 19 Vaccination Record Card Please keep this record card , which includes medical information about the vaccines you have received',
  LAST_NAME: 'Last Name',
  FIRST_NAME: 'First Name',
  MI: 'MI',
  DOB: 'Date of birth',
  PATIENT_NUMBER: 'Patient number ( medical record or IIS record number )',
  PRODUCT_NAME: 'Product Name / Manufacturer',
  VACCINE: 'Vaccine',
  DATE: 'Date',
  HEALTHCARE_PROF: 'Healthcare Professional or Clinic Site',
  LOT_NUMBER: 'Lot Number',
  FIRST_DOSE: '1st Dose COVID - 19',
  MM_DD_YY_1: 'mm dd',
  SECOND_DOSE: '2nd Dose COVID - 19',
  MM_DD_YY_2: 'mm dd',
  OTHER_1: 'Other'
}

function getOCRResponseObject() {
  return {
    "firstName": null, 
    "middleName": null, 
    "lastName": null,
    "mi": null, 
    "dob": null, 
    "patientNumber": null, 
    "firstDose": null,
    "firstDoseDate": null, 
    "firstClinicName": null, 
    "secondDose": null,
    "secondDoseDate": null, 
    "secondClinicName": null
  }
}

function extractParagraph(paragraph: any) {
  let extractedParagraphText: string[] = [];
  for (let i = 0; i < paragraph.words.length; i++) {
    let word = '';
    for (let j = 0; j < paragraph.words[i].symbols.length; j++) {
      word += paragraph.words[i].symbols[j].text
    }
    extractedParagraphText.push(word)
  }
  return extractedParagraphText.join(' ')
}

function extractBlocks(blocks: any[]): string[] {
  let blockContents: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    let paragraphContent: string[] = [];
    for (let j = 0; j < blocks[i].paragraphs.length; j++) {
      paragraphContent.push(extractParagraph(blocks[i].paragraphs[j]))
    }
    blockContents.push(paragraphContent.join(' '))
  }
  return blockContents;
}

export async function readText(path: string) {
  // 'https://tesseract.projectnaptha.com/img/eng_bw.png'
  // return new Promise((resolve,reject)=>{
  //   Tesseract.recognize(
  //     path,'eng',{ logger: m => console.log(m) }
  //     ).then(({ data: { text } }) => {
  //       resolve(text)
  //     },(err)=>{
  //       reject(err)
  //     })
  // })
  try {
    let responseObj: any = getOCRResponseObject();
    const client = new ImageAnnotatorClient({ keyFile: './serviceAccountToken.json' });
    const translate = new Translate({ keyFile: './serviceAccountToken.json' });
    const resp = await client.documentTextDetection(path);

    let indexs: any = {}
    // console.log('fullTextAnnotation-->', JSON.stringify(resp[0].fullTextAnnotation?.pages));
    let blocks: any[] = [];
    let blockContents: string[] = [];
    if (resp && resp[0].fullTextAnnotation && resp[0].fullTextAnnotation.pages && resp[0].fullTextAnnotation.pages[0].blocks) {
      blocks = resp[0].fullTextAnnotation.pages[0].blocks;
      blockContents = extractBlocks(blocks)
    }

    indexs['HEADER_LABEL'] = blockContents.findIndex(x => x.indexOf(CARD_LABELS.HEADER_LABEL) > -1)
    indexs['LAST_NAME'] = blockContents.findIndex(x => x.indexOf(CARD_LABELS.LAST_NAME) > -1)
    let posDelta1 = indexs['LAST_NAME'] - indexs['HEADER_LABEL'] - 1;
    switch (posDelta1) {
      case 0:
        // responseObj['firstName'] = '';
        // responseObj['middleName'] = '';
        // responseObj['lastName'] = '';
        // responseObj['mi'] = '';
        break;
      case 1:
        responseObj['firstName'] = blockContents[indexs['HEADER_LABEL'] + 1];
        // responseObj['middleName'] = '';
        // responseObj['lastName'] = '';
        // responseObj['mi'] = '';
        break;
      case 2:
        responseObj['firstName'] = blockContents[indexs['HEADER_LABEL'] + 1];
        // responseObj['middleName'] = '';
        responseObj['lastName'] = blockContents[indexs['HEADER_LABEL'] + 2];
        // responseObj['mi'] = '';
        break;
      case 3:
        responseObj['firstName'] = blockContents[indexs['HEADER_LABEL'] + 1];
        responseObj['middleName'] = blockContents[indexs['HEADER_LABEL'] + 3];
        responseObj['lastName'] = blockContents[indexs['HEADER_LABEL'] + 2];
        // responseObj['mi'] = '';
        break;
      case 4:
        responseObj['firstName'] = blockContents[indexs['HEADER_LABEL'] + 1];
        responseObj['middleName'] = blockContents[indexs['HEADER_LABEL'] + 3];
        responseObj['lastName'] = blockContents[indexs['HEADER_LABEL'] + 2];
        responseObj['mi'] = blockContents[indexs['HEADER_LABEL'] + 4];
        break;
    }

    indexs['MI'] = blockContents.findIndex(x => x.indexOf(CARD_LABELS.MI) > -1)
    indexs['DOB'] = blockContents.findIndex(x => x.indexOf(CARD_LABELS.DOB) > -1)

    let posDelta2 = indexs['DOB'] - indexs['MI'] - 1;
    switch (posDelta2) {
      case 0:
        // responseObj['dob'] = '';
        // responseObj['patientNumber'] = '';
        break;
      case 1:
        responseObj['dob'] = blockContents[indexs['MI'] + 1];
        // responseObj['patientNumber'] = '';
        break;
    }
    indexs["FIRST_DOSE"] = blockContents.findIndex(x => x.indexOf(CARD_LABELS.FIRST_DOSE) > -1)
    indexs["MM_DD_YY_1"] = blockContents.findIndex(x => x.indexOf(CARD_LABELS.MM_DD_YY_1) > -1)

    let posDelta3 = indexs['MM_DD_YY_1'] - indexs['FIRST_DOSE'] - 1;

    switch (posDelta3) {
      case 0:
        // responseObj['firstDose'] = '';
        // responseObj['firstDoseDate'] = '';
        break;
      case 2:
        responseObj['firstDose'] = blockContents[indexs['FIRST_DOSE'] + 1];
        let dt = blockContents[indexs['FIRST_DOSE'] + 2];
        let yyIndx = dt.indexOf('yy')
        dt = dt.substr(0, yyIndx)
        responseObj['firstDoseDate'] = transformDate(dt);
        break;
    }

    indexs["SECOND_DOSE"] = blockContents.findIndex(x => x.indexOf(CARD_LABELS.SECOND_DOSE) > -1)
    indexs["MM_DD_YY_2"] = blockContents.findIndex(x => {
      let xecondMMIndx = x.indexOf(CARD_LABELS.MM_DD_YY_2);
      if (xecondMMIndx > -1 && xecondMMIndx > indexs["MM_DD_YY_1"]) {
        return true;
      } else {
        return false;
      }
    })

    let posDelta4 = indexs['MM_DD_YY_2'] - indexs['SECOND_DOSE'] - 1;

    switch (posDelta4) {
      case 0:
        // responseObj['secondDose'] = '';
        // responseObj['secondDoseDate'] = '';
        break;
      case 2:
        responseObj['secondDose'] = blockContents[indexs['SECOND_DOSE'] + 1];
        let dt = blockContents[indexs['SECOND_DOSE'] + 2];
        let yyIndx = dt.indexOf('yy')
        dt = dt.substr(0, yyIndx)
        responseObj['secondDoseDate'] = transformDate(dt);
        break;
    }

    // if(blocks[4].blockType=='TEXT' && blocks[4].paragraphs.length==1 &&  blocks[4].paragraphs[0].words.length==2){
    //   let extracted_text4 = extractParagraph(blocks[4].paragraphs[0])
    //   let extracted_text3 = extractParagraph(blocks[3].paragraphs[0])
    //   let extracted_text2 = extractParagraph(blocks[2].paragraphs[0])
    //   console.log(extracted_text4)
    //   if(extracted_text4==='Last Name'){
    //     responseObj['firstName']= extracted_text3
    //     responseObj['lastName']= extracted_text2
    //   }
    //   else if(extracted_text3 == 'Last Name'){
    //     responseObj['firstName']= extracted_text2
    //     responseObj['lastName']= ""
    //   }
    // }
    // resp[0].fullTextAnnotation?.pages?
    // const [annotation] = resp[0].textAnnotations || [];
    // const text = annotation ? annotation.description : '';
    // let [translateDetection] = await translate.detect(text);
    // console.log('translateDetection-->',translateDetection);
    return { responseObj, blocks, blockContents };
  } catch (err) {
    console.log("err-->", err);
    throw err;
  }
}

function transformDate(dt:string){
  dt=dt.trim();
  let objDt=new Date();
  let yy=parseInt("20"+dt.substr(dt.length-2));
  console.log('yy-->',yy);
  objDt.setFullYear(yy)
  let mm=0;
  let commaIndx= dt.lastIndexOf(',')
  if(commaIndx===6){
    let dd = parseInt(dt.substr(commaIndx-2,2))
    let trimStr =dt.substr(0,commaIndx-2).trim()
    console.log('trimStr-->',trimStr);
    console.log('trimStr.length-->',trimStr.length);
    if(trimStr.length>2){
      trimStr=trimStr.substr(1);
    }
    console.log("dd-->",dd)
    objDt.setDate(dd)
    objDt.setMonth(parseInt(trimStr)-1)

  }
  return objDt;
}