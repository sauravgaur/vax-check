import {config,DotenvConfigOptions} from "dotenv"
import {IWatcher,IWatcherOptions,Watcher} from "./watcher"
import {app} from "./server"
const NO_PATH='NO_PATH'
class Main{
    env:string
    constructor(env:string){
        this.env=env;
        this.configVariable();
        this.startExpressServer()
        this.configureFileWatcher()
    }

    private configVariable(){
        console.log(this.env);
        let configOption:DotenvConfigOptions={path:`dotenv/${this.env}.env`}
        config(configOption)
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
    let env=process.env.NODE_ENV || 'develop'
    new Main(env)
}
else{
    exports.Main=Main
}
