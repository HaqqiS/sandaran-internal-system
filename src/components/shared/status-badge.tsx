"use client";

import type { ProjectStatus } from "@prisma/client";
import { Badge } from "~/components/ui/badge";

export const PROJECT_STATUS_MAP: Record<
  ProjectStatus,
  { label: string; variant: "success" | "warning" | "outline" }
> = {
  ACTIVE: { label: "Aktif", variant: "success" },
  PAUSED: { label: "Dijeda", variant: "warning" },
  DONE: { label: "Selesai", variant: "outline" },
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus | "ACTIVE" | "PAUSED" | "DONE";
  className?: string;
}

export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  const config = PROJECT_STATUS_MAP[status as ProjectStatus] ?? {
    label: status,
    variant: "outline" as const,
  };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
