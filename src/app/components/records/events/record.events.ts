import { format } from "path"
import { EventEmitter } from "events"
import { inherits } from "util"
import { Csv2Json, ICsvConfig } from "../../../core/fileConverter/csv2json.converter"
import {BatchCtrl} from "../controllers/records.controller"
import { IBatch, ISourceProvider } from "../../../interfaces/record.interface"
import {SkyflowDal} from "../dals/skyflow.dals"
import {unlink} from "fs"
import { RecordsDal } from "../dals/records.dals"

export const EVENT_NAME = {
    BATCH_PROCESSING_START: "batch processing start",
    BATCH_PROCESSING_RUNNING: "batch processing running",
    BATCH_PROCESSING_STOPPED: "batch processing stopped"
}

const eventEmitter = new EventEmitter()

function onBatchProcessingStart(filePath: string) {
    let csvConfig: ICsvConfig = {
        readerPath: filePath
    }
    let csv2Json = new Csv2Json(csvConfig)
    // csv2Json.tranform()
}

async function onBatchProcessRunning(filePath: string,jsonObj:any[],sourceProvider?:ISourceProvider) {
    console.log("onBatchProcessRunning")
    if(!sourceProvider){
        sourceProvider={
            id:"id-123",
            name:"Dept. of Health"
        } as ISourceProvider
    }
    let batchCtrl= new BatchCtrl(jsonObj,sourceProvider)
    let batch:IBatch =await batchCtrl.generateBatch()
    let recordsDal=new RecordsDal()
    await recordsDal.openConnection()
    let batch_master_id= await recordsDal.addBatch(batch);
    recordsDal.closeConnection();
    console.log("batch-->",JSON.stringify(batch))
    let skyflowDal=new SkyflowDal(null,null,null,null)
    let batchUploadResponse= await skyflowDal.uploadBatch(batch.records)
    eventEmitter.emit(EVENT_NAME.BATCH_PROCESSING_STOPPED,filePath,batch_master_id)

 }
function onBatchProcessStopped(filePath:string,batch_master_id:number) { 
    unlink(filePath,async (err)=>{
        if(err){
            return console.log("Error in deleting file-->",err)
        }
        let recordsDal=new RecordsDal()
        await recordsDal.openConnection()
        await recordsDal.uploadBatchCompleted('SUCCESS',new Date(),batch_master_id)
        recordsDal.closeConnection();
        return console.log(`${filePath} has been file deleted`)
    })
    // let skyflowDal=new SkyflowDal(null,null,null,null)
    // skyflowDal.uploadBatch([])
}


eventEmitter.on(EVENT_NAME.BATCH_PROCESSING_START, onBatchProcessingStart)
eventEmitter.on(EVENT_NAME.BATCH_PROCESSING_RUNNING, onBatchProcessRunning)
eventEmitter.on(EVENT_NAME.BATCH_PROCESSING_STOPPED, onBatchProcessStopped)

export { eventEmitter }

// function MailEvents(){
//     console.log('init mail event...');
//     this.isCheckStatusInProcess=false;
//     EventEmitter.call(this);
// }