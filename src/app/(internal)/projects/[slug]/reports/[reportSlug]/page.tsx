import { requireAuth } from "~/lib/server-auth"
import { ReportDetailClient } from "./report-detail-client"

interface ReportDetailPageProps {
  params: Promise<{ slug: string; reportSlug: string }>
}

export default async function ReportDetailPage(props: ReportDetailPageProps) {
  await requireAuth()
  const params = await props.params

  return (
    <ReportDetailClient
      projectSlug={params.slug}
      reportSlug={params.reportSlug}
    />
  )
}
