import * as passport from "passport";
import {User as UserType} from "@prisma/client";

declare global {
  namespace Express {
    export interface User extends UserType {}
  }

}