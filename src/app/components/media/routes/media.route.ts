import { Router } from "express";
import {isAuthenticated,isAuthorized} from '../../../core/index'
import multer from "multer";
import {MediaController } from "../controllers/media.controller";
import { APP_PATHS } from "../../../core/constants/path.constants";
const DIR = './uploads/'
// import {RecordsCtrl} from "../controllers/records.controller"
console.log("APP_PATHS-->",APP_PATHS)
const uploadSnapshot = multer({dest:APP_PATHS.SNAPSHOT_DIR}).single('snapshot')
// const uploadSnapshot = multer({dest:DIR}).single('snapshot')
const uploadsupplementDoc = multer({dest:APP_PATHS.SUPPLIMENT_DIR}).single('supplementDoc')
const uploadVerifcationDoc = multer({dest:APP_PATHS.VERFICATION_DIR}).single('verificationDoc')

let router=Router()
console.log('saurav test---->')

export function routesConfigInner():Router {
    let mediaController=new MediaController()
    router.post('/snapshots',uploadSnapshot,mediaController.defaultResponse);
    router.post('/supplement-doc',uploadsupplementDoc,mediaController.defaultResponse);
    router.post('/verification-doc',uploadVerifcationDoc,mediaController.defaultResponse);
    
    return router
 }