import { Application,Router } from "express";
import {isAuthenticated,isAuthorized} from '../../../core/index'
import {RecordsCtrl} from "../controllers/records.controller"

let router=Router()


export function routesConfig():Router {
    let recordCtrl=new RecordsCtrl()
    console.log("enter into router--->")
    router.get('/batch',recordCtrl.getAllBatchMeta);
    router.get('/batch/testUrl',recordCtrl.testTurl);
    // app.post('/users/signup',signup);
    // app.get('/user/passwordreset/:email',passwordReset);
    
 
    // app.get('/users', [
    //      isAuthenticated,
    //      isAuthorized({ hasRole: ['View User', 'View  Admin','View Author','View Institutional Users'] }),
    //      all
    //  ]);
    //  app.get('/user/mailverification/:email', [
    //      isAuthenticated,
    //      isAuthorized({ hasRole: ['Create Admin', 'Create User','Create Author'] }),
    //      mailverification
    //  ]);
    //  app.put('/users/approved/:uid',
    //      isAuthenticated,
    //      isAuthorized({ hasRole: ['Authorize User'] }),
    //      approvedUser
    //  )
    //  app.put('/users/change-active-status/:uid',
    //      isAuthenticated,
    //      isAuthorized({ hasRole: ['Authorize User'] }),
    //      changeActiveStatus
    //  )

    return router
 }