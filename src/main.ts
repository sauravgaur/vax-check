import {config,DotenvConfigOptions} from "dotenv"

let env=process.env.NODE_ENV || 'develop'
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
    new Main()
}
else{
    exports.Main=Main
}
