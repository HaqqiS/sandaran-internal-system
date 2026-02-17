import { requireAuth } from "~/lib/server-auth";
import { DocumentsClient } from "./documents-client";

export default async function DocumentsPage() {
  await requireAuth();

  return <DocumentsClient />;
}
