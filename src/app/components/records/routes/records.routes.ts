import { Application,Router } from "express";
import {isAuthenticated,isAuthorized} from '../../../core/index'
import {RecordsCtrl} from "../controllers/records.controller"

let router=Router()


export function routesConfig():Router {
    let recordCtrl=new RecordsCtrl()
    console.log("enter into router--->")
    router.get('/batch',recordCtrl.getAllBatchMeta);
    router.get('/batch/testUrl',recordCtrl.testTurl);
    router.post('/batch/patient-vax',recordCtrl.addPatientVax);
    router.post('/batch/check-patient',recordCtrl.checkUserExists);
    
    return router
 }