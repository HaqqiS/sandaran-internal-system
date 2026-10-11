"use client";

import {
  IconBuildingArch,
  IconCash,
  IconClipboardCheck,
  IconPackages,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export type RoleLensType = "SUPERVISOR" | "ARCHITECT" | "FINANCE" | "LOGISTIC";

interface RoleDef {
  key: RoleLensType;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const ROLE_DEFINITIONS: RoleDef[] = [
  { key: "SUPERVISOR", label: "Supervisor", icon: IconClipboardCheck },
  { key: "LOGISTIC", label: "Logistik", icon: IconPackages },
  { key: "FINANCE", label: "Keuangan", icon: IconCash },
  { key: "ARCHITECT", label: "Arsitek", icon: IconBuildingArch },
];

interface RoleLensTabsProps {
  availableRoles: RoleLensType[];
  activeRole: RoleLensType;
  onRoleChange: (role: RoleLensType) => void;
  badges?: {
    SUPERVISOR?: number;
    ARCHITECT?: number;
    FINANCE?: number;
    LOGISTIC?: number;
  };
  className?: string;
}

export function RoleLensTabs({
  availableRoles,
  activeRole,
  onRoleChange,
  badges,
  className,
}: RoleLensTabsProps) {
  if (availableRoles.length <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label="Pilih Lensa Peran"
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/60",
        className,
      )}
    >
      {ROLE_DEFINITIONS.filter((def) => availableRoles.includes(def.key)).map(
        (def) => {
          const isActive = activeRole === def.key;
          const Icon = def.icon;
          const badgeCount = badges?.[def.key] ?? 0;

          return (
            <button
              type="button"
              key={def.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onRoleChange(def.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg text-xs md:text-sm font-medium transition-all shrink-0 cursor-pointer border-b-2 min-h-11",
                isActive
                  ? "border-primary text-foreground bg-muted/40 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span>{def.label}</span>

              {badgeCount > 0 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 font-bold",
                    isActive
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-status-attention/60 bg-status-attention-bg text-status-attention",
                  )}
                >
                  {badgeCount}
                </Badge>
              )}
            </button>
          );
        },
      )}
    </div>
  );
}
