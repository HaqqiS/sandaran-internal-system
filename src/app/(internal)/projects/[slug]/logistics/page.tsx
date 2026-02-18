import { requireAuth } from "~/lib/server-auth";
import { LogisticsClient } from "./logistics-client";

interface LogisticsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LogisticsPage({ params }: LogisticsPageProps) {
  await requireAuth();
  const slug = (await params).slug;

  return <LogisticsClient projectSlug={slug} />;
}
