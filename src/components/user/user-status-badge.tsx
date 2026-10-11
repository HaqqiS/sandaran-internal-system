"use client";

import { Badge } from "~/components/ui/badge";

type Status = "pending" | "approved" | "rejected";

interface UserStatusBadgeProps {
  status: Status;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config: Record<
    Status,
    { label: string; variant: "warning" | "success" | "attention" }
  > = {
    pending: { label: "Menunggu", variant: "warning" },
    approved: { label: "Aktif", variant: "success" },
    rejected: { label: "Ditolak", variant: "attention" },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}
