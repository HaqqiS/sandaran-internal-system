"use client";

import { Badge } from "~/components/ui/badge";

type Status = "pending" | "approved" | "rejected";

interface UserStatusBadgeProps {
  status: Status;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config: Record<
    Status,
    { label: string; variant: "outline" | "default" | "destructive" }
  > = {
    pending: { label: "Pending", variant: "outline" },
    approved: { label: "Active", variant: "default" },
    rejected: { label: "Rejected", variant: "destructive" },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}
