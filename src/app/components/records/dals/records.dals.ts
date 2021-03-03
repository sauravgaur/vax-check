import {ConnectionPool,config, VarChar, Int, DateTime2} from "mssql"
import { IBatch } from "../../../interfaces/record.interface"

export class RecordsDal{
    connection:ConnectionPool
    constructor(config?:config){
        if(!config){
            config={
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                server: process.env.DB_SERVER as string,
                database: process.env.DB_NAME
            }
        }
        this.connection=new ConnectionPool(config)
    }
    async closeConnection(){
        await this.connection.close()
    }
    async openConnection(){
        await this.connection.connect()
    }
    async addBatch(batch:IBatch){
        console.log("enter into add batch-->")
        try{
            const query = `insert into batch_master 
            (batch_id,no_of_records,source_id,source_name,status,upload_start_at,upload_end_at)
            values(@batch_id,@no_of_records,@source_id,@source_name,@status,@upload_start_at,@upload_end_at);SELECT SCOPE_IDENTITY() AS id;`
            let trx=this.connection.request();
            trx=trx.input('batch_id',VarChar, batch.batch_id)
            .input('no_of_records',Int, batch.no_of_records)
            .input('source_id',VarChar, batch.source?.id|| null)
            .input('source_name',VarChar, batch.source?.name|| null)
            .input('status',VarChar, batch.status)
            .input('upload_start_at',DateTime2, batch.upload_start_at)
            .input('upload_end_at',DateTime2, batch.upload_end_at)
            .output('id', Int)

            let resp= await trx.query(query)
            return resp.recordset[0]["id"]
        }catch(err){
            throw err;
        } 
    }
    async uploadBatchCompleted(status:'PENDING'|'SUCCESS'|'FAIL',upload_end_at:Date,id:number){
        try{
            const query=`update batch_master set status=@status,upload_end_at=@upload_end_at where id=@id`

            let trx=this.connection.request()
            trx=trx.input('status',VarChar, status)
            .input('upload_end_at',DateTime2,upload_end_at)
            .input('id',Int,id)
            let resp= await trx.query(query)
            return resp;
        }catch(err){
            throw err
        }
    }
}