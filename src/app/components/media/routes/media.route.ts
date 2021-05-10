import { Router } from "express";
import {isAuthenticated,isAuthorized} from '../../../core/index'
import multer from "multer";
import * as shortid from 'shortid';
import * as mime from 'mime-types';
import {diskStorage,DiskStorageOptions} from "multer";
import {MediaController } from "../controllers/media.controller";
import { APP_PATHS } from "../../../core/constants/path.constants";
const DIR = './uploads/'
// import {RecordsCtrl} from "../controllers/records.controller"
console.log("APP_PATHS-->",APP_PATHS)

function fileNameHandler(req:any,file:any,cb:any){
    let id = shortid.generate();
        let ext = mime.extension(file.mimetype);
        cb(null, `${id}.${ext}`);
}

const snapshotStorageOptions:DiskStorageOptions={
    destination:(req,file,cb)=>{
        cb(null, APP_PATHS.SNAPSHOT_DIR);
    },
    filename:fileNameHandler
}

const supplementStorageOptions:DiskStorageOptions={
    destination:(req,file,cb)=>{
        cb(null, APP_PATHS.SUPPLIMENT_DIR);
    },
    filename:fileNameHandler
}

const verificationStorageOptions:DiskStorageOptions={
    destination:(req,file,cb)=>{
        cb(null, APP_PATHS.VERFICATION_DIR);
    },
    filename:fileNameHandler
}

const snapshotStorage = diskStorage(snapshotStorageOptions)
const supplementStorage = diskStorage(supplementStorageOptions)
const verificationStorage = diskStorage(verificationStorageOptions)

const uploadSnapshot = multer({storage:snapshotStorage}).single('snapshot')
const uploadsupplementDoc = multer({storage:supplementStorage}).single('supplementDoc')
const uploadVerifcationDoc = multer({storage:verificationStorage}).single('verificationDoc')

let router=Router()

export function routesConfigInner():Router {
    let mediaController=new MediaController()
    router.post('/snapshots',uploadSnapshot,mediaController.defaultResponse);
    router.post('/supplement-doc',uploadsupplementDoc,mediaController.defaultResponse);
    router.post('/verification-doc',uploadVerifcationDoc,mediaController.defaultResponse);
    
    return router
 }