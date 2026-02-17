"use client";

import type { GlobalRole } from "generated/prisma";
import { Badge } from "~/components/ui/badge";

interface RoleBadgeProps {
  role: GlobalRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config: Record<
    GlobalRole,
    { variant: "default" | "secondary" | "outline" | "destructive" }
  > = {
    ADMIN: { variant: "default" },
    CEO: { variant: "secondary" },
    USER: { variant: "outline" },
    NONE: { variant: "destructive" },
  };

  return <Badge variant={config[role].variant}>{role}</Badge>;
}
