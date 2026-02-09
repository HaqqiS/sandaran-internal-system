import { requireAuth } from "~/lib/server-auth"
import { LogisticsClient } from "./logistics-client"

export default async function LogisticsPage() {
  await requireAuth()

  return <LogisticsClient />
}
