import express from 'express';
import {userModule,recordsModule,vaxCardModule,safeTravellerModule,mediaModule,paymentModule, humanApiModule} from "./app/index";
import cors = require('cors');
import * as bodyParser from 'body-parser';
// rest of the code remains same
const API_ROUTES=[
  userModule.userRoutes.routesConfig(),
  recordsModule.recordsRoutes.routesConfig(),
  vaxCardModule.vaxCardRoutes.routesConfig(),
  safeTravellerModule.routesConfig(),
  mediaModule.routesConfig(),
  paymentModule.paymentRoutes.routesConfig(),
  humanApiModule.humanApiRoutes.routesConfig(),
]

export function app(port?:string){
  console.log('enter into app--->');
  const exp=express();
  exp.use(bodyParser.json());
  exp.use(cors({ origin: true }));
  exp.use(function(req, res, next) {
    //set headers to allow cross origin request.
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
  // _app.use('/user',userModule.userRoutes.routesConfig())
  exp.use('/api',API_ROUTES);
  exp.get('/', (req, res) => res.send('Server is running.'));
  console.log("port-->",port)
  exp.listen(3000, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
};