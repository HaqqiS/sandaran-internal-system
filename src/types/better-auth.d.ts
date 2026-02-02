import type { GlobalRole } from "~/generated/prisma"

declare module "better-auth" {
  interface User {
    roleGlobal: GlobalRole
    isActive: boolean
  }
}
