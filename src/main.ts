import {config,DotenvConfigOptions} from "dotenv"
import { isMaster, fork, on} from "cluster"
const totalCPUs = require('os').cpus().length;

// let env=process.env.NODE_ENV || 'develop'
let env=process.argv[2] || 'develop'
console.log('process.env---->',process.argv);
let configOption:DotenvConfigOptions={path:`dotenv/${env}.env`}

config(configOption)
import {IWatcher,IWatcherOptions,Watcher} from "./watcher"
import {app} from "./server"
const NO_PATH='NO_PATH'

class Main{
    constructor(){
        this.startExpressServer()
        this.configureFileWatcher()
    }

    private configureFileWatcher(){
        const options:IWatcherOptions={}
        const watcherConfig:IWatcher={
            pathToDir:process.env.PATH_TO_WATCHER_DIR||NO_PATH,
            watcherOptions:options
        }
        let watcher=new Watcher(watcherConfig)
        watcher.listen()
    }

    private startExpressServer(){
        app(process.env.APP_PORT)
    }
}

if(require.main===module){
    if (isMaster) {
        console.log(`Number of CPUs is ${totalCPUs}`);
        console.log(`Master ${process.pid} is running`);
      
        // Fork workers.
        for (let i = 0; i < totalCPUs; i++) {
          fork();
        }
      
        on('exit', (worker, code, signal) => {
          console.log(`worker ${worker.process.pid} died`);
          console.log("Let's fork another worker!");
          fork();
        });
      
      } else {
        new Main()
      }
}
else{
    exports.Main=Main
}
