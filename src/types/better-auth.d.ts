import type { GlobalRole } from "~/@prisma/client";

declare module "better-auth" {
  interface User {
    roleGlobal: GlobalRole;
    isActive: boolean;
  }
}
