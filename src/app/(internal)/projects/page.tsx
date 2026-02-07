import { requireAuth } from "~/lib/server-auth"
import { ProjectsClient } from "./projects-client"

export default async function ProjectsPage() {
  // Server-side authentication
  await requireAuth()

  return <ProjectsClient />
}
