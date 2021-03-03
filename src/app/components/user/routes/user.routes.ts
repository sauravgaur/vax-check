import { Application,Router } from "express";
import {isAuthenticated,isAuthorized} from '../../../../app/core/index'
import {UserCtrl} from "../controllers/user.controller"

let router=Router()


export function routesConfig():Router {
    let userCtrl=new UserCtrl()
    console.log("enter into router--->")
    router.post('/login',userCtrl.login);
    router.get('/user/getById',isAuthenticated,userCtrl.getById)
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