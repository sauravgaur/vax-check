import csvParser, {Options} from 'csv-parser'
import {createReadStream, ReadStream} from 'fs'

export interface ICsvConfig{
    readerPath:string,
    options?:Options
}
export class Csv2Json{
    private config:ICsvConfig
    private results:any[]
    constructor(config:ICsvConfig){
        this.config=config
        this.results=[]
    }

    private toJson(){}
    tranform(onEndReadFunc:Function,onDataReadFunc?:Function){
       let readstream:ReadStream =  createReadStream(this.config.readerPath)
       let transform=readstream.pipe(csvParser(this.config.options))
       if(onDataReadFunc){
        transform=transform.on('data',onDataReadFunc.bind(this))
       }else{
        transform=transform.on('data',this.toJson.bind(this))
       }
       transform=transform.on('end',onEndReadFunc.bind(this))
        
    }

}