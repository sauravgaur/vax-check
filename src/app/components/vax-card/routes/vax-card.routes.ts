import { Application,Router } from "express";
import {isAuthenticated,isAuthorized} from '../../../core/index'
import multer from "multer";
import {MediaController } from "../controllers/media.controller";
const DIR = './uploads/'
// import {RecordsCtrl} from "../controllers/records.controller"

const uploadSnapshot = multer({dest:DIR}).single('snapshot')

let router=Router()
console.log('saurav test---->')

export function routesConfig():Router {
    let mediaController=new MediaController()
    console.log("enter into router vax card--->")
    // router.get('/batch',recordCtrl.getAllBatchMeta);
    router.post('/snapshot/upload',uploadSnapshot,mediaController.uploadSnapshot);
    router.get('/snapshot/test',(req,res)=>{
        console.log('/snapshot/test-->');
        res.send("test vax-route")
    });
    return router
 }