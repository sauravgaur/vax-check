import express from 'express';
import {userModule} from "./app/index"
import cors = require('cors');
import * as bodyParser from 'body-parser';
// rest of the code remains same

export function app(port?:string){
  const _app=express();
  _app.use(bodyParser.json());
  _app.use(cors({ origin: true }));

  // _app.use('/user',userModule.userRoutes.routesConfig())
  _app.use('/api',[userModule.userRoutes.routesConfig()])
  _app.get('/', (req, res) => res.send('Server is running.'));
  console.log("port-->",port)
  _app.listen(3000, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
};