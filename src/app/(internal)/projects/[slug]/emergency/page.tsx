import { requireAuth } from "~/lib/server-auth";
import { EmergencyClient } from "./emergency-client";

export default async function EmergencyPage() {
  await requireAuth();

  return <EmergencyClient />;
}
