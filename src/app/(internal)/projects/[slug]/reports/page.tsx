import { requireAuth } from "~/lib/server-auth"
import { ReportsClient } from "./reports-client"

interface ReportsPageProps {
  params: Promise<{ slug: string }>
}

export default async function ReportsPage(props: ReportsPageProps) {
  await requireAuth()
  const params = await props.params

  return <ReportsClient projectSlug={params.slug} />
}
