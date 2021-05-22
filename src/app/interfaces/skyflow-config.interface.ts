import { promises } from "fs";
import { PathLike } from "fs";

export interface ISkyflowConfig{
    orgName: string,
    accountName: string,
    vaultId:string,
    accountId:string,
    desc:string,
    vaultName:string,
    skyflowCredPath: PathLike | promises.FileHandle
}

export interface ITokens{
    accessToken:string,
    tokenType:string
}