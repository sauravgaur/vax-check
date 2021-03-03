
import {hash,compare} from "bcrypt"
export async function generateHash(plainText:string,saltOrRounds:number=10):Promise<string> {
    saltOrRounds=saltOrRounds>10?10:saltOrRounds
    return await hash(plainText,saltOrRounds)
}

export async function compareHash(plainText:string,cipherText:string) {
    return await compare(plainText,cipherText)
}