import { requireAuth } from "~/lib/server-auth"
import { ProjectDetailClient } from "./project-detail-client"

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  // Server-side authentication
  await requireAuth()

  const { slug } = await params

  return <ProjectDetailClient slug={slug} />
}
