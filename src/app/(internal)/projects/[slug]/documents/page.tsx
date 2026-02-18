import { requireAuth } from "~/lib/server-auth";
import { DocumentsClient } from "./documents-client";

interface DocumentsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  await requireAuth();
  const slug = (await params).slug;

  return <DocumentsClient projectSlug={slug} />;
}
