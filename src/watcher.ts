import watch from "node-watch";
import {Csv2Json,ICsvConfig} from "./app/core"
import {recordEvents} from "./app/components/records/index"

export interface IWatcher{
    pathToDir:string
    watcherOptions:IWatcherOptions
}
export interface IWatcherOptions{
    recursive?:boolean
    persistent?:boolean
    delay?:null
    encoding?:string
    filter?: RegExp | Function
}

export class Watcher{
    private watcher:IWatcher;
    result:any[]
    private EVENT_NAME=recordEvents.EVENT_NAME
    private recordEvents=recordEvents.eventEmitter
    constructor(watcher:IWatcher){
        console.log("Watcher constructor...")
        this.watcher=watcher
        this.result=[]
        this.watcher.watcherOptions=this.loadDefaultOptions(watcher.watcherOptions)
    }
    listen(){
        console.log("Watcher listen...")
        // this.recordEvents.emit(this.EVENT_NAME.BATCH_PROCESSING_STOPPED)
        watch(this.watcher.pathToDir,this.watcher.watcherOptions as Object,(event,name)=>this.triggerWatcher(event,name))
    }
    private triggerWatcher(event:'update'|'remove'|undefined,name:string|undefined){
        if(event==='update'){
            let config:ICsvConfig={
                readerPath:name as string
            }
            const csv2Json=new Csv2Json(config)
            csv2Json.tranform(()=>{
                console.log("data-->",this.result)
                this.recordEvents.emit(this.EVENT_NAME.BATCH_PROCESSING_RUNNING,name as string,this.result)
            },(data:any)=>{
                this.result.push(data)
                // console.log("file read end.")
                
            })
        }
    }

    loadDefaultOptions(options:IWatcherOptions):IWatcherOptions{
        // return options;
        return {
            persistent:options.persistent|| true,
            recursive:options.recursive || false,
            encoding:options.encoding||'utf8',
            filter:options.filter || /\.csv$/
        } as IWatcherOptions
    }
}