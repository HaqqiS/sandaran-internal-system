"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export interface RoleCoverageData {
  supervisor: boolean;
  architect: boolean;
  finance: boolean;
  logistic: boolean;
}

interface RoleCoverageProps {
  coverage: RoleCoverageData;
  className?: string;
}

const ROLES_DEF = [
  { key: "supervisor" as const, label: "S", name: "Supervisor" },
  { key: "architect" as const, label: "A", name: "Arsitek" },
  { key: "finance" as const, label: "K", name: "Keuangan" },
  { key: "logistic" as const, label: "L", name: "Logistik" },
];

export function RoleCoverage({ coverage, className }: RoleCoverageProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className={cn("inline-flex items-center gap-1", className)}>
        {ROLES_DEF.map((role) => {
          const isAssigned = coverage[role.key];
          return (
            <Tooltip key={role.key}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold select-none transition-colors border",
                    isAssigned
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-dashed border-status-attention/60 bg-status-attention-bg/30 text-status-attention opacity-80",
                  )}
                >
                  <span aria-hidden="true">
                    {isAssigned ? role.label : `!${role.label}`}
                  </span>
                  <span className="sr-only">
                    {role.name}: {isAssigned ? "Terisi" : "Belum ditugaskan"}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <span className="font-semibold">{role.name}:</span>{" "}
                {isAssigned ? "Anggota terisi" : "Peran belum ditugaskan"}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
