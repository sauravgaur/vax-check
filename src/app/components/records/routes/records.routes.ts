import { Application,Router } from "express";
import {isAuthenticated,isAuthorized} from '../../../core/index'
import {RecordsCtrl} from "../controllers/records.controller"

let router=Router()

// updateVaccinationNotes
export function routesConfig():Router {
    let recordCtrl=new RecordsCtrl()
    console.log("enter into router--->")
    router.get('/batch',recordCtrl.getAllBatchMeta);
    router.get('/batch/testUrl',recordCtrl.testTurl);
    router.post('/batch/patient-vax',recordCtrl.saveVaxProfile);
    router.post('/batch/check-patient',recordCtrl.checkUserExists);
    router.post('/batch/payment-status',recordCtrl.paymentStatus);
    router.post('/batch/check-patient-exist',recordCtrl.checkPatientExist);
    router.get('/batch/unverified-patient',recordCtrl.unverifiedPatient);
    router.get('/batch/all-patient',recordCtrl.allPatient);
    router.get('/batch/patient-by-id/:id',recordCtrl.patientById);
    router.put('/batch/patient/status-update',recordCtrl.patientStatusUpdate);
    router.put('/batch/patient/update-vax-note',recordCtrl.updateVaccinationNotes);
    router.get('/batch/patient-by-org/:org_id',recordCtrl.allEmployees);
    router.get('/batch/patient-count-by-org/:org_id',recordCtrl.allEmployeesCount);
    
    return router
 }