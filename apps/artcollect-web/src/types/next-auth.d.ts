import type { DefaultSession } from "next-auth";
import type { UserRole } from "@artcollect/database";

declare module "next-auth" {
  interface User {
    roles?: UserRole[];
  }

  interface Session {
    user: {
      id: string;
      roles: UserRole[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roles?: UserRole[];
  }
}
