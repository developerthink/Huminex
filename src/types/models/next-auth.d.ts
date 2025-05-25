import NextAuth, { DefaultSession } from "next-auth";
import { RoleType } from "./user/user";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's MongoDB objectId */
      id: string;
      /** User role: 'candidate' or 'hr' */
      role: RoleType;
    } & DefaultSession["user"];
  }

  interface User {
    role?: RoleType;
  }
  
  interface JWT {
    id?: string;
    role?: RoleType;
  }
}