import { requireAuth } from "~/lib/server-auth";
import { EmergencyClient } from "./emergency-client";

interface EmergencyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EmergencyPage({ params }: EmergencyPageProps) {
  await requireAuth();
  const slug = (await params).slug;

  return <EmergencyClient projectSlug={slug} />;
}
