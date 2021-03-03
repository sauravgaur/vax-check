import { Request, Response } from "express";

export  function isAuthorized(opts: { hasRole: Array<string>, allowSameUser?: boolean }) {
   return async (req: Request, res: Response, next: Function) => {
    //    const { role, email, uid } = res.locals
       const { role,email, uid } = res.locals
       console.log("res.locals-->",res.locals);
       const { id } = req.params

       if(email=="admin@vaxCheck.com"){
           return next();
       }

       if (opts.allowSameUser && id && uid === id)
           return next();

       if (!role)
           return res.status(403).send();

       
       
       return res.status(403).send();
   }
}